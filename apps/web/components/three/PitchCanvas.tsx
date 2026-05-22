"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Scene3D from "./Scene3D";
import type { Player, Slot } from "@/lib/data";

const Pitch3D = dynamic(() => import("./Pitch3D"), { ssr: false });

export default function PitchCanvas({
  slots,
  lineup,
  captainId,
  onSlot,
  className,
  fallback,
}: {
  slots: Slot[];
  lineup: Record<string, Player | undefined>;
  captainId?: string;
  onSlot?: (slotId: string) => void;
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <Scene3D
      className={className}
      fallback={fallback}
      camera={{ position: [0, 9, 13], fov: 42 }}
      dpr={[1, 2]}
    >
      <Pitch3D
        slots={slots}
        lineup={lineup}
        captainId={captainId}
        onSlot={onSlot}
      />
    </Scene3D>
  );
}
