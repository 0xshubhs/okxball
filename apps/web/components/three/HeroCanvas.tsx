"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Scene3D from "./Scene3D";

const StadiumHero = dynamic(() => import("./StadiumHero"), { ssr: false });

export default function HeroCanvas({
  className,
  fallback,
}: {
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <Scene3D
      className={className}
      fallback={fallback}
      camera={{ position: [0, 7, 17], fov: 40 }}
      dpr={[1, 2]}
    >
      <StadiumHero />
    </Scene3D>
  );
}
