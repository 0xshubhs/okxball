import type { Rarity } from "@/lib/data";

/** Rarity → 3D material palette. Drives emissive glow + Fresnel rim on cards. */
export const RARITY_3D: Record<
  Rarity,
  { base: string; emissive: string; rim: string; glow: number }
> = {
  common: { base: "#9aa6b2", emissive: "#5b6672", rim: "#e2e8f0", glow: 0.35 },
  rare: { base: "#2dd4ff", emissive: "#0ea5e9", rim: "#aef0ff", glow: 0.8 },
  epic: { base: "#ff4d8d", emissive: "#db2777", rim: "#ffd0e3", glow: 1.0 },
  legendary: { base: "#ffd35c", emissive: "#f59e0b", rim: "#fff3cf", glow: 1.25 },
  icon: { base: "#3ef08b", emissive: "#10b981", rim: "#caffe4", glow: 1.6 },
};

/** Position → marker colour, mirrors POSITION_META so 2D/3D stay consistent. */
export const POSITION_3D: Record<string, string> = {
  GK: "#ffd35c",
  DEF: "#2dd4ff",
  MID: "#3ef08b",
  FWD: "#ff4d8d",
};
