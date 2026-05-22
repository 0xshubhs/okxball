/**
 * Agent engine — the "AI" that auto-manages a squad.
 *
 * Two control modes, matching the product spec:
 *   1. AUTO   — optimise purely on live stats (rating, form, fixture, rarity).
 *   2. PROMPT — bias the optimiser from a natural-language instruction, e.g.
 *               "go all-out attack and captain my best form player".
 *
 * This is a deterministic, explainable heuristic so the demo runs with zero
 * external calls. To swap in a real LLM, replace `parsePrompt` + `pickXI` with
 * a tool-calling agent (server-side) that returns the same `AgentPlan` shape —
 * the UI and on-chain submission path are unchanged.
 */

import {
  FORMATIONS,
  FormationName,
  Player,
  Position,
  RARITY_META,
  Slot,
} from "@/lib/data";

export type AgentMode = "auto" | "prompt";

export interface AgentWeights {
  attack: number; // emphasis on FWD/MID output
  defense: number; // emphasis on DEF/GK + clean sheets
  form: number; // recent form vs raw rating
  fixture: number; // reward easy fixtures
}

export interface AgentStep {
  kind: "scan" | "decision" | "swap" | "captain" | "warn" | "done";
  text: string;
}

export interface AgentPlan {
  formation: FormationName;
  /** slotId -> playerId */
  lineup: Record<string, string>;
  captainId: string;
  viceId: string;
  projectedPoints: number;
  weights: AgentWeights;
  steps: AgentStep[];
}

const BASE_WEIGHTS: AgentWeights = { attack: 1, defense: 1, form: 1, fixture: 1 };

/** Per-player expected points for the upcoming gameweek. */
export function projectedPoints(p: Player, w: AgentWeights = BASE_WEIGHTS): number {
  const rarity = RARITY_META[p.rarity].mult;
  const formFactor = 1 + ((p.form - 5) / 10) * 0.6 * w.form;
  // Easier fixtures (low difficulty) score higher.
  const fixtureFactor = 1 + ((3 - p.fixtureDifficulty) / 6) * w.fixture;

  const attackBias = p.position === "FWD" || p.position === "MID" ? w.attack : 1;
  const defenseBias = p.position === "DEF" || p.position === "GK" ? w.defense : 1;

  const base = (p.rating / 10) * rarity * formFactor * fixtureFactor;
  const pts = base * ((attackBias + defenseBias) / 2);
  return Math.round(pts * 10) / 10;
}

/** Map free-text instructions onto optimiser weights + an optional formation. */
export function parsePrompt(prompt: string): {
  weights: AgentWeights;
  formation?: FormationName;
  notes: string[];
} {
  const t = prompt.toLowerCase();
  const w: AgentWeights = { ...BASE_WEIGHTS };
  const notes: string[] = [];

  if (/(attack|aggress|all.?out|goals?|score|offensiv)/.test(t)) {
    w.attack = 1.8;
    w.defense = 0.7;
    notes.push("Detected attacking intent → boosting FWD/MID weighting.");
  }
  if (/(defen|clean sheet|park the bus|solid|conservativ|catenaccio)/.test(t)) {
    w.defense = 1.8;
    w.attack = 0.8;
    notes.push("Detected defensive intent → boosting DEF/GK weighting.");
  }
  if (/(form|hot|streak|in.?form|momentum)/.test(t)) {
    w.form = 1.8;
    notes.push("Prioritising recent form over raw rating.");
  }
  if (/(fixture|easy|opponent|matchup|favorab)/.test(t)) {
    w.fixture = 1.8;
    notes.push("Weighting easy fixtures more heavily.");
  }

  let formation: FormationName | undefined;
  for (const f of Object.keys(FORMATIONS) as FormationName[]) {
    if (t.includes(f) || t.includes(f.replace(/-/g, ""))) {
      formation = f;
      notes.push(`Locking requested formation ${f}.`);
    }
  }
  if (!notes.length) notes.push("No strong signal — optimising on balanced stats.");

  return { weights: w, formation, notes };
}

/** Choose the best formation for a roster by maximising total projected points. */
function bestFormation(roster: Player[], w: AgentWeights): FormationName {
  let best: FormationName = "4-3-3";
  let bestScore = -Infinity;
  for (const name of Object.keys(FORMATIONS) as FormationName[]) {
    const { projected, filled } = fillFormation(name, roster, w);
    // Penalise formations we can't fully field.
    const total = projected - (FORMATIONS[name].length - filled) * 6;
    if (total > bestScore) {
      bestScore = total;
      best = name;
    }
  }
  return best;
}

function fillFormation(name: FormationName, roster: Player[], w: AgentWeights) {
  const slots = FORMATIONS[name];
  const byPos: Record<Position, Player[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of roster) byPos[p.position].push(p);
  for (const pos of Object.keys(byPos) as Position[]) {
    byPos[pos].sort((a, b) => projectedPoints(b, w) - projectedPoints(a, w));
  }

  const lineup: Record<string, string> = {};
  const used = new Set<string>();
  let projected = 0;
  let filled = 0;

  for (const slot of slots) {
    const pick = byPos[slot.position].find((p) => !used.has(p.id));
    if (pick) {
      lineup[slot.id] = pick.id;
      used.add(pick.id);
      projected += projectedPoints(pick, w);
      filled += 1;
    }
  }
  return { lineup, projected: Math.round(projected * 10) / 10, filled };
}

/** Run the agent end-to-end and produce an explainable plan. */
export function runAgent(
  roster: Player[],
  mode: AgentMode,
  prompt = ""
): AgentPlan {
  const steps: AgentStep[] = [];
  const parsed = mode === "prompt" && prompt.trim() ? parsePrompt(prompt) : null;
  const weights = parsed?.weights ?? BASE_WEIGHTS;

  steps.push({
    kind: "scan",
    text: `Scanning ${roster.length} owned Player NFTs and pulling live oracle stats…`,
  });

  if (parsed) {
    for (const n of parsed.notes) steps.push({ kind: "decision", text: n });
  } else {
    steps.push({
      kind: "decision",
      text: "AUTO mode: optimising on rating × form × fixture × rarity.",
    });
  }

  const formation = parsed?.formation ?? bestFormation(roster, weights);
  steps.push({
    kind: "decision",
    text: `Selected formation ${formation} as the highest-EV shape.`,
  });

  const { lineup, projected, filled } = fillFormation(formation, roster, weights);
  const slots: Slot[] = FORMATIONS[formation];

  if (filled < slots.length) {
    steps.push({
      kind: "warn",
      text: `Only ${filled}/${slots.length} slots fillable — acquire more NFTs to complete the XI.`,
    });
  }

  // Captain = highest projected starter, vice = second.
  const starters = Object.values(lineup)
    .map((id) => roster.find((p) => p.id === id)!)
    .filter(Boolean)
    .sort((a, b) => projectedPoints(b, weights) - projectedPoints(a, weights));

  const captain = starters[0];
  const vice = starters[1] ?? starters[0];

  if (captain) {
    steps.push({
      kind: "captain",
      text: `Captaining ${captain.name} (×2 points) — top projection at ${projectedPoints(
        captain,
        weights
      )} pts. ${vice ? `${vice.name} as vice.` : ""}`,
    });
  }

  const withCaptain =
    projected + (captain ? projectedPoints(captain, weights) : 0);

  steps.push({
    kind: "done",
    text: `Lineup ready. Projected ${Math.round(withCaptain * 10) / 10} pts. Ready to submit on-chain.`,
  });

  return {
    formation,
    lineup,
    captainId: captain?.id ?? "",
    viceId: vice?.id ?? "",
    projectedPoints: Math.round(withCaptain * 10) / 10,
    weights,
    steps,
  };
}
