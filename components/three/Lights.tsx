"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS, ROOM, ANCHORS, BACK_Z } from "@/lib/constants";
import { useVoid } from "@/lib/store";

/**
 * Red-soaked lighting tuned for the front-wall layout. Accent lights sit in front of
 * the Frames and Box zones to spill red onto the floor (for the reflections), a
 * central wash breathes, and a cold purple rim adds cyberpunk depth on a side wall.
 */
export default function Lights() {
  const lowPower = useVoid((s) => s.lowPower);
  const wash = useRef<THREE.PointLight>(null);
  const framesAccent = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // breathing central wash
    if (wash.current) wash.current.intensity = 9 + Math.sin(t * 1.3) * 1.6;
    // soft neon flicker on the frames accent
    if (framesAccent.current) {
      const flicker = Math.random() > 0.93 ? 0.55 : 1;
      framesAccent.current.intensity = (7 + Math.sin(t * 2.1) * 1.2) * flicker;
    }
  });

  return (
    <>
      <ambientLight color={"#350109"} intensity={0.55} />
      <hemisphereLight color={"#2a0206"} groundColor={"#050505"} intensity={0.3} />

      {/* central breathing wash */}
      <pointLight
        ref={wash}
        position={[0, 2.0, BACK_Z + 4]}
        color={COLORS.red}
        intensity={9}
        distance={26}
        decay={2}
      />

      {/* spill in front of the Frames zone (drives floor reflection + flicker) */}
      <pointLight
        ref={framesAccent}
        position={[ANCHORS.frames.x, 0.4, BACK_Z + 2.2]}
        color={COLORS.redBright}
        intensity={7}
        distance={12}
        decay={2}
      />

      {/* gentle fill in front of the Box zone */}
      <pointLight
        position={[ANCHORS.box.x, 0.4, BACK_Z + 2.2]}
        color={COLORS.red}
        intensity={4}
        distance={10}
        decay={2}
      />

      {/* cold purple rim on the right side wall */}
      <pointLight
        position={[ROOM.width / 2 - 1, 0.4, -2]}
        color={"#5b1aff"}
        intensity={4}
        distance={12}
        decay={2}
      />

      {/* shadow-casting key from the ceiling */}
      <spotLight
        position={[0.5, ROOM.height - 0.6, 1.5]}
        angle={0.95}
        penumbra={0.85}
        color={"#ffd9c2"}
        intensity={16}
        distance={28}
        decay={2}
        castShadow
        shadow-mapSize-width={lowPower ? 512 : 1024}
        shadow-mapSize-height={lowPower ? 512 : 1024}
        shadow-bias={-0.0008}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
    </>
  );
}
