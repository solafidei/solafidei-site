"use client";

import { motion } from "framer-motion";
import { Cog, MessageSquare, Cpu, Globe } from "lucide-react";
import { stagger } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";
import { ServiceCard } from "./ServiceCard";

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
    <section id="services" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <SectionHeading
        eyebrow="Services"
        title="Software solutions that level up your"
        highlight="business."
        subtitle="Work smarter, not harder — accelerate delivery and reduce operational toil."
      />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4"
      >
        {items.map(({ icon: Icon, title, desc }) => (
          <ServiceCard key={title} icon={<Icon size={22} strokeWidth={1.5} />} title={title} description={desc} />
        ))}
      </motion.div>
    </section>
  );
}
