"use client";

import { motion } from "framer-motion";
import { stagger, sectionReveal } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";

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
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <SectionHeading eyebrow="Testimonials" title="Why teams choose" highlight="Solafidei" />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2"
      >
        {items.map((t, i) => (
          <motion.figure
            key={i}
            variants={sectionReveal}
            className="flex flex-col border-t border-border pt-8"
          >
            <blockquote className="flex-1 font-[family-name:var(--font-fraunces)] text-xl font-light leading-relaxed text-foreground md:text-2xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-8">
              <div className="text-sm text-foreground">{t.author}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">{t.role}</div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}
