"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Coins,
  Goal,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatEther } from "viem";
import {
  FIXTURES,
  ownedPlayers,
  Player,
  POSITION_META,
} from "@/lib/data";
import { runAgent } from "@/lib/agents/engine";
import TxToast from "@/components/TxToast";
import {
  useAccount,
  useClaimable,
  useDeployed,
  useFantasyTx,
  txClaim,
} from "@/lib/onchain";

const MatchdayCanvas = dynamic(
  () => import("@/components/three/MatchdayCanvas"),
  { ssr: false }
);

interface LiveEvent {
  id: number;
  minute: number;
  player: Player;
  type: "goal" | "assist" | "save" | "clean" | "bonus";
  points: number;
}

const EVENT_META: Record<
  LiveEvent["type"],
  { label: string; icon: any; color: string }
> = {
  goal: { label: "Goal", icon: Goal, color: "#3ef08b" },
  assist: { label: "Assist", icon: ArrowUpRight, color: "#2dd4ff" },
  save: { label: "Key save", icon: ShieldCheck, color: "#ffd35c" },
  clean: { label: "Clean sheet", icon: ShieldCheck, color: "#a78bfa" },
  bonus: { label: "Bonus", icon: Sparkles, color: "#ff4d8d" },
};

export default function LivePage() {
  const roster = useMemo(() => ownedPlayers(), []);
  const plan = useMemo(() => runAgent(roster, "auto"), [roster]);
  const starters = useMemo(
    () =>
      Object.values(plan.lineup)
        .map((id) => roster.find((p) => p.id === id))
        .filter(Boolean) as Player[],
    [plan, roster]
  );

  const [minute, setMinute] = useState(54);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [points, setPoints] = useState<Record<string, number>>({});
  const [claimable, setClaimable] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const idRef = useRef(0);
  const minuteRef = useRef(54);
  const { address, isConnected } = useAccount();
  const deployed = useDeployed();
  const tx = useFantasyTx();
  const { data: onchainClaimableWei } = useClaimable(address);
  const onchainClaimable = onchainClaimableWei
    ? Number(formatEther(onchainClaimableWei))
    : 0;
  const shownClaimable = deployed.payoutVault ? onchainClaimable : claimable;

  async function claim() {
    if (deployed.payoutVault && isConnected) {
      try {
        await tx.writeContractAsync(txClaim());
      } catch {
        /* surfaced by TxToast */
      }
      return;
    }
    if (claimable <= 0) return;
    setClaimed(true);
    setClaimable(0);
    setTimeout(() => setClaimed(false), 2600);
  }

  useEffect(() => {
    const tick = setInterval(() => {
      setMinute((m) => {
        const next = m >= 90 ? 90 : m + 1;
        minuteRef.current = next;
        return next;
      });
      // ~45% chance an event happens each tick
      if (Math.random() < 0.45 && starters.length) {
        const p = starters[Math.floor(Math.random() * starters.length)];
        const types: LiveEvent["type"][] =
          p.position === "GK"
            ? ["save", "clean", "bonus"]
            : p.position === "DEF"
              ? ["clean", "assist", "bonus", "goal"]
              : ["goal", "assist", "bonus"];
        const type = types[Math.floor(Math.random() * types.length)];
        const pts =
          type === "goal" ? (p.position === "FWD" ? 4 : p.position === "MID" ? 5 : 6)
          : type === "assist" ? 3
          : type === "clean" ? 4
          : type === "save" ? 2
          : 1;
        const isCap = p.id === plan.captainId;
        const finalPts = pts * (isCap ? 2 : 1);
        idRef.current += 1;
        setEvents((e) => [
          { id: idRef.current, minute: minuteRef.current, player: p, type, points: finalPts },
          ...e,
        ]);
        setPoints((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + finalPts }));
        setClaimable((c) => Math.round((c + finalPts * 0.6) * 100) / 100);
      }
    }, 2000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starters, plan.captainId]);

  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-magenta opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-magenta" />
            </span>
            <span className="label-mono text-magenta">Live · matchday</span>
          </div>
          <h1 className="font-display text-3xl font-bold">Live Center</h1>
        </div>
        <div className="chip border-neon/20 bg-neon/5 text-neon">
          <Radio className="h-3.5 w-3.5" />{" "}
          {deployed.scoringOracle ? "ScoringOracle live" : "Matchday feed · oracle-ready"}
        </div>
      </div>

      {/* fixtures strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FIXTURES.map((f) => (
          <div key={f.id} className="glass p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold">
              <span>{f.home}</span>
              <span className="font-mono text-neon">
                {f.status === "upcoming" ? "v" : `${f.homeScore ?? 0}-${f.awayScore ?? 0}`}
              </span>
              <span>{f.away}</span>
            </div>
            <div className="mt-1 text-[11px]">
              {f.status === "live" ? (
                <span className="font-bold text-magenta">{f.minute}' LIVE</span>
              ) : f.status === "ft" ? (
                <span className="text-white/40">FT</span>
              ) : (
                <span className="text-white/40">{f.kickoff}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3D matchday banner */}
      <div className="mb-6">
        <MatchdayCanvas
          className="h-[300px] w-full overflow-hidden rounded-2xl bg-pitch-950"
          home={FIXTURES[0].home}
          away={FIXTURES[0].away}
          homeScore={FIXTURES[0].homeScore ?? 0}
          awayScore={FIXTURES[0].awayScore ?? 0}
          minute={minute}
          fallback={
            <div className="flex h-[300px] w-full items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-pitch-900 to-pitch-950">
              <span className="font-display text-2xl font-bold">
                {FIXTURES[0].home}
              </span>
              <span className="font-mono text-3xl font-bold text-neon">
                {FIXTURES[0].homeScore}–{FIXTURES[0].awayScore}
              </span>
              <span className="font-display text-2xl font-bold">
                {FIXTURES[0].away}
              </span>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* main: live points + feed */}
        <div className="space-y-6">
          {/* score banner */}
          <div className="glass relative overflow-hidden p-6">
            <div className="absolute right-0 top-0 -z-10 h-40 w-40 rounded-full bg-neon/20 blur-3xl" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="label-mono">Your live gameweek score</div>
                <div className="font-display text-5xl font-bold text-neon">
                  {totalPoints}
                  <span className="ml-2 text-lg text-white/40">pts</span>
                </div>
              </div>
              <div className="text-right">
                <div className="label-mono">Match clock</div>
                <div className="font-display text-3xl font-bold">{minute}'</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon to-electric transition-all duration-1000"
                style={{ width: `${(minute / 90) * 100}%` }}
              />
            </div>
          </div>

          {/* live player points */}
          <div className="glass p-5">
            <h3 className="mb-3 font-display font-bold">Your XI · live points</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {starters.map((p) => {
                const pts = points[p.id] ?? 0;
                const isCap = p.id === plan.captainId;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: POSITION_META[p.position].color }}
                      />
                      <span className="truncate text-sm">
                        {p.name.split(" ").slice(-1)[0]}
                        {isCap && <span className="ml-1 text-[10px] text-gold">(C)</span>}
                      </span>
                    </div>
                    <motion.span
                      key={pts}
                      initial={{ scale: 1.4, color: "#3ef08b" }}
                      animate={{ scale: 1, color: "#e9fff4" }}
                      className="font-mono text-sm font-bold"
                    >
                      {pts}
                    </motion.span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* event feed */}
          <div className="glass p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display font-bold">
              <Zap className="h-4 w-4 text-neon" /> Live feed
            </h3>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {events.length === 0 && (
                  <p className="py-6 text-center text-sm text-white/40">
                    Waiting for the next big moment…
                  </p>
                )}
                {events.map((ev) => {
                  const meta = EVENT_META[ev.type];
                  return (
                    <motion.div
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5"
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                        style={{ background: `${meta.color}1a`, color: meta.color }}
                      >
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          {meta.label} · {ev.player.name}
                        </div>
                        <div className="text-[11px] text-white/45">
                          {ev.minute}' · {ev.player.club}
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-neon">
                        +{ev.points}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* payout panel */}
        <div className="space-y-6">
          <div className="glass relative overflow-hidden p-5">
            <div className="absolute left-0 top-0 -z-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg font-bold">Instant payout</h3>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Winnings are claimable on-chain from the prize vault — then swap
              OKB to a stablecoin via OKX DEX.
            </p>
            <div className="my-4 rounded-xl bg-white/5 p-4 text-center">
              <div className="label-mono">Claimable now</div>
              <motion.div
                key={shownClaimable}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-display text-3xl font-bold text-gold"
              >
                {shownClaimable.toFixed(2)} OKB
              </motion.div>
            </div>
            <button
              onClick={claim}
              disabled={shownClaimable <= 0}
              className="btn-neon w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap className="h-4 w-4" />
              {claimed ? "Paid out ✓" : "Claim to wallet"}
            </button>
            <p className="mt-2 text-center text-[11px] text-white/35">
              payoutVault.claim(leagueId) ·{" "}
              {deployed.payoutVault ? "live on X Layer" : "demo"}
            </p>
          </div>

          <div className="glass p-5">
            <h3 className="mb-3 font-display font-bold">Scoring rules</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex justify-between"><span>Goal (FWD/MID/DEF)</span><span className="font-mono text-neon">4 / 5 / 6</span></li>
              <li className="flex justify-between"><span>Assist</span><span className="font-mono text-neon">+3</span></li>
              <li className="flex justify-between"><span>Clean sheet (DEF/GK)</span><span className="font-mono text-neon">+4</span></li>
              <li className="flex justify-between"><span>Key save</span><span className="font-mono text-neon">+2</span></li>
              <li className="flex justify-between"><span>Captain</span><span className="font-mono text-gold">×2</span></li>
            </ul>
          </div>
        </div>
      </div>

      <TxToast
        tx={tx}
        labels={{ pending: "Confirm in OKX Wallet…", success: "Claimed on X Layer" }}
      />
    </div>
  );
}
