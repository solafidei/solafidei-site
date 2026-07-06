"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "../animations";

type GlassCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  /** Enable hover lift + glow. Defaults to true. */
  interactive?: boolean;
  /** Use the shared fadeInUp reveal variant. Defaults to true. */
  reveal?: boolean;
  children?: ReactNode;
};

/**
 * Frosted-glass surface used across sections (services, benefits, process,
 * case studies, testimonials, forms). Hover lift + gradient glow border.
 */
export function GlassCard({
  className = "",
  interactive = true,
  reveal = true,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      variants={reveal ? fadeInUp : undefined}
      whileHover={interactive ? { y: -6 } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={[
        "glass card-gradient-border group relative rounded-2xl p-5",
        interactive
          ? "transition-colors hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {interactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(34,211,238,0.10), transparent 60%)",
          }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
