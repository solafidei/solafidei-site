"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type SplashScreenProps = {
  durationMs?: number;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const RING_GRADIENT =
  "conic-gradient(from 0deg, #6d28d9, #8b5cf6, #4c1d95, #6d28d9)";

export function SplashScreen({ durationMs = 2800 }: SplashScreenProps) {
  // Start visible on the server + first client paint so the overlay is in the
  // initial HTML and covers the page — prevents a flash of the landing page.
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), durationMs);
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
              ? { opacity: 0, transition: { duration: 0.6 } }
              : { opacity: 0, transition: { delay: 1.5, duration: 0.3, ease: "easeIn" } }
          }
          transition={{ duration: 0.9, ease: EASE }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* background image layer — fades out on exit so the site behind it
              shows through the logo's transparent areas (the window effect) */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(rgba(5,5,7,0.5), rgba(5,5,7,0.5)), url(/intro.jpg)",
              backgroundColor: "var(--bg-deep)",
            }}
            exit={
              reduce
                ? undefined
                : { opacity: 0, transition: { duration: 1.2, ease: [0.45, 0, 0.55, 1] } }
            }
          />

          {/* logo inside a spinning gradient ring — on exit the ring + dark disc
              fade away while the transparent logo zooms toward the viewer, so the
              site shows through the logo's negative space like a window */}
          <motion.div
            className="relative z-10 h-36 w-36"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    scale: 8,
                    filter: "blur(8px)",
                    transition: { duration: 1.8, ease: [0.45, 0, 0.55, 1] },
                  }
            }
            transition={{ duration: 0.8, ease: EASE }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: RING_GRADIENT }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={
                reduce
                  ? undefined
                  : { repeat: Infinity, ease: "linear", duration: 1.6 }
              }
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, transition: { duration: 0.7, ease: [0.45, 0, 0.55, 1] } }
              }
            />
            {/* dark disc backing — fades on exit to "open" the window */}
            <motion.div
              className="absolute inset-[3px] rounded-full bg-[var(--bg-deep)]"
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, transition: { duration: 0.7, ease: [0.45, 0, 0.55, 1] } }
              }
            />
            {/* logo (transparent PNG) on top — its black space is alpha, so the
                site behind shows through it once the disc/background clear */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/logo_transparent_smaller.png"
                alt="Solafidei"
                width={120}
                height={120}
                priority
                className="h-24 w-auto"
              />
            </div>
          </motion.div>

          {/* wordmark — clears quickly on exit so only the logo zooms */}
          <motion.div
            className="font-heading relative z-10 mt-7 text-lg font-semibold tracking-[0.3em] text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          >
            SOLAFIDEI
          </motion.div>

          {/* progress bar — clears quickly on exit */}
          <motion.div
            className="relative z-10 mt-6 h-1 w-44 overflow-hidden rounded-full bg-[var(--surface)]"
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #8b5cf6, #4c1d95)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: Math.max(0.4, durationMs / 1000 - 0.3), ease: EASE }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
