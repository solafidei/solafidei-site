"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp, stagger } from "../animations";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  /** Emphasised tail of the headline, rendered in serif italic. */
  highlight?: string;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`flex flex-col ${alignment} ${align === "center" ? "mx-auto max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && (
        <motion.span
          variants={fadeInUp}
          className="text-xs uppercase tracking-[0.25em] text-muted"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeInUp}
        className="mt-5 font-[family-name:var(--font-fraunces)] text-3xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl"
      >
        {title} {highlight && <em className="font-light italic">{highlight}</em>}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeInUp} className="mt-5 max-w-xl leading-relaxed text-muted">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
