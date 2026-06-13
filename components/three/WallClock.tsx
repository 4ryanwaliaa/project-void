"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { ANCHORS, CLOCK_RADIUS, COLORS } from "@/lib/constants";
import { useVoid } from "@/lib/store";

const R = CLOCK_RADIUS;
/** Open skeleton window in the middle of the dial where the gear train lives. */
const PIT_R = R * 0.52;

const ROMAN = ["I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Classic white dial with radially-set Roman numerals, drawn once to canvas.
 * It's mapped onto a RingGeometry, so the centre stays open for the gears.
 */
function makeDialTexture(): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const cx = S / 2;
  const cy = S / 2;

  // warm ivory face with a soft edge falloff
  const g = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, S / 2);
  g.addColorStop(0, "#f6f2e9");
  g.addColorStop(0.75, "#efe9dc");
  g.addColorStop(1, "#ddd5c4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // outer black band + thin chapter ring
  ctx.strokeStyle = "#171310";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, S / 2 - 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, S / 2 - 40, 0, Math.PI * 2);
  ctx.stroke();

  // minute / hour ticks
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r1 = S / 2 - (major ? 88 : 64);
    const r2 = S / 2 - 44;
    ctx.strokeStyle = major ? "#171310" : "rgba(23,19,16,0.55)";
    ctx.lineWidth = major ? 8 : 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Roman numerals, rotated to face the centre (classic gear-clock style)
  ctx.fillStyle = "#171310";
  ctx.font = "700 104px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
    const rr = S / 2 - 168;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ROMAN[n - 1], 0, 0);
    ctx.restore();
  }

  // rim of the skeleton window (a little shadowed depth lip)
  const pitPx = (PIT_R / R) * (S / 2);
  ctx.strokeStyle = "#171310";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, pitPx + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(23,19,16,0.35)";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, pitPx + 24, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Soft red halo disc that sits behind the clock (the room's neon spill). */
function makeGlow(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 10, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,20,45,0.55)");
  g.addColorStop(0.5, "rgba(209,0,31,0.25)");
  g.addColorStop(1, "rgba(209,0,31,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

/** Real extruded gear: trapezoid teeth, axle hole, spoke cutouts on big wheels. */
function makeGearGeometry(teeth: number, radius: number, depth: number): THREE.ExtrudeGeometry {
  const root = radius * 0.8;
  const shape = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const onTooth = i % 4 === 1 || i % 4 === 2;
    const r = onTooth ? radius : root;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const axle = new THREE.Path();
  axle.absarc(0, 0, radius * 0.14, 0, Math.PI * 2, true);
  shape.holes.push(axle);

  if (radius >= 0.14) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      const hr = root * 0.52;
      const hole = new THREE.Path();
      hole.absarc(Math.cos(a) * hr, Math.sin(a) * hr, root * 0.21, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  }

  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 10,
  });
}

const GEAR_DEPTH = 0.05;

/** The gear train. Two z-layers so wheels overlap like a real movement. */
const GEARS: {
  pos: [number, number, number];
  r: number;
  teeth: number;
  dir: 1 | -1;
  accent?: boolean;
}[] = [
  { pos: [-0.02, -0.04, 0.04], r: 0.3, teeth: 13, dir: 1 },
  { pos: [-0.34, 0.26, 0.095], r: 0.195, teeth: 9, dir: -1 },
  { pos: [0.3, 0.3, 0.04], r: 0.165, teeth: 8, dir: -1, accent: true },
  { pos: [0.43, -0.1, 0.095], r: 0.155, teeth: 8, dir: -1 },
  { pos: [-0.38, -0.24, 0.095], r: 0.175, teeth: 8, dir: 1 },
  { pos: [0.12, -0.42, 0.04], r: 0.145, teeth: 7, dir: -1 },
  { pos: [-0.02, -0.04, 0.105], r: 0.095, teeth: 6, dir: -1 },
  { pos: [-0.13, 0.43, 0.04], r: 0.115, teeth: 6, dir: 1 },
];

function Hand({
  length,
  width,
  color,
  z,
  emissive = 0,
  tail = 0,
  refObj,
}: {
  length: number;
  width: number;
  color: string;
  z: number;
  emissive?: number;
  tail?: number;
  refObj: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group ref={refObj} position={[0, 0, z]}>
      {/* main blade, slightly raised off the dial */}
      <mesh position={[0, length / 2 - length * 0.14, 0]} castShadow>
        <boxGeometry args={[width, length, 0.018]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          metalness={0.55}
          roughness={0.35}
          toneMapped={emissive < 1}
        />
      </mesh>
      {/* tapered tip */}
      <mesh position={[0, length * 0.86 - length * 0.14 + length * 0.1, 0]}>
        <coneGeometry args={[width * 0.9, length * 0.2, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          metalness={0.55}
          roughness={0.35}
          toneMapped={emissive < 1}
        />
      </mesh>
      {/* counterweight tail (second hand) */}
      {tail > 0 && (
        <mesh position={[0, -tail / 2, 0]}>
          <boxGeometry args={[width * 1.6, tail, 0.016]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissive}
            toneMapped={emissive < 1}
          />
        </mesh>
      )}
    </group>
  );
}

export default function WallClock() {
  const phase = useVoid((s) => s.phase);
  const hover = useVoid((s) => s.hover);
  const focus = useVoid((s) => s.focus);
  const isMobile = useVoid((s) => s.isMobile);
  const reducedMotion = useVoid((s) => s.reducedMotion);
  const setHover = useVoid((s) => s.setHover);
  const claimClock = useVoid((s) => s.claimClock);
  const [localHover, setLocalHover] = useState(false);

  const dial = useMemo(makeDialTexture, []);
  const glow = useMemo(makeGlow, []);
  const gearGeos = useMemo(
    () => GEARS.map((g) => makeGearGeometry(g.teeth, g.r, GEAR_DEPTH)),
    []
  );

  const gearRefs = useRef<(THREE.Mesh | null)[]>([]);
  const gearAngle = useRef(0); // shared accumulator keeps the train meshed
  const speedBoost = useRef(1);

  const hour = useRef<THREE.Group | null>(null);
  const minute = useRef<THREE.Group | null>(null);
  const second = useRef<THREE.Group | null>(null);
  const secTarget = useRef<number | null>(null);
  const lastSec = useRef(-1);

  const bezelGlow = useRef<THREE.MeshStandardMaterial>(null);

  const active = hover === "clock" || focus === "clock" || localHover;
  const showLabels = phase === "hub" && focus === "none";

  useFrame((_, delta) => {
    // ------------------------------------------------ REAL TIME, REAL HANDS
    const d = new Date();
    const s = d.getSeconds();
    const m = d.getMinutes();
    const h = d.getHours() % 12;

    if (minute.current)
      minute.current.rotation.z = -((m + s / 60) / 60) * Math.PI * 2;
    if (hour.current)
      hour.current.rotation.z = -((h + m / 60 + s / 3600) / 12) * Math.PI * 2;

    // Mechanical tick: target steps once a second, hand snaps with a damped
    // bounce. The accumulator only ever decreases, so the 59→0 wrap never
    // makes the hand spin backwards.
    if (secTarget.current === null) {
      secTarget.current = -(s / 60) * Math.PI * 2;
      lastSec.current = s;
    } else if (s !== lastSec.current) {
      lastSec.current = s;
      secTarget.current -= (Math.PI * 2) / 60;
    }
    if (second.current) {
      second.current.rotation.z = THREE.MathUtils.damp(
        second.current.rotation.z,
        secTarget.current,
        reducedMotion ? 30 : 14,
        delta
      );
    }

    // ------------------------------------------------------- GEAR TRAIN
    const boostTarget = reducedMotion ? 0.12 : active ? 2.4 : 1;
    speedBoost.current = THREE.MathUtils.damp(
      speedBoost.current,
      boostTarget,
      4,
      delta
    );
    gearAngle.current += delta * speedBoost.current;
    for (let i = 0; i < GEARS.length; i++) {
      const mesh = gearRefs.current[i];
      if (!mesh) continue;
      const g = GEARS[i];
      // smaller wheels spin faster, neighbours counter-rotate
      mesh.rotation.z = gearAngle.current * (0.55 / g.r) * g.dir * 0.5 + i * 0.7;
    }

    // bezel rim light breathes, brightens on hover
    if (bezelGlow.current) {
      const t = performance.now() / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      bezelGlow.current.emissiveIntensity = THREE.MathUtils.damp(
        bezelGlow.current.emissiveIntensity,
        (active ? 1.5 : 0.7) + pulse * 0.25,
        6,
        delta
      );
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    setLocalHover(true);
    setHover("clock");
    document.body.style.cursor = "pointer";
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLocalHover(false);
    if (hover === "clock") setHover("none");
    document.body.style.cursor = "auto";
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    document.body.style.cursor = "auto";
    claimClock();
  };

  return (
    <group position={ANCHORS.clock.toArray()}>
      {/* red neon halo on the wall behind */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[R * 3.0, R * 3.0]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* movement backboard (pit floor) */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[PIT_R + 0.1, 48]} />
        <meshStandardMaterial color="#181410" roughness={0.9} metalness={0.15} />
      </mesh>

      {/* ------------------------------------------------ THE GEAR TRAIN */}
      {GEARS.map((g, i) => (
        <mesh
          key={i}
          ref={(el) => {
            gearRefs.current[i] = el;
          }}
          geometry={gearGeos[i]}
          position={g.pos}
          castShadow
        >
          <meshStandardMaterial
            color={g.accent ? COLORS.red : "#ece5d6"}
            emissive={g.accent ? COLORS.red : "#3a342a"}
            emissiveIntensity={g.accent ? 0.55 : 0.12}
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* axle pins under the visible wheels */}
      {GEARS.filter((g) => g.r >= 0.14).map((g, i) => (
        <mesh
          key={`pin-${i}`}
          position={[g.pos[0], g.pos[1], g.pos[2] + GEAR_DEPTH + 0.012]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
          <meshStandardMaterial color="#26201a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* ----------------------------------------------- DIAL + CASE */}
      {/* white Roman dial ring (open centre) */}
      <mesh position={[0, 0, 0.14]}>
        <ringGeometry args={[PIT_R, R, 96]} />
        <meshStandardMaterial
          map={dial}
          emissive="#ffffff"
          emissiveMap={dial}
          emissiveIntensity={0.22}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* depth lip around the skeleton window */}
      <mesh position={[0, 0, 0.14]}>
        <torusGeometry args={[PIT_R, 0.018, 12, 64]} />
        <meshStandardMaterial color="#15110d" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* glossy black bezel */}
      <mesh position={[0, 0, 0.12]} castShadow>
        <torusGeometry args={[R + 0.05, 0.09, 24, 96]} />
        <meshStandardMaterial color="#0c0b0a" metalness={0.75} roughness={0.22} />
      </mesh>

      {/* thin red rim light behind the bezel — VOID's signature glow */}
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[R + 0.13, 0.02, 8, 96]} />
        <meshStandardMaterial
          ref={bezelGlow}
          color="#1a0206"
          emissive={new THREE.Color(COLORS.redBright)}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* case barrel mounting it to the wall */}
      <mesh position={[0, 0, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R + 0.1, R + 0.12, 0.16, 64, 1, true]} />
        <meshStandardMaterial color="#0a0908" metalness={0.6} roughness={0.45} />
      </mesh>

      {/* ----------------------------------------------------- HANDS */}
      <Hand refObj={hour} length={R * 0.5} width={0.055} color="#171310" z={0.165} />
      <Hand refObj={minute} length={R * 0.78} width={0.04} color="#171310" z={0.185} />
      <Hand
        refObj={second}
        length={R * 0.88}
        width={0.014}
        color="#ff2a44"
        z={0.205}
        emissive={1.8}
        tail={R * 0.22}
      />

      {/* centre cap */}
      <mesh position={[0, 0, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.062, 0.035, 24]} />
        <meshStandardMaterial color="#0e0c0a" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.245]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#ff2a44" toneMapped={false} />
      </mesh>

      {/* domed glass */}
      <mesh position={[0, 0, 0.27]}>
        <circleGeometry args={[R + 0.01, 64]} />
        <meshPhysicalMaterial
          color="#cfe6ff"
          transparent
          opacity={0.08}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* interaction surface */}
      <mesh
        position={[0, 0, 0.4]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
      >
        <circleGeometry args={[R + 0.18, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ------------------------------------------------ HUB LABELS */}
      {/* The clock sits dead-centre between the frames (left) and box (right)
          zones, so its title rides in its own raised lane — on wide/short
          screens perspective squeezes the side labels inward and they'd
          otherwise collide with a centre label at the same height. */}
      {showLabels && !isMobile && (
        <>
          <Html position={[0, R + 1.15, 0.1]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap text-center font-display text-[10px] font-bold tracking-[0.2em] text-white void-label sm:text-sm sm:tracking-[0.3em] lg:text-base">
              GEARWORK CHRONO
            </div>
          </Html>
          <Html position={[0, -(R + 0.4), 0.1]} center zIndexRange={[20, 0]}>
            <button
              onClick={() => claimClock()}
              onPointerOver={() => {
                setHover("clock");
                setLocalHover(true);
              }}
              onPointerOut={() => {
                setHover("none");
                setLocalHover(false);
              }}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 font-mono text-[9px] font-bold tracking-[0.3em] void-label transition sm:text-[11px] ${
                active ? "text-white" : "text-white/85"
              }`}
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse-red rounded-full bg-void-red" />
              CLAIM — 1 LEFT
            </button>
          </Html>
        </>
      )}

      {/* compact scarcity tag pinned on the dial for mobile — floating rows
          would collide with the frames/box labels at odd aspect ratios */}
      {showLabels && isMobile && (
        <Html position={[0, R * 0.52, 0.45]} center zIndexRange={[20, 0]}>
          <button
            onClick={() => claimClock()}
            className="flex items-center gap-1.5 whitespace-nowrap border border-void-red/70 bg-black/80 px-2 py-1 font-mono text-[9px] font-bold tracking-[0.2em] text-white void-label"
          >
            <span className="inline-block h-1.5 w-1.5 animate-pulse-red rounded-full bg-void-red" />
            1 LEFT
          </button>
        </Html>
      )}
    </group>
  );
}
