"use client";

import { useEffect, useState } from "react";

export interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
}

/**
 * Lightweight client device probe used to thin out particles/effects and swap
 * pointer-look for touch-look. Resolves after mount to stay SSR-safe.
 */
export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTouch: false,
    reducedMotion: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const touch = window.matchMedia("(pointer: coarse)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () =>
      setInfo({
        isMobile: mq.matches,
        isTouch: touch.matches,
        reducedMotion: motion.matches,
      });

    update();
    mq.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  return info;
}
