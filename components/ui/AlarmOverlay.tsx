"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useVoid } from "@/lib/store";

/** Full-screen red strobe + breach warning fired the instant the glass shatters. */
export default function AlarmOverlay() {
  const alarm = useVoid((s) => s.alarm);

  return (
    <AnimatePresence>
      {alarm && (
        <motion.div
          key="alarm"
          className="pointer-events-none absolute inset-0 z-[55]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(209,0,31,0) 30%, rgba(209,0,31,0.55) 100%)",
            }}
            animate={{ opacity: [0, 1, 0.2, 1, 0.3, 1] }}
            transition={{ duration: 0.9, times: [0, 0.15, 0.3, 0.5, 0.7, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 top-1/3 text-center"
            animate={{ opacity: [1, 0.1, 1, 0.1, 1] }}
            transition={{ duration: 0.9, repeat: 0 }}
          >
            <div className="font-display text-3xl font-bold tracking-[0.4em] text-white text-glow sm:text-5xl">
              VAULT BREACHED
            </div>
            <div className="mt-2 font-mono text-xs tracking-[0.5em] text-void-red">
              {"// EMERGENCY DROP PROTOCOL ENGAGED"}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
