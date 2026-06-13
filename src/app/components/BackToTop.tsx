"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "Back to top" button.
 *
 * - Appears once the user has scrolled past `threshold` pixels (default 600).
 * - Hidden when at (or near) the top of the page.
 * - Smooth-scrolls to the top on activation.
 * - Rendered as a native <button>, so it is focusable and Enter/Space activate it.
 */
export function BackToTop({ threshold = 600 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    // Initialise in case the page loads already scrolled.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white shadow-lg backdrop-blur transition duration-300 hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-start)] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
