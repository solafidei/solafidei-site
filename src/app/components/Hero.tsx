"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { useScroll, useTransform } from "framer-motion";
// import BackgroundScene from "./BackgroundScene";
import RotatingRingScene from "./RotatingRingScene";
import { fadeInUp, stagger } from "./animations";

export function Hero() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section id="home" className="relative overflow-hidden">
      {/* <BackgroundScene className="pointer-events-none absolute inset-0 -z-20" maskSrc="/logo_opaque_smaller.png" /> */}
      <RotatingRingScene className="pointer-events-none absolute inset-0 -z-10" gapAngleDeg={36} thickness={10} outerRadius={48} speed={0.7} />
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 text-center">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.p variants={fadeInUp} style={{ y: y1 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5" /> New: Availability for 2 projects this month
          </motion.p>

          <motion.h1 variants={fadeInUp} style={{ y: y1 }} className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
            We design and build modern, intuitive apps
          </motion.h1>

          <motion.p variants={fadeInUp} style={{ y: y1 }} className="mx-auto mt-4 max-w-3xl text-white/70">
            We help innovative companies launch and scale digital products with confidence — from discovery and UI/UX to development, integrations, and optimization.
          </motion.p>

          <motion.div variants={fadeInUp} style={{ y: y2 }} className="mt-8 flex items-center justify-center gap-3">
            <a href="https://calendly.com/solafidei/coffee" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:bg-black/90">
              Get in touch <Mail className="h-4 w-4" />
            </a>
            <a href="#services" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/90 hover:bg-white/10">
              View services <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


