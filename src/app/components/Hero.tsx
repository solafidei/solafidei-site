"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import DecryptedText from "@/components/DecryptedText";
import { FluidCursor } from "./FluidCursor";
import { gsap, useGSAP } from "./gsap";
import { SPLASH_DONE_EVENT, splashEnabled } from "./splash-state";

// WebGL — desktop-only set piece, loaded lazily so mobile never pays for it
const LightRays = dynamic(() => import("@/components/LightRays"), {
  ssr: false,
});

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

const HEADLINE = "We design and build modern, intuitive apps.";
const WORDS = HEADLINE.split(" ");

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

  // entrance is sequenced after the splash so the text assembly is actually
  // seen (the splash is an overlay — without this, in-view animations fire
  // and finish behind it)
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!splashEnabled()) {
      setGo(true);
      return;
    }
    const onDone = () => setGo(true);
    window.addEventListener(SPLASH_DONE_EVENT, onDone);
    // safety net: never leave the hero hidden if the event is missed
    const fallback = setTimeout(() => setGo(true), 4000);
    return () => {
      window.removeEventListener(SPLASH_DONE_EVENT, onDone);
      clearTimeout(fallback);
    };
  }, []);

  // Arrive scene (experience-rebuild): GSAP owns the whole hero — entrance
  // AND scroll exit. framer-motion previously ran the entrance, but its
  // animations keep overriding inline styles afterwards, which silently
  // blocked the scroll scatter from touching the same elements. Only the
  // infinite scroll-cue line stays framer.
  //
  // Entrance: blur-assemble the headline words, then fade the rows up.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const section = ref.current;
      if (!section) return;
      const words = gsap.utils.toArray<HTMLElement>(".hero-word", section);
      const fades = gsap.utils.toArray<HTMLElement>(
        "[data-hero-fade]",
        section,
      );

      gsap.set(words, { autoAlpha: 0, y: -44, filter: "blur(10px)" });
      gsap.set(fades, { autoAlpha: 0, y: 16 });
      if (!go) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(
          words,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.09,
          },
          0.15,
        )
        .to(fades, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.7);
    },
    { dependencies: [go], scope: ref },
  );

  // Scroll exit: desktop pins the hero and scatters it as you scrub; mobile
  // gets an unpinned drift-and-fade; reduced-motion gets neither.
  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;

      const content = section.querySelector("[data-hero-content]");
      const rows = gsap.utils.toArray<HTMLElement>("[data-hero-row]", section);
      const words = gsap.utils.toArray<HTMLElement>(".hero-word", section);
      const rays = section.querySelector("[data-hero-rays]");
      const watermark = section.querySelector("[data-hero-watermark]");
      const cue = section.querySelector("[data-hero-cue]");

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=120%",
              pin: true,
              scrub: 0.6,
            },
          });

          if (cue) tl.to(cue, { autoAlpha: 0, duration: 0.08 }, 0);
          tl.to(
            rows,
            {
              y: -60,
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power1.in",
            },
            0,
          );
          // headline words scatter — transform/opacity only (entrance blur is
          // already at 0 by the time anyone scrubs; scrubbing filters janks)
          tl.to(
            words,
            {
              y: (i) => -140 - (i % 3) * 60,
              x: (i) => (i % 2 ? 1 : -1) * (24 + (i % 4) * 18),
              rotation: (i) => (i % 2 ? 4 : -4),
              autoAlpha: 0,
              duration: 0.55,
              stagger: { each: 0.035, from: "random" },
              ease: "power2.in",
            },
            0.06,
          );
          if (rays) tl.to(rays, { opacity: 0, duration: 0.5 }, 0.15);
          if (watermark) {
            tl.fromTo(
              watermark,
              { opacity: 0, scale: 0.92 },
              { opacity: 0.8, scale: 1.06, duration: 0.5, ease: "none" },
              0.25,
            ).to(
              watermark,
              { opacity: 0, y: -80, duration: 0.25, ease: "power1.in" },
              0.8,
            );
          }
        },
      );

      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (!content) return;
          gsap.to(content, {
            y: -70,
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "75% top",
              scrub: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  // rays run on mobile too (OGL caps DPR at 2 and pauses off-screen);
  // only reduced-motion users get the static gradient alone
  const showRays = !reduce;

  return (
    <section
      ref={ref}
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden"
    >
      {/* static glow — the reduced-motion fallback, and the base the rays
          sit on so the WebGL load never causes a visual pop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(90% 55% at 50% -10%, rgba(34,211,238,0.17), transparent 65%), var(--bg-deep)",
        }}
      />

      {/* volumetric light rays (set piece #1) */}
      {showRays && (
        <div aria-hidden data-hero-rays className="absolute inset-0 -z-10">
          <LightRays
            raysOrigin="top-center"
            raysColor="#22d3ee"
            raysSpeed={1.1}
            lightSpread={0.9}
            rayLength={1.5}
            fadeDistance={1.0}
            saturation={0.9}
            followMouse={desktop}
            mouseInfluence={0.08}
            noiseAmount={0.06}
            distortion={0.04}
            className="h-full w-full"
          />
        </div>
      )}

      {/* outlined wordmark that surfaces mid-scatter (desktop scene beat) */}
      <div
        aria-hidden
        data-hero-watermark
        className="pointer-events-none absolute inset-0 z-0 hidden items-center justify-center opacity-0 md:flex"
      >
        <span
          className="font-[family-name:var(--font-space-grotesk)] text-[16vw] font-semibold uppercase leading-none tracking-tight text-transparent"
          style={{ WebkitTextStroke: "1px rgba(34,211,238,0.3)" }}
        >
          Solafidei
        </span>
      </div>

      {/* fade the hero floor into the page background */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{
          background: "linear-gradient(180deg, transparent, var(--bg-base))",
        }}
      />

      {/* fluid cursor — scoped to the hero: unmounts once it scrolls away */}
      {desktop && inView && <FluidCursor />}

      <div
        data-hero-content
        className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28 pt-40 text-center"
      >
        <p
          data-hero-row
          data-hero-fade
          className="mb-8 font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep md:text-xs"
        >
          {go ? (
            <DecryptedText
              text="Software Design & Development Studio"
              animateOn="view"
              sequential
              speed={40}
              className="text-accent-deep"
              encryptedClassName="text-muted/60"
            />
          ) : (
            <span>Software Design &amp; Development Studio</span>
          )}
        </p>

        <h1 className="sr-only">{HEADLINE}</h1>
        <div
          aria-hidden
          className="flex flex-wrap justify-center font-[family-name:var(--font-space-grotesk)] text-[clamp(2.75rem,6.5vw,5.5rem)] font-medium leading-[1.05] tracking-tight text-foreground"
        >
          {WORDS.map((word, i) => (
            <span
              key={i}
              className="hero-word inline-block will-change-transform"
            >
              {word}
              {i < WORDS.length - 1 && " "}
            </span>
          ))}
        </div>

        <p
          data-hero-row
          data-hero-fade
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          We help innovative companies launch and scale digital products with
          confidence.
        </p>

        {/* availability badge — scarcity signal carried over from the
            original site, restyled to the mono/cyan system */}
        <div data-hero-row data-hero-fade className="mt-10 flex justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-bright opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-bright" />
            </span>
            Availability for 2 new projects this month
          </span>
        </div>

        <div
          data-hero-row
          data-hero-fade
          className="mt-7 flex flex-wrap items-center justify-center gap-4"
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
        </div>
      </div>

      {/* scroll cue */}
      <div
        data-hero-cue
        data-hero-fade
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
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-full bg-accent-bright/70"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
