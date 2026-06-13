"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useVoid } from "@/lib/store";
import { useDevice } from "@/lib/useDevice";
import LandingScreen from "@/components/ui/LandingScreen";
import Hud from "@/components/ui/Hud";
import MysteryDropModal from "@/components/ui/MysteryDropModal";
import ClockOfferModal from "@/components/ui/ClockOfferModal";
import CartDrawer from "@/components/ui/CartDrawer";
import AlarmOverlay from "@/components/ui/AlarmOverlay";

// R3F cannot server-render — load the whole scene on the client only.
const SceneCanvas = dynamic(
  () => import("@/components/experience/SceneCanvas"),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-void-black" /> }
);

export default function VoidExperience() {
  const router = useRouter();
  const phase = useVoid((s) => s.phase);
  const setPhase = useVoid((s) => s.setPhase);
  const setLowPower = useVoid((s) => s.setLowPower);
  const setIsMobile = useVoid((s) => s.setIsMobile);
  const setReducedMotion = useVoid((s) => s.setReducedMotion);
  const { isMobile, reducedMotion } = useDevice();

  // Kick the machine from the implicit "boot" into "landing" once mounted.
  // If we're arriving back from the gallery (phase was left at "toFrames"),
  // skip the intro and drop straight into the room hub.
  useEffect(() => {
    if (phase === "boot") {
      setPhase("landing");
    } else if (phase === "toFrames") {
      useVoid.setState({ phase: "hub", focus: "none", hover: "none" });
    }
    // mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Thin the scene on small / low-power devices, and drive the mobile camera framing.
  useEffect(() => {
    setLowPower(isMobile || reducedMotion);
    setIsMobile(isMobile);
    setReducedMotion(reducedMotion);
  }, [isMobile, reducedMotion, setLowPower, setIsMobile, setReducedMotion]);

  // When the camera finishes its dive into the frames wall, route to the gallery.
  // The wipe covers the screen in 350ms, so push just after it's opaque.
  useEffect(() => {
    if (phase !== "toFrames") return;
    const t = setTimeout(() => router.push("/frames"), 380);
    return () => clearTimeout(t);
  }, [phase, router]);

  // Prefetch the gallery route on idle so the hand-off is instant.
  useEffect(() => {
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
    };
    const run = () => router.prefetch("/frames");
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else run();
  }, [router]);

  return (
    <div className="absolute inset-0">
      <SceneCanvas />

      {/* Landing: logo + ENTER. Shown immediately (no separate loading screen). */}
      <AnimatePresence>
        {(phase === "landing" || phase === "boot") && <LandingScreen key="landing" />}
      </AnimatePresence>

      {/* In-world HUD: reticle + contextual hover labels. */}
      <Hud />

      {/* Emergency box alarm strobe. */}
      <AlarmOverlay />

      {/* Mystery Drop vault. */}
      <MysteryDropModal />

      {/* 1-of-1 wall clock limited offer. */}
      <ClockOfferModal />

      {/* Ecommerce cart (shared with /frames). */}
      <CartDrawer />

      {/* Cinematic black wipe while routing into the gallery. */}
      <AnimatePresence>
        {phase === "toFrames" && (
          <motion.div
            key="wipe"
            className="pointer-events-none absolute inset-0 z-[60] bg-void-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
