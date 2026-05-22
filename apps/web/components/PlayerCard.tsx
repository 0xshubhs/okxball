"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { difficulty, Player, POSITION_META, Rarity } from "@/lib/data";
import StatBar from "./StatBar";

// 2-tone friendly: rarity shown via red intensity + label, not many hues.
const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legend",
  icon: "Icon",
};
const RARITY_RED: Record<Rarity, boolean> = {
  common: false,
  rare: false,
  epic: true,
  legendary: true,
  icon: true,
};

/**
 * Player card — modern red/black/white sports-app style.
 *  - "sm": compact tile · "md": full card with stat bars · "pitch": pitch token
 */
export default function PlayerCard({
  player,
  size = "md",
  selected = false,
  captain = false,
  onClick,
}: {
  player: Player;
  size?: "sm" | "md" | "pitch";
  selected?: boolean;
  captain?: boolean;
  onClick?: () => void;
}) {
  const pos = POSITION_META[player.position];
  const fix = difficulty(player.fixtureDifficulty);
  const rareRed = RARITY_RED[player.rarity];

  if (size === "pitch") {
    return (
      <button onClick={onClick} className="group relative flex w-16 flex-col items-center">
        <div
          className={`relative grid h-12 w-12 place-items-center rounded-full border-2 bg-ink-850 transition group-hover:-translate-y-0.5 ${
            captain ? "border-red" : "border-white/25"
          }`}
          style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.55)" }}
        >
          <span className="font-display text-base font-bold text-white">
            {player.rating}
          </span>
          {captain && (
            <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red font-display text-[9px] font-bold text-white">
              C
            </span>
          )}
        </div>
        <span className="mt-1.5 max-w-[64px] truncate rounded-full bg-ink-850 px-1.5 font-display text-[10px] font-semibold uppercase">
          {player.name.split(" ").slice(-1)[0]}
        </span>
      </button>
    );
  }

  const compact = size === "sm";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group relative w-full overflow-hidden rounded-2xl border bg-ink-900 text-left transition"
      style={{
        borderColor: selected ? "#ff2d2d" : "rgba(255,255,255,0.08)",
        boxShadow: selected
          ? "0 10px 30px rgba(255,45,45,0.30)"
          : "0 12px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* header */}
      <div className="flex items-start justify-between px-3.5 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold leading-none text-white">
            {player.rating}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {player.position}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            rareRed ? "text-red" : "text-bone"
          }`}
        >
          {RARITY_LABEL[player.rarity]}
        </span>
      </div>

      {/* name */}
      <div className="px-3.5 pt-1.5">
        <div className="truncate font-display text-lg font-bold uppercase leading-tight tracking-tight text-white">
          {player.name}
        </div>
        <div className="flex items-center gap-1.5 truncate text-[11px] text-bone">
          <span>{player.flag}</span>
          {player.club}
        </div>
      </div>

      {!compact && (
        <div className="mt-3 space-y-1.5 px-3.5">
          <StatBar label="PAC" value={player.stats.pace} />
          <StatBar label="SHO" value={player.stats.shooting} />
          <StatBar label="PAS" value={player.stats.passing} />
          <StatBar label="DEF" value={player.stats.defending} />
        </div>
      )}

      {/* footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-bone">
            <Flame className="h-3 w-3 text-red" />
            {player.form}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ color: fix.color, background: `${fix.color}1f` }}
          >
            v {player.fixtureOpponent}
          </span>
        </div>
        <span className="font-display text-sm font-bold text-white">
          <span className="mr-1 text-bone">L{player.level}</span>
          {player.price} OKB
        </span>
      </div>

      {captain && (
        <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-red font-display text-xs font-bold text-white">
          C
        </div>
      )}
    </motion.button>
  );
}
