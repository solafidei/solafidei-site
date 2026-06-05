"use client";

import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds per loop. Lower = faster. */
  durationSec?: number;
  className?: string;
};

/**
 * CSS-driven infinite marquee. Duplicates its children once for a seamless
 * loop and applies edge fade masks. Honours prefers-reduced-motion via the
 * `.animate-marquee` rule in globals.css.
 */
export function Marquee({ children, durationSec = 24, className = "" }: MarqueeProps) {
  return (
    <div className={`edge-fade overflow-hidden ${className}`}>
      <div
        className="animate-marquee flex w-max"
        style={{ ["--marquee-duration" as string]: `${durationSec}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
