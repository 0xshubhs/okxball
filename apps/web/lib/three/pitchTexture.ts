import * as THREE from "three";

/**
 * Procedurally drawn football-pitch markings as a CanvasTexture — neon lines on
 * near-black turf. Used as both `map` and `emissiveMap` so the lines bloom.
 * No external assets; client-only (uses document.createElement).
 */
export function makePitchTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1536; // 2:3 vertical pitch
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // turf — subtle vertical mow stripes on near-black
  ctx.fillStyle = "#05140c";
  ctx.fillRect(0, 0, W, H);
  const stripes = 10;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#06180e" : "#04110a";
    ctx.fillRect((i * W) / stripes, 0, W / stripes, H);
  }

  // neon line style
  ctx.strokeStyle = "#5af2a0";
  ctx.shadowColor = "#3ef08b";
  ctx.shadowBlur = 22;
  ctx.lineWidth = 7;

  const m = 70; // margin
  // outline
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  // halfway line
  ctx.beginPath();
  ctx.moveTo(m, H / 2);
  ctx.lineTo(W - m, H / 2);
  ctx.stroke();
  // centre circle + spot
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 150, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#5af2a0";
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 9, 0, Math.PI * 2);
  ctx.fill();

  // penalty + goal boxes (both ends)
  const boxW = 460;
  const penH = 240;
  const goalW = 230;
  const goalH = 90;
  const cx = W / 2;
  for (const top of [true, false]) {
    const yPen = top ? m : H - m - penH;
    ctx.strokeRect(cx - boxW / 2, yPen, boxW, penH);
    const yGoal = top ? m : H - m - goalH;
    ctx.strokeRect(cx - goalW / 2, yGoal, goalW, goalH);
    // penalty spot
    ctx.beginPath();
    ctx.arc(cx, top ? m + 165 : H - m - 165, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
