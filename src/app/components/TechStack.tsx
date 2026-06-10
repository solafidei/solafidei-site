"use client";

import { motion } from "framer-motion";
import LogoLoop, { type LogoItem } from "@/components/LogoLoop";

const tech = [
  "Next.js",
  "React",
  "React Native",
  "Flutter",
  ".NET / C#",
  "Node.js",
  "Python",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "Firebase",
  "PostgreSQL",
  "Redis",
];

const audiences = [
  "Startups & scale-ups",
  "B2B SaaS & enterprise teams",
  "Consumer & e-commerce",
  "Healthcare",
  "Education",
  "Finance",
];

const logos: LogoItem[] = tech.map((name) => ({
  node: (
    <span className="flex items-center gap-3 font-mono text-sm tracking-wider text-muted transition-colors hover:text-foreground">
      <span className="h-1 w-1 rounded-full bg-accent-bright/70" aria-hidden />
      {name}
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

const audienceItems: LogoItem[] = audiences.map((name) => ({
  node: (
    <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted/60">{name}</span>
  ),
  title: name,
  ariaLabel: name,
}));

export function TechStack() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent-deep"
        >
          Our stack
        </motion.p>
        <div className="mt-8">
          <LogoLoop
            logos={logos}
            speed={70}
            direction="left"
            logoHeight={20}
            gap={56}
            pauseOnHover
            fadeOut
            fadeOutColor="#050709"
            ariaLabel="Technologies we work with"
          />
        </div>
        {/* who we build for — quieter counter-scrolling row (from the
            original site's industries bar) */}
        <div className="mt-6">
          <LogoLoop
            logos={audienceItems}
            speed={40}
            direction="right"
            logoHeight={14}
            gap={72}
            pauseOnHover
            fadeOut
            fadeOutColor="#050709"
            ariaLabel="Industries and teams we work with"
          />
        </div>
      </div>
    </section>
  );
}
