"use client";

import { useReducedMotion } from "framer-motion";
import SplashCursor from "@/components/SplashCursor";

/**
 * Cursor-driven WebGL fluid overlay (react-bits SplashCursor).
 * Fixed, pointer-events-none, so it never blocks interaction. Disabled for
 * users who prefer reduced motion. Responds to mouse + touch drags.
 */
export function FluidCursor() {
  const reduce = useReducedMotion();
  if (reduce) return null;

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
      RAINBOW_MODE
      COLOR="#A855F7"
    />
  );
}
