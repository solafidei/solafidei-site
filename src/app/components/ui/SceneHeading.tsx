"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../gsap";

// GSAP counterpart to SectionHeading: words rise with the scroll (scrubbed,
// reversible) instead of firing once. Use this in rebuilt scenes; framer
// sections keep SectionHeading. Never point GSAP at framer-animated nodes.

type SceneHeadingProps = {
  eyebrow?: string;
  title: string;
  /** Emphasised tail of the headline, rendered in the accent color. */
  highlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
};

export function SceneHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "center",
  className = "",
}: SceneHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const words = gsap.utils.toArray<HTMLElement>(".scene-word", el);
      const lines = gsap.utils.toArray<HTMLElement>("[data-scene-line]", el);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(words, {
          y: "0.9em",
          autoAlpha: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "top 45%",
            scrub: true,
          },
        });
        if (lines.length) {
          gsap.from(lines, {
            y: 24,
            autoAlpha: 0,
            stagger: 0.2,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "top 40%",
              scrub: true,
            },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div
      ref={ref}
      className={`flex flex-col ${alignment} ${align === "center" ? "mx-auto max-w-2xl" : ""} ${className}`}
    >
      {eyebrow && (
        <span
          data-scene-line
          className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep"
        >
          {eyebrow}
        </span>
      )}
      <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl">
        {title.split(" ").map((word, i) => (
          <span key={i} className="scene-word inline-block">
            {word}{" "}
          </span>
        ))}
        {highlight && (
          <span className="scene-word inline-block text-accent-bright">
            {highlight}
          </span>
        )}
      </h2>
      {subtitle && (
        <p data-scene-line className="mt-5 max-w-xl leading-relaxed text-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}
