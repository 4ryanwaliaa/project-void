"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import Frame from "./Frame";
import { PRODUCTS } from "@/lib/products";
import {
  FRAME_COLS,
  FRAME_ROWS,
  FRAME_SIZE,
  FRAME_Z,
  ANCHORS,
} from "@/lib/constants";
import { useVoid } from "@/lib/store";

// Build 6 slots: row-major across the 3×2 grid.
const SLOTS: [number, number, number][] = [];
for (const y of FRAME_ROWS) for (const x of FRAME_COLS) SLOTS.push([x, y, FRAME_Z]);

const clusterTop = FRAME_ROWS[0] + FRAME_SIZE[1] / 2;
const clusterBottom = FRAME_ROWS[FRAME_ROWS.length - 1] - FRAME_SIZE[1] / 2;

export default function FramesWall() {
  const phase = useVoid((s) => s.phase);
  const hover = useVoid((s) => s.hover);
  const focus = useVoid((s) => s.focus);
  const setHover = useVoid((s) => s.setHover);
  const focusObject = useVoid((s) => s.focusObject);
  const [localHover, setLocalHover] = useState(false);

  const active = hover === "frames" || focus === "frames" || localHover;
  const showLabels = phase === "hub" && focus === "none";

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    setLocalHover(true);
    setHover("frames");
    document.body.style.cursor = "pointer";
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLocalHover(false);
    if (hover === "frames") setHover("none");
    document.body.style.cursor = "auto";
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    document.body.style.cursor = "auto";
    focusObject("frames");
  };

  return (
    <group>
      {PRODUCTS.map((product, i) => (
        <Frame
          key={product.id}
          product={product}
          index={i}
          position={SLOTS[i % SLOTS.length]}
          size={FRAME_SIZE}
          active={active}
        />
      ))}

      {/* one invisible hitbox over the whole hang */}
      <mesh
        position={[ANCHORS.frames.x, ANCHORS.frames.y, FRAME_Z + 0.4]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
      >
        <planeGeometry args={[5.4, 3.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {showLabels && (
        <>
          <Html
            position={[ANCHORS.frames.x, clusterTop + 0.5, FRAME_Z + 0.1]}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="whitespace-nowrap text-center font-display text-base font-bold tracking-[0.35em] text-white void-label">
              FRAMES COLLECTION
            </div>
          </Html>

          <Html
            position={[ANCHORS.frames.x, clusterBottom - 0.5, FRAME_Z + 0.1]}
            center
            zIndexRange={[20, 0]}
          >
            <button
              onClick={() => focusObject("frames")}
              onPointerOver={() => {
                setHover("frames");
                setLocalHover(true);
              }}
              onPointerOut={() => {
                setHover("none");
                setLocalHover(false);
              }}
              className={`flex items-center gap-2 whitespace-nowrap font-mono text-[11px] font-bold tracking-[0.3em] void-label transition ${
                active ? "text-white" : "text-white/85"
              }`}
            >
              VIEW COLLECTION
            </button>
          </Html>
        </>
      )}
    </group>
  );
}
