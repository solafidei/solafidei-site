"use client";

import { motion } from "framer-motion";
import { Clock, User, Layers, MessageCircle } from "lucide-react";
import { stagger } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";
import { GlassCard } from "./ui/GlassCard";

export function Benefits() {
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
      description: "We build apps that grow with your business, avoiding costly rebuilds.",
    },
    {
      icon: MessageCircle,
      title: "Transparent Collaboration",
      description: "Frequent updates, clear timelines, and open communication at every stage.",
    },
  ];

  return (
    <section id="benefits" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <SectionHeading
        eyebrow="Why us"
        title="Benefits of"
        highlight="working with us"
      />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {benefits.map(({ icon: Icon, title, description }) => (
          <GlassCard key={title} className="flex flex-col items-start gap-3 p-6">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(167,139,250,0.18))] text-[var(--brand-start)]">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="font-heading text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
