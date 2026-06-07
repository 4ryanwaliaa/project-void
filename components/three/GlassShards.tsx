"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ShardsProps {
  /** Flip to true to detonate the glass. */
  broken: boolean;
  /** Local origin the shards burst from. */
  origin?: [number, number, number];
  count?: number;
}

interface Shard {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  life: number;
}

const GRAVITY = 7.5;
const LIFETIME = 1.8;

/** A triangular sliver of glass. */
function shardGeometry() {
  const g = new THREE.BufferGeometry();
  const verts = new Float32Array([
    0, 0.09, 0, -0.06, -0.05, 0, 0.05, -0.06, 0,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  g.computeVertexNormals();
  return g;
}

export default function GlassShards({
  broken,
  origin = [0, 0, 0],
  count = 18,
}: ShardsProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(shardGeometry, []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dff3ff",
        emissive: new THREE.Color("#9fd6ff"),
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      }),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const wasBroken = useRef(false);
  const elapsed = useRef(0);

  const shards = useMemo<Shard[]>(
    () =>
      Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        spin: new THREE.Vector3(),
        life: 0,
      })),
    [count]
  );

  const detonate = () => {
    elapsed.current = 0;
    for (const s of shards) {
      s.pos.set(
        origin[0] + (Math.random() - 0.5) * 0.8,
        origin[1] + (Math.random() - 0.5) * 1.0,
        origin[2]
      );
      // Burst outward (+z local = into the room) with spread.
      s.vel.set(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.4 + 0.6,
        1.5 + Math.random() * 2.5
      );
      s.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      s.spin.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14
      );
      s.life = LIFETIME;
    }
  };

  useFrame((_, delta) => {
    if (broken && !wasBroken.current) detonate();
    wasBroken.current = broken;
    if (!mesh.current) return;

    const visible = broken && elapsed.current < LIFETIME;
    mesh.current.visible = visible;
    if (!visible) return;

    elapsed.current += delta;
    const dt = Math.min(delta, 0.05);

    shards.forEach((s, i) => {
      s.vel.y -= GRAVITY * dt;
      s.pos.addScaledVector(s.vel, dt);
      s.rot.x += s.spin.x * dt;
      s.rot.y += s.spin.y * dt;
      s.rot.z += s.spin.z * dt;
      const fade = Math.max(0, s.life) / LIFETIME;
      dummy.position.copy(s.pos);
      dummy.rotation.copy(s.rot);
      dummy.scale.setScalar(0.6 + fade * 0.6);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      s.life -= delta;
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geo, mat, count]}
      visible={false}
      frustumCulled={false}
    />
  );
}
