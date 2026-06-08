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
          exit={{ opacity: 0, transition: { duration: 1.8, ease: EASE } }}
          transition={{ duration: 0.9, ease: EASE }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url(/intro.jpg)", backgroundColor: "var(--bg-deep)" }}
        >

          {/* logo inside a spinning gradient ring — on exit it zooms up toward
              the viewer while the splash fades, revealing the site behind it */}
          <motion.div
            className="relative h-36 w-36"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { scale: 8, opacity: 0, transition: { duration: 1.8, ease: EASE } }
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
            />
            {/* mask to turn the disc into a ring */}
            <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-[var(--bg-deep)]">
              <Image
                src="/logo_opaque_smaller.png"
                alt="Solafidei"
                width={120}
                height={120}
                priority
                className="h-24 w-auto"
              />
            </div>
          </motion.div>

          {/* wordmark */}
          <motion.div
            className="font-heading mt-7 text-lg font-semibold tracking-[0.3em] text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          >
            SOLAFIDEI
          </motion.div>

          {/* progress bar */}
          <div className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-[var(--surface)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #8b5cf6, #4c1d95)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: Math.max(0.4, durationMs / 1000 - 0.3), ease: EASE }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
