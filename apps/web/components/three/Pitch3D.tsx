"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Float, Html, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Crown } from "lucide-react";
import type { Player, Slot } from "@/lib/data";
import { POSITION_3D } from "@/lib/three/rarity";
import { makePitchTexture } from "@/lib/three/pitchTexture";

const PITCH_W = 12;
const PITCH_L = 18;

const toWorld = (s: Slot): [number, number, number] => [
  (s.x / 100 - 0.5) * PITCH_W,
  0.05,
  (s.y / 100 - 0.5) * PITCH_L,
];

function Turf() {
  const tex = useMemo(() => makePitchTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[PITCH_W, PITCH_L]} />
      <meshStandardMaterial
        map={tex}
        emissiveMap={tex}
        emissive="#3ef08b"
        emissiveIntensity={1.3}
        color="#08160e"
        roughness={0.85}
      />
    </mesh>
  );
}

function FilledMarker({
  pos,
  color,
  name,
  captain,
  onClick,
}: {
  pos: [number, number, number];
  color: string;
  name: string;
  captain?: boolean;
  onClick?: () => void;
}) {
  const c = captain ? "#ffd35c" : color;
  return (
    <Float speed={2.4} floatIntensity={0.5} rotationIntensity={0} floatingRange={[0, 0.18]}>
      <group
        position={pos}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.05, 36]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 10]} />
          <meshBasicMaterial
            color={c}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={2} />
        </mesh>
        {captain && (
          <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.03, 12, 36]} />
            <meshBasicMaterial color="#ffd35c" />
          </mesh>
        )}
        <Html center distanceFactor={11} position={[0, -0.35, 0]} occlude={false}>
          <div className="flex items-center gap-1 whitespace-nowrap rounded-full border border-white/15 bg-pitch-950/85 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            {captain && <Crown className="h-2.5 w-2.5 text-gold" />}
            {name}
          </div>
        </Html>
      </group>
    </Float>
  );
}

function EmptyMarker({
  pos,
  color,
  onClick,
}: {
  pos: [number, number, number];
  color: string;
  onClick?: () => void;
}) {
  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.04, 10, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.55} />
      </mesh>
      {/* invisible larger hit area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function Pitch3D({
  slots,
  lineup,
  captainId,
  onSlot,
}: {
  slots: Slot[];
  lineup: Record<string, Player | undefined>;
  captainId?: string;
  onSlot?: (slotId: string) => void;
}) {
  return (
    <>
      <color attach="background" args={["#060d09"]} />
      <fog attach="fog" args={["#060d09", 16, 40]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 10, 4]} intensity={120} color="#ffffff" distance={45} />
      <pointLight position={[-8, 4, -8]} intensity={40} color="#2dd4ff" distance={40} />
      <pointLight position={[8, 4, 8]} intensity={40} color="#ff2d2d" distance={40} />

      <Turf />

      {slots.map((s) => {
        const pos = toWorld(s);
        const p = lineup[s.id];
        return p ? (
          <FilledMarker
            key={s.id}
            pos={pos}
            color={POSITION_3D[s.position]}
            name={p.name}
            captain={p.id === captainId}
            onClick={() => onSlot?.(s.id)}
          />
        ) : (
          <EmptyMarker
            key={s.id}
            pos={pos}
            color={POSITION_3D[s.position]}
            onClick={() => onSlot?.(s.id)}
          />
        );
      })}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.4}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
        target={[0, 0.4, 0]}
      />

      <EffectComposer>
        <Bloom intensity={0.85} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}
