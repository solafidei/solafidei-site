"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

// Set piece #4: the page's single loudest CTA. Everything funnels here.
export function CTASection() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* h-auto on mobile: the component's fixed h-96 clips the stacked
          content (overflow-hidden) — only desktop gets the fixed stage */}
      <BackgroundBeamsWithCollision className="h-auto min-h-96 md:h-[36rem]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 mx-auto max-w-3xl px-6 py-20 text-center"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep">
            Start a project
          </p>
          <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            Let&apos;s build something that
            <span className="text-accent-bright"> outlasts the hype.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted">
            Every project is scoped and quoted individually — tell us what
            you&apos;re building and we&apos;ll come back with a clear plan and
            a number.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            <MovingBorderButton
              as="a"
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              borderRadius="2rem"
              duration={4000}
              containerClassName="h-14 w-auto"
              borderClassName="bg-[radial-gradient(#22d3ee_40%,transparent_60%)]"
              className="border-white/10 bg-[#070b0e]/90 px-8 text-sm font-medium text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                Book an intro call
                <ArrowRight className="h-4 w-4" />
              </span>
            </MovingBorderButton>
            <a
              href="#contact"
              className="inline-flex items-center px-4 py-3 text-sm text-muted transition-colors hover:text-foreground"
            >
              or send us a message
            </a>
          </div>
        </motion.div>
      </BackgroundBeamsWithCollision>
    </section>
  );
}
