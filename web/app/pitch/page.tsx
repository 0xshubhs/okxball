"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Coins,
  Gamepad2,
  Layers,
  Radio,
  Rocket,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { LogoLockup } from "@/components/logo";
import { GAMEWEEK, PRIZE_POOL_OKB } from "@/lib/data";

function Card({
  icon: Icon,
  title,
  body,
}: {
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-900 p-5">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-red/15 text-red">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-display text-lg font-bold uppercase">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-bone">{body}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-900 p-5">
      <div className="font-display text-3xl font-bold text-red sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-bone">{label}</div>
    </div>
  );
}

function Frame({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="label-mono mb-3">{kicker}</div>
      <h2 className="mb-8 max-w-4xl font-display text-4xl font-bold uppercase leading-[0.98] tracking-tight text-balance sm:text-6xl">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ---- 8 slides ----
const SLIDES: { label: string; render: () => React.ReactNode }[] = [
  {
    label: "Cover",
    render: () => (
      <div className="w-full">
        <div className="mb-8">
          <LogoLockup markSize={60} />
        </div>
        <div className="chip mb-6 border-red/30 bg-red/10 text-red">
          <Sparkles className="h-3.5 w-3.5" /> GameFi · AI Agents · NFTs — on X Layer
        </div>
        <h1 className="max-w-4xl font-display text-5xl font-bold uppercase leading-[0.92] tracking-tight text-balance sm:text-7xl">
          Fantasy football, <span className="text-red">run by AI agents.</span> Fully
          on-chain.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-bone">
          AI agents manage your squad of Player NFTs from live match stats.
          Real-time oracle scoring. Instant OKB payouts from your OKX Wallet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn-neon">
            <Wallet className="h-4 w-4" /> Try the live demo
          </Link>
          <Link href="/agent" className="btn-ghost">
            <Bot className="h-4 w-4" /> See the agent
          </Link>
        </div>
      </div>
    ),
  },
  {
    label: "Problem",
    render: () => (
      <Frame kicker="01 · The problem" title="Fantasy sports is huge — and stuck off-chain">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card icon={Target} title="Massive market" body="Hundreds of millions play fantasy football — on centralised apps with zero asset ownership and opaque payouts." />
          <Card icon={Layers} title="On-chain is thin" body="Web3 fantasy on L2s is under-built — mostly static markets. No depth, no agents, weak retention, clunky wallets." />
          <Card icon={Bot} title="Managing is a chore" body="Real fantasy is constant admin — transfers, fixtures, form. Most players churn because keeping up is exhausting." />
        </div>
      </Frame>
    ),
  },
  {
    label: "Solution",
    render: () => (
      <Frame kicker="02 · The solution" title="An agentic fantasy operating system">
        <p className="mb-6 max-w-2xl text-bone">
          You own the players as NFTs. An AI agent does the managing — on
          auto-pilot or from a one-line instruction. Everything settles on-chain
          on X Layer, in OKB, from your OKX Wallet.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={Bot} title="AI agents" body="AUTO or PROMPT mode set formation, XI and captain from live stats — and explain every call." />
          <Card icon={Sparkles} title="Player NFTs" body="Footballers as ERC-721s you can train and upgrade. Levels boost output and resale value." />
          <Card icon={Radio} title="Oracle scoring" body="Matchday points stream in live. Watch your XI tick up in real time." />
          <Card icon={Coins} title="Instant payouts" body="Prize pools settle in OKB the moment the gameweek locks — straight to your wallet." />
        </div>
      </Frame>
    ),
  },
  {
    label: "Product",
    render: () => (
      <Frame kicker="03 · How it works" title="Wallet to winnings in four taps">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Connect", "One tap with OKX Wallet, auto-switched to X Layer. Ramp in from OKX CEX."],
            ["Draft", "Mint or buy Player NFTs. Train them up between gameweeks."],
            ["Deploy agent", "Auto-pilot or prompt-driven — it sets your lineup and captain."],
            ["Win & cash out", "Live scoring, leaderboards, instant payouts."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-white/[0.07] bg-ink-900 p-5">
              <div className="font-display text-5xl font-bold text-white/10">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-2 font-display text-lg font-bold uppercase">{t}</h3>
              <p className="mt-1.5 text-sm text-bone">{d}</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    label: "Audience",
    render: () => (
      <Frame kicker="04 · Target audience" title="Who it's for">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card icon={Trophy} title="Traditional fantasy players" body="The 100M+ on FPL & daily fantasy who want real ownership, transparent prizes and less weekly admin." />
          <Card icon={Gamepad2} title="GameFi & crypto-native gamers" body="Players who want depth — collectible NFTs, training loops and on-chain competition with actual stakes." />
          <Card icon={TrendingUp} title="Sports predictors & bettors" body="Fans who already wager on matches — drawn by skill-based, agent-assisted, instant-payout competition." />
          <Card icon={Wallet} title="OKX users & newcomers" body="The huge OKX base, on-ramped in one tap — fans who'd never touch a seed phrase but love football." />
        </div>
      </Frame>
    ),
  },
  {
    label: "Business",
    render: () => (
      <Frame kicker="05 · Business model" title="How it makes money">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card icon={Sparkles} title="NFT mint & packs" body="Primary sales of Player NFTs across rarity tiers — the core acquisition revenue." />
          <Card icon={Zap} title="Training fees" body="A small OKB fee each time a player is trained or upgraded — recurring, habitual spend." />
          <Card icon={Trophy} title="League rake" body="A modest % of every prize pool on entry — scales directly with engagement and volume." />
          <Card icon={ShoppingBag} title="Marketplace royalties" body="Royalty on secondary NFT trades as a real player economy forms." />
          <Card icon={Bot} title="Premium agents" body="Subscription tiers for advanced agent strategies, analytics and auto-transfers." />
          <Card icon={Coins} title="Volume flywheel" body="Mints → training → leagues → payouts → resale: each loop compounds on-chain activity." />
        </div>
      </Frame>
    ),
  },
  {
    label: "Scale",
    render: () => (
      <Frame kicker="06 · Why now, why X Layer" title="Built to scale on X Layer + OKX">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value="100M+" label="Fantasy football players" />
          <Stat value={`${PRIZE_POOL_OKB}`} label="OKB prize pool (demo)" />
          <Stat value={`GW${GAMEWEEK}`} label="Weekly return cadence" />
          <Stat value="11,420" label="Demo managers" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card icon={Zap} title="Throughput for spikes" body="Matchdays are bursty and concurrent — X Layer's speed and low fees keep scoring and payouts snappy." />
          <Card icon={Wallet} title="Seamless ramps" body="OKX Wallet + OKB collapse the on-ramp, bringing the traditional fantasy market on-chain." />
          <Card icon={Coins} title="Deep liquidity" body="Instant payouts route through OKX DEX liquidity — winnings are real and immediate." />
        </div>
      </Frame>
    ),
  },
  {
    label: "Ask",
    render: () => (
      <Frame kicker="07 · Roadmap & the ask" title="From hackathon to season one">
        <div className="mb-8 space-y-3">
          {[
            ["Now", "Live demo: full flow on X Layer testnet — agents, NFTs, scoring, payouts."],
            ["Next", "Real sports-data oracle, mainnet launch, public OKB leagues."],
            ["Then", "On-chain social layer + copy-able agents, secondary marketplace."],
            ["Later", "Cross-L2 football liquidity via AggLayer."],
          ].map(([t, d]) => (
            <div key={t} className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-ink-900 p-4">
              <span className="w-14 shrink-0 font-display text-sm font-bold uppercase text-red">{t}</span>
              <span className="text-sm text-bone">{d}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Rocket className="h-6 w-6 text-red" />
          <span className="font-display text-xl font-bold uppercase">
            Let's bring fantasy football fully on-chain.
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn-neon">
            <Zap className="h-4 w-4" /> Launch the app
          </Link>
          <Link href="/leaderboard" className="btn-ghost">
            <Users className="h-4 w-4" /> See the league
          </Link>
        </div>
      </Frame>
    ),
  },
];

export default function PitchPage() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const total = SLIDES.length;

  const go = useCallback(
    (next: number) => {
      setDir(next > i ? 1 : -1);
      setI(Math.max(0, Math.min(total - 1, next)));
    },
    [i, total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  return (
    <div className="relative">
      {/* progress bar */}
      <div className="mb-6 mt-2 flex items-center gap-3">
        <span className="font-display text-sm font-bold text-red">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-red"
            animate={{ width: `${((i + 1) / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
        </div>
        <span className="font-display text-sm font-bold text-bone">
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* slide stage */}
      <div className="relative flex min-h-[60vh] items-center sm:min-h-[64vh]">
        {/* side arrows (desktop) */}
        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          aria-label="Previous slide"
          className="absolute -left-2 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-ink-900 text-white transition hover:border-red hover:text-red disabled:opacity-30 lg:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(i + 1)}
          disabled={i === total - 1}
          aria-label="Next slide"
          className="absolute -right-2 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/15 bg-ink-900 text-white transition hover:border-red hover:text-red disabled:opacity-30 lg:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="w-full overflow-hidden px-0 lg:px-14">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              {SLIDES[i].render()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* bottom controls */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="btn-ghost !px-4 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>

        <div className="flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.label}
              onClick={() => go(idx)}
              aria-label={`Go to ${s.label}`}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-6 bg-red" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(i + 1)}
          disabled={i === total - 1}
          className="btn-neon !px-4 disabled:opacity-30"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-bone">
        Use ← → arrow keys · {SLIDES[i].label}
      </p>
    </div>
  );
}
