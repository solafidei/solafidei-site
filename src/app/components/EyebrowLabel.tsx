"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "./animations";

type EyebrowLabelProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** Small frosted-glass pill used above section headings. */
export function EyebrowLabel({ children, icon, className = "" }: EyebrowLabelProps) {
  return (
    <motion.span
      variants={fadeInUp}
      className={`glass card-gradient-border inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-white ${className}`.trim()}
    >
      {icon}
      {children}
    </motion.span>
  );
}
