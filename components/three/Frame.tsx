"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { makePosterTexture } from "@/lib/posterTexture";

interface FrameProps {
  product: Product;
  index: number;
  position: [number, number, number];
  size: [number, number];
  /** True only for the single frame currently under the pointer. */
  hovered: boolean;
  onOver: (e: ThreeEvent<PointerEvent>) => void;
  onOut: (e: ThreeEvent<PointerEvent>) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

/**
 * A real, physical framed poster mounted on the wall. On hover the individual
 * piece lifts off the wall, scales up, brightens, and floats its title + price
 * in-world — the rest of the salon hang stays put.
 */
export default function Frame({
  product,
  index,
  position,
  size,
  hovered,
  onOver,
  onOut,
  onClick,
}: FrameProps) {
  const [w, h] = size;
  const tex = useMemo(() => makePosterTexture(product, index), [product, index]);
  const neon = useMemo(() => new THREE.Color("#ff1f3d").multiplyScalar(1.8), []);

  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const art = useRef<THREE.MeshStandardMaterial>(null);
  const baseZ = position[2];

  useFrame((state, delta) => {
    const k = 1 - Math.pow(0.0012, delta);
    const breathe = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.6 + index);

    if (group.current) {
      // lift toward the camera + a gentle scale-up when hovered
      const targetZ = baseZ + (hovered ? 0.28 : 0);
      group.current.position.z += (targetZ - group.current.position.z) * k;
      const targetScale = hovered ? 1.06 : 1;
      const s = group.current.scale.x + (targetScale - group.current.scale.x) * k;
      group.current.scale.setScalar(s);
    }
    if (halo.current) {
      const target = (hovered ? 0.95 : 0.42) + breathe * 0.08;
      halo.current.opacity += (target - halo.current.opacity) * k;
    }
    if (art.current) {
      const target = hovered ? 0.85 : 0.38;
      art.current.emissiveIntensity +=
        (target - art.current.emissiveIntensity) * k;
    }
  });

  return (
    <group ref={group} position={position}>
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

      {/* per-frame interaction surface (sits just proud of the art) */}
      <mesh
        position={[0, 0, 0.3]}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <planeGeometry args={[w + 0.14, h + 0.14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* in-world title + price, only for the hovered piece */}
      {hovered && (
        <Html
          position={[0, h / 2 + 0.34, 0.32]}
          center
          zIndexRange={[25, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex select-none flex-col items-center gap-0.5 whitespace-nowrap text-center void-label">
            <span className="font-display text-[11px] font-bold tracking-[0.2em] text-white sm:text-xs">
              {product.title}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-void-red-bright">
              {formatPrice(product.price)}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
