import * as THREE from "three";
import type { Player } from "@/lib/data";

const RARITY_GRAD: Record<string, [string, string]> = {
  common: ["#2a3340", "#0b0f14"],
  rare: ["#0b4d63", "#06141a"],
  epic: ["#5e1740", "#180410"],
  legendary: ["#6b4d12", "#1a1304"],
  icon: ["#0d5e38", "#03150c"],
};
const RARITY_LINE: Record<string, string> = {
  common: "#9aa6b2",
  rare: "#2dd4ff",
  epic: "#ff4d8d",
  legendary: "#ffd35c",
  icon: "#3ef08b",
};

/** Draws a FUT-style player card face as a CanvasTexture. */
export function makeCardTexture(p: Player): THREE.CanvasTexture {
  const W = 512;
  const H = 720;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const [g0, g1] = RARITY_GRAD[p.rarity] ?? RARITY_GRAD.common;
  const line = RARITY_LINE[p.rarity] ?? "#9aa6b2";

  // background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, g0);
  grad.addColorStop(1, g1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // holo scanlines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // frame
  ctx.strokeStyle = line;
  ctx.shadowColor = line;
  ctx.shadowBlur = 26;
  ctx.lineWidth = 6;
  ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.shadowBlur = 0;

  // rating + position (top-left)
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "900 132px 'Arial Narrow', Arial, sans-serif";
  ctx.fillText(String(p.rating), 52, 168);
  ctx.font = "700 40px Arial, sans-serif";
  ctx.fillStyle = line;
  ctx.fillText(p.position, 58, 214);

  // flag/club (top-right)
  ctx.textAlign = "right";
  ctx.font = "60px serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(p.flag, W - 52, 150);

  // divider
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(52, 430);
  ctx.lineTo(W - 52, 430);
  ctx.stroke();

  // name
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px 'Arial Narrow', Arial, sans-serif";
  ctx.fillText(p.name.toUpperCase(), W / 2, 500);
  ctx.font = "500 30px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(p.club, W / 2, 540);

  // stat chips
  const stats: [string, number][] = [
    ["PAC", p.stats.pace],
    ["SHO", p.stats.shooting],
    ["PAS", p.stats.passing],
    ["DEF", p.stats.defending],
    ["PHY", p.stats.physical],
  ];
  ctx.font = "700 26px Arial, sans-serif";
  const startX = 70;
  const stepX = (W - 140) / 4;
  stats.forEach((s, i) => {
    const x = startX + stepX * i;
    ctx.fillStyle = line;
    ctx.fillText(String(s[1]), x, 600);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "500 20px Arial, sans-serif";
    ctx.fillText(s[0], x, 624);
    ctx.font = "700 26px Arial, sans-serif";
  });

  // rarity label + token id
  ctx.font = "700 24px Arial, sans-serif";
  ctx.fillStyle = line;
  ctx.fillText(p.rarity.toUpperCase(), W / 2, 672);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "500 20px monospace";
  ctx.fillText(`TOKEN #${p.tokenId}`, W / 2, 698);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
