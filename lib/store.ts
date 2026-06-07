"use client";

import { create } from "zustand";
import type { Phase, FocusTarget } from "./constants";
import type { Product } from "./products";
import { startVoidAmbience, setAmbienceMuted } from "./audio";

export interface CartLine {
  product: Product;
  qty: number;
}

interface VoidState {
  /** High-level experience phase machine. */
  phase: Phase;
  /** Which interactive prop the camera is currently flying toward (or settled on). */
  focus: FocusTarget;
  /** Prop currently under the reticle, drives the floating hover label. */
  hover: FocusTarget;
  /** Emergency box glass state. */
  glassBroken: boolean;
  alarm: boolean;
  /** Mystery Drop modal. */
  modalOpen: boolean;
  /** Ecommerce cart. */
  cart: CartLine[];
  cartOpen: boolean;
  /** Set true on low-power / mobile devices to thin out particles + effects. */
  lowPower: boolean;
  /** Portrait/handheld — drives the backed-up camera framing. */
  isMobile: boolean;
  /** HUD sound toggle. */
  soundMuted: boolean;
  /** drei useProgress feeds this so the landing screen knows assets are ready. */
  assetsReady: boolean;

  // ---- actions ----
  setPhase: (p: Phase) => void;
  enter: () => void;
  setHover: (h: FocusTarget) => void;
  focusObject: (f: FocusTarget) => void;
  returnToHub: () => void;
  breakGlass: () => void;
  setAlarm: (v: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  setLowPower: (v: boolean) => void;
  setIsMobile: (v: boolean) => void;
  toggleSound: () => void;
  setAssetsReady: (v: boolean) => void;

  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  setCartOpen: (v: boolean) => void;
  cartCount: () => number;
  cartTotal: () => number;
}

export const useVoid = create<VoidState>((set, get) => ({
  phase: "boot",
  focus: "none",
  hover: "none",
  glassBroken: false,
  alarm: false,
  modalOpen: false,
  cart: [],
  cartOpen: false,
  lowPower: false,
  isMobile: false,
  soundMuted: false,
  assetsReady: false,

  setPhase: (p) => set({ phase: p }),

  enter: () => {
    if (get().phase !== "landing") return;
    set({ phase: "entering" });
    // Gesture-allowed: kick off the 30s ambience (no-op if muted / file absent).
    if (!get().soundMuted) startVoidAmbience();
  },

  setHover: (h) => set({ hover: h }),

  focusObject: (f) => {
    // Only allow focusing from the free-look hub, and clear any hover label.
    if (get().phase !== "hub") return;
    set({ focus: f, hover: "none" });
  },

  returnToHub: () => set({ focus: "none" }),

  breakGlass: () => {
    if (get().glassBroken) {
      set({ modalOpen: true });
      return;
    }
    set({ glassBroken: true, alarm: true });
    // Alarm strobe runs briefly, then the modal opens.
    setTimeout(() => set({ alarm: false }), 900);
    setTimeout(() => set({ modalOpen: true }), 700);
  },

  setAlarm: (v) => set({ alarm: v }),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false, focus: "none" }),
  setLowPower: (v) => set({ lowPower: v }),
  setIsMobile: (v) => set({ isMobile: v }),
  toggleSound: () =>
    set((s) => {
      const muted = !s.soundMuted;
      setAmbienceMuted(muted);
      return { soundMuted: muted };
    }),
  setAssetsReady: (v) => set({ assetsReady: v }),

  addToCart: (product) =>
    set((s) => {
      const existing = s.cart.find((l) => l.product.id === product.id);
      if (existing) {
        return {
          cart: s.cart.map((l) =>
            l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l
          ),
        };
      }
      return { cart: [...s.cart, { product, qty: 1 }] };
    }),

  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((l) => l.product.id !== id) })),

  changeQty: (id, delta) =>
    set((s) => ({
      cart: s.cart
        .map((l) =>
          l.product.id === id ? { ...l, qty: Math.max(0, l.qty + delta) } : l
        )
        .filter((l) => l.qty > 0),
    })),

  setCartOpen: (v) => set({ cartOpen: v }),

  cartCount: () => get().cart.reduce((n, l) => n + l.qty, 0),
  cartTotal: () => get().cart.reduce((n, l) => n + l.qty * l.product.price, 0),
}));
