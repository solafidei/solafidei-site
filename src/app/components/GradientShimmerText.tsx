import type { ReactNode } from "react";

type GradientShimmerTextProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Renders inline text with the brand gradient and a soft moving sheen.
 * Use for heading highlights, e.g. <GradientShimmerText>scale.</GradientShimmerText>.
 */
export function GradientShimmerText({ children, className = "" }: GradientShimmerTextProps) {
  return <span className={`gradient-shimmer-text ${className}`.trim()}>{children}</span>;
}
