"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import BlurText from "@/components/BlurText";
import DecryptedText from "@/components/DecryptedText";
import { FluidCursor } from "./FluidCursor";

// WebGL — desktop-only set piece, loaded lazily so mobile never pays for it
const LightRays = dynamic(() => import("@/components/LightRays"), { ssr: false });

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

const HEADLINE = "We design and build modern, intuitive apps.";

function useFinePointerDesktop() {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return match;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const desktop = useFinePointerDesktop();
  const inView = useInView(ref, { amount: 0.15 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Content lags the scroll (parallax) and fades as the hero leaves.
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const showRays = desktop && !reduce;

  return (
    <section
      ref={ref}
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden"
    >
      {/* static glow — the mobile/reduced-motion fallback, and the base the
          rays sit on so the WebGL load never causes a visual pop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(90% 55% at 50% -10%, rgba(34,211,238,0.13), transparent 65%), var(--bg-deep)",
        }}
      />

      {/* volumetric light rays (set piece #1) */}
      {showRays && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <LightRays
            raysOrigin="top-center"
            raysColor="#22d3ee"
            raysSpeed={1.1}
            lightSpread={0.9}
            rayLength={1.5}
            fadeDistance={1.0}
            saturation={0.9}
            followMouse
            mouseInfluence={0.08}
            noiseAmount={0.06}
            distortion={0.04}
            className="h-full w-full"
          />
        </div>
      )}

      {/* fade the hero floor into the page background */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{ background: "linear-gradient(180deg, transparent, var(--bg-base))" }}
      />

      {/* fluid cursor — scoped to the hero: unmounts once it scrolls away */}
      {desktop && inView && <FluidCursor />}

      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="mx-auto w-full max-w-5xl px-6 pb-28 pt-40 text-center"
      >
        <p className="mb-8 font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep md:text-xs">
          <DecryptedText
            text="Software Design & Development Studio"
            animateOn="view"
            sequential
            speed={40}
            className="text-accent-deep"
            encryptedClassName="text-muted/60"
          />
        </p>

        <h1 className="sr-only">{HEADLINE}</h1>
        <div aria-hidden>
          <BlurText
            text={HEADLINE}
            animateBy="words"
            direction="top"
            delay={90}
            stepDuration={0.4}
            className="justify-center font-[family-name:var(--font-space-grotesk)] text-[clamp(2.75rem,6.5vw,5.5rem)] font-medium leading-[1.05] tracking-tight text-foreground"
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          We help innovative companies launch and scale digital products with confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-accent-bright/40 bg-accent-bright/10 px-7 py-3.5 text-sm font-medium text-cyan-100 transition-colors hover:border-accent-bright/70 hover:bg-accent-bright/20"
          >
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#work"
            className="inline-flex items-center px-5 py-3.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            See our work
          </a>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted/70">
            Scroll
          </span>
          <div className="h-10 w-px overflow-hidden bg-white/10">
            <motion.div
              animate={reduce ? undefined : { y: ["-100%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full bg-accent-bright/70"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
