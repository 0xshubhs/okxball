import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FORMATIONS, type FormationName, type Player, type Position } from "@/lib/data";
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

const MODEL = "claude-opus-4-7";
const FORMATION_NAMES = Object.keys(FORMATIONS) as FormationName[];

type Body = { mode: "auto" | "prompt"; prompt: string; roster: Player[] };

const SYSTEM_RULES = `You are the autonomous manager for an onchain fantasy football league ("Agentic Fantasy Football OS" on X Layer).

Your job: pick the optimal starting XI from the manager's owned Player NFTs.

Scoring intuition (higher = better expected points):
- rating (overall quality), recent form (1-10), and rarity all raise output.
- Easier fixtures (lower difficulty 1-5) raise output; hard fixtures lower it.
- The captain scores DOUBLE — captain your highest-projection attacker unless the manager says otherwise.

Hard rules:
- Pick ONLY from the listed owned Player NFTs (use their exact id).
- Fill EVERY slot of your chosen formation with exactly one player whose position matches the slot's position.
- Never use the same player in two slots.
- If a manager instruction is given, honor it (e.g. "all-out attack" → favor FWD/MID and aggressive shape; "park the bus" → favor DEF/GK and a defensive shape; "on form" → weight recent form over rating).

Process:
- Reason concisely, step by step, about formation choice, key picks, and the captain.
- Then call the submit_xi tool EXACTLY ONCE with the final XI. Do not call it more than once.`;

const submitXiTool: Anthropic.Tool = {
  name: "submit_xi",
  description:
    "Submit the final optimal starting XI. Call exactly once after reasoning.",
  input_schema: {
    type: "object",
    properties: {
      formation: {
        type: "string",
        enum: FORMATION_NAMES,
        description: "The chosen formation.",
      },
      picks: {
        type: "array",
        description:
          "One entry per slot of the chosen formation. slotId must be a slot of that formation; playerId must be an owned player whose position matches the slot.",
        items: {
          type: "object",
          properties: {
            slotId: { type: "string" },
            playerId: { type: "string" },
          },
          required: ["slotId", "playerId"],
        },
      },
      captainId: {
        type: "string",
        description: "playerId of the captain (must be one of the picks). Scores 2x.",
      },
      viceId: { type: "string", description: "playerId of the vice-captain." },
    },
    required: ["formation", "picks", "captainId"],
  },
};

export async function POST(req: NextRequest) {
  const { mode, prompt, roster } = (await req.json()) as Body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Guarded enqueue: a client abort closes the stream; never throw past it.
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
        if (!apiKey) {
          send({ type: "meta", engine: "heuristic" });
          const plan = runAgent(roster, mode, prompt);
          for (const s of plan.steps) {
            if (cancelled) break;
            send({ type: "step", step: s });
            await sleep(260);
          }
          send({ type: "plan", plan });
          close();
          return;
        }

        send({ type: "meta", engine: "llm" });
        await runLlm({ apiKey, mode, prompt, roster, send, shouldStop: () => cancelled });
        close();
      } catch (err) {
        // Any LLM failure degrades to the deterministic heuristic.
        const plan = runAgent(roster, mode, prompt);
        send({
          type: "meta",
          engine: "heuristic-fallback",
          error: err instanceof Error ? err.message : "agent error",
        });
        for (const s of plan.steps) send({ type: "step", step: s });
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
  apiKey,
  mode,
  prompt,
  roster,
  send,
  shouldStop,
}: {
  apiKey: string;
  mode: "auto" | "prompt";
  prompt: string;
  roster: Player[];
  send: (obj: unknown) => void;
  shouldStop: () => boolean;
}) {
  const client = new Anthropic({ apiKey });
  const weights: AgentWeights =
    mode === "prompt" && prompt.trim()
      ? parsePrompt(prompt).weights
      : { attack: 1, defense: 1, form: 1, fixture: 1 };

  const rosterTable = roster
    .map(
      (p) =>
        `- id=${p.id} | ${p.name} (${p.position}) | rating ${p.rating} | form ${p.form}/10 | rarity ${p.rarity} | next vs ${p.fixtureOpponent} (difficulty ${p.fixtureDifficulty}/5) | ${p.club}`
    )
    .join("\n");
  const slotSpec = FORMATION_NAMES.map(
    (f) => `${f}: ${FORMATIONS[f].map((s) => `${s.id}(${s.position})`).join(", ")}`
  ).join("\n");

  // Stable, reusable content first (cached); volatile instruction goes in messages.
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM_RULES },
    { type: "text", text: `FORMATIONS AND SLOTS:\n${slotSpec}` },
    {
      type: "text",
      text: `OWNED PLAYER NFTs (pick only from these):\n${rosterTable}`,
      cache_control: { type: "ephemeral" },
    },
  ];

  const userText =
    mode === "prompt" && prompt.trim()
      ? `Manager instruction: "${prompt.trim()}"\n\nBuild the optimal XI honoring this instruction, then call submit_xi.`
      : `AUTO mode — no manager instruction. Build the optimal XI purely from the stats, then call submit_xi.`;

  send({
    type: "step",
    step: {
      kind: "scan",
      text: `Reading live oracle stats for ${roster.length} Player NFTs…`,
    },
  });

  const llm = client.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive", display: "summarized" },
    system,
    tools: [submitXiTool],
    // Forced tool_choice is incompatible with thinking — instruct via system instead.
    tool_choice: { type: "auto" },
    messages: [{ role: "user", content: userText }],
  });

  // Stream summarized reasoning as bite-sized steps split on sentence/line boundaries.
  let buf = "";
  const flush = (force = false) => {
    let idx: number;
    while ((idx = boundary(buf)) !== -1) {
      const chunk = buf.slice(0, idx + 1).trim();
      buf = buf.slice(idx + 1);
      if (chunk.length > 3) send({ type: "step", step: { kind: "decision", text: chunk } });
    }
    if (force && buf.trim().length > 3) {
      send({ type: "step", step: { kind: "decision", text: buf.trim() } });
      buf = "";
    }
  };

  for await (const ev of llm) {
    if (shouldStop()) {
      llm.abort();
      return;
    }
    if (ev.type === "content_block_delta") {
      if (ev.delta.type === "thinking_delta") {
        buf += ev.delta.thinking;
        flush();
      } else if (ev.delta.type === "text_delta") {
        buf += ev.delta.text;
        flush();
      }
    }
  }
  flush(true);

  const final = await llm.finalMessage();
  const toolUse = final.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("agent did not return a lineup");
  }

  const plan = buildPlan(
    toolUse.input as ToolInput,
    roster,
    weights,
    mode,
    prompt
  );

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

type ToolInput = {
  formation?: string;
  picks?: { slotId: string; playerId: string }[];
  captainId?: string;
  viceId?: string;
};

/** Validate the model's tool output, repairing any gaps with the heuristic. */
function buildPlan(
  input: ToolInput,
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
    const slot = slots.find((s) => s.id === pick.slotId);
    const p = byId.get(pick.playerId);
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

  // If the model produced nothing usable, defer entirely to the heuristic.
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

function boundary(s: string): number {
  const nl = s.indexOf("\n");
  const dot = s.indexOf(". ");
  const cands = [nl, dot >= 0 ? dot + 1 : -1].filter((x) => x >= 0);
  return cands.length ? Math.min(...cands) : -1;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
