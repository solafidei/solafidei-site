"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  color: string;
  twinkleStart: number;
  twinkleDuration: number;
  twinkleBoost: number;
  twinkling: boolean;
};

// Ambient star layer (ported from the original site, retuned): adds depth to
// the calm near-black stretches between set pieces. Sections with their own
// opaque backgrounds (hero, CTA beams, case-study window) cover it, so it
// never competes with them. Density/alpha kept low on purpose; ~25% of stars
// carry the cyan accent. Reduced motion gets a static (non-animated) field.
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpi = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      const { innerWidth, innerHeight } = window;
      canvas.width = Math.floor(innerWidth * dpi);
      canvas.height = Math.floor(innerHeight * dpi);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
    }
    resize();

    // density scales with viewport, capped — phones get proportionally fewer
    const starCount = Math.min(
      130,
      Math.round((window.innerWidth * window.innerHeight) / 14000),
    );
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.5 + Math.random() * 0.9,
        baseAlpha: 0.1 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.7,
        color: Math.random() < 0.25 ? "#67e8f9" : "#ffffff",
        twinkleStart: 0,
        twinkleDuration: 0,
        twinkleBoost: 0,
        twinkling: false,
      });
    }

    let rafId = 0;
    let last = performance.now();
    const began = last;

    function draw(now: number) {
      const t = (now - began) / 1000;
      const dt = Math.max(0, now - last);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        if (!reduce) {
          if (!s.twinkling) {
            // sparse twinkles: roughly one every ~8s per star
            if (Math.random() < 0.00012 * dt) {
              s.twinkling = true;
              s.twinkleStart = now;
              s.twinkleDuration = 800 + Math.random() * 1000;
              s.twinkleBoost = 0;
            }
          } else {
            const k = Math.min(1, (now - s.twinkleStart) / s.twinkleDuration);
            s.twinkleBoost = Math.sin(Math.PI * k);
            if (k >= 1) {
              s.twinkling = false;
              s.twinkleBoost = 0;
            }
          }
        }

        const flicker = reduce ? 0 : 0.08 * Math.sin(s.phase + t * s.speed);
        const alpha = Math.max(
          0,
          Math.min(1, s.baseAlpha + flicker + 0.3 * s.twinkleBoost),
        );
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        const px = Math.floor(s.x * canvas.width);
        const py = Math.floor(s.y * canvas.height);
        const pr = (s.r + 0.6 * s.twinkleBoost) * dpi;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    />
  );
}
