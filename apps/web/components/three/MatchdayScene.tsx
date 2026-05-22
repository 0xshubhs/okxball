"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { makePitchTexture } from "@/lib/three/pitchTexture";

const PITCH_W = 13;
const PITCH_L = 9; // wide broadcast crop

function Turf() {
  const tex = useMemo(() => makePitchTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[PITCH_W, PITCH_L]} />
      <meshStandardMaterial
        map={tex}
        emissiveMap={tex}
        emissive="#3ef08b"
        emissiveIntensity={1.2}
        color="#08160e"
        roughness={0.85}
      />
    </mesh>
  );
}

function Ball() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    ref.current.position.set(
      Math.sin(t * 0.8) * 4.5,
      0.35 + Math.abs(Math.sin(t * 2.2)) * 0.7,
      Math.cos(t * 0.6) * 2.6
    );
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.22, 24, 24]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.6} />
    </mesh>
  );
}

function Floodlight({ pos }: { pos: [number, number, number] }) {
  return (
    <group>
      <mesh position={pos}>
        <boxGeometry args={[1.8, 0.9, 0.25]} />
        <meshStandardMaterial color="#dff1ff" emissive="#bfe6ff" emissiveIntensity={2.4} />
      </mesh>
      <spotLight position={pos} angle={0.6} penumbra={0.8} intensity={300} distance={45} color="#eaf6ff" />
    </group>
  );
}

export default function MatchdayScene({
  home,
  away,
  homeScore,
  awayScore,
  minute,
}: {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: number;
}) {
  return (
    <>
      <color attach="background" args={["#060406"]} />
      <fog attach="fog" args={["#060406", 12, 34]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 7, 5]} intensity={90} color="#ff2d2d" distance={36} />
      <pointLight position={[0, 6, -6]} intensity={50} color="#2dd4ff" distance={36} />

      <Turf />
      <Ball />
      <Floodlight pos={[7, 9, 7]} />
      <Floodlight pos={[-7, 9, 7]} />
      <Floodlight pos={[7, 9, -7]} />
      <Floodlight pos={[-7, 9, -7]} />

      <Sparkles count={50} scale={[16, 5, 10]} position={[0, 2.5, 0]} size={2.5} speed={0.3} color="#ff6a6a" />

      <Html center position={[0, 3.4, 0]} zIndexRange={[10, 0]}>
        <div className="flex select-none items-center gap-3 whitespace-nowrap rounded-xl border border-white/15 bg-pitch-950/80 px-4 py-2 backdrop-blur">
          <span className="font-display text-lg font-bold text-white">{home}</span>
          <span className="font-mono text-2xl font-bold text-neon">
            {homeScore}–{awayScore}
          </span>
          <span className="font-display text-lg font-bold text-white">{away}</span>
          <span className="ml-1 rounded-full bg-magenta/20 px-2 py-0.5 text-[11px] font-bold text-magenta">
            {minute}&apos;
          </span>
        </div>
      </Html>

      <EffectComposer>
        <Bloom intensity={1.0} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette offset={0.3} darkness={0.8} />
      </EffectComposer>
    </>
  );
}
