"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { stagger, sectionReveal } from "./animations";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import CountUp from "@/components/CountUp";

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

export function CaseStudies() {
  return (
    <section id="work" className="relative isolate overflow-hidden">
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
      <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.article
            variants={sectionReveal}
            className="grid gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12"
          >
            <div className="md:col-span-4">
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
            <div className="md:col-span-8">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-normal leading-snug text-foreground md:text-2xl">
                {second.title}
              </h3>
              <p className="mt-5 leading-relaxed text-muted">
                {second.summary}
              </p>
            </div>
          </motion.article>
        </motion.div>
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
