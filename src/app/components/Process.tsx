"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { SectionHeading } from "./ui/SectionHeading";

// Process set piece: Sticky Scroll Reveal × Tracing Beam (the /sampler winner).
// Desktop pins the step list while a beam draws down the rail and the detail
// panel crossfades; mobile keeps the beam + steps in normal flow (no pinning).

const ACCENT = "#22d3ee";

const steps = [
  {
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
    title: "Design & Architecture",
    desc: "We craft intuitive UI/UX and plan robust technical architecture for your app.",
    items: [
      "Wireframes: low-fidelity flows for app navigation and interactions.",
      "UI design system: components, typography, and palette.",
      "High-fidelity mockups: pixel-perfect screens for review and handoff.",
      "Architecture diagram and technical spec.",
    ],
  },
  {
    title: "Build & Integrate",
    desc: "Develop front-end and back-end, implement features, connect APIs, and perform QA.",
    items: [
      "Front-end and back-end development.",
      "Feature implementation and integration.",
      "API connections and data handling.",
      "Quality assurance and testing.",
    ],
  },
  {
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

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

function StepNumber({ index }: { index: number }) {
  return (
    <span className="font-mono text-xs font-medium tracking-[0.25em] text-accent-deep">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function StepItems({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-muted"
        >
          <span className="select-none" style={{ color: ACCENT }}>
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* Desktop: pinned step list + drawn beam + crossfading detail panel */
function PinnedProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);
  const beamHeight = useTransform(scrollYProgress, [0, 0.92], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(
      Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length))),
    );
  });

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-20 px-6 md:grid-cols-2">
          {/* step list with beam rail */}
          <div className="relative flex flex-col justify-center gap-10 py-4 pl-10">
            <div className="absolute bottom-4 left-0 top-4 w-px bg-white/10" />
            <motion.div
              style={{
                height: beamHeight,
                background: `linear-gradient(to bottom, transparent 0%, ${ACCENT} 30%)`,
              }}
              className="absolute left-0 top-4 w-px"
            >
              <div
                className="absolute -bottom-1 -left-[3.5px] h-2 w-2 rounded-full"
                style={{
                  background: ACCENT,
                  boxShadow: `0 0 14px 4px ${ACCENT}66`,
                }}
              />
            </motion.div>

            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative transition-opacity duration-300"
                style={{ opacity: i <= active ? 1 : 0.3 }}
              >
                <div
                  className="absolute -left-[2.85rem] top-1.5 h-3 w-3 rounded-full border transition-all duration-300"
                  style={{
                    borderColor: i <= active ? ACCENT : "rgba(255,255,255,0.2)",
                    background: i <= active ? ACCENT : "var(--bg-base)",
                    boxShadow:
                      i === active ? `0 0 12px 3px ${ACCENT}55` : "none",
                  }}
                />
                <StepNumber index={i} />
                <h3 className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-medium text-foreground md:text-3xl">
                  {s.title}
                </h3>
                {i === active && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 max-w-md text-sm leading-relaxed text-muted"
                  >
                    {s.desc}
                  </motion.p>
                )}
              </div>
            ))}
          </div>

          {/* detail panel */}
          <div className="relative flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full rounded-2xl border border-border-strong bg-surface p-10 backdrop-blur"
              >
                <StepNumber index={active} />
                <h4 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-foreground">
                  {steps[active].title}
                </h4>
                <StepItems items={steps[active].items} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mobile / reduced-motion: beam + steps in normal flow */
function FlowingProcess({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 75%"],
  });
  const beamHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl px-6 py-8">
      <div className="absolute left-6 top-0 h-full w-px bg-white/10" />
      {!reduce && (
        <motion.div
          style={{
            height: beamHeight,
            background: `linear-gradient(to bottom, transparent, ${ACCENT})`,
          }}
          className="absolute left-6 top-0 w-px"
        >
          <div
            className="absolute -bottom-1 -left-[3.5px] h-2 w-2 rounded-full"
            style={{
              background: ACCENT,
              boxShadow: `0 0 14px 4px ${ACCENT}66`,
            }}
          />
        </motion.div>
      )}

      <div className="space-y-20 pl-10">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="absolute -left-[1.85rem] top-1 h-3 w-3 rounded-full border"
              style={{ borderColor: ACCENT, background: "var(--bg-base)" }}
            />
            <StepNumber index={i} />
            <h3 className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-medium text-foreground">
              {s.title}
            </h3>
            <p className="mt-3 leading-relaxed text-muted">{s.desc}</p>
            <StepItems items={s.items} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Process() {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion() ?? false;

  return (
    // overflow-x-clip (NOT overflow-hidden): a hidden-overflow ancestor
    // becomes the scrollport for position:sticky and kills the pinning
    <section id="about" className="relative isolate overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32">
        <SectionHeading
          eyebrow="Process"
          title="Simple, smart, and"
          highlight="scalable."
          subtitle="Our process for app design and development, from idea to launch."
        />
      </div>
      <div className="pb-24 md:pb-0">
        {desktop && !reduce ? (
          <PinnedProcess />
        ) : (
          <FlowingProcess reduce={reduce} />
        )}
      </div>
    </section>
  );
}
