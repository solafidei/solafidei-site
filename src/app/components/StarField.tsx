"use client";

import React, { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  // Twinkle state
  twinkleStart: number; // ms timestamp
  twinkleDuration: number; // ms
  twinkleBoost: number; // additional alpha/size boost 0..1
  twinkling: boolean;
};

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanupRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const dpi = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      const { innerWidth, innerHeight } = window;
      canvas.width = Math.floor(innerWidth * dpi);
      canvas.height = Math.floor(innerHeight * dpi);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
    }
    resize();

    // Create stars
    const STAR_COUNT = 160;
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 1.1,
        baseAlpha: 0.25 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.0,
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
      const t = (now - began) / 1000; // seconds
      const dt = Math.max(0, now - last);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.fillStyle = "#ffffff";
      for (const s of stars) {
        // Randomly trigger twinkle
        if (!s.twinkling) {
          // Probability per millisecond
          const p = 0.00025 * dt; // ~0.25/sec average per star
          if (Math.random() < p) {
            s.twinkling = true;
            s.twinkleStart = now;
            s.twinkleDuration = 600 + Math.random() * 900; // 0.6s - 1.5s
            s.twinkleBoost = 0; // will be eased
          }
        } else {
          const elapsed = now - s.twinkleStart;
          const k = Math.min(1, Math.max(0, elapsed / s.twinkleDuration));
          // Ease in-out (sine)
          s.twinkleBoost = Math.sin(Math.PI * k);
          if (elapsed >= s.twinkleDuration) {
            s.twinkling = false;
            s.twinkleBoost = 0;
          }
        }

        // Base subtle flicker
        const flicker = 0.25 * Math.sin(s.phase + t * s.speed);
        let alpha = s.baseAlpha + flicker + 0.6 * s.twinkleBoost;
        alpha = Math.max(0, Math.min(1, alpha));
        ctx.globalAlpha = alpha;
        const px = Math.floor(s.x * canvas.width);
        const py = Math.floor(s.y * canvas.height);
        const pr = (s.r + 0.9 * s.twinkleBoost) * dpi;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    function onResize() {
      resize();
    }
    window.addEventListener("resize", onResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
    return cleanupRef.current;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-20 opacity-60"
      aria-hidden
    />
  );
}


