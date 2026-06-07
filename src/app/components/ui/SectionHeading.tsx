"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp, stagger } from "../animations";
import { GradientShimmerText } from "../GradientShimmerText";
import { EyebrowLabel } from "../EyebrowLabel";

type SectionHeadingProps = {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  /** Highlight portion rendered with the shimmer text treatment. */
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
  // Dark halo so headings stay legible over the animated shader background.
  const textShadow =
    "0 2px 6px rgba(0,0,0,1), 0 4px 22px rgba(0,0,0,0.95), 0 0 46px rgba(0,0,0,0.85)";
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`flex flex-col ${alignment} ${align === "center" ? "max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && <EyebrowLabel icon={eyebrowIcon}>{eyebrow}</EyebrowLabel>}
      <motion.h2
        variants={fadeInUp}
        style={{ textShadow }}
        className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl"
      >
        {title} {highlight && <GradientShimmerText>{highlight}</GradientShimmerText>}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeInUp} style={{ textShadow }} className="mt-3 max-w-xl text-muted">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
