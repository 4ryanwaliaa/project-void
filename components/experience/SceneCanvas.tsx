"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA, COLORS } from "@/lib/constants";
import { useVoid } from "@/lib/store";

import CameraRig from "@/components/three/CameraRig";
import Lights from "@/components/three/Lights";
import Room from "@/components/three/Room";
import FramesWall from "@/components/three/FramesWall";
import WallClock from "@/components/three/WallClock";
import EmergencyBox from "@/components/three/EmergencyBox";
import DustParticles from "@/components/three/DustParticles";
import Effects from "@/components/three/Effects";

export default function SceneCanvas() {
  const lowPower = useVoid((s) => s.lowPower);

  return (
    <Canvas
      className="absolute inset-0"
      shadows
      dpr={[1, lowPower ? 1.5 : 2]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
      camera={{
        position: CAMERA.start.toArray(),
        fov: 46, // CameraRig eases this to the active device preset
        near: 0.1,
        far: 140,
      }}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.FogExp2(new THREE.Color("#0a0203"), 0.042);
        scene.background = new THREE.Color(COLORS.black);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <CameraRig />
        <Lights />
        <Room />
        <FramesWall />
        <WallClock />
        <EmergencyBox />
        <DustParticles />
        <Effects />
        <Preload all />
      </Suspense>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
