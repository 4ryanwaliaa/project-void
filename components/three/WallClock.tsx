"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ANCHORS, CLOCK_RADIUS, COLORS } from "@/lib/constants";

const R = CLOCK_RADIUS;

/** Premium dark clock face with elegant numerals + an ornate centre medallion. */
function makeClockFace(): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const cx = S / 2;
  const cy = S / 2;

  // dark dished face
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, S / 2);
  g.addColorStop(0, "#140a0c");
  g.addColorStop(0.7, "#0b0709");
  g.addColorStop(1, "#060405");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, S / 2 - 6, 0, Math.PI * 2);
  ctx.fill();

  // ticks
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r1 = S / 2 - (major ? 40 : 26);
    const r2 = S / 2 - 16;
    ctx.strokeStyle = major ? "rgba(255,60,80,0.95)" : "rgba(200,200,210,0.35)";
    ctx.lineWidth = major ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // numerals
  ctx.fillStyle = "rgba(240,235,235,0.92)";
  ctx.font = "600 46px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
    const rr = S / 2 - 72;
    ctx.fillText(String(n), cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }

  // ornate centre medallion
  ctx.strokeStyle = "rgba(209,0,31,0.5)";
  for (let ring = 0; ring < 3; ring++) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 26 + ring * 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(209,0,31,0.4)";
  for (let p = 0; p < 12; p++) {
    const a = (p / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Soft red halo disc that sits behind the clock. */
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

function Hand({
  length,
  width,
  color,
  z,
  emissive = 0,
  refObj,
}: {
  length: number;
  width: number;
  color: string;
  z: number;
  emissive?: number;
  refObj: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group ref={refObj} position={[0, 0, z]}>
      <mesh position={[0, length / 2 - length * 0.18, 0]}>
        <boxGeometry args={[width, length, 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissive}
          metalness={0.6}
          roughness={0.4}
          toneMapped={emissive < 1}
        />
      </mesh>
    </group>
  );
}

export default function WallClock() {
  const face = useMemo(makeClockFace, []);
  const glow = useMemo(makeGlow, []);

  const hour = useRef<THREE.Group | null>(null);
  const minute = useRef<THREE.Group | null>(null);
  const second = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    const d = new Date();
    const s = d.getSeconds();
    const m = d.getMinutes();
    const h = d.getHours() % 12;

    const secTarget = -(Math.floor(s) / 60) * Math.PI * 2; // ticks (snaps each second)
    const minTarget = -((m + s / 60) / 60) * Math.PI * 2;
    const hourTarget = -((h + m / 60) / 12) * Math.PI * 2;

    if (second.current) {
      // damp toward the stepped target → a crisp little tick with a hint of ease
      second.current.rotation.z = THREE.MathUtils.damp(
        second.current.rotation.z,
        secTarget,
        0.04,
        delta
      );
    }
    if (minute.current) minute.current.rotation.z = minTarget;
    if (hour.current) hour.current.rotation.z = hourTarget;
  });

  return (
    <group position={ANCHORS.clock.toArray()}>
      {/* red halo */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[R * 2.9, R * 2.9]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* outer bezel ring (glowing red) */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[R + 0.02, 0.06, 16, 80]} />
        <meshStandardMaterial
          color={"#1a0206"}
          emissive={new THREE.Color(COLORS.redBright).multiplyScalar(1.2)}
          emissiveIntensity={1}
          metalness={0.7}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* dark metal rim */}
      <mesh position={[0, 0, -0.02]}>
        <cylinderGeometry args={[R + 0.08, R + 0.08, 0.08, 64]} />
        <meshStandardMaterial color="#0a0809" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* face */}
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[R, 64]} />
        <meshStandardMaterial
          map={face}
          emissive={"#ffffff"}
          emissiveMap={face}
          emissiveIntensity={0.25}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* hands */}
      <Hand refObj={hour} length={R * 0.55} width={0.05} color="#e6e8ee" z={0.06} />
      <Hand refObj={minute} length={R * 0.82} width={0.035} color="#eef0f4" z={0.08} />
      <Hand
        refObj={second}
        length={R * 0.92}
        width={0.014}
        color={"#ff2a44"}
        z={0.1}
        emissive={2}
      />

      {/* centre cap */}
      <mesh position={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 24]} />
        <meshStandardMaterial
          color={"#ff2a44"}
          emissive={"#ff2a44"}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
