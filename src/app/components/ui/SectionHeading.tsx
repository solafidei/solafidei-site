"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp, stagger } from "../animations";

type SectionHeadingProps = {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  /** Highlight portion rendered with the gradient text treatment. */
  highlight?: string;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`flex flex-col ${alignment} ${align === "center" ? "max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && (
        <motion.span
          variants={fadeInUp}
          className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted"
        >
          {eyebrowIcon}
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeInUp}
        className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl"
      >
        {title} {highlight && <span className="gradient-text">{highlight}</span>}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeInUp} className="mt-3 max-w-xl text-muted">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
