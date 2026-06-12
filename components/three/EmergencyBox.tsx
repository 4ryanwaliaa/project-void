"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { ANCHORS, COLORS } from "@/lib/constants";
import { useVoid } from "@/lib/store";
import GlassShards from "./GlassShards";

/** Red emergency placard behind the glass. */
function makeFaceTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 320;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#b00018";
  ctx.fillRect(0, 0, W, H);

  const band = (y: number, h: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, W, h);
    ctx.clip();
    for (let x = -h; x < W; x += 26) {
      ctx.fillStyle = "#f2c200";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 13, y);
      ctx.lineTo(x + 13 + h, y + h);
      ctx.lineTo(x + h, y + h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  band(8, 22);
  band(H - 30, 22);

  ctx.fillStyle = "#0a0204";
  const cx = W / 2;
  const cy = H / 2 - 6;
  ctx.beginPath();
  ctx.moveTo(cx - 52, cy - 46);
  ctx.lineTo(cx - 24, cy - 46);
  ctx.lineTo(cx, cy + 42);
  ctx.lineTo(cx - 13, cy + 52);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 52, cy - 46);
  ctx.lineTo(cx + 24, cy - 46);
  ctx.lineTo(cx, cy + 42);
  ctx.lineTo(cx + 13, cy + 52);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0a0204";
  ctx.textAlign = "center";
  ctx.font = "900 22px Impact, 'Arial Narrow', sans-serif";
  ctx.fillText("E M E R G E N C Y", cx, 64);
  ctx.font = "900 16px Impact, 'Arial Narrow', sans-serif";
  ctx.fillText("DROP VAULT", cx, H - 44);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function EmergencyBox() {
  const phase = useVoid((s) => s.phase);
  const hover = useVoid((s) => s.hover);
  const focus = useVoid((s) => s.focus);
  const glassBroken = useVoid((s) => s.glassBroken);
  const setHover = useVoid((s) => s.setHover);
  const focusObject = useVoid((s) => s.focusObject);
  const breakGlass = useVoid((s) => s.breakGlass);
  const [localHover, setLocalHover] = useState(false);

  const faceTex = useMemo(makeFaceTexture, []);
  const beacon = useRef<THREE.Mesh>(null);
  const beaconMat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const faceMat = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);

  const active = hover === "box" || localHover;
  const showLabels = phase === "hub" && focus === "none";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const base = glassBroken ? 1.7 : 1;
    const pulse = 0.5 + 0.5 * Math.sin(t * (glassBroken ? 9 : 3));
    const flicker = Math.random() > 0.92 ? 0.45 : 1; // soft neon flicker
    const energy = base * (0.5 + pulse * 0.7) * flicker;

    if (light.current) light.current.intensity = 4 + energy * 8;
    if (beaconMat.current) beaconMat.current.opacity = 0.5 + energy * 0.5;
    if (beacon.current) beacon.current.scale.setScalar(0.7 + energy * 0.45);
    if (halo.current) halo.current.opacity = (active ? 0.7 : 0.45) + pulse * 0.15;
    if (faceMat.current)
      faceMat.current.emissiveIntensity =
        (active ? 1.0 : 0.6) + pulse * 0.3 + (glassBroken ? 0.4 : 0);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    setLocalHover(true);
    setHover("box");
    document.body.style.cursor = "pointer";
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLocalHover(false);
    if (hover === "box") setHover("none");
    document.body.style.cursor = "auto";
  };
  const trigger = () => {
    if (phase !== "hub") return;
    document.body.style.cursor = "auto";
    focusObject("box");
    breakGlass();
  };

  return (
    <group position={ANCHORS.box.toArray()}>
      {/* wide red spill */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.3, 3.7]} />
        <meshBasicMaterial
          ref={halo}
          color="#ff1f3d"
          transparent
          opacity={0.5}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight
        ref={light}
        position={[0, 0, 0.6]}
        color={COLORS.red}
        intensity={8}
        distance={11}
        decay={2}
      />

      {/* mounting plate */}
      <mesh position={[0, 0, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[1.92, 2.22, 0.08]} />
        <meshStandardMaterial color="#1a0206" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* glowing red housing */}
      <mesh position={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[1.7, 2.0, 0.26]} />
        <meshStandardMaterial
          color="#5e0010"
          roughness={0.4}
          metalness={0.6}
          emissive={new THREE.Color(COLORS.redBright).multiplyScalar(0.9)}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* placard */}
      <mesh position={[0, 0, 0.29]}>
        <planeGeometry args={[1.45, 1.75]} />
        <meshStandardMaterial
          ref={faceMat}
          map={faceTex}
          emissive={"#ffffff"}
          emissiveMap={faceTex}
          emissiveIntensity={0.6}
          roughness={0.7}
        />
      </mesh>

      {/* glass — vanishes when broken */}
      {!glassBroken && (
        <mesh position={[0, 0, 0.31]}>
          <planeGeometry args={[1.5, 1.8]} />
          <meshPhysicalMaterial
            color="#bfe3ff"
            transparent
            opacity={0.16}
            roughness={0.05}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            ior={1.45}
            reflectivity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <GlassShards broken={glassBroken} origin={[0, 0, 0.31]} />

      {/* warning beacon */}
      <mesh ref={beacon} position={[0, 1.18, 0.2]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial
          ref={beaconMat}
          color={COLORS.redBright}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* interaction surface */}
      <mesh
        position={[0, 0, 0.45]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          trigger();
        }}
      >
        <planeGeometry args={[1.8, 2.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* anchored labels */}
      {showLabels && (
        <>
          <Html position={[0, 1.35, 0.1]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div className="max-w-28 whitespace-normal text-center font-display text-[10px] font-bold leading-snug tracking-[0.25em] text-white void-label sm:max-w-none sm:whitespace-nowrap sm:text-sm sm:tracking-[0.35em] lg:text-base">
              EMERGENCY BOX
            </div>
          </Html>
          <Html position={[0, -1.35, 0.1]} center zIndexRange={[20, 0]}>
            <button
              onClick={trigger}
              onPointerOver={() => {
                setHover("box");
                setLocalHover(true);
              }}
              onPointerOut={() => {
                setHover("none");
                setLocalHover(false);
              }}
              className={`flex items-center gap-2 whitespace-nowrap px-2 py-2 font-mono text-[9px] font-bold tracking-[0.25em] void-label transition sm:px-3 sm:tracking-[0.3em] sm:text-[11px] ${
                active ? "text-white" : "text-white/85"
              }`}
            >
              BREAK GLASS
            </button>
          </Html>
        </>
      )}
    </group>
  );
}
