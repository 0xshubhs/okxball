"use client";

import { motion } from "framer-motion";

export default function StatBar({
  label,
  value,
  max = 100,
  color = "#ff2d2d",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-mono text-[10px] font-bold uppercase tracking-wider text-bone">
        {label}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-sm bg-ink-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ background: color }}
        />
      </div>
      <span className="scoreboard w-6 text-right text-xs font-bold text-cream">
        {value}
      </span>
    </div>
  );
}
