"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { fadeInUp, stagger } from "./animations";
import { AnimatedHeading } from "./AnimatedHeading";
import { FlowingGradientText } from "./FlowingGradientText";
import { GradientButton } from "./ui/GradientButton";
import { CodeTerminal } from "./ui/CodeTerminal";

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
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

          <AnimatedHeading
            className="mt-6 font-sans text-4xl font-semibold tracking-tight md:text-6xl"
            lead="We design and build modern,"
            highlight={<FlowingGradientText>intuitive apps.</FlowingGradientText>}
          />

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
