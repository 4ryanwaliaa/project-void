"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useVoid } from "@/lib/store";
import { useDevice } from "@/lib/useDevice";
import VoidLogo from "./VoidLogo";

export default function Hud() {
  const phase = useVoid((s) => s.phase);
  const focus = useVoid((s) => s.focus);
  const cartCount = useVoid((s) => s.cartCount());
  const setCartOpen = useVoid((s) => s.setCartOpen);
  const soundMuted = useVoid((s) => s.soundMuted);
  const toggleSound = useVoid((s) => s.toggleSound);
  const { isTouch } = useDevice();

  const inHub = phase === "hub" && focus === "none";

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none">
      <AnimatePresence>
        {inHub && (
          <>
            {/* top bar */}
            <motion.div
              key="topbar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8"
            >
              <div className="flex items-center gap-3">
                <VoidLogo size={34} glow={false} />
                <div className="font-mono text-[10px] tracking-[0.3em] text-void-ash">
                  VOID // HUB
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  aria-label={soundMuted ? "Unmute" : "Mute"}
                  className="pointer-events-auto grid h-11 w-11 place-items-center border border-void-red/40 bg-black/40 text-void-ash transition hover:border-void-red hover:text-white sm:h-9 sm:w-9"
                >
                  {soundMuted ? <IconMuted /> : <IconSound />}
                </button>
                <button
                  onClick={() => setCartOpen(true)}
                  className="pointer-events-auto flex min-h-11 items-center gap-2 border border-void-red/40 bg-black/40 px-4 py-2 font-mono text-[10px] tracking-widest text-white transition hover:border-void-red hover:bg-void-red/10 sm:min-h-0 sm:px-3"
                >
                  CART
                  <span className="grid h-4 min-w-4 place-items-center bg-void-red px-1 text-[10px]">
                    {cartCount}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* control hint */}
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] text-center font-mono text-[10px] tracking-[0.3em] text-void-ash"
            >
              {isTouch
                ? "TAP A PANEL · DRAG TO LOOK AROUND"
                : "CLICK A PANEL TO INTERACT"}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconSound() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M16 8a4 4 0 0 1 0 8" />
    </svg>
  );
}
function IconMuted() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M22 9l-6 6M16 9l6 6" />
    </svg>
  );
}
