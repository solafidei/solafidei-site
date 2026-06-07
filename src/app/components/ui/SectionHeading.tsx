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
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`flex flex-col ${alignment} ${align === "center" ? "max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && <EyebrowLabel icon={eyebrowIcon}>{eyebrow}</EyebrowLabel>}
      <motion.div variants={fadeInUp} className="relative mt-4 inline-block px-10 py-8">
        {/* dark radial glow behind the text for legibility over the shader */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 blur-[10px]"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(5,5,12,0.85), rgba(5,5,12,0.55) 45%, transparent 75%)",
          }}
        />
        <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
          {title} {highlight && <GradientShimmerText>{highlight}</GradientShimmerText>}
        </h2>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-muted">{subtitle}</p>}
      </motion.div>
    </motion.div>
  );
}
