"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Crown,
  Cpu,
  Search,
  Send,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import Pitch from "@/components/Pitch";
import {
  AgentMode,
  AgentPlan,
  AgentStep,
  runAgent,
} from "@/lib/agents/engine";
import { ownedPlayers, Player } from "@/lib/data";
import TxToast from "@/components/TxToast";
import {
  useAccount,
  useDeployed,
  useFantasyTx,
  useJoined,
  txJoinLeague,
  txSubmitLineup,
} from "@/lib/onchain";

const EXAMPLES = [
  "Go all-out attack and captain my hottest player",
  "Park the bus — prioritise clean sheets",
  "Pick on form over reputation",
  "Play 3-5-2 and target the easiest fixtures",
];

const STEP_ICON: Record<AgentStep["kind"], any> = {
  scan: Search,
  decision: Cpu,
  swap: Wand2,
  captain: Crown,
  warn: AlertTriangle,
  done: CheckCircle2,
};

export default function AgentPage() {
  const roster = useMemo(() => ownedPlayers(), []);
  const [mode, setMode] = useState<AgentMode>("auto");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [visible, setVisible] = useState(0); // streamed step count
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const runIdRef = useRef(0);
  const { address, isConnected } = useAccount();
  const deployed = useDeployed();
  const tx = useFantasyTx();
  const { data: hasJoined } = useJoined(address);

  // Submit the agent's recommended XI straight on-chain: prompt → Claude → tx.
  async function applySubmit() {
    if (!plan) return;
    const captain = roster.find((p) => p.id === plan.captainId);
    const tokenIds = Object.values(plan.lineup)
      .map((pid) => roster.find((p) => p.id === pid)?.tokenId)
      .filter((t): t is number => typeof t === "number");
    if (deployed.fantasyLeague && isConnected && captain) {
      try {
        if (!hasJoined) {
          await tx.writeContractAsync(txJoinLeague());
          flash("Joined league ✓ — click again to submit your XI");
        } else {
          await tx.writeContractAsync(txSubmitLineup(tokenIds, captain.tokenId));
          flash("Agent XI submitted on-chain ✓");
        }
      } catch {
        /* surfaced by TxToast */
      }
      return;
    }
    flash("Agent XI applied (demo) — connect on X Layer to submit");
  }

  async function run() {
    const myRun = ++runIdRef.current;
    setRunning(true);
    setEngine(null);
    setVisible(0);
    const collected: AgentStep[] = [];
    const partial = (): AgentPlan => ({
      formation: "4-3-3",
      lineup: {},
      captainId: "",
      viceId: "",
      projectedPoints: 0,
      weights: { attack: 1, defense: 1, form: 1, fixture: 1 },
      steps: [...collected],
    });
    setPlan(partial());

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, prompt, roster }),
      });
      if (!res.ok || !res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finalPlan: AgentPlan | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (runIdRef.current !== myRun) return; // a newer run superseded this
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.type === "meta") {
            setEngine(msg.engine);
            setModel(msg.model ?? null);
          }
          else if (msg.type === "step") {
            collected.push(msg.step);
            setPlan(partial());
            setVisible(collected.length);
          } else if (msg.type === "plan") {
            finalPlan = msg.plan as AgentPlan;
          }
        }
      }
      if (runIdRef.current !== myRun) return;
      if (finalPlan) {
        finalPlan.steps = collected.length ? collected : finalPlan.steps;
        setPlan(finalPlan);
        setVisible(finalPlan.steps.length);
      }
    } catch {
      // ultimate fallback: run the deterministic engine in-browser
      const p = runAgent(roster, mode, prompt);
      setPlan(p);
      setVisible(p.steps.length);
      setEngine("heuristic");
    } finally {
      if (runIdRef.current === myRun) setRunning(false);
    }
  }

  const engineLabel =
    engine === "llm"
      ? `${(model ?? "RunPod").split("/").pop()} · RunPod`
      : engine
        ? "Heuristic engine"
        : null;

  const lineupPlayers = useMemo(() => {
    if (!plan) return {};
    const map: Record<string, Player | undefined> = {};
    for (const [slot, id] of Object.entries(plan.lineup))
      map[slot] = roster.find((p) => p.id === id);
    return map;
  }, [plan, roster]);

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <div className="label-mono flex items-center gap-2">
          Autonomous manager
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              deployed.fantasyLeague
                ? "bg-neon/15 text-neon"
                : "bg-white/10 text-white/50"
            }`}
          >
            {deployed.fantasyLeague ? "Live" : "Demo"}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold">Agent Console</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/55">
          The agent reads live oracle stats for your {roster.length} Player NFTs
          and builds the optimal XI. Run it on auto-pilot, or steer it with a
          plain-English instruction.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* control panel */}
        <div className="space-y-4">
          <div className="glass p-5">
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setMode("auto")}
                className={`flex-1 rounded-xl border px-4 py-3 text-left transition ${
                  mode === "auto"
                    ? "border-neon bg-neon/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Zap className={`h-4 w-4 ${mode === "auto" ? "text-neon" : "text-white/50"}`} />
                  AUTO
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Optimise purely on stats
                </p>
              </button>
              <button
                onClick={() => setMode("prompt")}
                className={`flex-1 rounded-xl border px-4 py-3 text-left transition ${
                  mode === "prompt"
                    ? "border-neon bg-neon/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Bot className={`h-4 w-4 ${mode === "prompt" ? "text-neon" : "text-white/50"}`} />
                  PROMPT
                </div>
                <p className="mt-1 text-xs text-white/50">Tell it your strategy</p>
              </button>
            </div>

            {mode === "prompt" && (
              <div className="mb-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Go all-out attack and captain my hottest player…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 pr-10 text-sm outline-none transition focus:border-neon/50"
                  />
                  <Send className="absolute right-3 top-3 h-4 w-4 text-white/30" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setPrompt(ex)}
                      className="chip glass-hover hover:text-neon"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={run}
              disabled={running}
              className="btn-neon w-full"
            >
              <Sparkles className="h-4 w-4" />
              {running ? "Agent thinking…" : "Run agent"}
            </button>
          </div>

          {/* activity log */}
          <div className="glass min-h-[220px] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-neon ${running ? "animate-ping" : ""} opacity-60`} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon" />
              </span>
              <h3 className="font-display font-bold">Agent activity log</h3>
              {engineLabel && (
                <span className="chip ml-auto !px-2 !py-0.5 !text-[10px] text-neon">
                  <Cpu className="h-3 w-3" /> {engineLabel}
                </span>
              )}
            </div>
            {!plan ? (
              <p className="py-8 text-center text-sm text-white/40">
                Run the agent to watch it reason through your squad in real time.
              </p>
            ) : (
              <div className="space-y-2">
                {plan.steps.slice(0, visible).map((s, i) => {
                  const Icon = STEP_ICON[s.kind];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${
                        s.kind === "warn"
                          ? "bg-gold/10 text-gold"
                          : s.kind === "done"
                            ? "bg-neon/10 text-neon"
                            : "bg-white/5 text-white/75"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{s.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* result */}
        <div className="glass p-5">
          {plan && !running ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="label-mono">Recommended lineup</div>
                  <h3 className="font-display text-xl font-bold">
                    {plan.formation} ·{" "}
                    <span className="text-neon">{plan.projectedPoints} pts</span>
                  </h3>
                </div>
                <button onClick={applySubmit} className="btn-neon !py-2 !text-xs">
                  {deployed.fantasyLeague && isConnected && !hasJoined
                    ? "Join league · 0.02 OKB"
                    : "Apply & submit"}
                </button>
              </div>

              {/* weights */}
              <div className="mb-4 grid grid-cols-4 gap-2">
                {(
                  [
                    ["Attack", plan.weights.attack, "#ff4d8d"],
                    ["Defense", plan.weights.defense, "#2dd4ff"],
                    ["Form", plan.weights.form, "#3ef08b"],
                    ["Fixture", plan.weights.fixture, "#ffd35c"],
                  ] as const
                ).map(([label, val, color]) => (
                  <div key={label} className="rounded-lg bg-white/5 p-2 text-center">
                    <div className="label-mono">{label}</div>
                    <div
                      className="font-mono text-sm font-bold"
                      style={{ color }}
                    >
                      {Number(val).toFixed(1)}×
                    </div>
                  </div>
                ))}
              </div>

              <Pitch
                formation={plan.formation}
                lineup={lineupPlayers}
                captainId={plan.captainId}
              />
            </>
          ) : (
            <div className="grid h-full min-h-[420px] place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-neon/10 text-neon">
                  <Bot className="h-8 w-8" />
                </div>
                <p className="text-sm text-white/50">
                  {running
                    ? "Building your optimal XI…"
                    : "Your agent's recommended XI will appear here."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-neon/30 bg-pitch-900/95 px-5 py-3 text-sm font-semibold text-neon shadow-neon backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <TxToast
        tx={tx}
        labels={{ pending: "Confirm in OKX Wallet…", success: "Agent XI on-chain" }}
      />
    </div>
  );
}
