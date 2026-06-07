import type { ReactNode } from "react";

type FlowingGradientTextProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Inline text that shows a gradient, with a white overlay whose opacity
 * loops (white → color → white). Using opacity keeps the animation
 * GPU-composited and smooth.
 */
export function FlowingGradientText({ children, className = "" }: FlowingGradientTextProps) {
  const content = typeof children === "string" ? children : undefined;
  return (
    <span className={`flowing-gradient-text ${className}`.trim()} data-content={content}>
      {children}
    </span>
  );
}
