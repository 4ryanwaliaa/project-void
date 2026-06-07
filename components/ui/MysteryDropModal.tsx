"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVoid } from "@/lib/store";
import { DROPS, type Drop } from "@/lib/drops";
import VoidLogo from "./VoidLogo";

const STATUS_COLOR: Record<Drop["status"], string> = {
  INCOMING: "text-void-red border-void-red/50",
  ENCRYPTED: "text-amber-400 border-amber-400/40",
  SEALED: "text-void-ash border-void-ash/40",
};

export default function MysteryDropModal() {
  const open = useVoid((s) => s.modalOpen);
  const close = useVoid((s) => s.closeModal);
  const [freq, setFreq] = useState("");
  const [locked, setLocked] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[58] grid place-items-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-void-black/85 backdrop-blur-sm"
            onClick={close}
          />

          {/* panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="cut-corner relative z-10 max-h-[88vh] w-full max-w-4xl overflow-hidden border border-void-red/40 bg-void-panel/95 shadow-red-glow-lg grain"
          >
            {/* scanline */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute h-20 w-full bg-gradient-to-b from-transparent via-void-red/25 to-transparent animate-scan" />
            </div>

            {/* header */}
            <div className="flex items-start justify-between border-b border-void-line px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <VoidLogo size={40} glow={false} />
                <div>
                  <div className="font-mono text-[10px] tracking-[0.4em] text-void-red">
                    PROJECT VOID ARCHIVE
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-[0.25em] text-white sm:text-2xl">
                    EMERGENCY DROP VAULT
                  </h2>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close vault"
                className="grid h-9 w-9 place-items-center border border-void-line text-void-ash transition hover:border-void-red hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* COMING SOON hero */}
            <div className="relative border-b border-void-line px-6 py-10 text-center sm:px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                className="font-display text-4xl font-bold tracking-[0.18em] text-white text-glow sm:text-6xl"
              >
                COMING SOON
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 font-mono text-[11px] tracking-[0.35em] text-void-red"
              >
                THE VAULT IS SEALED — NEW DROPS INCOMING
              </motion.p>
            </div>

            {/* drops */}
            <div className="void-scroll max-h-[42vh] overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {DROPS.map((drop, i) => (
                  <motion.div
                    key={drop.code}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i + 0.1, duration: 0.5 }}
                    className="group relative border border-void-line bg-black/40 p-5 transition hover:border-void-red/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-widest text-void-ash">
                        {drop.code}
                      </span>
                      <span
                        className={`border px-2 py-0.5 font-mono text-[9px] tracking-widest ${STATUS_COLOR[drop.status]}`}
                      >
                        {drop.status}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold tracking-wider text-white">
                      {drop.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-void-ash">
                      {drop.blurb}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-void-line pt-3">
                      <span className="font-mono text-[10px] tracking-widest text-void-red">
                        {drop.window}
                      </span>
                      <span className="font-mono text-[10px] text-void-ash opacity-0 transition group-hover:opacity-100">
                        ◢ LOCKED
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* notify footer */}
            <div className="border-t border-void-line bg-black/40 px-6 py-5 sm:px-8">
              {locked ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center font-mono text-xs tracking-[0.3em] text-void-red"
                >
                  ◤ FREQUENCY LOCKED — YOU&apos;LL BE FIRST INTO THE VAULT ◥
                </motion.div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (freq.trim()) setLocked(true);
                  }}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <span className="font-mono text-[10px] tracking-[0.3em] text-void-ash">
                    LEAVE YOUR FREQUENCY //
                  </span>
                  <input
                    type="email"
                    required
                    value={freq}
                    onChange={(e) => setFreq(e.target.value)}
                    placeholder="signal@projectvoid.io"
                    className="flex-1 border border-void-line bg-black/60 px-4 py-2 font-mono text-sm text-white placeholder:text-void-ash/50 focus:border-void-red focus:outline-none"
                  />
                  <button type="submit" className="void-btn !px-6 !py-2 text-xs">
                    NOTIFY ME
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
