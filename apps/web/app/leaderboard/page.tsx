"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatEther } from "viem";
import {
  ArrowLeftRight,
  Bot,
  Coins,
  Crown,
  Gift,
  Medal,
  Trophy,
  Users,
} from "lucide-react";
import { GAMEWEEK, LEADERBOARD, PRIZE_POOL_OKB } from "@/lib/data";
import TxToast from "@/components/TxToast";
import SwapModal from "@/components/SwapModal";
import {
  useAccount,
  useClaimable,
  useDeployed,
  useFantasyTx,
  useOnchainStandings,
  txClaim,
  txJoinLeague,
} from "@/lib/onchain";

const SPLIT = [
  { place: "1st", pct: 0.5, color: "#ffd35c", icon: Crown },
  { place: "2nd", pct: 0.3, color: "#cbd5e1", icon: Medal },
  { place: "3rd", pct: 0.2, color: "#d97757", icon: Medal },
];

export default function LeaderboardPage() {
  const [toast, setToast] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const deployed = useDeployed();
  const tx = useFantasyTx();
  const { data: claimableWei } = useClaimable(address);
  const claimableOkb = claimableWei ? Number(formatEther(claimableWei)) : 0;
  const [swapOpen, setSwapOpen] = useState(false);
  const { standings } = useOnchainStandings();
  const onchain = deployed.fantasyLeague && standings.length > 0;

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  type Row = {
    rank: number;
    manager: string;
    address: string;
    points: number;
    gw: string | number;
    agent: boolean;
    you: boolean;
  };
  const rows: Row[] = onchain
    ? standings.map((s) => {
        const you =
          !!address && s.address.toLowerCase() === address.toLowerCase();
        return {
          rank: s.rank,
          manager: you ? "You" : short(s.address),
          address: short(s.address),
          points: s.points,
          gw: "—",
          agent: false,
          you,
        };
      })
    : LEADERBOARD.map((e) => ({
        rank: e.rank,
        manager: e.manager,
        address: e.address,
        points: e.points,
        gw: e.gw,
        agent: e.agent,
        you: !!e.you,
      }));

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  }

  async function join() {
    if (deployed.fantasyLeague && isConnected) {
      try {
        await tx.writeContractAsync(txJoinLeague());
      } catch {
        /* surfaced by TxToast */
      }
      return;
    }
    flash("Joined league ✓ entry fee paid in OKB (demo)");
  }

  async function claim() {
    if (deployed.payoutVault && isConnected) {
      try {
        await tx.writeContractAsync(txClaim());
      } catch {
        /* surfaced by TxToast */
      }
      return;
    }
    flash("Winnings settle here when the gameweek locks (demo)");
  }

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono flex items-center gap-2">
            Fantasy World Cup · Group stage
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                onchain ? "bg-neon/15 text-neon" : "bg-white/10 text-white/50"
              }`}
            >
              {onchain ? "Live · on-chain" : "Demo"}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold">League Standings</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={claim}
            disabled={deployed.payoutVault && claimableOkb === 0}
            className="btn-ghost !py-2 !text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Gift className="h-4 w-4 text-gold" />{" "}
            {deployed.payoutVault && claimableOkb > 0
              ? `Claim ${claimableOkb} OKB`
              : "Claim winnings"}
          </button>
          <button onClick={join} className="btn-neon !py-2 !text-sm">
            <Users className="h-4 w-4" /> Join league · 0.02 OKB
          </button>
        </div>
      </div>

      {/* prize pool */}
      <div className="glass relative mb-6 overflow-hidden p-6">
        <div className="absolute left-1/2 top-0 -z-10 h-32 w-[28rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[80px]" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold">
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <div className="label-mono">Prize pool</div>
              <div className="font-display text-3xl font-bold">
                {PRIZE_POOL_OKB} <span className="text-lg text-white/40">OKB</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {SPLIT.map((s) => (
              <div key={s.place} className="text-center">
                <s.icon className="mx-auto h-5 w-5" style={{ color: s.color }} />
                <div className="mt-1 font-display text-lg font-bold" style={{ color: s.color }}>
                  {Math.round(PRIZE_POOL_OKB * s.pct)} OKB
                </div>
                <div className="label-mono">{s.place} · {s.pct * 100}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-white/45">
            <Coins className="h-3.5 w-3.5 text-gold" />
            Settled instantly via OKX DEX when the gameweek locks — no manual
            distribution.
          </p>
          <button
            onClick={() => setSwapOpen(true)}
            className="btn-ghost !py-1.5 !text-xs"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-neon" /> Swap winnings (OKX
            DEX)
          </button>
        </div>
      </div>

      {/* table */}
      <div className="glass overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_88px_88px] gap-2 border-b border-white/10 px-4 py-3 text-left">
          <span className="label-mono">#</span>
          <span className="label-mono">Manager</span>
          <span className="label-mono text-right">GW {GAMEWEEK}</span>
          <span className="label-mono text-right">Total</span>
        </div>
        {rows.map((e, i) => (
          <motion.div
            key={e.rank}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`grid grid-cols-[48px_1fr_88px_88px] items-center gap-2 px-4 py-3 transition ${
              e.you
                ? "bg-neon/10"
                : "hover:bg-white/[0.03]"
            } ${i !== rows.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span
              className={`font-display text-lg font-bold ${
                e.rank === 1
                  ? "text-gold"
                  : e.rank === 2
                    ? "text-slate-300"
                    : e.rank === 3
                      ? "text-[#d97757]"
                      : "text-white/40"
              }`}
            >
              {e.rank}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`truncate font-semibold ${e.you ? "text-neon" : ""}`}>
                  {e.manager}
                </span>
                {e.agent && (
                  <span className="chip !px-2 !py-0.5 !text-[10px] text-neon">
                    <Bot className="h-3 w-3" /> agent
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-white/40">{e.address}</div>
            </div>
            <span className="text-right font-mono text-sm text-white/70">{e.gw}</span>
            <span className="text-right font-mono text-sm font-bold">{e.points}</span>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-white/35">
        {onchain
          ? `Standings read live from FantasyLeague on X Layer · ${rows.length} manager${rows.length === 1 ? "" : "s"} joined.`
          : `${LEADERBOARD.filter((e) => e.agent).length}/${LEADERBOARD.length} top managers are running AI agents this gameweek.`}
      </p>

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
        labels={{
          pending: "Confirm in OKX Wallet…",
          success: "Settled on X Layer",
        }}
      />

      <SwapModal
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        toToken={process.env.NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS || undefined}
      />
    </div>
  );
}
