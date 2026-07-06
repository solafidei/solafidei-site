"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import SplashCursor from "@/components/SplashCursor";

/**
 * Cursor-driven WebGL fluid overlay (react-bits SplashCursor), tuned to the
 * single cyan accent. Fixed and pointer-events-none so it never blocks
 * interaction. Mounted only while the hero is in view (see Hero.tsx),
 * desktop pointers only, and disabled for reduced motion.
 */
export function FluidCursor() {
  const reduce = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (reduce || !finePointer) return null;

  return (
    <SplashCursor
      DENSITY_DISSIPATION={5.5}
      VELOCITY_DISSIPATION={5}
      PRESSURE={0.35}
      CURL={42}
      SPLAT_RADIUS={0.54}
      SPLAT_FORCE={6000}
      COLOR_UPDATE_SPEED={28}
      SHADING
      RAINBOW_MODE={false}
      COLOR="#22d3ee"
    />
  );
}
