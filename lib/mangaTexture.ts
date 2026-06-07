"use client";

import * as THREE from "three";

/**
 * Generates a black-and-white "manga collage" wall texture on a canvas — panel
 * grids, speed lines, halftone screentone and SFX slashes — so the room ships with
 * zero binary image assets and no copyrighted manga. The red room light + bloom do
 * the rest. Swap in a licensed photographic texture later if desired (see README).
 *
 * Cached: generated once, cloned per wall for independent tiling.
 */
let cached: THREE.CanvasTexture | null = null;

export function makeMangaTexture(): THREE.CanvasTexture {
  if (cached) return cached;

  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;

  // aged paper base
  ctx.fillStyle = "#e7e4dd";
  ctx.fillRect(0, 0, S, S);

  // lay out a jittered grid of panels
  const cols = 4;
  const rows = 4;
  const gw = S / cols;
  const gh = S / rows;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const jx = (Math.random() - 0.5) * 20;
      const jy = (Math.random() - 0.5) * 20;
      const x = col * gw + 6 + jx * 0.3;
      const y = r * gh + 6 + jy * 0.3;
      const w = gw - 12;
      const h = gh - 12;
      drawPanel(ctx, x, y, w, h);
    }
  }

  // grime + vignette
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(Math.random() * S, Math.random() * S, 1, 1);
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  cached = tex;
  return tex;
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const roll = Math.random();
  if (roll < 0.18) {
    // solid black dramatic panel
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(x, y, w, h);
    if (Math.random() > 0.5) speedLines(ctx, x, y, w, h, "#fff");
  } else {
    ctx.fillStyle = "#f3f1ec";
    ctx.fillRect(x, y, w, h);
    const kind = Math.floor(Math.random() * 4);
    if (kind === 0) speedLines(ctx, x, y, w, h, "#111");
    else if (kind === 1) halftone(ctx, x, y, w, h);
    else if (kind === 2) figures(ctx, x, y, w, h);
    else sfx(ctx, x, y, w, h);
  }

  ctx.restore();

  // panel border
  ctx.strokeStyle = "#0b0b0b";
  ctx.lineWidth = 3 + Math.random() * 2;
  ctx.strokeRect(x, y, w, h);
}

function speedLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  const fx = x + Math.random() * w;
  const fy = y + Math.random() * h;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(a) * w * 1.5, fy + Math.sin(a) * h * 1.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function halftone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#161616";
  const step = 9;
  for (let yy = y; yy < y + h; yy += step) {
    for (let xx = x; xx < x + w; xx += step) {
      const d = (xx - x) / w;
      const r = Math.max(0, (1 - d) * 3.2 * Math.random());
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function figures(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#0c0c0c";
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(x + Math.random() * w, y + Math.random() * h);
    for (let p = 0; p < 4; p++) {
      ctx.lineTo(x + Math.random() * w, y + Math.random() * h);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function sfx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#0a0a0a";
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((Math.random() - 0.5) * 0.8);
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-w / 2, -6 + i * 14, w, 6);
  }
  ctx.restore();
}
