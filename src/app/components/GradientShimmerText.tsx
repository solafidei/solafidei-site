import type { CSSProperties, ReactNode } from "react";

type GradientShimmerTextProps = {
  children: ReactNode;
  className?: string;
  /** Sweep duration in seconds. */
  duration?: number;
  /** Pause between sweeps in seconds. */
  repeatDelay?: number;
  /** Gradient start color. */
  from?: string;
  /** Gradient end color. */
  to?: string;
};

/**
 * Inline text with a fixed gradient (from → to) and a soft sheen that
 * sweeps across, then rests. Driven by a CSS animation for smoothness.
 */
export function GradientShimmerText({
  children,
  className = "",
  duration = 1.5,
  repeatDelay = 1.5,
  from = "#67e8f9", // cyan
  to = "#1e40af", // navy / royal blue
}: GradientShimmerTextProps) {
  return (
    <span
      className={`gradient-shimmer-text ${className}`.trim()}
      style={
        {
          "--gst-from": from,
          "--gst-to": to,
          "--gst-dur": `${duration + repeatDelay}s`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
