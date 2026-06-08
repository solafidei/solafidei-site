"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { sectionReveal } from "./animations";

type ServiceCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

/** Editorial service block: thin top rule, muted icon, serif title, copy. */
export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <motion.div variants={sectionReveal} className="flex flex-col border-t border-border pt-8">
      <span className="text-muted">{icon}</span>
      <h3 className="mt-7 font-[family-name:var(--font-fraunces)] text-xl font-normal text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
    </motion.div>
  );
}
