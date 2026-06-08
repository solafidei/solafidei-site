"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Content lags the scroll (parallax) and fades as the hero leaves.
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-[92vh] items-end overflow-hidden bg-background shadow-[0_28px_70px_-24px_rgba(0,0,0,0.65)]"
    >
      {/* full-bleed cinematic background — placeholder; swap for an image/video.
          (e.g. <video> or <Image fill> in place of this gradient layer) */}
      <div
        aria-hidden
        className="hero-zoom absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(110% 90% at 72% 18%, #241d38 0%, transparent 58%), radial-gradient(90% 80% at 12% 95%, #15131f 0%, transparent 70%), linear-gradient(180deg, #0a0810 0%, #0c0a15 100%)",
        }}
      />
      {/* legibility scrim — darker toward the bottom where the copy sits */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,8,16,0.35) 0%, transparent 30%, rgba(10,8,16,0.55) 75%, var(--bg-base) 100%)",
        }}
      />

      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="mx-auto w-full max-w-7xl px-6 pb-24 pt-44 md:pb-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-7 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted">
            Software Design &amp; Development Studio
          </p>

          <h1 className="font-[family-name:var(--font-fraunces)] text-[clamp(2.75rem,6vw,5.25rem)] font-light leading-[1.04] tracking-tight text-foreground">
            We design and build modern, intuitive apps.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            We help innovative companies launch and scale digital products with confidence.
          </p>

          <div className="mt-11">
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-sm tracking-wide text-foreground transition-colors hover:border-foreground"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
