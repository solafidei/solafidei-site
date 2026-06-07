import type { CSSProperties, ReactNode } from "react";

type FlowingGradientTextProps = {
  children: ReactNode;
  className?: string;
  /** Animation start offset in seconds (for staggering lines). */
  delay?: number;
};

/**
 * Inline text that shows a gradient, with a white overlay whose opacity
 * loops (white → color → white). Using opacity keeps the animation
 * GPU-composited and smooth. `delay` staggers the loop.
 */
export function FlowingGradientText({ children, className = "", delay = 0 }: FlowingGradientTextProps) {
  const content = typeof children === "string" ? children : undefined;
  return (
    <span
      className={`flowing-gradient-text ${className}`.trim()}
      data-content={content}
      style={delay ? ({ "--fade-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}
