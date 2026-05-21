"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { difficulty, Player, POSITION_META, Rarity } from "@/lib/data";
import StatBar from "./StatBar";

const RARITY_COLOR: Record<Rarity, string> = {
  common: "#8b938c",
  rare: "#3b6bff",
  epic: "#ff2e7e",
  legendary: "#ffc233",
  icon: "#ff4d1c",
};
const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legend",
  icon: "Icon",
};

/**
 * Panini / FUT-style collectible card. Solid fills, hard edges, jersey numerals.
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
  const rare = RARITY_COLOR[player.rarity];
  const fix = difficulty(player.fixtureDifficulty);

  if (size === "pitch") {
    return (
      <button onClick={onClick} className="group relative flex w-16 flex-col items-center">
        <div
          className="relative grid h-12 w-12 place-items-center rounded-md border-2 bg-ink-900 transition group-hover:-translate-y-0.5"
          style={{ borderColor: pos.color, boxShadow: "2px 2px 0 0 #000" }}
        >
          <span className="font-display text-base font-bold text-cream">
            {player.rating}
          </span>
          <span
            className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2"
            style={{ background: rare }}
          />
          {captain && (
            <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-sm bg-gold font-display text-[9px] font-bold text-ink-950">
              C
            </span>
          )}
        </div>
        <span className="mt-1.5 max-w-[64px] truncate border border-ink-700 bg-ink-950 px-1 font-display text-[10px] font-semibold uppercase">
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
      className="group relative w-full overflow-hidden rounded-lg border-2 bg-ink-900 text-left transition"
      style={{
        borderColor: selected ? "#ff4d1c" : "#262e2b",
        boxShadow: selected ? "4px 4px 0 0 #ff4d1c" : "4px 4px 0 0 #000",
      }}
    >
      {/* rarity top bar */}
      <div className="h-1.5 w-full" style={{ background: rare }} />

      {/* header: rating + position */}
      <div className="flex items-start justify-between px-3 pt-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold leading-none text-cream">
            {player.rating}
          </span>
          <span
            className="rounded-sm px-1.5 py-0.5 font-display text-[10px] font-bold uppercase text-ink-950"
            style={{ background: pos.color }}
          >
            {player.position}
          </span>
        </div>
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-wider"
          style={{ color: rare }}
        >
          {RARITY_LABEL[player.rarity]}
        </span>
      </div>

      {/* name */}
      <div className="px-3 pt-1.5">
        <div className="truncate font-display text-lg font-bold uppercase leading-tight tracking-tight text-cream">
          {player.name}
        </div>
        <div className="flex items-center gap-1.5 truncate text-[11px] text-bone">
          <span>{player.flag}</span>
          {player.club}
        </div>
      </div>

      {!compact && (
        <div className="mt-2.5 space-y-1.5 border-t border-ink-700 px-3 pt-2.5">
          <StatBar label="PAC" value={player.stats.pace} color="#16d672" />
          <StatBar label="SHO" value={player.stats.shooting} color="#ff4d1c" />
          <StatBar label="PAS" value={player.stats.passing} color="#3b6bff" />
          <StatBar label="DEF" value={player.stats.defending} color="#ffc233" />
        </div>
      )}

      {/* footer */}
      <div className="mt-2 flex items-center justify-between border-t border-ink-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[11px] text-bone">
            <Flame className="h-3 w-3 text-flame" />
            {player.form}
          </span>
          <span
            className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase"
            style={{ color: fix.color, background: `${fix.color}1f` }}
          >
            v {player.fixtureOpponent}
          </span>
        </div>
        <span className="scoreboard text-xs font-bold text-cream">
          <span className="mr-1 text-bone">L{player.level}</span>
          {player.price} OKB
        </span>
      </div>

      {captain && (
        <div className="absolute right-2.5 top-3 grid h-6 w-6 place-items-center rounded-sm bg-gold font-display text-xs font-bold text-ink-950">
          C
        </div>
      )}
    </motion.button>
  );
}
