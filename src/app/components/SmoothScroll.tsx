"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Site-wide smooth scrolling via Lenis, driven by the GSAP ticker so
 * ScrollTrigger scenes stay frame-locked with the smoothed scroll position.
 * Skipped entirely for users who prefer reduced motion and on touch devices
 * (native momentum scrolling already feels right there; Lenis would fight
 * it). ScrollTrigger itself works off native scroll in those cases.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Lenis is the sole rAF driver now; lag smoothing would make the two
    // disagree about time after a long frame.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
