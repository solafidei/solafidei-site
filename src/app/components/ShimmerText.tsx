import type { ReactNode } from "react";

type ShimmerTextProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Renders inline text with an animated shimmer sweep. Set the base color
 * with a text utility (e.g. `text-primary`); the shimmer highlights it.
 */
export function ShimmerText({ children, className = "" }: ShimmerTextProps) {
  return <span className={`shimmer-text ${className}`.trim()}>{children}</span>;
}
