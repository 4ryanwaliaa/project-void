"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  /** Wall clock 1-of-1 limited offer modal. */
  clockOfferOpen: boolean;
  /** Ecommerce cart. */
  cart: CartLine[];
  cartOpen: boolean;
  /** Set true on low-power / mobile devices to thin out particles + effects. */
  lowPower: boolean;
  /** Portrait/handheld — drives the backed-up camera framing. */
  isMobile: boolean;
  /** prefers-reduced-motion — skips the cinematic flythrough. */
  reducedMotion: boolean;
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
  /** Click the wall clock: camera dives in, then the limited offer opens. */
  claimClock: () => void;
  closeClockOffer: () => void;
  setLowPower: (v: boolean) => void;
  setIsMobile: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  toggleSound: () => void;
  setAssetsReady: (v: boolean) => void;

  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  clearCart: () => void;
  setCartOpen: (v: boolean) => void;
  cartCount: () => number;
  cartTotal: () => number;
}

export const useVoid = create<VoidState>()(
  persist(
    (set, get) => ({
  phase: "boot",
  focus: "none",
  hover: "none",
  glassBroken: false,
  alarm: false,
  modalOpen: false,
  clockOfferOpen: false,
  cart: [],
  cartOpen: false,
  lowPower: false,
  isMobile: false,
  reducedMotion: false,
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

  claimClock: () => {
    if (get().phase !== "hub") return;
    set({ focus: "clock", hover: "none" });
    // Let the camera dive most of the way in before the offer drops.
    setTimeout(() => set({ clockOfferOpen: true }), 650);
  },
  closeClockOffer: () => set({ clockOfferOpen: false, focus: "none" }),
  setLowPower: (v) => set({ lowPower: v }),
  setIsMobile: (v) => set({ isMobile: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  toggleSound: () =>
    set((s) => {
      const muted = !s.soundMuted;
      setAmbienceMuted(muted);
      return { soundMuted: muted };
    }),
  setAssetsReady: (v) => set({ assetsReady: v }),

  addToCart: (product) =>
    set((s) => {
      const max = product.maxQty ?? 99;
      const existing = s.cart.find((l) => l.product.id === product.id);
      if (existing) {
        if (existing.qty >= max) return {}; // 1-of-1s stay 1-of-1
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
          l.product.id === id
            ? {
                ...l,
                qty: Math.min(
                  l.product.maxQty ?? 99,
                  Math.max(0, l.qty + delta)
                ),
              }
            : l
        )
        .filter((l) => l.qty > 0),
    })),

  clearCart: () => set({ cart: [] }),

  setCartOpen: (v) => set({ cartOpen: v }),

  cartCount: () => get().cart.reduce((n, l) => n + l.qty, 0),
  cartTotal: () => get().cart.reduce((n, l) => n + l.qty * l.product.price, 0),
    }),
    {
      name: "void-store",
      storage: createJSONStorage(() => localStorage),
      // Only the shopper's cart + sound preference survive a refresh; the
      // experience phase machine always boots fresh.
      partialize: (s) => ({ cart: s.cart, soundMuted: s.soundMuted }),
    }
  )
);
