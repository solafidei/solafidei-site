"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [28, -28]);
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      style={reduce ? undefined : { y }}
      className={`flex flex-col ${alignment} ${align === "center" ? "mx-auto max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && (
        <motion.span
          variants={fadeInUp}
          className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeInUp}
        className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl"
      >
        {title} {highlight && <span className="text-accent-bright">{highlight}</span>}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeInUp} className="mt-5 max-w-xl leading-relaxed text-muted">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
