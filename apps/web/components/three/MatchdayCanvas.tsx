"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Scene3D from "./Scene3D";

const MatchdayScene = dynamic(() => import("./MatchdayScene"), { ssr: false });

export default function MatchdayCanvas({
  home,
  away,
  homeScore,
  awayScore,
  minute,
  className,
  fallback,
}: {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <Scene3D
      className={className}
      fallback={fallback}
      camera={{ position: [0, 5, 13], fov: 38 }}
      dpr={[1, 2]}
    >
      <MatchdayScene
        home={home}
        away={away}
        homeScore={homeScore}
        awayScore={awayScore}
        minute={minute}
      />
    </Scene3D>
  );
}
