"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, Crown, Sparkles, Wand2, X } from "lucide-react";
import Pitch from "@/components/Pitch";
import PlayerCard from "@/components/PlayerCard";
import {
  FORMATIONS,
  FormationName,
  ownedPlayers,
  Player,
  POSITION_META,
} from "@/lib/data";
import { projectedPoints, runAgent } from "@/lib/agents/engine";

export default function SquadBuilder() {
  const roster = useMemo(() => ownedPlayers(), []);
  const [formation, setFormation] = useState<FormationName>("4-3-3");
  const [lineup, setLineup] = useState<Record<string, string | undefined>>({});
  const [captainId, setCaptainId] = useState<string>("");
  const [picking, setPicking] = useState<string | null>(null); // slotId
  const [toast, setToast] = useState<string | null>(null);

  const slots = FORMATIONS[formation];
  const lineupPlayers = useMemo(() => {
    const map: Record<string, Player | undefined> = {};
    for (const s of slots) map[s.id] = roster.find((p) => p.id === lineup[s.id]);
    return map;
  }, [slots, lineup, roster]);

  const usedIds = new Set(Object.values(lineup).filter(Boolean) as string[]);
  const filled = usedIds.size;
  const projTotal = useMemo(() => {
    let t = 0;
    for (const id of usedIds) {
      const p = roster.find((x) => x.id === id);
      if (p) t += projectedPoints(p) * (p.id === captainId ? 2 : 1);
    }
    return Math.round(t * 10) / 10;
  }, [usedIds, roster, captainId]);

  function pickSlotPosition(slotId: string) {
    return slots.find((s) => s.id === slotId)?.position;
  }

  function assign(slotId: string, playerId: string) {
    setLineup((prev) => {
      // remove player from any other slot first
      const next = { ...prev };
      for (const k of Object.keys(next)) if (next[k] === playerId) next[k] = undefined;
      next[slotId] = playerId;
      return next;
    });
    setPicking(null);
  }

  function clearSlot(slotId: string) {
    setLineup((prev) => ({ ...prev, [slotId]: undefined }));
  }

  function autoPick() {
    const plan = runAgent(roster, "auto");
    setFormation(plan.formation);
    setLineup(plan.lineup);
    setCaptainId(plan.captainId);
    flash("⚡ Agent optimised your XI");
  }

  function submit() {
    if (filled < slots.length) {
      flash("Fill all positions before submitting");
      return;
    }
    // On-chain: fantasyLeague.submitLineup(leagueId, tokenIds, captainTokenId)
    flash("Lineup submitted on-chain ✓ (tx simulated)");
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  const eligible = picking
    ? roster
        .filter((p) => p.position === pickSlotPosition(picking))
        .sort((a, b) => projectedPoints(b) - projectedPoints(a))
    : [];

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono">Squad builder</div>
          <h1 className="font-display text-3xl font-bold">Set your lineup</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={autoPick} className="btn-ghost !py-2 !text-sm">
            <Wand2 className="h-4 w-4 text-neon" /> Auto-pick with Agent
          </button>
          <button onClick={submit} className="btn-neon !py-2 !text-sm">
            <Check className="h-4 w-4" /> Submit on-chain
          </button>
        </div>
      </div>

      {/* formation + summary bar */}
      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="label-mono mr-1">Formation</span>
          {(Object.keys(FORMATIONS) as FormationName[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFormation(f);
                setLineup({});
                setCaptainId("");
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                formation === f
                  ? "bg-neon text-pitch-950"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <div>
            <div className="label-mono">Filled</div>
            <div className="font-display text-lg font-bold">
              {filled}/{slots.length}
            </div>
          </div>
          <div>
            <div className="label-mono">Projected</div>
            <div className="font-display text-lg font-bold text-neon">
              {projTotal} pts
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* pitch */}
        <div className="glass p-4 sm:p-6">
          <Pitch
            formation={formation}
            lineup={lineupPlayers}
            captainId={captainId}
            onSlotClick={(slotId) =>
              lineup[slotId] ? clearSlot(slotId) : setPicking(slotId)
            }
          />
          <p className="mt-3 text-center text-xs text-white/40">
            Tap an empty slot to pick · tap a player to remove · set the captain
            from the bench →
          </p>
        </div>

        {/* roster / captain panel */}
        <div className="space-y-4">
          <div className="glass p-4">
            <div className="mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-gold" />
              <h3 className="font-display font-bold">Captain (×2 points)</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(usedIds).map((id) => {
                const p = roster.find((x) => x.id === id)!;
                const isCap = id === captainId;
                return (
                  <button
                    key={id}
                    onClick={() => setCaptainId(id)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                      isCap
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                  >
                    {isCap ? (
                      <Crown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: POSITION_META[p.position].color }}
                      />
                    )}
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
              {filled === 0 && (
                <p className="col-span-2 text-xs text-white/40">
                  Pick players first, then choose a captain.
                </p>
              )}
            </div>
          </div>

          <div className="glass p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-bold">Your NFTs</h3>
              <span className="chip">{roster.length} owned</span>
            </div>
            <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-y-auto pr-1">
              {roster.map((p) => (
                <div key={p.id} className="relative">
                  <PlayerCard player={p} size="sm" selected={usedIds.has(p.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* picker modal */}
      <AnimatePresence>
        {picking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setPicking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-2xl p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-neon" />
                  <h3 className="font-display text-lg font-bold">
                    Pick a {POSITION_META[pickSlotPosition(picking)!].label}
                  </h3>
                </div>
                <button
                  onClick={() => setPicking(null)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {eligible.length ? (
                <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                  {eligible.map((p) => (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      size="sm"
                      selected={usedIds.has(p.id)}
                      onClick={() => assign(picking, p.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 p-6 text-center text-sm text-white/50">
                  <Bot className="mx-auto mb-2 h-6 w-6 text-neon" />
                  You don&apos;t own a player for this position yet. Mint one on
                  the Players page.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
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
    </div>
  );
}
