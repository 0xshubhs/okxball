"use client";

import { Canvas } from "@react-three/fiber";
import { Component, ReactNode, Suspense, useState } from "react";

/** Render a static fallback instead of WebGL on reduced-motion, small screens, or no-GL. */
function computeStatic(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const cv = document.createElement("canvas");
    const gl =
      cv.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      cv.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    return reduced || small || !gl;
  } catch {
    return true;
  }
}

/**
 * Catches WebGL/R3F runtime failures (e.g. "Error creating WebGL context") and
 * renders the 2D fallback instead of crashing the whole page. WebGLRenderer
 * creation throws inside a layout effect, which React error boundaries catch.
 */
class GLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow — the fallback UI is enough */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
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
      <GLErrorBoundary fallback={fallback ?? null}>
        <Canvas
          dpr={dpr}
          orthographic={orthographic}
          camera={{
            position: camera?.position ?? [0, 6, 12],
            fov: camera?.fov ?? 45,
            zoom: camera?.zoom ?? 1,
          }}
          // Permissive attributes so the context still creates on weak / software
          // GPUs; any remaining failure is caught by GLErrorBoundary above.
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </GLErrorBoundary>
    </div>
  );
}
