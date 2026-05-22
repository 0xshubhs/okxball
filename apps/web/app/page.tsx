"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Bot,
  Coins,
  Radio,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import { GAMEWEEK, PLAYERS, PRIZE_POOL_OKB, type Player } from "@/lib/data";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
});

/** 2D fallback for the hero (mobile / reduced-motion / no-WebGL). */
function FloatingCards({ a, b, c }: { a: Player; b: Player; c: Player }) {
  return (
    <>
      <motion.div
        className="absolute left-1/2 top-4 z-20 w-56 -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <PlayerCard player={a} />
      </motion.div>
      <motion.div
        className="absolute left-2 top-32 z-10 hidden w-44 opacity-90 sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <PlayerCard player={b} size="sm" />
      </motion.div>
      <motion.div
        className="absolute right-2 top-40 z-10 hidden w-44 opacity-90 sm:block"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6.5, repeat: Infinity }}
      >
        <PlayerCard player={c} size="sm" />
      </motion.div>
    </>
  );
}

const FEATURES = [
  {
    icon: Bot,
    title: "AI Agents manage your squad",
    body: "Set it to AUTO or just tell it what to do — “go all-out attack, captain my hottest player”. The agent picks the XI, formation & captain from live stats.",
    color: "#3ef08b",
  },
  {
    icon: Sparkles,
    title: "Player NFTs you can train",
    body: "Every footballer is an ERC-721 on X Layer. Train and upgrade them — levels boost projected points and resale value.",
    color: "#ff4d8d",
  },
  {
    icon: Radio,
    title: "Real-time oracle scoring",
    body: "Matchday stats stream in via the on-chain ScoringOracle. Watch points tick live across the tournament, fully on-chain.",
    color: "#2dd4ff",
  },
  {
    icon: Coins,
    title: "Instant OKB payouts",
    body: "Win and claim OKB on-chain the same minute — then swap straight to a stablecoin via the OKX DEX aggregator.",
    color: "#ffd35c",
  },
];

const STEPS = [
  { n: "01", t: "Connect OKX Wallet", d: "One tap on X Layer. No seed-phrase juggling — ramp in from OKX CEX." },
  { n: "02", t: "Draft Player NFTs", d: "Mint or buy footballers. Train them up between gameweeks." },
  { n: "03", t: "Deploy your Agent", d: "Auto-pilot or prompt-driven. It manages transfers, lineup & captain." },
  { n: "04", t: "Win & cash out", d: "Live scoring, leaderboards, instant payouts to your wallet." },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold heading-gradient sm:text-3xl">
        {value}
      </div>
      <div className="label-mono mt-1">{label}</div>
    </div>
  );
}

export default function Landing() {
  const hero = PLAYERS[0];
  const hero2 = PLAYERS[5];
  const hero3 = PLAYERS[10];

  return (
    <div className="relative">
      {/* HERO */}
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="chip mb-5 border-neon/20 bg-neon/5 text-neon"
          >
            <Zap className="h-3.5 w-3.5" /> Fantasy World Cup · built on X Layer · OKX Wallet
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            Your fantasy World Cup,{" "}
            <span className="heading-gradient">run by AI agents.</span> Fully
            on-chain.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl text-base text-white/60 sm:text-lg"
          >
            Agentic Fantasy Football OS turns the World Cup into a GameFi league.
            Mint national-team Player NFTs, let AI agents auto-manage your squad
            from live match stats, and claim OKB the moment the whistle blows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/dashboard" className="btn-neon">
              <Wallet className="h-4 w-4" /> Enter the OS
            </Link>
            <Link href="/agent" className="btn-ghost">
              <Bot className="h-4 w-4" /> Meet your Agent
            </Link>
          </motion.div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            <Stat value={`${PRIZE_POOL_OKB}`} label="OKB prize pool" />
            <Stat value={`GW ${GAMEWEEK}`} label="Group stage" />
            <Stat value="11,420" label="Managers" />
          </div>
        </div>

        {/* 3D stadium (falls back to floating cards on mobile / reduced-motion) */}
        <div className="relative h-[440px]">
          <HeroCanvas
            className="absolute inset-0 h-full w-full overflow-hidden rounded-3xl"
            fallback={<FloatingCards a={hero} b={hero2} c={hero3} />}
          />
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-pitch-950/70 px-3 py-1 text-[11px] font-mono text-white/45 backdrop-blur">
            drag to orbit · live XI in 3D
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/20 blur-[100px]" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="label-mono">Why it's different</div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              GameFi depth meets autonomous agents
            </h2>
          </div>
          <Link
            href="/players"
            className="hidden text-sm text-neon hover:underline sm:block"
          >
            Browse players →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover p-5"
            >
              <div
                className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `${f.color}1a`, color: f.color }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12">
        <div className="mb-8">
          <div className="label-mono">How it works</div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            From wallet to winnings in four taps
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass relative overflow-hidden p-5"
            >
              <div className="font-display text-4xl font-bold text-white/10">
                {s.n}
              </div>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-white/55">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="glass relative overflow-hidden p-8 text-center sm:p-14">
          <div className="absolute left-1/2 top-0 -z-10 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-neon/20 blur-[90px]" />
          <Trophy className="mx-auto mb-4 h-10 w-10 text-gold" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl text-balance">
            The matchday is live. Your agent is ready.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Join {PRIZE_POOL_OKB} OKB on the line this gameweek. Connect your OKX
            Wallet and let the agent take over.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="btn-neon">
              <TrendingUp className="h-4 w-4" /> Launch Dashboard
            </Link>
            <Link href="/live" className="btn-ghost">
              <Radio className="h-4 w-4" /> Watch Live Scoring
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/35">
        Agentic Fantasy Football OS · Hackathon build on X Layer · Wallet ramp via
        OKX · Demo data is simulated
      </footer>
    </div>
  );
}
