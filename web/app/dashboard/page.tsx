"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Coins,
  Radio,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Pitch from "@/components/Pitch";
import {
  FIXTURES,
  GAMEWEEK,
  LEADERBOARD,
  ownedPlayers,
  Player,
  PRIZE_POOL_OKB,
} from "@/lib/data";
import { runAgent } from "@/lib/agents/engine";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="glass glass-hover p-4">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `${color}1a`, color }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-xs text-white/45">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const roster = ownedPlayers();
  const plan = useMemo(() => runAgent(roster, "auto"), [roster]);
  const me = LEADERBOARD.find((e) => e.you)!;

  const lineup = useMemo(() => {
    const map: Record<string, Player | undefined> = {};
    for (const [slot, id] of Object.entries(plan.lineup)) {
      map[slot] = roster.find((p) => p.id === id);
    }
    return map;
  }, [plan, roster]);

  const teamValue = roster.reduce((s, p) => s + p.price, 0);

  return (
    <div className="py-6">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono">Gameweek {GAMEWEEK} · X Layer</div>
          <h1 className="font-display text-3xl font-bold">Manager Dashboard</h1>
        </div>
        <div className="chip border-neon/20 bg-neon/5 text-neon">
          <span className="h-2 w-2 animate-pulseGlow rounded-full bg-neon" />
          Agent online · AUTO mode
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Trophy}
          label="League rank"
          value={`#${me.rank}`}
          sub={`${me.points} total pts`}
          color="#ffd35c"
        />
        <KpiCard
          icon={TrendingUp}
          label="This GW"
          value={`${me.gw} pts`}
          sub="Projected live"
          color="#3ef08b"
        />
        <KpiCard
          icon={Coins}
          label="Team value"
          value={`${teamValue.toFixed(1)} OKB`}
          sub={`${roster.length} Player NFTs`}
          color="#2dd4ff"
        />
        <KpiCard
          icon={Trophy}
          label="Prize pool"
          value={`${PRIZE_POOL_OKB} OKB`}
          sub="Pays out instantly"
          color="#ff4d8d"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* XI */}
        <div className="glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="label-mono">Your starting XI</div>
              <h2 className="font-display text-xl font-bold">
                {plan.formation} ·{" "}
                <span className="text-neon">{plan.projectedPoints} proj pts</span>
              </h2>
            </div>
            <Link href="/squad" className="btn-ghost !py-2 !text-xs">
              Edit squad <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Pitch
            formation={plan.formation}
            lineup={lineup}
            captainId={plan.captainId}
          />
        </div>

        {/* right column */}
        <div className="space-y-6">
          {/* Agent quick card */}
          <div className="glass relative overflow-hidden p-5">
            <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-neon/20 blur-3xl" />
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-neon/15 text-neon">
                <Bot className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold">Agent activity</h3>
                <p className="text-xs text-white/50">
                  Last optimised your XI {plan.formation} ·{" "}
                  {roster.length} NFTs scanned
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {plan.steps.slice(-3).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70"
                >
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />
                  {s.text}
                </motion.div>
              ))}
            </div>
            <Link href="/agent" className="btn-neon mt-4 w-full !text-xs">
              Open Agent console
            </Link>
          </div>

          {/* Live fixtures */}
          <div className="glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Matchday</h3>
              <Link href="/live" className="flex items-center gap-1 text-xs text-magenta">
                <Radio className="h-3.5 w-3.5" /> Live center
              </Link>
            </div>
            <div className="space-y-2">
              {FIXTURES.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium">{f.home}</span>
                  {f.status === "live" ? (
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neon">
                        {f.homeScore}–{f.awayScore}
                      </span>
                      <span className="rounded bg-magenta/15 px-1.5 py-0.5 text-[10px] font-bold text-magenta">
                        {f.minute}'
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-white/40">{f.kickoff}</span>
                  )}
                  <span className="font-medium">{f.away}</span>
                </div>
              ))}
            </div>
          </div>

          {/* mini leaderboard */}
          <div className="glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Top of the league</h3>
              <Link href="/leaderboard" className="flex items-center gap-1 text-xs text-neon">
                <Users className="h-3.5 w-3.5" /> Full table
              </Link>
            </div>
            <div className="space-y-1.5">
              {LEADERBOARD.slice(0, 4).map((e) => (
                <div
                  key={e.rank}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    e.you ? "bg-neon/10 text-neon" : "bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 font-mono text-white/40">{e.rank}</span>
                    {e.manager}
                    {e.agent && <Bot className="h-3 w-3 text-white/40" />}
                  </span>
                  <span className="font-mono font-semibold">{e.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
