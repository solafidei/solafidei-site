"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { stagger } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";
import { GlassCard } from "./ui/GlassCard";

export function Testimonials() {
  const items = [
    {
      quote:
        "Solafidei shipped our push notification system and cleaned up our DB migrations with a proper CI/CD pipeline. It’s faster to ship and far easier to maintain now.",
      author: "Cian Fawcett",
      role: "Co-Founder & CEO, Happy Hour Hoppy",
    },
    {
      quote:
        "Solafidei refactored our architecture, upgraded our microservices, and terraformed our infra — we’re more scalable and cut operating costs by 70%. We also needed a complex chat system supporting images, video, and audio — Solafidei delivered a robust service and seamless integration across our stack.",
      author: "Jack Peagam",
      role: "Co‑founder & CEO, Linkup Social",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <SectionHeading eyebrow="Testimonials" title="Why teams choose" highlight="Solafidei" />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {items.map((t, i) => (
          <GlassCard key={i} className="flex flex-col p-6">
            <Quote className="h-7 w-7 text-[var(--brand-start)]/60" />
            <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">
              “{t.quote}”
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <div className="font-heading text-sm font-medium">{t.author}</div>
              <div className="text-xs text-muted">{t.role}</div>
            </div>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
