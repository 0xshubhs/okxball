"use client";

import { Canvas } from "@react-three/fiber";
import { ReactNode, Suspense, useState } from "react";

/** Render a static fallback instead of WebGL on reduced-motion, small screens, or no-GL. */
function computeStatic(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const cv = document.createElement("canvas");
    const gl = !!(cv.getContext("webgl2") || cv.getContext("webgl"));
    return reduced || small || !gl;
  } catch {
    return true;
  }
}

export default function Scene3D({
  children,
  fallback,
  className,
  camera,
  dpr = [1, 1.8],
  orthographic = false,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number; zoom?: number };
  dpr?: [number, number];
  orthographic?: boolean;
}) {
  const [staticMode] = useState(computeStatic);

  if (staticMode) {
    return <div className={className}>{fallback ?? null}</div>;
  }

  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        orthographic={orthographic}
        camera={{
          position: camera?.position ?? [0, 6, 12],
          fov: camera?.fov ?? 45,
          zoom: camera?.zoom ?? 1,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
