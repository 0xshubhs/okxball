"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { FORMATIONS } from "@/lib/data";
import { POSITION_3D } from "@/lib/three/rarity";
import { makePitchTexture } from "@/lib/three/pitchTexture";

const PITCH_W = 12;
const PITCH_L = 18;

function Pitch() {
  const tex = useMemo(() => makePitchTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[PITCH_W, PITCH_L]} />
      <meshStandardMaterial
        map={tex}
        emissiveMap={tex}
        emissive="#3ef08b"
        emissiveIntensity={1.5}
        color="#08160e"
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}

function Bowl() {
  return (
    <group>
      {/* stadium bowl */}
      <mesh position={[0, 3.4, 0]}>
        <cylinderGeometry args={[19, 12.5, 9, 64, 1, true]} />
        <meshStandardMaterial
          color="#0c0708"
          side={THREE.BackSide}
          roughness={1}
          metalness={0.1}
        />
      </mesh>
      {/* crowd shimmer on the inner wall */}
      <Sparkles
        count={420}
        scale={[34, 7, 34]}
        position={[0, 4.5, 0]}
        size={2}
        speed={0.5}
        color="#ff7a7a"
        opacity={0.5}
      />
    </group>
  );
}

function Beam({ from }: { from: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  useLayoutEffect(() => {
    const f = new THREE.Vector3(...from);
    const len = f.length();
    const dir = f.clone().normalize();
    ref.current.position.copy(f.clone().multiplyScalar(0.5));
    ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    ref.current.scale.set(1, len, 1);
  }, [from]);
  return (
    <mesh ref={ref}>
      <coneGeometry args={[3.2, 1, 28, 1, true]} />
      <meshBasicMaterial
        color="#cfeaff"
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Floodlight({ pos }: { pos: [number, number, number] }) {
  return (
    <group>
      <mesh position={[pos[0], pos[1] / 2, pos[2]]}>
        <cylinderGeometry args={[0.12, 0.16, pos[1], 8]} />
        <meshStandardMaterial color="#15171b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={pos}>
        <boxGeometry args={[2.2, 1.1, 0.3]} />
        <meshStandardMaterial
          color="#dff1ff"
          emissive="#bfe6ff"
          emissiveIntensity={2.2}
        />
      </mesh>
      <spotLight
        position={pos}
        angle={0.5}
        penumbra={0.7}
        intensity={350}
        distance={60}
        color="#eaf6ff"
        castShadow={false}
      />
      <Beam from={pos} />
    </group>
  );
}

function HoloPlayer({
  x,
  z,
  color,
  captain,
}: {
  x: number;
  z: number;
  color: string;
  captain?: boolean;
}) {
  const c = captain ? "#ffd35c" : color;
  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.6} floatingRange={[0, 0.25]}>
      <group position={[x, 0.5, z]}>
        {/* base disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.4} />
        </mesh>
        {/* light column */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.6, 12]} />
          <meshBasicMaterial
            color={c}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* node */}
        <mesh position={[0, 1.6, 0]}>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial color="#ffffff" emissive={c} emissiveIntensity={2} />
        </mesh>
        {captain && (
          <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.03, 12, 36]} />
            <meshBasicMaterial color="#ffd35c" />
          </mesh>
        )}
      </group>
    </Float>
  );
}

export default function StadiumHero() {
  const slots = FORMATIONS["4-3-3"];
  const players = slots.map((s) => ({
    id: s.id,
    x: (s.x / 100 - 0.5) * PITCH_W,
    z: (s.y / 100 - 0.5) * PITCH_L,
    color: POSITION_3D[s.position],
    captain: s.id === "st",
  }));

  const flood: [number, number, number][] = [
    [9, 12, 13],
    [-9, 12, 13],
    [9, 12, -13],
    [-9, 12, -13],
  ];

  return (
    <>
      <color attach="background" args={["#070406"]} />
      <fog attach="fog" args={["#070406", 18, 52]} />

      <ambientLight intensity={0.25} />
      <pointLight position={[0, 8, 6]} intensity={120} color="#ff2d2d" distance={40} />
      <pointLight position={[0, 5, -10]} intensity={60} color="#2dd4ff" distance={40} />

      <Pitch />
      <Bowl />
      {flood.map((p, i) => (
        <Floodlight key={i} pos={p} />
      ))}

      {players.map((p) => (
        <HoloPlayer key={p.id} x={p.x} z={p.z} color={p.color} captain={p.captain} />
      ))}

      <Sparkles
        count={70}
        scale={[16, 6, 22]}
        position={[0, 3, 0]}
        size={3}
        speed={0.3}
        color="#ff5a5a"
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.6, 0]}
      />

      <EffectComposer>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.18}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.28} darkness={0.85} />
      </EffectComposer>
    </>
  );
}
