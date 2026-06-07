"use client";

import * as THREE from "three";
import type { Product } from "./products";

/**
 * Generates original, VOID-branded poster art on a canvas and returns it as a
 * THREE texture. Doing this at runtime means the room ships with zero binary
 * image assets and no third-party/IP artwork baked in — every frame is on-brand.
 *
 * Results are cached per product id (each frame mounts once).
 */
const cache = new Map<string, THREE.CanvasTexture>();

const KANJI = ["計画", "虚空", "限定", "亡霊", "深紅", "鎮魂"];

export function makePosterTexture(product: Product, index = 0): THREE.CanvasTexture {
  const cached = cache.get(product.id);
  if (cached) return cached;

  const W = 512;
  const H = 683; // 3:4
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // --- base void gradient ---
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#080709");
  g.addColorStop(0.55, "#0a0608");
  g.addColorStop(1, "#120406");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // --- accent bloom rising from the base ---
  const bloom = ctx.createRadialGradient(W / 2, H * 1.05, 40, W / 2, H * 1.05, H * 0.9);
  bloom.addColorStop(0, hexA(product.accent, 0.55));
  bloom.addColorStop(1, hexA(product.accent, 0));
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  // --- diagonal hazard hatch in a corner ---
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = product.accent;
  ctx.lineWidth = 10;
  for (let i = -H; i < W; i += 26) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();

  // --- faint scanlines ---
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#ffffff";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  ctx.restore();

  // --- central VOID sigil ---
  drawVoidMark(ctx, W / 2, H * 0.42, 120, product.accent);

  // --- vertical kanji column (decorative) ---
  ctx.save();
  ctx.fillStyle = hexA("#ffffff", 0.85);
  ctx.font = "700 40px 'Noto Sans JP', 'Yu Gothic', sans-serif";
  ctx.textAlign = "center";
  const k = KANJI[index % KANJI.length];
  ctx.fillText(k[0] ?? "虚", W - 50, H * 0.30);
  ctx.fillText(k[1] ?? "空", W - 50, H * 0.30 + 46);
  ctx.restore();

  // --- series tag ---
  ctx.fillStyle = product.accent;
  ctx.font = "700 18px 'Arial Narrow', Impact, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(spaced(product.series), 38, H - 150);

  // --- title (wrapped) ---
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 44px 'Arial Narrow', Impact, sans-serif";
  wrapText(ctx, product.title.toUpperCase(), 36, H - 110, W - 72, 40);

  // --- edition footer ---
  ctx.fillStyle = hexA("#ffffff", 0.5);
  ctx.font = "700 14px 'Arial Narrow', monospace";
  ctx.fillText(spaced(product.edition), 38, H - 32);

  // --- frame vignette ---
  ctx.strokeStyle = hexA("#000000", 0.9);
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.7);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cache.set(product.id, tex);
  return tex;
}

/** The angular PROJECT VOID "V" inside a targeting reticle. */
function drawVoidMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  // reticle ring
  ctx.strokeStyle = hexA(color, 0.7);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI * 0.78, Math.PI * 0.78, false);
  ctx.stroke();
  // ticks
  ctx.lineWidth = 4;
  for (const ang of [-Math.PI / 2, Math.PI / 2]) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * (r - 10), Math.sin(ang) * (r - 10));
    ctx.lineTo(Math.cos(ang) * (r + 10), Math.sin(ang) * (r + 10));
    ctx.stroke();
  }

  // the V: two blades meeting low-center
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-r * 0.62, -r * 0.55);
  ctx.lineTo(-r * 0.3, -r * 0.55);
  ctx.lineTo(0, r * 0.5);
  ctx.lineTo(-r * 0.16, r * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.62, -r * 0.55);
  ctx.lineTo(r * 0.3, -r * 0.55);
  ctx.lineTo(0, r * 0.5);
  ctx.lineTo(r * 0.16, r * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---- small canvas helpers ----
function hexA(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.repeat(2).slice(0, 6) : c, 16);
  const r = (n >> 16) & 255;
  const gg = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${gg},${b},${alpha})`;
}

function spaced(s: string): string {
  return s.split("").join(" ");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, yy);
}
