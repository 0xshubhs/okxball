"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { Player } from "@/lib/data";
import { RARITY_3D } from "@/lib/three/rarity";
import { makeCardTexture } from "@/lib/three/cardTexture";

function Card({ player }: { player: Player }) {
  const tex = useMemo(() => makeCardTexture(player), [player]);
  useEffect(() => () => tex.dispose(), [tex]);
  const r = RARITY_3D[player.rarity];
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    const tx = state.pointer.x * 0.55;
    const ty = -state.pointer.y * 0.4;
    ref.current.rotation.y += (tx - ref.current.rotation.y) * 0.08;
    ref.current.rotation.x += (ty - ref.current.rotation.x) * 0.08;
  });

  return (
    <Float speed={2} rotationIntensity={0.12} floatIntensity={0.5}>
      <group ref={ref}>
        <RoundedBox args={[2.4, 3.4, 0.12]} radius={0.1} smoothness={5}>
          <meshStandardMaterial
            color="#0c0a0d"
            emissive={r.emissive}
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.45}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.062]}>
          <planeGeometry args={[2.32, 3.32]} />
          <meshStandardMaterial
            map={tex}
            emissiveMap={tex}
            emissive={r.rim}
            emissiveIntensity={0.4}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.062]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.32, 3.32]} />
          <meshStandardMaterial
            color="#0a090c"
            emissive={r.emissive}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function PlayerCard3D({ player }: { player: Player }) {
  const r = RARITY_3D[player.rarity];
  return (
    <>
      <color attach="background" args={["#08070a"]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 3, 4]} intensity={45} color={r.rim} />
      <pointLight position={[-3, -2, 3]} intensity={28} color={r.emissive} />
      <Card player={player} />
      <EffectComposer>
        <Bloom intensity={0.75} luminanceThreshold={0.25} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}
