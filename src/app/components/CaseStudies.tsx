"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { stagger, sectionReveal } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";

export function CaseStudies() {
  const studies = [
    {
      title: "Linkup Social — Scalability, Reliability & Messaging",
      summary:
        "Linkup needed their architecture and design patterns refactored to improve scalability. We upgraded microservices to the latest .NET, terraformed the infrastructure, and reduced operating costs by 70% while improving reliability. We also delivered a chat system able to handle images, videos, and audio files by creating a dedicated microservice and integrating it with the backend and frontend.",
      client: "Linkup Social",
      logo: "/linkup_logo.png",
      metric: "70%",
      metricLabel: "lower operating costs",
    },
    {
      title: "Happy Hour Hoppy — Push Campaigns, Migrations & CI/CD",
      summary:
        "Hoppy needed a push notifications system they could use to send out marketing messages. We integrated Firebase and set up a user‑friendly section on their admin dashboard to manage notifications and send based on a variety of dynamic rules. We also fixed database migrations (tables had been created directly instead of via migrations), re‑did all migrations to restore a single source of truth, and set up a CI/CD pipeline to deploy to their servers.",
      client: "Happy Hour Hoppy",
      logo: "/hoppy_logo.png",
      metric: "CI/CD",
      metricLabel: "automated deploys",
    },
  ];
  return (
    <section id="work" className="relative isolate overflow-hidden">
      {/* full-bleed particle backdrop — darkened + masked at edges to blend */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,8,16,0.84), rgba(10,8,16,0.84)), url(/casestudies.jpg)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          eyebrow="Case studies"
          title="Real-world impact for"
          highlight="our clients"
          subtitle="See how Solafidei delivers measurable outcomes."
        />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 flex flex-col"
      >
        {studies.map((study, idx) => (
          <motion.article
            key={idx}
            variants={sectionReveal}
            className="grid gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12"
          >
            <div className="md:col-span-4">
              <div className="font-[family-name:var(--font-fraunces)] text-5xl font-light leading-none text-foreground md:text-6xl">
                {study.metric}
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                {study.metricLabel}
              </div>
              <div className="mt-8 flex items-center gap-2.5">
                <Logo src={study.logo} alt={`${study.client} logo`} />
                <span className="text-sm text-foreground">{study.client}</span>
              </div>
            </div>
            <div className="md:col-span-8">
              <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-normal leading-snug text-foreground md:text-2xl">
                {study.title}
              </h3>
              <p className="mt-5 leading-relaxed text-muted">{study.summary}</p>
            </div>
          </motion.article>
        ))}
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
