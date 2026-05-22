"use client";

import { FIXTURES } from "@/lib/data";

/** Broadcast-style scrolling score ticker that sits under the navbar. */
export default function Ticker() {
  const items = FIXTURES.map((f) => {
    const score =
      f.status === "upcoming"
        ? f.kickoff
        : `${f.homeScore ?? 0}–${f.awayScore ?? 0}`;
    const tag =
      f.status === "live" ? `${f.minute}'` : f.status === "ft" ? "FT" : "";
    return { ...f, score, tag };
  });

  const Row = () => (
    <div className="flex shrink-0 items-center">
      <span className="mx-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-flame">
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-flame" />
        Live Matchday
      </span>
      {items.map((f) => (
        <span
          key={f.id}
          className="mx-4 flex items-center gap-2 whitespace-nowrap font-mono text-xs"
        >
          <span className="font-semibold text-cream">{f.home}</span>
          <span className="scoreboard font-bold text-flame">{f.score}</span>
          <span className="font-semibold text-cream">{f.away}</span>
          {f.tag && (
            <span className="text-[10px] font-bold uppercase text-bone">
              {f.tag}
            </span>
          )}
          <span className="text-ink-600">•</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="sticky top-16 z-30 overflow-hidden border-b border-ink-700 bg-ink-950 py-1.5">
      <div className="flex w-max animate-ticker">
        <Row />
        <Row />
      </div>
    </div>
  );
}
