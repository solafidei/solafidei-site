"use client";

import { useCallback, useEffect } from "react";

type PJSInstance = { pJS: { fn: { vendors: { destroypJS: () => void } } } };

declare global {
  interface Window {
    particlesJS?: (id: string, config: Record<string, unknown>) => void;
    pJSDom?: PJSInstance[];
  }
}

export default function ParticlesComponent() {
  const initParticles = useCallback(() => {
    // cleanup any previous instance
    document.querySelector("#particles-js canvas")?.remove();
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom.forEach((p) => p.pJS.fn.vendors.destroypJS());
      window.pJSDom = [];
    }

    const colors = { particles: "#00f5ff", lines: "#00d9ff", accent: "#0096c7" };

    window.particlesJS?.("particles-js", {
      particles: {
        number: { value: 140, density: { enable: true, value_area: 800 } },
        color: { value: colors.particles },
        shape: { type: "circle", stroke: { width: 1, color: colors.accent } },
        opacity: {
          value: 0.9,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.5 },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 1 },
        },
        line_linked: {
          enable: true,
          distance: 160,
          color: colors.lines,
          opacity: 0.65,
          width: 1.6,
        },
        move: { enable: true, speed: 2, random: true, out_mode: "bounce" },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 220, line_linked: { opacity: 0.9 } },
          push: { particles_nb: 4 },
          repulse: { distance: 180, duration: 0.4 },
        },
      },
      retina_detect: true,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.async = true;
    script.onload = () => initParticles();
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [initParticles]);

  return <div id="particles-js" aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
