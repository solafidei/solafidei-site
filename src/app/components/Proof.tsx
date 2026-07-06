"use client";

import Image from "next/image";
import React, { useRef } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import CountUp from "@/components/CountUp";
import { gsap, useGSAP } from "./gsap";

// Proof act (experience-rebuild): case studies + numbers + client voices as
// one scene — flagship set piece, second study, stats strip, testimonials.
// ContainerScroll keeps its own internal scrub (vendored, framer-based);
// everything we choreograph here is GSAP on elements framer never touches.

const flagship = {
  title: "Linkup Social — Scalability, Reliability & Messaging",
  summary:
    "Linkup needed their architecture and design patterns refactored to improve scalability. We upgraded microservices to the latest .NET, terraformed the infrastructure, and reduced operating costs by 70% while improving reliability — and delivered a rich-media chat system as a dedicated microservice.",
  client: "Linkup Social",
  logo: "/linkup_logo.png",
  metric: 70,
  metricSuffix: "%",
  metricLabel: "lower operating costs",
  tags: [".NET microservices", "Terraform", "Realtime chat", "Media pipeline"],
};

const second = {
  title: "Happy Hour Hoppy — Push Campaigns, Migrations & CI/CD",
  summary:
    "Hoppy needed a push notifications system they could use to send out marketing messages. We integrated Firebase with a rule-driven campaign manager in their admin dashboard, restored a single source of truth by re-doing all database migrations, and set up a CI/CD pipeline to deploy to their servers.",
  client: "Happy Hour Hoppy",
  logo: "/hoppy_logo.png",
  metric: "CI/CD",
  metricLabel: "automated deploys",
};

const stats = [
  { to: 70, suffix: "%", label: "Lower operating costs delivered" },
  { to: 20, suffix: "+", label: "Years of combined experience" },
  { to: 6, suffix: "", label: "Expert engineering & design leads" },
];

const voices = [
  {
    quote:
      "Solafidei shipped our push notification system and cleaned up our DB migrations with a proper CI/CD pipeline. It’s faster to ship and far easier to maintain now.",
    author: "Cian Fawcett",
    role: "Co-Founder & CEO, Happy Hour Hoppy",
  },
  {
    quote:
      "Solafidei refactored our architecture, upgraded our microservices, and terraformed our infra — we’re more scalable and cut operating costs by 70%. We also needed a complex chat system supporting images, video, and audio — Solafidei delivered a robust service and seamless integration across our stack.",
    author: "Jack Peagam",
    role: "Co‑founder & CEO, Linkup Social",
  },
];

export function Proof() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;

      const secondCols = gsap.utils.toArray<HTMLElement>(
        "[data-prf-col]",
        section,
      );
      const statBlocks = gsap.utils.toArray<HTMLElement>(".prf-stat", section);
      const voicesHead = section.querySelector("[data-prf-voices-head]");
      const quotes = gsap.utils.toArray<HTMLElement>(".prf-quote", section);

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

          // second study — columns slide in from opposite sides on desktop
          secondCols.forEach((col, i) => {
            gsap.from(col, {
              x: desktop ? (i % 2 ? 80 : -80) : 0,
              y: desktop ? 0 : 40,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: col,
                start: "top 90%",
                end: "top 60%",
                scrub: true,
              },
            });
          });

          // numbers — rise in sequence
          statBlocks.forEach((block, i) => {
            gsap.from(block, {
              y: 50,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: block,
                start: `top ${92 - (desktop ? i * 3 : 0)}%`,
                end: `top ${62 - (desktop ? i * 3 : 0)}%`,
                scrub: true,
              },
            });
          });

          // voices — heading, then quotes alternate from the sides
          if (voicesHead) {
            gsap.from(voicesHead, {
              y: 36,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: voicesHead,
                start: "top 90%",
                end: "top 55%",
                scrub: true,
              },
            });
          }
          quotes.forEach((q, i) => {
            gsap.from(q, {
              x: desktop ? (i % 2 ? 60 : -60) : 0,
              y: desktop ? 0 : 40,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: q,
                start: "top 92%",
                end: "top 60%",
                scrub: true,
              },
            });
          });
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="work" className="relative isolate overflow-hidden">
      {/* set piece #2: the flagship project unfolds out of the scroll */}
      <ContainerScroll
        titleComponent={
          <div className="px-6">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep">
              Case studies
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-4xl font-medium tracking-tight text-foreground md:text-6xl">
              Real-world impact for our clients.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">
              See how Solafidei delivers measurable outcomes.
            </p>
          </div>
        }
      >
        {/* stylized app window for the flagship case study */}
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/5">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-bright/60" />
            <span className="ml-4 hidden font-mono text-[0.65rem] tracking-wider text-muted/70 md:block">
              linkup-social / infrastructure
            </span>
          </div>
          {/* window body */}
          <div className="relative flex flex-1 flex-col justify-center gap-6 p-6 md:flex-row md:items-center md:gap-14 md:p-12">
            {/* faint grid backdrop */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="relative">
              <div className="font-[family-name:var(--font-space-grotesk)] text-7xl font-medium leading-none text-accent-bright md:text-8xl">
                <CountUp to={flagship.metric} duration={1.4} />
                {flagship.metricSuffix}
              </div>
              <div className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                {flagship.metricLabel}
              </div>
              <div className="mt-8 flex items-center gap-2.5">
                <Logo src={flagship.logo} alt={`${flagship.client} logo`} />
                <span className="text-sm text-foreground">
                  {flagship.client}
                </span>
              </div>
            </div>
            <div className="relative max-w-lg">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium leading-snug text-foreground md:text-xl">
                {flagship.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
                {flagship.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {flagship.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[0.65rem] text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* second study — calm article row under the set piece */}
      <div className="mx-auto max-w-7xl px-6">
        <article className="grid gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12">
          <div data-prf-col className="md:col-span-4">
            <div className="font-[family-name:var(--font-space-grotesk)] text-5xl font-medium leading-none text-foreground md:text-6xl">
              {second.metric}
            </div>
            <div className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
              {second.metricLabel}
            </div>
            <div className="mt-8 flex items-center gap-2.5">
              <Logo src={second.logo} alt={`${second.client} logo`} />
              <span className="text-sm text-foreground">{second.client}</span>
            </div>
          </div>
          <div data-prf-col className="md:col-span-8">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-normal leading-snug text-foreground md:text-2xl">
              {second.title}
            </h3>
            <p className="mt-5 leading-relaxed text-muted">{second.summary}</p>
          </div>
        </article>
      </div>

      {/* numbers — the act's pulse check */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 border-t border-border pt-14 sm:grid-cols-3 sm:gap-8">
          {stats.map(({ to, suffix, label }) => (
            <div key={label} className="prf-stat flex flex-col">
              <span
                className="font-[family-name:var(--font-space-grotesk)] text-5xl font-medium tracking-tight text-accent-deep md:text-6xl"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <CountUp to={to} duration={1.6} />
                {suffix}
              </span>
              <span className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* voices — the clients say it themselves */}
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-12 md:pb-32 md:pt-16">
        <div
          data-prf-voices-head
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep">
            Testimonials
          </span>
          <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl">
            Why teams choose{" "}
            <span className="text-accent-bright">Solafidei.</span>
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
          {voices.map((t, i) => (
            <figure
              key={i}
              className="prf-quote flex flex-col border-t border-border pt-8"
            >
              <blockquote className="flex-1 font-[family-name:var(--font-fraunces)] text-xl font-light leading-relaxed text-foreground md:text-2xl">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-8">
                <div className="text-sm text-foreground">{t.author}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
                  {t.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Logo({ src, alt }: { src: string; alt: string }) {
  const [current, setCurrent] = React.useState(src);
  return (
    <Image
      src={current}
      alt={alt}
      width={96}
      height={24}
      className="h-5 w-auto opacity-80"
      onError={() => setCurrent("/logo_opaque_smaller.png")}
    />
  );
}
