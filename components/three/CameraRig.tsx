"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { easing } from "maath";
import { CAMERA, LOOK, ANCHORS } from "@/lib/constants";
import { useVoid } from "@/lib/store";

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Scratch vectors — zero allocation in the frame loop.
const desiredPos = new THREE.Vector3();
const desiredLook = new THREE.Vector3();
const A = new THREE.Vector3();
const C = new THREE.Vector3();
const M = new THREE.Vector3();

/**
 * Single source of truth for camera motion. Picks a device preset (desktop stands
 * close with a narrow FOV; mobile backs up with a wide FOV) so the full 3-zone wall
 * is always framed without the user rotating.
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const phase = useVoid((s) => s.phase);
  const focus = useVoid((s) => s.focus);
  const isMobile = useVoid((s) => s.isMobile);
  const reducedMotion = useVoid((s) => s.reducedMotion);
  const setPhase = useVoid((s) => s.setPhase);

  const enterStart = useRef<number | null>(null);
  const smoothedLook = useRef(new THREE.Vector3().copy(CAMERA.desktop.look));
  const arrivedFrames = useRef(false);

  useFrame((state, delta) => {
    const preset = isMobile ? CAMERA.mobile : CAMERA.desktop;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    const sway = Math.sin(t * LOOK.swaySpeed) * LOOK.swayAmplitude;
    const bob = Math.cos(t * LOOK.swaySpeed * 0.7) * LOOK.swayAmplitude * 0.6;

    // Ease FOV toward the active preset (handles desktop↔mobile / resize).
    if (Math.abs(camera.fov - preset.fov) > 0.02) {
      camera.fov = THREE.MathUtils.damp(camera.fov, preset.fov, 6, delta);
      camera.updateProjectionMatrix();
    }

    // ---------------------------------------------------------------- ENTERING
    if (phase === "entering") {
      // Respect prefers-reduced-motion: no 5s flythrough, just cut to the hub.
      if (reducedMotion) {
        camera.position.copy(preset.hub);
        smoothedLook.current.copy(preset.look);
        camera.lookAt(smoothedLook.current);
        enterStart.current = null;
        setPhase("hub");
        return;
      }
      if (enterStart.current === null) enterStart.current = t;
      const e = Math.min(1, (t - enterStart.current) / CAMERA.flythroughDuration);
      const k = easeInOutCubic(e);
      const omk = 1 - k;
      A.copy(CAMERA.start);
      C.copy(preset.hub);
      M.copy(A).add(C).multiplyScalar(0.5);
      M.y += 1.0; // arc upward through the room
      camera.position.set(
        omk * omk * A.x + 2 * omk * k * M.x + k * k * C.x,
        omk * omk * A.y + 2 * omk * k * M.y + k * k * C.y,
        omk * omk * A.z + 2 * omk * k * M.z + k * k * C.z
      );
      smoothedLook.current.lerp(preset.look, 0.06);
      camera.lookAt(smoothedLook.current);
      if (e >= 1) {
        enterStart.current = null;
        setPhase("hub");
      }
      return;
    }

    // -------------------------------------------------------------- FOCUS PROP
    if (focus === "frames") {
      desiredPos.copy(CAMERA.framesFocus);
      desiredLook.copy(ANCHORS.frames);
      easing.damp3(camera.position, desiredPos, 0.5, delta);
      easing.damp3(smoothedLook.current, desiredLook, 0.4, delta);
      camera.lookAt(smoothedLook.current);
      if (
        !arrivedFrames.current &&
        camera.position.distanceToSquared(desiredPos) < 0.06
      ) {
        arrivedFrames.current = true;
        setPhase("toFrames");
      }
      return;
    }

    if (focus === "box") {
      desiredPos.copy(CAMERA.boxFocus);
      desiredLook.copy(ANCHORS.box);
      easing.damp3(camera.position, desiredPos, 0.5, delta);
      easing.damp3(smoothedLook.current, desiredLook, 0.45, delta);
      camera.lookAt(smoothedLook.current);
      return;
    }

    if (focus === "clock") {
      desiredPos.copy(CAMERA.clockFocus);
      desiredLook.copy(ANCHORS.clock);
      easing.damp3(camera.position, desiredPos, 0.5, delta);
      easing.damp3(smoothedLook.current, desiredLook, 0.45, delta);
      camera.lookAt(smoothedLook.current);
      return;
    }

    // --------------------------------------------------------- HUB / LANDING
    const inHub = phase === "hub";
    // Touch screens get a wider pan range so a drag can peek across the wall.
    const panX = isMobile ? 1.2 : 0.5;
    const lookX = isMobile ? 26 : 14;
    desiredPos.copy(preset.hub);
    if (inHub) {
      desiredPos.x += px * panX + sway * 3;
      desiredPos.y += py * 0.18 + bob * 3;
    } else {
      desiredPos.copy(CAMERA.start);
    }
    easing.damp3(camera.position, desiredPos, inHub ? 0.5 : 1.0, delta);

    desiredLook.copy(preset.look);
    if (inHub) {
      desiredLook.x += px * LOOK.maxYaw * lookX + sway * 4;
      desiredLook.y += py * LOOK.maxPitch * 12 + bob * 4;
    }
    easing.damp3(smoothedLook.current, desiredLook, inHub ? 0.32 : 0.7, delta);
    camera.lookAt(smoothedLook.current);
  });

  return null;
}
