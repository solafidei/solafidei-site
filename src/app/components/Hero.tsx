"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { fadeInUp, stagger } from "./animations";
import { GradientShimmerText } from "./GradientShimmerText";
import { GradientButton } from "./ui/GradientButton";
import { CodeTerminal } from "./ui/CodeTerminal";

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* top-down hero glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-background [background:radial-gradient(110%_90%_at_50%_-30%,#4a5a9e2e_45%,transparent_80%)]"
      />
      {/* vibrant hero glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-0 -z-10 h-[30rem] w-[30rem] rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--brand-start), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 -z-10 h-[28rem] w-[28rem] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--aurora-3), transparent 70%)" }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-2">
        {/* left: copy */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center lg:text-left"
        >
          <motion.p
            variants={fadeInUp}
            className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-start)]" /> New: Availability for 2
            projects this month
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mt-6 font-sans text-4xl font-semibold tracking-tight md:text-6xl"
          >
            We design and build modern, <GradientShimmerText>intuitive apps.</GradientShimmerText>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-xl text-balance text-muted lg:mx-0"
          >
            We help innovative companies launch and scale digital products with confidence — from
            discovery and UI/UX to development, integrations, and optimization.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <GradientButton
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              Get in touch <Mail className="h-4 w-4" />
            </GradientButton>
            <GradientButton variant="ghost" href="#services" className="w-full sm:w-auto">
              View services{" "}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </GradientButton>
          </motion.div>
        </motion.div>

        {/* right: animated code terminal (decorative — hidden on small screens) */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="hidden min-w-0 lg:block"
        >
          <CodeTerminal />
        </motion.div>
      </div>
    </section>
  );
}
