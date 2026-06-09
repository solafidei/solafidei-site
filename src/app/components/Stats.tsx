"use client";

import { motion } from "framer-motion";
import { sectionReveal } from "./animations";
import CountUp from "@/components/CountUp";

const stats = [
  { to: 70, suffix: "%", label: "Lower operating costs delivered" },
  { to: 20, suffix: "+", label: "Years of combined experience" },
  { to: 6, suffix: "", label: "Expert engineering & design leads" },
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
        {stats.map(({ to, suffix, label }) => (
          <div key={label} className="flex flex-col">
            <span
              className="font-[family-name:var(--font-space-grotesk)] text-5xl font-medium tracking-tight text-accent-deep md:text-6xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <CountUp to={to} duration={1.6} />
              {suffix}
            </span>
            <span className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">{label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
