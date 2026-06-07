// Optional convenience pass — pure Node fs, no native deps.
// Stages the original reference photos + brand logo into /public so they can be
// previewed or swapped into the scene. The room itself needs NONE of these to run
// (walls + posters are generated procedurally on a canvas at runtime).
//
//   npm run assets
//
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const refsOut = join(root, "public", "references");
const brandOut = join(root, "public", "brand");

for (const dir of [refsOut, brandOut]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// Map messy source filenames -> clean staged names.
const MAP = {
  "anime poswer wall theme room but hight the poster of levi and brotuo with frames.jpeg":
    ["references", "manga-wall-neutral.jpeg"],
  "WhatsApp Image 2026-06-07 at 20.39.46.jpeg": ["references", "manga-wall-red.jpeg"],
  "WhatsApp Image 2026-06-07 at 20.39.51.jpeg": ["references", "frame-levi.jpeg"],
  "WhatsApp Image 2026-06-07 at 20.40.01.jpeg": ["references", "frames-pair.jpeg"],
  "back wall.jpeg": ["references", "red-lamp.jpeg"],
  "watch wall with a window .jpeg": ["references", "window-wall.jpeg"],
  "mirror and with poster on the wall .jpeg": ["references", "neon-corner.jpeg"],
  "ChatGPT Image Jun 7, 2026, 09_00_36 PM.png": ["brand", "void-logo.png"],
};

let copied = 0;
const present = new Set(readdirSync(root));
for (const [src, [folder, dest]] of Object.entries(MAP)) {
  if (!present.has(src)) {
    console.warn(`· skip (not found): ${src}`);
    continue;
  }
  copyFileSync(join(root, src), join(root, "public", folder, dest));
  copied++;
  console.log(`✓ ${folder}/${dest}`);
}

console.log(`\nStaged ${copied} reference asset(s) into /public.`);
