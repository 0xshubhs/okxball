import { NextRequest } from "next/server";
import {
  FORMATIONS,
  type FormationName,
  type Player,
  type Position,
} from "@/lib/data";
import {
  parsePrompt,
  projectedPoints,
  runAgent,
  type AgentPlan,
  type AgentStep,
  type AgentWeights,
} from "@/lib/agents/engine";

export const runtime = "nodejs";
export const maxDuration = 60;

// Self-hosted OpenAI-compatible LLM (RunPod vLLM). No API key required.
const AI_BASE_URL =
  process.env.AI_BASE_URL || "https://0ziii4vt975sjd-8000.proxy.runpod.net";
const AI_MODEL = process.env.AI_MODEL || "Qwen/Qwen3-VL-8B-Instruct";
const AI_API_KEY = process.env.AI_API_KEY; // optional Bearer token

const FORMATION_NAMES = Object.keys(FORMATIONS) as FormationName[];

type Body = { mode: "auto" | "prompt"; prompt: string; roster: Player[] };

const SYSTEM_RULES = `You are the autonomous manager for an onchain Fantasy World Cup league ("OKBall" on X Layer).

Your job: pick the optimal starting XI from the manager's owned national-team Player NFTs.

Scoring intuition (higher = better expected points):
- rating (overall), recent form (1-10), and rarity all raise output.
- Easier fixtures (lower difficulty 1-5) raise output; hard fixtures lower it.
- The captain scores DOUBLE — captain your highest-projection attacker unless told otherwise.

Hard rules:
- Pick ONLY from the listed owned Player NFTs (use their exact id).
- Fill EVERY slot of your chosen formation with exactly one player whose position matches the slot's position.
- Never use the same player in two slots.
- Honor any manager instruction (e.g. "all-out attack" -> favour FWD/MID; "park the bus" -> favour DEF/GK; "on form" -> weight recent form).`;

export async function POST(req: NextRequest) {
  const { mode, prompt, roster } = (await req.json()) as Body;
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        if (cancelled) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        } catch {
          cancelled = true;
        }
      };
      const close = () => {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      try {
        send({ type: "meta", engine: "llm", model: AI_MODEL });
        await runLlm({ mode, prompt, roster, send, shouldStop: () => cancelled });
        close();
      } catch (err) {
        // LLM unreachable / bad output -> deterministic heuristic.
        const plan = runAgent(roster, mode, prompt);
        send({
          type: "meta",
          engine: "heuristic-fallback",
          error: err instanceof Error ? err.message : "agent error",
        });
        for (const s of plan.steps) {
          if (cancelled) break;
          send({ type: "step", step: s });
        }
        send({ type: "plan", plan });
        close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function runLlm({
  mode,
  prompt,
  roster,
  send,
  shouldStop,
}: {
  mode: "auto" | "prompt";
  prompt: string;
  roster: Player[];
  send: (obj: unknown) => void;
  shouldStop: () => boolean;
}) {
  const weights: AgentWeights =
    mode === "prompt" && prompt.trim()
      ? parsePrompt(prompt).weights
      : { attack: 1, defense: 1, form: 1, fixture: 1 };

  const rosterTable = roster
    .map(
      (p) =>
        `- id=${p.id} | ${p.name} (${p.position}) | ${p.club} | rating ${p.rating} | form ${p.form}/10 | rarity ${p.rarity} | next vs ${p.fixtureOpponent} (difficulty ${p.fixtureDifficulty}/5)`
    )
    .join("\n");
  const slotSpec = FORMATION_NAMES.map(
    (f) => `${f}: ${FORMATIONS[f].map((s) => `${s.id}(${s.position})`).join(", ")}`
  ).join("\n");

  const system = `${SYSTEM_RULES}

FORMATIONS AND SLOTS:
${slotSpec}

OWNED PLAYER NFTs (pick only from these):
${rosterTable}

Respond with ONLY a JSON object (no markdown fences, no prose) of this exact shape:
{"formation":"<one formation name>","picks":[{"slotId":"<slot id>","playerId":"<player id>"}],"captainId":"<player id>","viceId":"<player id>","steps":["<3-6 short strings explaining your reasoning>"]}
"picks" must contain exactly one entry per slot of the chosen formation.`;

  const user =
    mode === "prompt" && prompt.trim()
      ? `Manager instruction: "${prompt.trim()}". Build the optimal XI honoring it.`
      : `AUTO mode — no instruction. Build the optimal XI purely from the stats.`;

  send({
    type: "step",
    step: {
      kind: "scan",
      text: `Reading live oracle stats for ${roster.length} Player NFTs via ${AI_MODEL.split("/").pop()}…`,
    },
  });

  const res = await fetch(`${AI_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson(content);
  if (!parsed) throw new Error("LLM returned no parseable lineup");

  for (const s of (parsed.steps as string[] | undefined) ?? []) {
    if (shouldStop()) return;
    if (typeof s === "string" && s.trim().length > 2) {
      send({ type: "step", step: { kind: "decision", text: s.trim() } });
      await sleep(220);
    }
  }

  const plan = buildPlan(parsed, roster, weights, mode, prompt);

  const cap = roster.find((p) => p.id === plan.captainId);
  const vice = roster.find((p) => p.id === plan.viceId);
  if (cap) {
    send({
      type: "step",
      step: {
        kind: "captain",
        text: `Captaining ${cap.name} (×2 points) — ${projectedPoints(cap, weights)} pts projected.${vice && vice.id !== cap.id ? ` ${vice.name} as vice.` : ""}`,
      },
    });
  }
  send({
    type: "step",
    step: {
      kind: "done",
      text: `XI locked: ${plan.formation}, projected ${plan.projectedPoints} pts. Ready to submit on-chain.`,
    },
  });
  send({ type: "plan", plan });
}

type PlanInput = {
  formation?: string;
  picks?: { slotId: string; playerId: string }[];
  captainId?: string;
  viceId?: string;
  steps?: string[];
};

/** Validate the model's output, repairing any gaps with the heuristic. */
function buildPlan(
  input: PlanInput,
  roster: Player[],
  weights: AgentWeights,
  mode: "auto" | "prompt",
  prompt: string
): AgentPlan {
  const formation: FormationName = FORMATION_NAMES.includes(
    input.formation as FormationName
  )
    ? (input.formation as FormationName)
    : "4-3-3";
  const slots = FORMATIONS[formation];
  const byId = new Map(roster.map((p) => [p.id, p]));

  const lineup: Record<string, string> = {};
  const used = new Set<string>();

  for (const pick of input.picks ?? []) {
    const slot = slots.find((s) => s.id === pick?.slotId);
    const p = pick ? byId.get(pick.playerId) : undefined;
    if (slot && p && p.position === slot.position && !used.has(p.id) && !lineup[slot.id]) {
      lineup[slot.id] = p.id;
      used.add(p.id);
    }
  }

  // Repair: greedily fill any slot the model left empty/invalid.
  const byPos: Record<Position, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of roster) byPos[p.position].push(p);
  for (const pos of Object.keys(byPos) as Position[]) {
    byPos[pos].sort((a, b) => projectedPoints(b, weights) - projectedPoints(a, weights));
  }
  for (const slot of slots) {
    if (lineup[slot.id]) continue;
    const pick = byPos[slot.position].find((p) => !used.has(p.id));
    if (pick) {
      lineup[slot.id] = pick.id;
      used.add(pick.id);
    }
  }

  const starters = Object.values(lineup)
    .map((id) => byId.get(id)!)
    .filter(Boolean)
    .sort((a, b) => projectedPoints(b, weights) - projectedPoints(a, weights));

  const captain =
    (input.captainId && used.has(input.captainId) && byId.get(input.captainId)) ||
    starters[0];
  const vice =
    (input.viceId &&
      used.has(input.viceId) &&
      input.viceId !== captain?.id &&
      byId.get(input.viceId)) ||
    starters.find((s) => s.id !== captain?.id) ||
    starters[0];

  const projected =
    starters.reduce((t, p) => t + projectedPoints(p, weights), 0) +
    (captain ? projectedPoints(captain, weights) : 0);

  if (Object.keys(lineup).length === 0) {
    return runAgent(roster, mode, prompt);
  }

  return {
    formation,
    lineup,
    captainId: captain?.id ?? "",
    viceId: vice?.id ?? "",
    projectedPoints: Math.round(projected * 10) / 10,
    weights,
    steps: [] as AgentStep[],
  };
}

/** Parse a JSON object from model output, tolerating fences / surrounding prose. */
function extractJson(s: string): PlanInput | null {
  try {
    return JSON.parse(s) as PlanInput;
  } catch {
    /* try to slice out the object */
  }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(s.slice(start, end + 1)) as PlanInput;
    } catch {
      /* give up */
    }
  }
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
