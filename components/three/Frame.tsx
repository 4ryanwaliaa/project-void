"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Product } from "@/lib/products";
import { makePosterTexture } from "@/lib/posterTexture";

interface FrameProps {
  product: Product;
  index: number;
  position: [number, number, number];
  size: [number, number];
  active: boolean;
}

/**
 * A real, physical framed poster mounted on the wall: a dark frame body that
 * protrudes from the surface, the art inset on its face, a bright HDR-red neon
 * backlight rim, and a wide red halo spilling onto the wall behind it.
 */
export default function Frame({
  product,
  index,
  position,
  size,
  active,
}: FrameProps) {
  const [w, h] = size;
  const tex = useMemo(() => makePosterTexture(product, index), [product, index]);
  const neon = useMemo(() => new THREE.Color("#ff1f3d").multiplyScalar(1.8), []);

  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const art = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const k = 1 - Math.pow(0.0012, delta);
    const breathe = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.6 + index);
    if (halo.current) {
      const target = (active ? 0.85 : 0.42) + breathe * 0.08;
      halo.current.opacity += (target - halo.current.opacity) * k;
    }
    if (art.current) {
      const target = active ? 0.7 : 0.38;
      art.current.emissiveIntensity +=
        (target - art.current.emissiveIntensity) * k;
    }
  });

  return (
    <group position={position}>
      {/* wide red spill on the wall */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[w + 1.0, h + 1.0]} />
        <meshBasicMaterial
          ref={halo}
          color="#ff1f3d"
          transparent
          opacity={0.42}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* glowing neon rim behind the frame */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[w + 0.28, h + 0.28]} />
        <meshBasicMaterial color={neon} toneMapped={false} />
      </mesh>

      {/* physical frame body (protrudes from the wall) */}
      <mesh position={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[w + 0.14, h + 0.14, 0.12]} />
        <meshStandardMaterial color="#0b0b0d" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* thin black mat */}
      <mesh position={[0, 0, 0.121]}>
        <planeGeometry args={[w + 0.02, h + 0.02]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* the art, on the frame face */}
      <mesh position={[0, 0, 0.122]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={art}
          map={tex}
          emissive={"#ffffff"}
          emissiveMap={tex}
          emissiveIntensity={0.38}
          roughness={0.5}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
