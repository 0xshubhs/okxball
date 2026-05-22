"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Scene3D from "./Scene3D";
import type { Player } from "@/lib/data";

const PlayerCard3D = dynamic(() => import("./PlayerCard3D"), { ssr: false });

export default function PlayerCard3DCanvas({
  player,
  className,
  fallback,
}: {
  player: Player;
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <Scene3D
      className={className}
      fallback={fallback}
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={[1, 2]}
    >
      <PlayerCard3D player={player} />
    </Scene3D>
  );
}
