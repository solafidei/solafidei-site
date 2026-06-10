"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { emitSplashDone, markSplashSeen, splashEnabled } from "./splash-state";

type SplashScreenProps = {
  durationMs?: number;
};

const EASE = [0.16, 1, 0.3, 1] as const;
// single-accent system: cyan ident ring
const RING_GRADIENT =
  "conic-gradient(from 0deg, #0e7d86, #22d3ee, #0a4f57, #0e7d86)";

// Short branded ident, shown once per session. The exit keeps the "window"
// trick: ring + disc fade while the transparent logo zooms toward the viewer,
// so the hero appears through the logo's negative space — and the hero's text
// entrance starts at that moment (see splash-state.ts + Hero.tsx).
export function SplashScreen({ durationMs = 900 }: SplashScreenProps) {
  // Visible on the server + first paint so the overlay is in the initial HTML
  // and covers the page — prevents a flash of the landing page.
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!splashEnabled()) {
      setVisible(false);
      emitSplashDone();
      return;
    }
    markSplashSeen();
    const t = setTimeout(() => {
      setVisible(false);
      // fire as the exit starts: the hero headline assembles while the
      // splash "window" opens over it
      emitSplashDone();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          aria-hidden
          initial={{ opacity: 1 }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.5 } }
              : { opacity: 0, transition: { delay: 1.0, duration: 0.25, ease: "easeIn" } }
          }
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* solid base — fades out on exit so the site shows through the
              logo's transparent areas (the window effect) */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundColor: "var(--bg-deep)" }}
            exit={
              reduce
                ? undefined
                : { opacity: 0, transition: { duration: 0.9, ease: [0.45, 0, 0.55, 1] } }
            }
          />

          {/* logo inside a spinning cyan ring */}
          <motion.div
            className="relative z-10 h-32 w-32"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    scale: 8,
                    filter: "blur(8px)",
                    transition: { duration: 1.2, ease: [0.45, 0, 0.55, 1] },
                  }
            }
            transition={{ duration: 0.55, ease: EASE }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: RING_GRADIENT }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={
                reduce
                  ? undefined
                  : { repeat: Infinity, ease: "linear", duration: 1.4 }
              }
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, transition: { duration: 0.5, ease: [0.45, 0, 0.55, 1] } }
              }
            />
            {/* dark disc backing — fades on exit to "open" the window */}
            <motion.div
              className="absolute inset-[3px] rounded-full bg-[var(--bg-deep)]"
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, transition: { duration: 0.5, ease: [0.45, 0, 0.55, 1] } }
              }
            />
            {/* logo (transparent PNG) — its negative space becomes the window */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/logo_transparent_smaller.png"
                alt="Solafidei"
                width={120}
                height={120}
                priority
                className="h-[5.25rem] w-auto"
              />
            </div>
          </motion.div>

          {/* wordmark — clears quickly on exit so only the logo zooms */}
          <motion.div
            className="font-heading relative z-10 mt-6 text-lg font-semibold tracking-[0.3em] text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          >
            SOLAFIDEI
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
