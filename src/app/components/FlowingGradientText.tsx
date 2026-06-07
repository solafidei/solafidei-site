import type { ReactNode } from "react";

type FlowingGradientTextProps = {
  children: ReactNode;
  className?: string;
};

/** Inline text with a continuously flowing gradient. */
export function FlowingGradientText({ children, className = "" }: FlowingGradientTextProps) {
  return <span className={`flowing-gradient-text ${className}`.trim()}>{children}</span>;
}
