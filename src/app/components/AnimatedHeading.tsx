"use client";

import { Fragment, type ReactNode } from "react";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
} as const;

const word = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
} as const;

type AnimatedHeadingProps = {
  /** Plain text that reveals word-by-word. */
  lead: string;
  /** Optional highlighted node rendered after the lead (e.g. GradientShimmerText). */
  highlight?: ReactNode;
  className?: string;
};

/** Heading that reveals its words in a staggered rise on mount. */
export function AnimatedHeading({ lead, highlight, className = "" }: AnimatedHeadingProps) {
  const words = lead.split(" ");
  return (
    <motion.h1 className={className} variants={container} initial="hidden" animate="show">
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <motion.span variants={word} className="inline-block">
            {w}
          </motion.span>{" "}
        </Fragment>
      ))}
      {highlight && (
        <motion.span variants={word} className="inline-block">
          {highlight}
        </motion.span>
      )}
    </motion.h1>
  );
}
