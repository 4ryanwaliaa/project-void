"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PARTICLES, ROOM } from "@/lib/constants";
import { useVoid } from "@/lib/store";

const FLOOR_Y = -1.6;

/** Soft round sprite for each dust mote. */
function dotTexture(): THREE.CanvasTexture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,170,180,0.6)");
  g.addColorStop(1, "rgba(255,0,30,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

export default function DustParticles() {
  const lowPower = useVoid((s) => s.lowPower);
  const count = lowPower ? PARTICLES.countMobile : PARTICLES.countDesktop;
  const points = useRef<THREE.Points>(null);
  const sprite = useMemo(dotTexture, []);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * ROOM.width;
      positions[i * 3 + 1] = FLOOR_Y + Math.random() * ROOM.height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * ROOM.depth;
      speeds[i] = 0.04 + Math.random() * 0.12;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    const arr = points.current.geometry.attributes.position
      .array as Float32Array;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      arr[iy] += speeds[i] * dt; // drift up
      // gentle lateral sway
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0015;
      if (arr[iy] > FLOOR_Y + ROOM.height) arr[iy] = FLOOR_Y; // recycle
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * 0.01;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={lowPower ? 0.06 : 0.05}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ff5a6e"
      />
    </points>
  );
}
