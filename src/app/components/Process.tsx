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
import { Clock, User, Layers, MessageCircle } from "lucide-react";
import { SceneHeading } from "./ui/SceneHeading";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";

// "How we work" act (experience-rebuild): the Process set piece (Sticky
// Scroll Reveal × Tracing Beam, the /sampler winner) plus the absorbed
// Benefits ("why us") and Team beats. The pinned set piece stays framer —
// it works and GSAP must never touch framer-animated nodes; the beats and
// headings are GSAP-scrubbed.

const ACCENT = "#22d3ee";

const benefits = [
  {
    icon: Clock,
    title: "Faster Time-to-Market",
    description:
      "Our agile approach gets your app into users’ hands quickly without compromising quality.",
  },
  {
    icon: User,
    title: "User-Centric Design",
    description:
      "We design with your users in mind, delivering intuitive and engaging experiences.",
  },
  {
    icon: Layers,
    title: "Scalable Architecture",
    description:
      "We build apps that grow with your business, avoiding costly rebuilds.",
  },
  {
    icon: MessageCircle,
    title: "Transparent Collaboration",
    description:
      "Frequent updates, clear timelines, and open communication at every stage.",
  },
];

const people = [
  {
    name: "Solomon Razaq",
    role: "Founder",
    skills: "TypeScript, JavaScript, C#, SQL, GCP",
  },
  {
    name: "Innocent Munyadziwa",
    role: "Tech Lead",
    skills: "TypeScript, JavaScript, C#, SQL, Java, AWS, Azure, Terraform",
  },
  {
    name: "Muema Kamba",
    role: "Tech Lead",
    skills: "TypeScript, JavaScript, Java, Python, Go, Rust, AWS",
  },
  {
    name: "Daniel Jorge",
    role: "Mobile Developer",
    skills: "Flutter, React Native, Node.js, AWS, Firebase, Code Magic",
  },
  {
    name: "Den Radkevich",
    role: "Developer",
    skills: "TypeScript, JavaScript, React, React Native, NodeJS, SQL",
  },
  {
    name: "Nathan Boyega",
    role: "Product Strategy & Design",
    skills: "Product Strategy, Product Design, Design Systems",
  },
];

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
  const ref = useRef<HTMLElement>(null);

  // beats after the set piece — scrubbed reveals on plain (non-framer) nodes
  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const cards = gsap.utils.toArray<HTMLElement>(".hww-card", section);
      const rows = gsap.utils.toArray<HTMLElement>(".hww-row", section);

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop:
            "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile:
            "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const desk = !!(ctx.conditions as { desktop: boolean }).desktop;

          cards.forEach((card) => {
            gsap.from(card, {
              y: desk ? 70 : 40,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 92%",
                end: "top 60%",
                scrub: true,
              },
            });
          });

          rows.forEach((row) => {
            gsap.from(row, {
              x: desk ? -50 : 0,
              y: desk ? 0 : 30,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top 94%",
                end: "top 68%",
                scrub: true,
              },
            });
          });
        },
      );
      // the desktop/mobile process swap changes the act's height by ~3
      // viewports; every trigger measured before the swap is stale
      ScrollTrigger.refresh();

      return () => mm.revert();
    },
    // re-run when the set-piece variant swaps (useIsDesktop flips after
    // mount), otherwise the beats' trigger positions are computed against
    // the wrong layout and they reveal thousands of px too early
    { scope: ref, dependencies: [desktop, reduce], revertOnUpdate: true },
  );

  return (
    // overflow-x-clip (NOT overflow-hidden): a hidden-overflow ancestor
    // becomes the scrollport for position:sticky and kills the pinning
    <section ref={ref} id="about" className="relative isolate overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32">
        <SceneHeading
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

      {/* why us beat — absorbed from the old Benefits section */}
      <div id="benefits" className="mx-auto max-w-7xl px-6 pt-24 md:pt-32">
        <SceneHeading
          eyebrow="Why us"
          title="Benefits of"
          highlight="working with us."
        />
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="hww-card flex flex-col border-t border-border pt-8"
            >
              <span className="text-icon">
                <Icon size={22} strokeWidth={1.5} />
              </span>
              <h3 className="mt-7 font-[family-name:var(--font-fraunces)] text-xl font-normal text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* team beat — the people who run the process */}
      <div id="team" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SceneHeading
          eyebrow="Team"
          title="The people behind the"
          highlight="work."
        />
        <div className="mt-16 flex flex-col">
          {people.map((p) => (
            <div key={p.name} className="hww-row border-t border-border py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-normal text-foreground">
                  {p.name}
                </h3>
                <span className="text-xs uppercase tracking-[0.18em] text-muted">
                  {p.role}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{p.skills}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
