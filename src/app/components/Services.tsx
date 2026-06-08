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
    <section id="services" className="relative isolate overflow-hidden">
      {/* full-bleed particle backdrop — darkened + masked at edges to blend */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,8,16,0.84), rgba(10,8,16,0.84)), url(/services.jpg)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
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
      </div>
    </section>
  );
}
