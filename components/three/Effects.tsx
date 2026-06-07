"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useVoid } from "@/lib/store";

/**
 * Cinematic grade. Bloom drives the red-light glow that defines the room;
 * vignette + grain + a whisper of chromatic aberration finish the film look.
 * Heavier passes are dropped on low-power devices.
 */
export default function Effects() {
  const lowPower = useVoid((s) => s.lowPower);
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);

  if (lowPower) {
    return (
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={1.1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.3}
          radius={0.75}
        />
        <Vignette eskil={false} offset={0.32} darkness={0.92} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass={false} multisampling={4}>
      <Bloom
        mipmapBlur
        intensity={1.45}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.4}
        radius={0.85}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={caOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.2} premultiply />
      <Vignette eskil={false} offset={0.3} darkness={0.95} />
    </EffectComposer>
  );
}
