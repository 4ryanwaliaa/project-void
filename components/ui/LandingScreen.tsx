"use client";

import { motion } from "framer-motion";
import { useVoid } from "@/lib/store";
import VoidLogo from "./VoidLogo";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function LandingScreen() {
  const enter = useVoid((s) => s.enter);

  return (
    <motion.div
      className="absolute inset-0 z-40 grid place-items-center overflow-hidden bg-void-black/90 grain"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.1, ease: "easeInOut" } }}
    >
      {/* HUD corner brackets */}
      <HudCorners />

      {/* scanline sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute left-0 h-24 w-full bg-gradient-to-b from-transparent via-void-red/15 to-transparent animate-scan" />
      </div>

      <motion.div
        className="relative flex flex-col items-center px-6 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <VoidLogo size={150} withText />
        </motion.div>

        <motion.div
          variants={item}
          className="mt-10 h-px w-40 bg-gradient-to-r from-transparent via-void-red to-transparent"
        />

        <motion.h1
          variants={item}
          className="mt-8 font-display text-2xl font-semibold tracking-[0.5em] text-white sm:text-3xl"
        >
          ENTER THE VOID
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-3 max-w-xs font-mono text-[11px] leading-relaxed tracking-widest text-void-ash"
        >
          A SECRET COLLECTOR&apos;S ROOM // HIDDEN SOMEWHERE INSIDE THE NETWORK
        </motion.p>

        <motion.button
          variants={item}
          onClick={enter}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="void-btn group mt-12"
        >
          <span className="relative z-10">ENTER</span>
          <span className="font-mono text-void-red transition-transform duration-300 group-hover:translate-x-1">
            ›
          </span>
        </motion.button>

        <motion.div
          variants={item}
          className="mt-6 font-mono text-[9px] tracking-[0.3em] text-void-ash/60"
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-red rounded-full bg-void-red align-middle" />
          SYSTEM ONLINE — AUDIO RECOMMENDED
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function HudCorners() {
  const corner =
    "pointer-events-none absolute h-10 w-10 border-void-red/50";
  return (
    <>
      <div className={`${corner} left-6 top-6 border-l border-t`} />
      <div className={`${corner} right-6 top-6 border-r border-t`} />
      <div className={`${corner} bottom-6 left-6 border-b border-l`} />
      <div className={`${corner} bottom-6 right-6 border-b border-r`} />
    </>
  );
}
