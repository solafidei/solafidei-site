"use client";

import { motion } from "framer-motion";
import { Cog, MessageSquare, Cpu, Globe } from "lucide-react";
import { stagger, sectionReveal } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";
import BorderGlow from "@/components/BorderGlow";

// One accent: cyan-400 (#22d3ee) expressed as HSL for BorderGlow
const GLOW = "187 86% 53%";
const CARD_BG = "#0a0d12";
const GRADIENT = ["#164e63", "#0e7d86", "#0891b2"]; // in-family cyans, kept dim

const items = [
  {
    icon: Globe,
    title: "Web & Mobile App Development",
    desc: "Full-stack expertise (Next.js, React Native/Flutter, robust back-ends) to build scalable products.",
    span: "md:col-span-4",
    flagship: true,
  },
  {
    icon: MessageSquare,
    title: "Product Discovery & UI/UX Design",
    desc: "Collaboratively define your app's vision, craft user journeys, and create beautiful, intuitive interfaces.",
    span: "md:col-span-2",
    flagship: false,
  },
  {
    icon: Cpu,
    title: "Feature Development & Integration",
    desc: "Architect new features, connect APIs and third-party services, and ensure seamless performance.",
    span: "md:col-span-2",
    flagship: false,
  },
  {
    icon: Cog,
    title: "Ongoing Support & Optimization",
    desc: "Iterate post-launch with maintenance, performance tuning, and user-feedback-driven enhancements.",
    span: "md:col-span-4",
    flagship: false,
  },
];

export function Services() {
  return (
    <section id="services" className="relative isolate overflow-hidden">
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
          className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-6"
        >
          {items.map(({ icon: Icon, title, desc, span, flagship }) => (
            <motion.div key={title} variants={sectionReveal} className={span}>
              <BorderGlow
                glowColor={GLOW}
                backgroundColor={CARD_BG}
                colors={GRADIENT}
                fillOpacity={0.14}
                borderRadius={20}
                glowIntensity={0.85}
                animated={flagship}
                className="h-full"
              >
                <div className="flex h-full flex-col p-8 md:p-10">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-accent-bright/25 bg-accent-bright/10 text-accent-bright">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-foreground md:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">{desc}</p>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
