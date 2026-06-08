"use client";

import { motion } from "framer-motion";
import { stagger, sectionReveal } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";

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
    <section id="about" className="relative isolate overflow-hidden">
      {/* full-bleed light-streak backdrop, masked to transparent at top/bottom
          so the section edges reveal the same page background (base + purple
          wash) as the neighbouring sections */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
        }}
      >
        {/* tiled streak image, graded down: highlights pulled back and shadows
            deepened so the bright streaks read as a moodier, lower-key glow */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/streaks.jpg)",
            backgroundSize: "100% 50%",
            backgroundRepeat: "repeat-y",
            backgroundPosition: "center",
            filter: "brightness(0.5) contrast(1.5)",
          }}
        />
        {/* dark wash over the graded image for text legibility */}
        <div className="absolute inset-0 bg-[rgba(10,8,16,0.82)]" />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
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
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 flex flex-col"
      >
        {steps.map(({ title, desc, items }, i) => (
          <motion.div
            key={title}
            variants={sectionReveal}
            className="grid gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12"
          >
            <div className="md:col-span-5">
              <span className="font-[family-name:var(--font-fraunces)] text-4xl font-light text-foreground/30 md:text-5xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-fraunces)] text-2xl font-normal text-foreground">
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{desc}</p>
            </div>
            <div className="md:col-span-7 md:pt-3">
              <ul className="space-y-3">
                {items.map((c) => (
                  <li key={c} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="select-none text-foreground/30">—</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
      </div>
    </section>
  );
}
