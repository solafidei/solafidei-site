"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { stagger } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";
import { GlassCard } from "./ui/GlassCard";

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
    <section id="work" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
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
        viewport={{ once: true }}
        className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {studies.map((study, idx) => (
          <GlassCard key={idx} className="flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {study.logo && <Logo src={study.logo} alt={`${study.client} logo`} />}
                <div className="font-heading text-lg font-semibold leading-tight">
                  {study.title}
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="gradient-text font-heading text-3xl font-bold">
                {study.metric}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted">
                {study.metricLabel}
              </span>
            </div>

            <p className="mt-4 flex-1 text-sm text-muted">{study.summary}</p>
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted">
              Client: <span className="text-foreground">{study.client}</span>
            </div>
          </GlassCard>
        ))}
      </motion.div>
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
      className="h-6 w-auto"
      onError={() => setCurrent("/logo_opaque_smaller.png")}
    />
  );
}
