"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVoid } from "@/lib/store";
import { CLOCK_PRODUCT, formatPrice } from "@/lib/products";

const OFFER_SECONDS = 15 * 60;

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * The 1-of-1 wall clock drop. Opens when the clock is clicked in the room:
 * live time readout, a ticking offer window, hard stock of one.
 */
export default function ClockOfferModal() {
  const open = useVoid((s) => s.clockOfferOpen);
  const close = useVoid((s) => s.closeClockOffer);
  const addToCart = useVoid((s) => s.addToCart);
  const setCartOpen = useVoid((s) => s.setCartOpen);
  const inCart = useVoid((s) =>
    s.cart.some((l) => l.product.id === CLOCK_PRODUCT.id)
  );

  const [now, setNow] = useState("");
  const [left, setLeft] = useState(OFFER_SECONDS);
  const [extended, setExtended] = useState(false);

  // Live clock + offer countdown, only while the modal is up.
  useEffect(() => {
    if (!open) return;
    setLeft(OFFER_SECONDS);
    setExtended(false);
    const tick = () => {
      const d = new Date();
      setNow(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
      setLeft((v) => {
        if (v <= 1) {
          setExtended(true);
          return OFFER_SECONDS;
        }
        return v - 1;
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open]);

  // Escape closes; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const claim = () => {
    if (inCart) {
      close();
      setCartOpen(true);
      return;
    }
    addToCart(CLOCK_PRODUCT);
    close();
    setCartOpen(true);
  };

  const discount = CLOCK_PRODUCT.compareAt
    ? Math.round(
        (1 - CLOCK_PRODUCT.price / CLOCK_PRODUCT.compareAt) * 100
      )
    : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-void-black/85 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Gearwork Chrono limited offer"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="cut-corner relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden border border-void-red/50 bg-void-panel/95 shadow-red-glow-lg grain"
          >
            {/* scanline */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute h-20 w-full bg-gradient-to-b from-transparent via-void-red/25 to-transparent animate-scan" />
            </div>

            {/* header */}
            <div className="flex items-start justify-between border-b border-void-line px-6 py-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.35em] text-void-red">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse-red rounded-full bg-void-red" />
                  LIMITED TIME OFFER
                </div>
                <div className="mt-1 font-mono text-[9px] tracking-[0.3em] text-void-ash">
                  VOID HOROLOGY DIVISION
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close offer"
                className="grid h-11 w-11 shrink-0 place-items-center border border-void-line text-void-ash transition hover:border-void-red hover:text-white sm:h-9 sm:w-9"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="void-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="font-mono text-[10px] tracking-[0.3em] text-void-ash">
                {`${CLOCK_PRODUCT.series} // ${CLOCK_PRODUCT.edition}`}
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-[0.12em] text-white text-glow sm:text-4xl">
                {CLOCK_PRODUCT.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-void-ash">
                {CLOCK_PRODUCT.description}
              </p>

              {/* live readouts */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="border border-void-line bg-black/40 p-3">
                  <div className="font-mono text-[9px] tracking-[0.3em] text-void-ash">
                    IT IS CURRENTLY
                  </div>
                  <div className="mt-1 font-mono text-xl tabular-nums text-white">
                    {now || "--:--:--"}
                  </div>
                </div>
                <div className="border border-void-red/40 bg-void-red/5 p-3">
                  <div className="font-mono text-[9px] tracking-[0.3em] text-void-red">
                    {extended ? "OFFER EXTENDED ☻" : "OFFER ENDS IN"}
                  </div>
                  <div className="mt-1 font-mono text-xl tabular-nums text-void-red-bright">
                    {pad(Math.floor(left / 60))}:{pad(left % 60)}
                  </div>
                </div>
              </div>

              {/* stock bar */}
              <div className="mt-4 border border-void-line bg-black/40 p-3">
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em]">
                  <span className="text-void-ash">STOCK</span>
                  <span className="text-void-red-bright">1 LEFT — THEN IT&apos;S GONE</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-void-line">
                  <motion.div
                    className="h-full bg-void-red"
                    initial={{ width: "100%" }}
                    animate={{ width: "8%" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>

              {/* price */}
              <div className="mt-5 flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-white">
                  {formatPrice(CLOCK_PRODUCT.price)}
                </span>
                {CLOCK_PRODUCT.compareAt && (
                  <>
                    <span className="pb-1 font-mono text-sm text-void-ash line-through">
                      {formatPrice(CLOCK_PRODUCT.compareAt)}
                    </span>
                    <span className="mb-1 border border-void-red/60 bg-void-red/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-void-red-bright">
                      −{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 border-t border-void-line bg-black/40 px-6 py-5">
              <button
                onClick={claim}
                className="void-btn w-full justify-center text-sm"
              >
                {inCart ? "SECURED ✓ — VIEW YOUR HAUL" : "CLAIM IT NOW ›"}
              </button>
              <p className="mt-3 text-center font-mono text-[9px] tracking-[0.25em] text-void-ash/60">
                REAL GEARS · REAL TIME · ONE UNIT EVER MADE
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
