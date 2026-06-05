"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { stagger } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";
import { GlassCard } from "./ui/GlassCard";

const steps = [
  {
    step: "Step 1",
    title: "Discover & Define",
    desc: "We work with you to understand your goals, target users, and the features your app needs to succeed.",
    items: [
      "Clarify business goals and success metrics.",
      "Identify target users and use cases.",
      "Define core features and MVP scope.",
      "Establish project timelines and priorities.",
    ],
  },
  {
    step: "Step 2",
    title: "Design & Architecture",
    desc: "We craft intuitive UI/UX and plan robust technical architecture for your app.",
    items: [
      "Wireframes: low‑fidelity flows for app navigation and interactions.",
      "UI Design System: components, typography, and palette for a consistent look and feel.",
      "High‑Fidelity Mockups: pixel‑perfect app screens for review and handoff.",
      "Architecture Diagram: app modules, backend services, and integrations.",
      "Technical Spec: chosen stack, API contracts, and third‑party integrations.",
    ],
  },
  {
    step: "Step 3",
    title: "Build & Integrate",
    desc: "Develop front‑end and back‑end, implement features, connect APIs, and perform QA.",
    items: [
      "Front‑end and back‑end development.",
      "Feature implementation and integration.",
      "API connections and data handling.",
      "Quality assurance and testing.",
    ],
  },
  {
    step: "Step 4",
    title: "Launch & Optimize",
    desc: "Deploy the app, monitor performance, gather feedback, and iterate.",
    items: [
      "Deployment to production environments.",
      "Performance monitoring.",
      "User feedback collection.",
      "Continuous improvements and updates.",
    ],
  },
];

export function Process() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <SectionHeading
        eyebrow="Process"
        title="Simple, smart, and"
        highlight="scalable"
        subtitle="Our process for app design and development, from idea to launch."
      />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map(({ step, title, desc, items }, i) => (
          <GlassCard key={step} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(167,139,250,0.2))] text-sm font-semibold text-[var(--brand-start)]">
                {i + 1}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted">{step}</span>
            </div>
            <h3 className="font-heading mt-3 font-medium">{title}</h3>
            <p className="mt-2 text-sm text-muted">{desc}</p>
            <div className="mt-4 flex-1 space-y-2">
              {items.map((c) => (
                <div key={c} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-start)]" />
                  <span className="text-muted">{c}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
