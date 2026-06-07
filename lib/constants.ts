import * as THREE from "three";

/**
 * Central tuning file.
 *
 * The room is a real space with depth: a deep box whose BACK wall is the feature
 * wall. The camera stands back, raised and tilted slightly down, so the floor,
 * both side walls and the front wall are all in frame (anime collector room) —
 * not a flat dashboard.
 *
 * Front-wall zoning (wall is 16 wide):
 *   LEFT  ~30%  Frames Collection (3×2 grid)
 *   CENTER ~15% Wall Clock
 *   RIGHT ~15%  Emergency Box
 *   gaps        manga panels
 */

export const COLORS = {
  black: "#050505",
  red: "#D1001F",
  redBright: "#ff1f3d",
  redDeep: "#7a0012",
  white: "#ffffff",
} as const;

export const ROOM = {
  width: 16,
  height: 6,
  depth: 24, // deep room → strong perspective + visible side walls
} as const;

export const BACK_Z = -ROOM.depth / 2; // -12 : the feature wall
const WALL = BACK_Z + 0.16; // props sit just proud of the wall

// ---- Frames Collection — left ~30% of the wall (3 cols × 2 rows) ----
export const FRAME_COLS = [-6.4, -4.6, -2.8]; // 1.8 spacing
export const FRAME_ROWS = [1.0, -0.5]; // 1.5 spacing
export const FRAME_SIZE: [number, number] = [1.25, 1.45];
export const FRAME_Z = WALL;

// World anchors (centres) used by props + camera focus moves.
export const ANCHORS = {
  frames: new THREE.Vector3(-4.6, 0.25, WALL),
  clock: new THREE.Vector3(0, 0.55, WALL),
  box: new THREE.Vector3(4.6, 0.4, WALL),
} as const;

export const CLOCK_RADIUS = 1.2; // ~15% of wall width

/**
 * Camera presets. Both stand well back so floor + side walls + front wall frame up
 * as a room. Desktop is closer with a narrow FOV; mobile backs up + widens so the
 * whole wall still fits a tall screen with no rotating.
 */
export const CAMERA = {
  flythroughDuration: 5.2,
  start: new THREE.Vector3(0, 1.6, 16),

  desktop: {
    fov: 44,
    hub: new THREE.Vector3(0, 1.0, 4.6),
    look: new THREE.Vector3(0, -0.5, BACK_Z),
  },
  mobile: {
    fov: 70,
    hub: new THREE.Vector3(0, 1.1, 8.2),
    look: new THREE.Vector3(0, -0.1, BACK_Z),
  },

  framesFocus: new THREE.Vector3(-2.8, 0.2, -5.4),
  boxFocus: new THREE.Vector3(2.8, 0.4, -5.6),
} as const;

// Tight look range — the objects must never leave the frame.
export const LOOK = {
  maxYaw: 0.1,
  maxPitch: 0.05,
  damping: 0.06,
  swayAmplitude: 0.008,
  swaySpeed: 0.4,
} as const;

export const PARTICLES = {
  countDesktop: 800,
  countMobile: 300,
  area: new THREE.Vector3(ROOM.width, ROOM.height, ROOM.depth),
} as const;

export type Phase = "boot" | "landing" | "entering" | "hub" | "toFrames";
export type FocusTarget = "none" | "frames" | "box";
