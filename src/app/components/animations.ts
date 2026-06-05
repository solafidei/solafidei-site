"use client";

// Shared motion tokens — easing matches the global `--ease` curve.
const EASE = [0.16, 1, 0.3, 1] as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
} as const;

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
} as const;

export const staggerFast = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
} as const;
