"use client";

import { motion } from "framer-motion";

export function LogosBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-black/10 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 overflow-hidden">
        <motion.div
          className="flex w-max gap-8"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          {/* Set A */}
          <div className="flex items-center gap-8 whitespace-nowrap">
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">Startups & scale‑ups</span>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">B2B SaaS & enterprise teams</span>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">Consumer & e‑commerce</span>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">Healthcare • Education • Finance</span>
          </div>
          {/* Set B (duplicate for seamless loop) */}
          <div className="flex items-center gap-8 whitespace-nowrap" aria-hidden>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">Startups & scale‑ups</span>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">B2B SaaS & enterprise teams</span>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">Consumer & e‑commerce</span>
            <span className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">Healthcare • Education • Finance</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


