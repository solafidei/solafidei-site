"use client";

import { motion } from "framer-motion";
import { sectionReveal } from "./animations";

const stats = [
  { value: "70%", label: "Lower operating costs delivered" },
  { value: "20+", label: "Years of combined experience" },
  { value: "6", label: "Expert engineering & design leads" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <motion.div
        variants={sectionReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 gap-12 border-t border-border pt-14 sm:grid-cols-3 sm:gap-8"
      >
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col">
            <span className="font-[family-name:var(--font-fraunces)] text-5xl font-light tracking-tight text-foreground md:text-6xl">
              {value}
            </span>
            <span className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">{label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
