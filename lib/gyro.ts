"use client";

/**
 * Gyro look — tilting the phone pans the room camera on mobile.
 *
 * The first sensor reading defines "neutral" (however the visitor happens to
 * be holding the phone), and the baseline drifts very slowly toward the
 * current pose so a new resting posture re-centres itself over ~10s.
 *
 * iOS 13+ requires DeviceOrientationEvent.requestPermission() to be called
 * from inside a user gesture — enableGyroLook() is invoked from the ENTER tap.
 * If permission is denied or sensors are absent, drag-look still works.
 */

interface GyroState {
  /** -1..1 — tilt the right edge down to look right. */
  x: number;
  /** -1..1 — tilt the top edge away from you to look up. */
  y: number;
  enabled: boolean;
}

export const gyroLook: GyroState = { x: 0, y: 0, enabled: false };

/** Degrees of tilt that map to full look deflection. */
const RANGE = 22;

let baseBeta: number | null = null;
let baseGamma: number | null = null;
let listening = false;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function screenAngle(): number {
  if (typeof screen !== "undefined" && screen.orientation) {
    return screen.orientation.angle;
  }
  return (window as unknown as { orientation?: number }).orientation ?? 0;
}

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta === null || e.gamma === null) return;

  if (baseBeta === null || baseGamma === null) {
    baseBeta = e.beta;
    baseGamma = e.gamma;
    gyroLook.enabled = true;
    return;
  }

  // Slow re-centre: if the visitor settles into a new posture, that pose
  // becomes the new neutral over ~10 seconds.
  baseBeta += (e.beta - baseBeta) * 0.002;
  baseGamma += (e.gamma - baseGamma) * 0.002;

  let dx = e.gamma - baseGamma; // roll: right edge down → positive
  let dy = e.beta - baseBeta; // pitch: top toward you → positive

  // Landscape: the device axes rotate relative to the screen.
  const angle = screenAngle();
  if (angle === 90) {
    const t = dx;
    dx = dy;
    dy = -t;
  } else if (angle === 270 || angle === -90) {
    const t = dx;
    dx = -dy;
    dy = t;
  }

  gyroLook.x = clamp(dx / RANGE);
  gyroLook.y = clamp(-dy / RANGE); // tilt back (top away) → look up
}

/**
 * Start gyro look. Must be called from inside a user gesture for iOS.
 * Touch devices only — a laptop's tilt sensor panning the room would be odd.
 */
export function enableGyroLook(): void {
  if (listening || typeof window === "undefined") return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;

  const DOE = window.DeviceOrientationEvent as unknown as
    | { requestPermission?: () => Promise<string> }
    | undefined;
  if (!DOE) return;

  const attach = () => {
    if (listening) return;
    listening = true;
    window.addEventListener("deviceorientation", onOrientation);
  };

  if (typeof DOE.requestPermission === "function") {
    // iOS: prompt inside the gesture; silently fall back to drag-look.
    DOE.requestPermission()
      .then((res) => {
        if (res === "granted") attach();
      })
      .catch(() => {});
  } else {
    attach();
  }
}

export function disableGyroLook(): void {
  if (!listening) return;
  listening = false;
  window.removeEventListener("deviceorientation", onOrientation);
  gyroLook.x = 0;
  gyroLook.y = 0;
  gyroLook.enabled = false;
  baseBeta = null;
  baseGamma = null;
}
