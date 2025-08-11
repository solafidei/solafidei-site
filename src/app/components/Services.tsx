"use client";

import { motion } from "framer-motion";
import { Cog, MessageSquare, Cpu, Globe } from "lucide-react";
import { fadeInUp, stagger } from "./animations";

export function Services() {
  const items = [
    {
      icon: MessageSquare,
      title: "Product Discovery & UI/UX Design",
      desc: "Collaboratively define your app’s vision, craft user journeys, and create beautiful, intuitive interfaces.",
    },
    {
      icon: Globe,
      title: "Web & Mobile App Development",
      desc: "Full‑stack expertise (Next.js, React Native/Flutter, robust back‑ends) to build scalable products.",
    },
    {
      icon: Cpu,
      title: "Feature Development & Integration",
      desc: "Architect new features, connect APIs and third‑party services, and ensure seamless performance.",
    },
    {
      icon: Cog,
      title: "Ongoing Support & Optimization",
      desc: "Iterate post‑launch with maintenance, performance tuning, and user‑feedback‑driven enhancements.",
    },
  ];
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">Software solutions that level up your business</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-black/60 dark:text-white/70">Work smarter, not harder — accelerate delivery and reduce operational toil.</p>
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={fadeInUp} whileHover={{ y: -6 }} className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
            <Icon className="h-5 w-5 mb-3 text-black/70 dark:text-white/70" />
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-black/60 dark:text-white/70">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}


