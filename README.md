# PROJECT VOID

> 計画虚空 — A secret collector's room hidden inside a cyberpunk anime universe.
> The homepage is not a page. It's a room. Enter The Void.

An immersive, cinematic 3D hub-world built with **Next.js 15 · React 19 · React Three Fiber · Three.js · Drei · @react-three/postprocessing · Framer Motion · Tailwind CSS**.

Users land on a black screen with the VOID sigil, hit **ENTER**, fly through a
red-lit manga-walled room, then free-look around a hub with **two** interactive
objects: the **Frames Wall** (the shop) and the **Emergency Box** (mystery drops).

---

## ⚡ Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run assets               # (optional) stage the reference photos into /public
```

Requires Node 18.18+ (built and verified on Node 24 / npm 11).

---

## 🧠 Key architecture decision — zero binary art assets

The entire room renders **procedurally**. Walls, posters, the emergency placard
and dust sprites are all painted onto `<canvas>` at runtime and used as Three.js
textures. There are **no `.glb` files and no image dependencies** required to run.

Why this is the right call for a web hub-world:

- **Instant load** — homepage first-load JS is ~248 kB and the heavy 3D libs are
  code-split out of the initial bundle (lazy-loaded after mount).
- **No missing-asset failures** — nothing to 404.
- **No IP baked in** — the shippable build contains original VOID-branded art, not
  copyrighted manga/anime. (Your reference photos are staged separately in
  `/public/references` for swap-in — see _Customising the art_.)
- **Fully art-directable** — every dimension, colour and camera beat lives in
  `lib/constants.ts`.

A clear **GLB upgrade path** is documented below for anyone who later wants sculpted props.

---

## 📁 Project structure

```
project-void/
├─ app/
│  ├─ layout.tsx              # fonts (Chakra Petch / Inter / Space Mono), metadata
│  ├─ globals.css             # Tailwind layers, HUD button, grain, scrollbars
│  ├─ page.tsx                # "/" — mounts the Void experience full-bleed
│  └─ frames/
│     └─ page.tsx             # "/frames" — ecommerce gallery (metadata + gallery)
│
├─ components/
│  ├─ experience/
│  │  ├─ VoidExperience.tsx   # client orchestrator: phases, overlays, routing
│  │  └─ SceneCanvas.tsx      # <Canvas> — fog, tone mapping, adaptive perf
│  │
│  ├─ three/                  # everything inside the Canvas
│  │  ├─ CameraRig.tsx        # flythrough + hub free-look + object focus
│  │  ├─ Lights.tsx           # red ambient rig + shadow key + purple rim
│  │  ├─ Room.tsx             # floor (reflections) / ceiling / manga walls
│  │  ├─ FramesWall.tsx       # the hang + single "VIEW COLLECTION" hitbox
│  │  ├─ Frame.tsx            # one framed poster (canvas art + hover bloom)
│  │  ├─ EmergencyBox.tsx     # pulsing/flickering break-glass unit
│  │  ├─ GlassShards.tsx      # instanced glass-shatter burst
│  │  ├─ DustParticles.tsx    # floating dust point-cloud
│  │  └─ Effects.tsx          # Bloom · ChromaticAberration · Noise · Vignette
│  │
│  ├─ ui/                     # DOM overlays above the canvas
│  │  ├─ VoidLogo.tsx         # the SVG sigil (reticle + twin-blade V)
│  │  ├─ LoadingScreen.tsx    # boot sequence + progress
│  │  ├─ LandingScreen.tsx    # logo + ENTER THE VOID + [ENTER]
│  │  ├─ Hud.tsx              # reticle, hover labels, top bar, hints
│  │  ├─ AlarmOverlay.tsx     # red strobe + "VAULT BREACHED"
│  │  ├─ MysteryDropModal.tsx # EMERGENCY DROP VAULT
│  │  └─ CartDrawer.tsx       # slide-in cart (shared across routes)
│  │
│  └─ frames/
│     ├─ FramesGallery.tsx    # gallery shell (header, hero, grid, footer)
│     ├─ ProductCard.tsx      # card + add-to-cart
│     └─ PosterArt.tsx        # HTML/SVG poster (twin of the 3D canvas art)
│
├─ lib/
│  ├─ constants.ts            # 🎛️ ALL art-direction tuning (room, camera, look…)
│  ├─ store.ts                # Zustand: phase machine + cart + modal state
│  ├─ products.ts             # catalog
│  ├─ drops.ts                # mystery-drop vault contents
│  ├─ posterTexture.ts        # canvas → CanvasTexture for the 3D frames
│  ├─ mangaTexture.ts         # canvas → manga-collage wall texture
│  └─ useDevice.ts            # mobile / touch / reduced-motion probe
│
├─ public/
│  ├─ brand/                  # favicon.svg, void-logo.png (staged)
│  └─ references/             # your original reference photos (staged)
│
├─ scripts/process-assets.mjs # optional, pure-fs: stage references into /public
└─ .claude/launch.json        # dev-server config for the preview tooling
```

---

## 🎬 Scene architecture & the phase machine

State lives in one Zustand store (`lib/store.ts`). A small phase machine drives
the whole experience; `CameraRig` reads it every frame and is the **single source
of truth for camera motion**.

```
boot ──▶ landing ──(ENTER)──▶ entering ──(flythrough done)──▶ hub
                                                               │
                          ┌── click Frames Wall ──▶ focus:frames ──▶ toFrames ──▶ /frames
                          └── click Emergency Box ─▶ focus:box + breakGlass ──▶ modal
```

| Phase      | Camera behaviour                                                        |
| ---------- | ---------------------------------------------------------------------- |
| `landing`  | holds just outside the room in the dark, micro-drift                    |
| `entering` | scripted **quadratic-bezier dive** (always completes in `5.2s`)         |
| `hub`      | fixed vantage + **pointer/touch parallax look** + idle breathing sway   |
| `focus`    | damped push toward a prop (→ route to `/frames`, or open the vault)     |

Returning from `/frames` drops you straight back into the hub (intro skipped).

### Lighting & atmosphere (the references, translated)

- Dim **red ambient** + hemisphere so shadows never go pure black.
- A slowly **breathing** central red wash (the "alive room").
- A hot red accent by the frames wall, a **cold purple rim** in the far corner
  (lifted from the mirror/lava-lamp shot), and one **shadow-casting key** from the ceiling.
- `FogExp2` swallows the open entry side; **Bloom** drives the red glow;
  vignette + film-grain + a whisper of chromatic aberration finish the grade.
- A `MeshReflectorMaterial` floor gives the neon-reflection sheen (auto-disabled on low-power).

---

## 🕹️ Controls

- **Desktop** — move the mouse to look (parallax + sway); click an object to interact.
- **Mobile / touch** — drag to look; tap to interact. Particles, DPR, multisampling
  and post-FX passes are automatically thinned via `useDevice()` + `lowPower`.
- **Reduced motion** — heavy ambient CSS animations are disabled; the scene treats
  the device as low-power.

---

## 🧩 Required GLB models — and the upgrade path

**None are required.** If you want to replace procedural props with sculpted GLBs,
here's the recommended drop-in plan. Keep each model **Draco/Meshopt-compressed,
< ~1–2 MB, ≤ 50k tris**, with baked AO and a 1–2k texture atlas.

| Prop                | Suggested GLB                                  | Replaces                |
| ------------------- | ---------------------------------------------- | ----------------------- |
| Emergency box       | `emergency-box.glb` (housing + glass + lever)  | `EmergencyBox.tsx` mesh |
| Picture frames      | `frame.glb` (one reusable shadow-box frame)    | `Frame.tsx` body        |
| Room shell / props  | `room.glb` (skirting, desk, shelves, cables)   | adds to `Room.tsx`      |
| Ceiling LED strip   | `led-strip.glb`                                | the emissive cove plane |

Drop files in `public/models/`, then:

```tsx
import { useGLTF } from "@react-three/drei";
const { nodes, materials } = useGLTF("/models/emergency-box.glb");
useGLTF.preload("/models/emergency-box.glb");
```

`next.config.mjs` already tolerates `.glb`/`.hdr`/GLSL imports. Loading via
`useGLTF` integrates with the existing `useProgress` loader automatically.
For HDRI image-based lighting, add `<Environment files="/hdr/void.hdr" />` from drei.

### Asset recommendations (if you go the photographic route)

- **Manga wall** — a seamless **tileable** B&W manga texture (2k), desaturated, so
  the in-scene red light tints it. Swap inside `lib/mangaTexture.ts` for a
  `useTexture("/textures/manga-wall.jpg")` call. ⚠️ Use art you own/licensed.
- **Posters** — real product photography at 3:4; replace `makePosterTexture` with
  `useTexture(product.image)` and point `products.ts → image` at the files.
- Your supplied references are staged at `public/references/` (run `npm run assets`).

---

## 🎛️ Customising the art

Almost everything is tunable without touching component logic:

- **`lib/constants.ts`** — room size, camera waypoints + FOV, flythrough duration,
  look sensitivity/sway, particle counts.
- **`tailwind.config.ts`** — the brand palette (`void.red #D1001F`, `void.black #050505`…)
  and keyframes (flicker, pulse-red, scan, alarm-flash).
- **`lib/products.ts` / `lib/drops.ts`** — catalog + vault copy.
- **`Lights.tsx`** — intensities/colours of the red rig.
- **`Effects.tsx`** — bloom intensity/threshold, grain, vignette.

---

## 🚀 Production checklist

- [ ] Replace the procedural manga texture with **owned/licensed** art (or keep procedural).
- [ ] Wire real checkout — the cart + drawer are ready; connect **Stripe** or
      **Shopify** in `CartDrawer.tsx` (`CHECKOUT` handler) and the vault email capture.
- [ ] Swap placeholder posters for product photography (see above).
- [ ] Set `metadataBase` + OpenGraph image in `app/layout.tsx`; add a real OG card.
- [ ] Optional: add ambient audio on ENTER (the landing already hints "AUDIO RECOMMENDED").
- [ ] Optional: drop in GLB props per the table above.

---

## 🛠️ Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 15 (App Router) · React 19 · TypeScript      |
| 3D             | three 0.176 · @react-three/fiber 9 · drei 10         |
| Post-FX        | @react-three/postprocessing 3 · postprocessing 6     |
| State          | Zustand 5                                            |
| Animation (DOM)| Framer Motion 11                                     |
| Styling        | Tailwind CSS 3.4                                      |
| Easing helpers | maath                                                |

> **Note on the 3D loop:** the experience uses `requestAnimationFrame` (via R3F's
> render loop) for the flythrough, particles and prop animation. Browsers pause rAF
> in **backgrounded/hidden tabs** — this is expected and battery-friendly; motion
> resumes seamlessly when the tab is visible again.
```
