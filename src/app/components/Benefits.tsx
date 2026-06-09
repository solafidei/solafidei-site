"use client";

import { motion } from "framer-motion";
import { Clock, User, Layers, MessageCircle } from "lucide-react";
import { stagger, sectionReveal } from "./animations";
import { SectionHeading } from "./ui/SectionHeading";

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
    <section id="benefits" className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="Why us" title="Benefits of" highlight="working with us" />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4"
      >
        {benefits.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={sectionReveal}
            className="flex flex-col border-t border-border pt-8"
          >
            <span className="text-icon">
              <Icon size={22} strokeWidth={1.5} />
            </span>
            <h3 className="mt-7 font-[family-name:var(--font-fraunces)] text-xl font-normal text-foreground">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
          </motion.div>
        ))}
      </motion.div>
      </div>
    </section>
  );
}
