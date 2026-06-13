"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import Frame from "./Frame";
import { PRODUCTS } from "@/lib/products";
import { FRAME_SLOTS, FRAME_Z, ANCHORS } from "@/lib/constants";
import { useVoid } from "@/lib/store";

// Cluster extents (for the floating labels) derived from the curated slots.
const clusterTop = Math.max(...FRAME_SLOTS.map((s) => s.pos[1] + s.size[1] / 2));
const clusterBottom = Math.min(...FRAME_SLOTS.map((s) => s.pos[1] - s.size[1] / 2));

export default function FramesWall() {
  const phase = useVoid((s) => s.phase);
  const hover = useVoid((s) => s.hover);
  const focus = useVoid((s) => s.focus);
  const setHover = useVoid((s) => s.setHover);
  const focusObject = useVoid((s) => s.focusObject);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const active = hover === "frames" || focus === "frames" || hoveredIndex !== null;
  const showLabels = phase === "hub" && focus === "none";

  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    setHoveredIndex(i);
    setHover("frames");
    document.body.style.cursor = "pointer";
  };
  const out = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Only clear if we're leaving the frame we think is hovered (avoids the
    // out-of-A / into-B handoff wiping the new hover).
    setHoveredIndex((cur) => (cur === i ? null : cur));
    if (hover === "frames") setHover("none");
    document.body.style.cursor = "auto";
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (phase !== "hub") return;
    setHoveredIndex(null);
    document.body.style.cursor = "auto";
    focusObject("frames");
  };

  return (
    <group>
      {PRODUCTS.map((product, i) => {
        const slot = FRAME_SLOTS[i % FRAME_SLOTS.length];
        return (
          <Frame
            key={product.id}
            product={product}
            index={i}
            position={[slot.pos[0], slot.pos[1], FRAME_Z]}
            size={slot.size}
            hovered={hoveredIndex === i}
            onOver={over(i)}
            onOut={out(i)}
            onClick={click}
          />
        );
      })}

      {showLabels && (
        <>
          <Html
            position={[ANCHORS.frames.x, clusterTop + 0.5, FRAME_Z + 0.1]}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="whitespace-nowrap text-center font-display text-[10px] font-bold tracking-[0.25em] text-white void-label sm:text-sm sm:tracking-[0.35em] lg:text-base">
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
              onPointerOver={() => setHover("frames")}
              onPointerOut={() => {
                if (hover === "frames") setHover("none");
              }}
              className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 font-mono text-[9px] font-bold tracking-[0.3em] void-label transition sm:text-[11px] ${
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
