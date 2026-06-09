"use client";

// Throwaway scroll sampler for the redesign: four candidate Process-section
// scroll patterns, back to back, using the real Process content. Delete this
// route once a winner is picked (see docs/intent/futuristic-redesign.md).

import { useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

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

const ACCENT = "#22d3ee";

function StepNumber({ index }: { index: number }) {
  return (
    <span className="text-sm font-semibold tracking-[0.25em]" style={{ color: ACCENT }}>
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function VariantHeader({
  letter,
  name,
  note,
}: {
  letter: string;
  name: string;
  note: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-12 pt-32 md:pt-40">
      <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
        Candidate {letter}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-foreground md:text-5xl">{name}</h2>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A — Sticky Scroll Reveal: step list pins, detail panel crossfades   */
/* ------------------------------------------------------------------ */

function StickyScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length))));
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${steps.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-20">
          <div className="flex flex-col justify-center gap-8">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="transition-opacity duration-300"
                style={{ opacity: i === active ? 1 : 0.3 }}
              >
                <StepNumber index={i} />
                <h3 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
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
          <div className="relative hidden items-center md:flex">
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
                <h4 className="mt-3 text-xl font-semibold text-foreground">
                  {steps[active].title}
                </h4>
                <ul className="mt-6 space-y-4">
                  {steps[active].items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className="select-none" style={{ color: ACCENT }}>
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WINNER (A + D) — Sticky Scroll Reveal with a Tracing Beam rail      */
/* ------------------------------------------------------------------ */

function StickyScrollWithBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const beamHeight = useTransform(scrollYProgress, [0, 0.92], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length))));
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${steps.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-20">
          {/* left: step list with the beam rail drawn alongside */}
          <div className="relative flex flex-col justify-center gap-10 py-4 pl-10">
            {/* base rail */}
            <div className="absolute bottom-4 left-0 top-4 w-px bg-white/10" />
            {/* drawn beam, tied to the same scroll progress as the panel */}
            <motion.div
              style={{
                height: beamHeight,
                background: `linear-gradient(to bottom, transparent 0%, ${ACCENT} 30%)`,
              }}
              className="absolute left-0 top-4 w-px"
            >
              <div
                className="absolute -bottom-1 -left-[3.5px] h-2 w-2 rounded-full"
                style={{ background: ACCENT, boxShadow: `0 0 14px 4px ${ACCENT}66` }}
              />
            </motion.div>

            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative transition-opacity duration-300"
                style={{ opacity: i <= active ? 1 : 0.3 }}
              >
                {/* node on the rail; lights up once the beam reaches it */}
                <div
                  className="absolute -left-[2.85rem] top-1.5 h-3 w-3 rounded-full border transition-all duration-300"
                  style={{
                    borderColor: i <= active ? ACCENT : "rgba(255,255,255,0.2)",
                    background: i <= active ? ACCENT : "#0a0810",
                    boxShadow: i === active ? `0 0 12px 3px ${ACCENT}55` : "none",
                  }}
                />
                <StepNumber index={i} />
                <h3 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">
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

          {/* right: detail panel, crossfades per active step */}
          <div className="relative hidden items-center md:flex">
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
                <h4 className="mt-3 text-xl font-semibold text-foreground">
                  {steps[active].title}
                </h4>
                <ul className="mt-6 space-y-4">
                  {steps[active].items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className="select-none" style={{ color: ACCENT }}>
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B — Sticky Card Stack: each card pins and the next slides over it   */
/* ------------------------------------------------------------------ */

function StickyCardStack() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-[20vh]">
      {steps.map((s, i) => (
        <div key={s.title} className="sticky mb-16" style={{ top: `${88 + i * 28}px` }}>
          <div className="min-h-[55vh] rounded-3xl border border-border-strong bg-[#0c0a14] p-8 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] md:p-12">
            <StepNumber index={i} />
            <h3 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">{s.title}</h3>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">{s.desc}</p>
            <ul className="mt-8 space-y-3">
              {s.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="select-none" style={{ color: ACCENT }}>
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C — Rotate Deck: cards pinned center-screen, top card spins away    */
/* ------------------------------------------------------------------ */

function DeckCard({
  step,
  index,
  progress,
}: {
  step: (typeof steps)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const total = steps.length;
  const start = index / total;
  const end = (index + 1) / total;
  const isLast = index === total - 1;

  const y = useTransform(progress, [start, end], ["0%", isLast ? "0%" : "-140%"]);
  const rotate = useTransform(
    progress,
    [start, end],
    [index * 1.5, isLast ? index * 1.5 : index % 2 ? 16 : -16]
  );
  const scale = useTransform(progress, [0, start], [1 - index * 0.04, 1]);
  const opacity = useTransform(
    progress,
    [end - 0.04, end],
    [1, isLast ? 1 : 0]
  );

  return (
    <motion.div
      style={{ y, rotate, scale, opacity, zIndex: total - index, top: index * 14 }}
      className="absolute inset-x-0 rounded-3xl border border-border-strong bg-[#0c0a14] p-8 shadow-2xl md:p-12"
    >
      <StepNumber index={index} />
      <h3 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">{step.title}</h3>
      <p className="mt-3 leading-relaxed text-muted">{step.desc}</p>
      <ul className="mt-8 space-y-3">
        {step.items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
            <span className="select-none" style={{ color: ACCENT }}>
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function RotateDeck() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="relative" style={{ height: `${steps.length * 120}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <div className="relative h-[520px] w-full max-w-xl">
          {steps.map((s, i) => (
            <DeckCard key={s.title} step={s} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D — Tracing Beam: a glowing line draws itself alongside the steps   */
/* ------------------------------------------------------------------ */

function TracingBeam() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 75%"] });
  const beamHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl px-6 py-8">
      {/* base rail */}
      <div className="absolute left-8 top-0 h-full w-px bg-white/10 md:left-12" />
      {/* drawn beam */}
      <motion.div
        style={{
          height: beamHeight,
          background: `linear-gradient(to bottom, transparent, ${ACCENT})`,
        }}
        className="absolute left-8 top-0 w-px md:left-12"
      >
        <div
          className="absolute -bottom-1 -left-[3.5px] h-2 w-2 rounded-full"
          style={{ background: ACCENT, boxShadow: `0 0 14px 4px ${ACCENT}66` }}
        />
      </motion.div>

      <div className="space-y-28 pl-12 md:pl-24">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {/* node on the rail */}
            <div
              className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full border md:-left-[3.6rem]"
              style={{ borderColor: ACCENT, background: "#0a0810" }}
            />
            <StepNumber index={i} />
            <h3 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{s.title}</h3>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">{s.desc}</p>
            <ul className="mt-6 space-y-3">
              {s.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="select-none" style={{ color: ACCENT }}>
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function SamplerPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
          Scroll Sampler
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold md:text-6xl">
          Four ways the Process section could scroll
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          The chosen combination — Sticky Scroll Reveal with a Tracing Beam — is first. The
          original four candidates follow for reference.
        </p>
        <div className="mt-12 animate-bounce text-muted">↓</div>
      </section>

      <VariantHeader
        letter="A + D"
        name="The Winner: Sticky Scroll Reveal × Tracing Beam"
        note="The step list pins while the detail panel swaps — and a beam draws itself down the rail as you move through the steps, lighting up each node as it passes. Confirm this is the one."
      />
      <StickyScrollWithBeam />

      <VariantHeader
        letter="A"
        name="Sticky Scroll Reveal"
        note="The step list pins to the screen while the detail panel swaps as you scroll. The original pick — calm, readable, guided."
      />
      <StickyScrollReveal />

      <VariantHeader
        letter="B"
        name="Sticky Card Stack"
        note="Each step is a full card that pins, and the next card slides up over it. Simple physics, satisfying rhythm."
      />
      <StickyCardStack />

      <VariantHeader
        letter="C"
        name="Rotate Deck"
        note="All steps stacked as a deck in the center; the top card spins away as you scroll to reveal the next. The flashiest of the four."
      />
      <RotateDeck />

      <VariantHeader
        letter="D"
        name="Tracing Beam"
        note="A glowing line draws itself down the page alongside the steps as you scroll. The most understated — connective tissue rather than spectacle."
      />
      <TracingBeam />

      <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">The winner is at the top.</h2>
        <p className="mt-4 max-w-md leading-relaxed text-muted">
          If the A + D combination at the top feels right, tell Claude to lock it in and the real
          build begins.
        </p>
      </section>
    </main>
  );
}
