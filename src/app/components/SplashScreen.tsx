"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type SplashScreenProps = {
  durationMs?: number;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function SplashScreen({ durationMs = 2800 }: SplashScreenProps) {
  // Visible on the server + first client paint so the overlay covers the page
  // and prevents a flash of the landing content.
  const [visible, setVisible] = useState(true);

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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--bg-base)" }}
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-[family-name:var(--font-fraunces)] text-3xl font-light tracking-[0.04em] text-foreground md:text-4xl"
          >
            Solafidei
          </motion.span>

          <div className="mt-9 h-px w-28 overflow-hidden bg-[var(--border)]">
            <motion.div
              className="h-full bg-foreground/50"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: Math.max(0.4, durationMs / 1000 - 0.4), ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
