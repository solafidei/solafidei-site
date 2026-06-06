"use client";

import { motion } from "framer-motion";
import { TrendingDown, Clock, Users } from "lucide-react";
import { stagger, fadeInUp } from "./animations";
import { GradientShimmerText } from "./GradientShimmerText";

const stats = [
  { icon: TrendingDown, value: "70%", label: "Lower operating costs delivered" },
  { icon: Clock, value: "20+", label: "Years of combined experience" },
  { icon: Users, value: "6", label: "Expert engineering & design leads" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="glass grid grid-cols-1 gap-6 rounded-2xl p-6 sm:grid-cols-3 sm:gap-4 sm:p-8"
      >
        {stats.map(({ icon: Icon, value, label }) => (
          <motion.div
            key={label}
            variants={fadeInUp}
            className="flex flex-col items-center text-center sm:items-start sm:text-left"
          >
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(167,139,250,0.2))] text-[var(--brand-start)]">
              <Icon className="h-5 w-5" />
            </span>
            <GradientShimmerText className="font-heading text-4xl font-bold tabular-nums md:text-5xl">
              {value}
            </GradientShimmerText>
            <p className="mt-1.5 max-w-[14rem] text-sm text-muted">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
