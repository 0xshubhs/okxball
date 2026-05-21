"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dumbbell,
  Flame,
  Plus,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import PlayerCard from "@/components/PlayerCard";
import StatBar from "@/components/StatBar";
import {
  difficulty,
  PLAYERS,
  Player,
  Position,
  POSITION_META,
  RARITY_META,
} from "@/lib/data";
import { TRAIN_PRICE } from "@/lib/contracts";

type Tab = "all" | "owned" | "market";
const POSITIONS: (Position | "ALL")[] = ["ALL", "GK", "DEF", "MID", "FWD"];

export default function PlayersPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [pos, setPos] = useState<Position | "ALL">("ALL");
  const [players, setPlayers] = useState<Player[]>(PLAYERS);
  const [active, setActive] = useState<Player | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (tab === "owned" && !p.owned) return false;
      if (tab === "market" && p.owned) return false;
      if (pos !== "ALL" && p.position !== pos) return false;
      return true;
    });
  }, [players, tab, pos]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function update(id: string, patch: Partial<Player>) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setActive((a) => (a && a.id === id ? { ...a, ...patch } : a));
  }

  function train(p: Player) {
    // On-chain: playerNFT.train(tokenId) { value: TRAIN_PRICE }
    const gained = 60 + Math.floor(Math.random() * 60);
    let xp = p.xp + gained;
    let level = p.level;
    let rating = p.rating;
    let xpToNext = p.xpToNext;
    let form = Math.min(10, p.form + 1);
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      rating = Math.min(99, rating + 1);
      xpToNext = Math.round(xpToNext * 1.15);
    }
    update(p.id, { xp, level, rating, xpToNext, form });
    flash(
      level > p.level
        ? `🎉 ${p.name} leveled up to Lv${level} (+rating)`
        : `💪 ${p.name} trained · +${gained} XP`
    );
  }

  function buy(p: Player) {
    // On-chain: marketplace buy / playerNFT.mint(rarity)
    update(p.id, { owned: true });
    flash(`✓ Acquired ${p.name} for ${p.price} OKB`);
  }

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono">Player NFTs · ERC-721 on X Layer</div>
          <h1 className="font-display text-3xl font-bold">Collection & Market</h1>
        </div>
        <button onClick={() => flash("Mint flow: playerNFT.mint(rarity) — simulated")} className="btn-neon !py-2 !text-sm">
          <Plus className="h-4 w-4" /> Mint pack
        </button>
      </div>

      {/* filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(["all", "owned", "market"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-neon text-pitch-950" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {POSITIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPos(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                pos === p ? "bg-white/15 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="relative">
            <PlayerCard player={p} onClick={() => setActive(p)} />
            {!p.owned && (
              <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-pitch-950/80 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                Market
              </span>
            )}
          </div>
        ))}
      </div>

      {/* detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-3xl overflow-hidden"
            >
              <div className="grid gap-0 sm:grid-cols-[260px_1fr]">
                <div className="bg-white/[0.03] p-5">
                  <PlayerCard player={active} />
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold">{active.name}</h3>
                      <p className="text-sm text-white/55">
                        {active.club} · {active.flag} {active.country}
                      </p>
                    </div>
                    <button onClick={() => setActive(null)} className="text-white/50 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className={`chip ${RARITY_META[active.rarity].chip}`}>
                      <Sparkles className="h-3 w-3" /> {RARITY_META[active.rarity].label}
                    </span>
                    <span
                      className="chip"
                      style={{ color: POSITION_META[active.position].color }}
                    >
                      {POSITION_META[active.position].label}
                    </span>
                    <span className="chip">
                      <Flame className="h-3 w-3 text-magenta" /> Form {active.form}/10
                    </span>
                    <span
                      className="chip"
                      style={{ color: difficulty(active.fixtureDifficulty).color }}
                    >
                      vs {active.fixtureOpponent} · {difficulty(active.fixtureDifficulty).label}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    <StatBar label="PAC" value={active.stats.pace} />
                    <StatBar label="SHO" value={active.stats.shooting} color="#ff4d8d" />
                    <StatBar label="PAS" value={active.stats.passing} color="#2dd4ff" />
                    <StatBar label="DEF" value={active.stats.defending} color="#ffd35c" />
                    <StatBar label="PHY" value={active.stats.physical} color="#a78bfa" />
                  </div>

                  {/* training xp */}
                  <div className="mb-4 rounded-xl bg-white/5 p-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold">Level {active.level}</span>
                      <span className="font-mono text-white/50">
                        {active.xp}/{active.xpToNext} XP
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon to-electric"
                        style={{ width: `${(active.xp / active.xpToNext) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {active.owned ? (
                      <button
                        onClick={() => train(active)}
                        className="btn-neon flex-1 !text-sm"
                      >
                        <Dumbbell className="h-4 w-4" /> Train · {TRAIN_PRICE} OKB
                      </button>
                    ) : (
                      <button
                        onClick={() => buy(active)}
                        className="btn-neon flex-1 !text-sm"
                      >
                        <ShoppingCart className="h-4 w-4" /> Buy · {active.price} OKB
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 text-xs text-white/60">
                      <TrendingUp className="h-4 w-4 text-neon" />
                      Token #{active.tokenId}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-neon/30 bg-pitch-900/95 px-5 py-3 text-sm font-semibold text-neon shadow-neon backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
