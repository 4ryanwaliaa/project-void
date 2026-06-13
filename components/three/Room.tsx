"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { ROOM, COLORS } from "@/lib/constants";
import { useVoid } from "@/lib/store";
import { makeMangaTexture } from "@/lib/mangaTexture";

const FLOOR_Y = -1.6;
const CEIL_Y = FLOOR_Y + ROOM.height;

/** Subtle grayscale noise → roughness variation so the floor isn't a perfect mirror. */
function makeRoughnessNoise(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#888";
  ctx.fillRect(0, 0, S, S);
  const img = ctx.getImageData(0, 0, S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 80;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

/**
 * Room shell. The BACK wall (z = -depth/2) is the feature wall — Frames, Clock and
 * Box all live in front of it. The camera-entry side is open; fog hides the gap.
 */
export default function Room() {
  const lowPower = useVoid((s) => s.lowPower);
  const roughnessNoise = useMemo(makeRoughnessNoise, []);

  const { leftTex, rightTex, backTex } = useMemo(() => {
    const base = makeMangaTexture();
    const make = (rx: number, ry: number) => {
      const t = base.clone();
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
      return t;
    };
    return {
      leftTex: make(6.5, 2.2),
      rightTex: make(6.5, 2.2),
      backTex: make(4.0, 2.2),
    };
  }, []);

  return (
    <group>
      {/* ---------------------------------------- PREMIUM REFLECTIVE FLOOR ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        {lowPower ? (
          <meshStandardMaterial
            color="#0a0708"
            roughness={0.45}
            metalness={0.6}
            roughnessMap={roughnessNoise}
          />
        ) : (
          <MeshReflectorMaterial
            resolution={256}
            blur={[128, 32]}
            mixBlur={0.9}
            mixStrength={1.4}
            mirror={0.72}
            depthScale={1.0}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.2}
            color="#070406"
            metalness={0.65}
            roughness={0.55}
            roughnessMap={roughnessNoise}
          />
        )}
      </mesh>

      {/* ---------------------------------------------------------- CEILING ---- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL_Y, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#070506" roughness={1} metalness={0} />
      </mesh>

      {/* red ceiling cove strip on the back wall — the bright bloom rail */}
      <mesh position={[0, CEIL_Y - 0.25, -ROOM.depth / 2 + 0.06]}>
        <planeGeometry args={[ROOM.width * 0.96, 0.14]} />
        <meshBasicMaterial
          color={new THREE.Color(COLORS.redBright).multiplyScalar(1.4)}
          toneMapped={false}
        />
      </mesh>

      {/* --------------------------------------------- BACK (FEATURE) WALL ---- */}
      <mesh position={[0, FLOOR_Y + ROOM.height / 2, -ROOM.depth / 2]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.height]} />
        <meshStandardMaterial map={backTex} roughness={0.95} metalness={0} />
      </mesh>

      {/* --------------------------------------------- SIDE WALLS (manga) ---- */}
      <mesh
        position={[-ROOM.width / 2, FLOOR_Y + ROOM.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial map={leftTex} roughness={0.95} metalness={0} />
      </mesh>
      <mesh
        position={[ROOM.width / 2, FLOOR_Y + ROOM.height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial map={rightTex} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}
