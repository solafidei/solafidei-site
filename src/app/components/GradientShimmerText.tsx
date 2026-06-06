"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type GradientShimmerTextProps = {
  children: ReactNode;
  className?: string;
  /** Sweep duration in seconds. */
  duration?: number;
  /** Pause between sweeps in seconds. */
  repeatDelay?: number;
  /** Gradient start color. */
  from?: string;
  /** Gradient end color. */
  to?: string;
};

/**
 * Inline text with a fixed gradient (from → to) and a soft sheen that
 * sweeps across, then rests. Colors and timing are configurable.
 */
export function GradientShimmerText({
  children,
  className = "",
  duration = 1.5,
  repeatDelay = 1.5,
  from = "#67e8f9", // cyan
  to = "#1e40af", // navy / royal blue
}: GradientShimmerTextProps) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`gradient-shimmer-text ${className}`.trim()}
      style={{ "--gst-from": from, "--gst-to": to, "--gst-x": "-100%" } as CSSProperties}
      animate={reduce ? undefined : { "--gst-x": ["-100%", "250%"] }}
      transition={{ duration, repeatDelay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}
