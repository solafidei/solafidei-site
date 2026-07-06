"use client";

import { useRef } from "react";
import { Cog, MessageSquare, Cpu, Globe } from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import LogoLoop, { type LogoItem } from "@/components/LogoLoop";
import { gsap, useGSAP } from "./gsap";

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

const HEADLINE_WORDS = "Software solutions that level up your".split(" ");
const HIGHLIGHT = "business.";

// stack beat — absorbed from the old TechStack section so "what we build"
// reads as one scene: claim → bento → the tools and audiences behind it
const tech = [
  "Next.js",
  "React",
  "React Native",
  "Flutter",
  ".NET / C#",
  "Node.js",
  "Python",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "Firebase",
  "PostgreSQL",
  "Redis",
];

const audiences = [
  "Startups & scale-ups",
  "B2B SaaS & enterprise teams",
  "Consumer & e-commerce",
  "Healthcare",
  "Education",
  "Finance",
];

const logos: LogoItem[] = tech.map((name) => ({
  node: (
    <span className="flex items-center gap-3 font-mono text-sm tracking-wider text-muted transition-colors hover:text-foreground">
      <span className="h-1 w-1 rounded-full bg-accent-bright/70" aria-hidden />
      {name}
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

const audienceItems: LogoItem[] = audiences.map((name) => ({
  node: (
    <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted/60">
      {name}
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

export function Services() {
  const ref = useRef<HTMLElement>(null);

  // "What we build" scene — everything scrubbed so the section assembles
  // with the scroll (and disassembles when you scroll back). GSAP only;
  // no framer here (WAAPI fill fights GSAP's inline styles).
  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;

      const heading = section.querySelector("[data-svc-heading]");
      const words = gsap.utils.toArray<HTMLElement>(".svc-word", section);
      const lines = gsap.utils.toArray<HTMLElement>("[data-svc-line]", section);
      const grid = section.querySelector("[data-svc-grid]");
      const cards = gsap.utils.toArray<HTMLElement>(".svc-card", section);
      const stack = section.querySelector("[data-svc-stack]");

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop:
            "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile:
            "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const desktop = !!(ctx.conditions as { desktop: boolean }).desktop;

          gsap.from(words, {
            y: "0.9em",
            autoAlpha: 0,
            rotation: desktop ? 2 : 0,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: heading,
              start: "top 88%",
              end: "top 45%",
              scrub: true,
            },
          });
          gsap.from(lines, {
            y: 24,
            autoAlpha: 0,
            stagger: 0.2,
            ease: "none",
            scrollTrigger: {
              trigger: heading,
              start: "top 80%",
              end: "top 40%",
              scrub: true,
            },
          });

          if (grid && desktop) gsap.set(grid, { perspective: 900 });
          cards.forEach((card) => {
            gsap.from(card, {
              y: desktop ? 90 : 48,
              autoAlpha: 0,
              rotationX: desktop ? 7 : 0,
              transformOrigin: "50% 0%",
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 92%",
                end: "top 58%",
                scrub: true,
              },
            });
          });

          if (stack) {
            gsap.from(stack, {
              autoAlpha: 0,
              y: 30,
              ease: "none",
              scrollTrigger: {
                trigger: stack,
                start: "top 92%",
                end: "top 65%",
                scrub: true,
              },
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="services"
      className="relative isolate overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div
          data-svc-heading
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span
            data-svc-line
            className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep"
          >
            Services
          </span>
          <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl">
            {HEADLINE_WORDS.map((word, i) => (
              <span key={i} className="svc-word inline-block">
                {word}
                {" "}
              </span>
            ))}
            <span className="svc-word inline-block text-accent-bright">
              {HIGHLIGHT}
            </span>
          </h2>
          <p data-svc-line className="mt-5 max-w-xl leading-relaxed text-muted">
            Work smarter, not harder — accelerate delivery and reduce
            operational toil.
          </p>
        </div>

        <div
          data-svc-grid
          className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-6"
        >
          {items.map(({ icon: Icon, title, desc, span, flagship }) => (
            <div key={title} className={`svc-card ${span}`}>
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
                  <p className="mt-3 max-w-md leading-relaxed text-muted">
                    {desc}
                  </p>
                </div>
              </BorderGlow>
            </div>
          ))}
        </div>

        {/* stack beat — the tools and audiences behind the bento */}
        <div data-svc-stack className="mt-20 border-t border-border pt-12">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent-deep">
            Our stack
          </p>
          <div className="mt-8">
            <LogoLoop
              logos={logos}
              speed={70}
              direction="left"
              logoHeight={20}
              gap={56}
              pauseOnHover
              fadeOut
              fadeOutColor="#050709"
              ariaLabel="Technologies we work with"
            />
          </div>
          {/* who we build for — quieter counter-scrolling row */}
          <div className="mt-6">
            <LogoLoop
              logos={audienceItems}
              speed={40}
              direction="right"
              logoHeight={14}
              gap={72}
              pauseOnHover
              fadeOut
              fadeOutColor="#050709"
              ariaLabel="Industries and teams we work with"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
