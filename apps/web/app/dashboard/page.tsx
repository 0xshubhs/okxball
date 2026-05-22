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
  FORMATIONS,
  FormationName,
  GAMEWEEK,
  LEADERBOARD,
  ownedPlayers,
  PLAYERS,
  Player,
  PRIZE_POOL_OKB,
} from "@/lib/data";
import { runAgent } from "@/lib/agents/engine";
import {
  useAccount,
  useDeployed,
  useOnchainStandings,
  usePlayerBalance,
  useSubmittedLineup,
} from "@/lib/onchain";

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

  const { address } = useAccount();
  const deployed = useDeployed();
  const { standings } = useOnchainStandings();
  const { data: nftBalance } = usePlayerBalance(address);
  const { data: lineupData } = useSubmittedLineup(address);
  const onchain = deployed.fantasyLeague && standings.length > 0;
  const myRow = address
    ? standings.find((s) => s.address.toLowerCase() === address.toLowerCase())
    : undefined;

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  const rankValue = onchain && myRow ? `#${myRow.rank}` : `#${me.rank}`;
  const totalPtsSub =
    onchain && myRow ? `${myRow.points} total pts` : `${me.points} total pts`;
  const gwValue = onchain && myRow ? `${myRow.points} pts` : `${me.gw} pts`;
  const nftCount =
    onchain && nftBalance != null ? Number(nftBalance) : roster.length;

  type Mini = {
    rank: number;
    manager: string;
    points: number;
    agent: boolean;
    you: boolean;
  };
  const miniRows: Mini[] = onchain
    ? standings.slice(0, 4).map((s) => {
        const you =
          !!address && s.address.toLowerCase() === address.toLowerCase();
        return {
          rank: s.rank,
          manager: you ? "You" : short(s.address),
          points: s.points,
          agent: false,
          you,
        };
      })
    : LEADERBOARD.slice(0, 4).map((e) => ({
        rank: e.rank,
        manager: e.manager,
        points: e.points,
        agent: e.agent,
        you: !!e.you,
      }));

  const lineup = useMemo(() => {
    const map: Record<string, Player | undefined> = {};
    for (const [slot, id] of Object.entries(plan.lineup)) {
      map[slot] = roster.find((p) => p.id === id);
    }
    return map;
  }, [plan, roster]);

  const teamValue = roster.reduce((s, p) => s + p.price, 0);

  // Submitted XI read from chain (getLineup), placed onto a best-fit formation.
  const submittedView = useMemo(() => {
    const ids = (lineupData?.[0] as readonly bigint[] | undefined) ?? [];
    const submitted = !!lineupData?.[2];
    const capId = lineupData?.[1] as bigint | undefined;
    if (!onchain || !submitted || ids.length === 0) return null;
    const players = ids
      .map((id) => PLAYERS.find((p) => p.tokenId === Number(id)))
      .filter((p): p is Player => !!p);
    if (!players.length) return null;

    let best:
      | { formation: FormationName; map: Record<string, Player | undefined>; placed: number }
      | null = null;
    for (const f of Object.keys(FORMATIONS) as FormationName[]) {
      const pools: Record<string, Player[]> = {};
      for (const p of players) (pools[p.position] ??= []).push(p);
      const map: Record<string, Player | undefined> = {};
      let placed = 0;
      for (const s of FORMATIONS[f]) {
        const p = pools[s.position]?.shift();
        if (p) {
          map[s.id] = p;
          placed++;
        }
      }
      if (!best || placed > best.placed) best = { formation: f, map, placed };
    }
    const cap =
      capId != null ? players.find((p) => p.tokenId === Number(capId)) : undefined;
    return best ? { ...best, captainId: cap?.id ?? "" } : null;
  }, [lineupData, onchain]);

  const pitchFormation = submittedView ? submittedView.formation : plan.formation;
  const pitchLineup = submittedView ? submittedView.map : lineup;
  const pitchCaptain = submittedView ? submittedView.captainId : plan.captainId;

  return (
    <div className="py-6">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono flex items-center gap-2">
            Group stage · GW {GAMEWEEK}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                onchain ? "bg-neon/15 text-neon" : "bg-white/10 text-white/50"
              }`}
            >
              {onchain ? "Live · on-chain" : "Demo"}
            </span>
          </div>
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
          value={rankValue}
          sub={totalPtsSub}
          color="#ffd35c"
        />
        <KpiCard
          icon={TrendingUp}
          label="This GW"
          value={gwValue}
          sub={onchain ? "On-chain score" : "Projected live"}
          color="#3ef08b"
        />
        <KpiCard
          icon={Coins}
          label="Team value"
          value={`${teamValue.toFixed(1)} OKB`}
          sub={`${nftCount} Player NFTs`}
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
              <div className="label-mono">
                {submittedView ? "Your submitted XI · on-chain" : "Your starting XI"}
              </div>
              <h2 className="font-display text-xl font-bold">
                {pitchFormation} ·{" "}
                <span className="text-neon">
                  {submittedView
                    ? `${submittedView.placed} player${submittedView.placed === 1 ? "" : "s"} on-chain`
                    : `${plan.projectedPoints} proj pts`}
                </span>
              </h2>
            </div>
            <Link href="/squad" className="btn-ghost !py-2 !text-xs">
              Edit squad <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Pitch
            formation={pitchFormation}
            lineup={pitchLineup}
            captainId={pitchCaptain}
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
              {miniRows.map((e) => (
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
