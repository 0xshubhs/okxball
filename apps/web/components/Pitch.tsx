"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FORMATIONS, FormationName, Player } from "@/lib/data";
import PlayerCard from "./PlayerCard";

export default function Pitch({
  formation,
  lineup,
  captainId,
  onSlotClick,
}: {
  formation: FormationName;
  /** slotId -> Player */
  lineup: Record<string, Player | undefined>;
  captainId?: string;
  onSlotClick?: (slotId: string) => void;
}) {
  const slots = FORMATIONS[formation];

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-neon/15 pitch-stripes bg-gradient-to-b from-pitch-700/40 via-pitch-800/60 to-pitch-900">
      {/* pitch markings */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-4 rounded-2xl border border-white/15" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-white/15" />
        {/* penalty boxes */}
        <div className="absolute left-1/2 top-4 h-16 w-40 -translate-x-1/2 border border-white/15" />
        <div className="absolute bottom-4 left-1/2 h-16 w-40 -translate-x-1/2 border border-white/15" />
        <div className="absolute left-1/2 top-4 h-7 w-20 -translate-x-1/2 border border-white/15" />
        <div className="absolute bottom-4 left-1/2 h-7 w-20 -translate-x-1/2 border border-white/15" />
      </div>

      {/* glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-neon/10 to-transparent" />

      {slots.map((slot, i) => {
        const p = lineup[slot.id];
        return (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 240, damping: 18 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {p ? (
              <PlayerCard
                player={p}
                size="pitch"
                captain={p.id === captainId}
                onClick={() => onSlotClick?.(slot.id)}
              />
            ) : (
              <button
                onClick={() => onSlotClick?.(slot.id)}
                className="flex w-16 flex-col items-center"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-white/25 bg-white/5 text-white/40 transition hover:border-neon hover:text-neon">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="mt-1 rounded bg-pitch-950/70 px-1 text-[10px] font-medium text-white/40">
                  {slot.position}
                </span>
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
