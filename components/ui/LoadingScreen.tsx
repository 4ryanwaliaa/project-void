"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { useVoid } from "@/lib/store";
import VoidLogo from "./VoidLogo";

const STATUS = [
  "CALIBRATING RETICLE",
  "BLEEDING THE LIGHTS",
  "PRESSURIZING THE VOID",
  "INDEXING ARCHIVE",
  "ARMING EMERGENCY VAULT",
];

export default function LoadingScreen() {
  // Real loader progress (drives the bar when any file assets are streamed in).
  const { progress } = useProgress();
  const assetsReady = useVoid((s) => s.assetsReady);
  const setAssetsReady = useVoid((s) => s.setAssetsReady);
  const [status, setStatus] = useState(STATUS[0]);
  const [synthetic, setSynthetic] = useState(0);

  // Cycle flavor status lines.
  useEffect(() => {
    const id = setInterval(
      () => setStatus(STATUS[Math.floor(Math.random() * STATUS.length)]),
      600
    );
    return () => clearInterval(id);
  }, []);

  // Single self-contained boot timer: ramps the bar and promotes to ready after a
  // fixed window. Deliberately independent of the render loop / drei loader 'active'
  // flag so it can never wedge (e.g. in a backgrounded tab where rAF is paused).
  useEffect(() => {
    const DURATION = 1700;
    const start = Date.now();
    const id = setInterval(() => {
      const e = Math.min(1, (Date.now() - start) / DURATION);
      setSynthetic(Math.floor(e * 100));
    }, 60);
    const ready = setTimeout(() => setAssetsReady(true), DURATION + 150);
    return () => {
      clearInterval(id);
      clearTimeout(ready);
    };
  }, [setAssetsReady]);

  // Bar reflects whichever is further along: the boot ramp or real asset streaming.
  const display = Math.min(100, Math.max(synthetic, progress));

  return (
    <AnimatePresence>
      {!assetsReady && (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center bg-void-black grain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="flex w-[300px] max-w-[80vw] flex-col items-center">
            <motion.div
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <VoidLogo size={96} />
            </motion.div>

            <div className="mt-8 font-mono text-[10px] tracking-[0.4em] text-void-red">
              ENTERING PROJECT VOID
            </div>

            <div className="mt-4 h-[3px] w-full overflow-hidden bg-void-line">
              <motion.div
                className="h-full bg-void-red shadow-red-glow"
                animate={{ width: `${display}%` }}
                transition={{ ease: "linear", duration: 0.15 }}
              />
            </div>

            <div className="mt-3 flex w-full items-center justify-between font-mono text-[10px] text-void-ash">
              <span className="truncate">{status}</span>
              <span className="text-white">
                {String(Math.floor(display)).padStart(3, "0")}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
