"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Plus } from "lucide-react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { Turnstile } from "./Turnstile";
import { SceneHeading } from "./ui/SceneHeading";
import { gsap, useGSAP } from "./gsap";

// Talk act (experience-rebuild): the closing scene — FAQ clears the last
// hesitations, the beams CTA is the page's single loudest moment, and the
// contact form lands the plane. The form logic is the business funnel:
// changes here need real-browser verification (constraint in the intent doc).
// framer keeps the FAQ accordion (UI state); GSAP scrubs only plain nodes.

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

const faqs = [
  {
    q: "How does pricing work?",
    a: "Every project is scoped and quoted individually. After an intro call we send a fixed quote with clear deliverables, a timeline, and milestones — no hourly billing, no surprise overruns. If scope changes mid-project, we re-quote the change before any work starts.",
  },
  {
    q: "How long does a typical project take?",
    a: "Most MVPs ship in 6–12 weeks depending on scope; smaller feature engagements can land in 2–4. Your quote includes a concrete timeline, and our process section above shows exactly how those weeks are spent.",
  },
  {
    q: "Who will actually build my product?",
    a: "The senior team on this page — engineering and design leads with 20+ years of combined experience. We don't subcontract your project out; the people you meet on the intro call are the people in the codebase.",
  },
  {
    q: "Can you work with an existing codebase or team?",
    a: "Yes. Alongside greenfield builds we do architecture audits, feature development, API integrations, and infrastructure work inside existing stacks — both of our featured case studies started exactly that way.",
  },
  {
    q: "What happens after launch?",
    a: "Launch is a milestone, not the end. We offer ongoing support engagements covering maintenance, performance tuning, monitoring, and feedback-driven iteration — scoped and quoted just like the build.",
  },
  {
    q: "What do you need from me to get a quote?",
    a: "Your goals, who the product is for, and the features it can't live without. A napkin sketch is enough to start — the discovery phase exists to turn whatever you have into a concrete spec.",
  },
];

export function Talk() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const faqRows = gsap.utils.toArray<HTMLElement>(".talk-faq", section);
      const cta = section.querySelector("[data-talk-cta]");
      const cols = gsap.utils.toArray<HTMLElement>("[data-talk-col]", section);

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop:
            "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile:
            "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const desk = !!(ctx.conditions as { desktop: boolean }).desktop;

          faqRows.forEach((row) => {
            gsap.from(row, {
              y: 40,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top 94%",
                end: "top 70%",
                scrub: true,
              },
            });
          });

          if (cta) {
            gsap.from(cta, {
              y: desk ? 80 : 40,
              scale: desk ? 0.94 : 1,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: cta,
                start: "top 90%",
                end: "top 50%",
                scrub: true,
              },
            });
          }

          cols.forEach((col, i) => {
            gsap.from(col, {
              x: desk ? (i % 2 ? 70 : -70) : 0,
              y: desk ? 0 : 40,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: col,
                start: "top 92%",
                end: "top 62%",
                scrub: true,
              },
            });
          });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative isolate overflow-x-clip">
      {/* FAQ beat — answers the hesitations that stop the booking */}
      <div id="faq" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SceneHeading
          eyebrow="FAQ"
          title="Questions, answered before the"
          highlight="call."
          subtitle="The things future clients usually ask us first."
        />
        <FAQList />
      </div>

      {/* set piece #4: the page's single loudest CTA. Everything funnels here. */}
      <div className="relative overflow-hidden">
        {/* h-auto on mobile: the component's fixed h-96 clips the stacked
            content (overflow-hidden) — only desktop gets the fixed stage */}
        <BackgroundBeamsWithCollision className="h-auto min-h-96 md:h-[36rem]">
          <div
            data-talk-cta
            className="relative z-20 mx-auto max-w-3xl px-6 py-20 text-center"
          >
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-accent-deep">
              Start a project
            </p>
            <h2 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-4xl font-medium tracking-tight text-foreground md:text-6xl">
              Let&apos;s build something that
              <span className="text-accent-bright"> outlasts the hype.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted">
              Every project is scoped and quoted individually — tell us what
              you&apos;re building and we&apos;ll come back with a clear plan
              and a number.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <MovingBorderButton
                as="a"
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                borderRadius="2rem"
                duration={4000}
                containerClassName="h-14 w-auto"
                borderClassName="bg-[radial-gradient(#22d3ee_40%,transparent_60%)]"
                className="border-white/10 bg-[#070b0e]/90 px-8 text-sm font-medium text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  Book an intro call
                  <ArrowRight className="h-4 w-4" />
                </span>
              </MovingBorderButton>
              <a
                href="#contact"
                className="inline-flex items-center px-4 py-3 text-sm text-muted transition-colors hover:text-foreground"
              >
                or send us a message
              </a>
            </div>
          </div>
        </BackgroundBeamsWithCollision>
      </div>

      {/* contact beat — the form lands the plane */}
      <div id="contact" className="relative">
        {/* lift the muted text just for this beat (cascades to every
            text-muted inside: eyebrow, subtitle, labels, placeholders, copy) */}
        <div
          className="mx-auto max-w-7xl px-6 py-24 md:py-32"
          style={
            { "--color-muted": "var(--foreground)" } as React.CSSProperties
          }
        >
          <SceneHeading
            eyebrow="Contact"
            title="Let’s build"
            highlight="something great."
            subtitle="Ready to start? Fill out the form or book a call to discuss your project."
          />
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div data-talk-col>
              <ContactForm />
            </div>
            <div
              data-talk-col
              className="flex flex-col md:border-l md:border-border md:pl-16"
            >
              <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-normal text-foreground">
                Prefer a live chat?
              </h3>
              <p className="mt-4 max-w-sm leading-relaxed text-muted">
                Book a free 30-minute consultation call to discuss your needs.
              </p>
              <a
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-2 self-start border-b border-foreground/30 pb-1 text-sm uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground"
              >
                Book a call{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-14 max-w-3xl">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="talk-faq border-t border-border last:border-b"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-accent-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-[family-name:var(--font-space-grotesk)] text-base font-medium text-foreground md:text-lg">
                  {f.q}
                </span>
              </span>
              <Plus
                className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-hover:text-foreground ${
                  isOpen ? "rotate-45 text-accent-bright" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 pl-9 text-sm leading-relaxed text-muted md:text-base">
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; error?: string }>(
    null,
  );
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  function isValidEmail(value: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  }
  const emailIsValid = isValidEmail(email);
  const emailShowError = emailTouched && !emailIsValid;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      setStatus({ ok: true });
      setName("");
      setEmail("");
      setMessage("");
      // Clear validation and reset captcha after successful send
      setEmailTouched(false);
      setTurnstileToken("");
      setTurnstileKey((key) => key + 1);
    } catch (err) {
      setStatus({ ok: false, error: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border-b border-border bg-transparent py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Name
        </span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
          autoComplete="name"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Email
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          aria-invalid={emailShowError}
          aria-describedby={emailShowError ? "email-error" : undefined}
          className={inputClass}
          placeholder="you@company.com"
          inputMode="email"
          autoComplete="email"
        />
        {emailShowError && (
          <p id="email-error" role="alert" className="text-xs text-red-400">
            Please enter a valid email address.
          </p>
        )}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Message
        </span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} min-h-[96px] resize-y`}
          placeholder="How can we help you?"
        />
      </label>
      <div className="flex justify-start">
        <Turnstile
          key={turnstileKey}
          siteKey={turnstileSiteKey}
          onVerify={setTurnstileToken}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !turnstileToken || !emailIsValid}
        className="group inline-flex items-center gap-2 self-start border-b border-foreground/40 pb-1 text-sm uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:border-foreground/40 disabled:opacity-40"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : !turnstileToken ? (
          "Verify CAPTCHA"
        ) : (
          <>
            Send Message{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
      <div aria-live="polite">
        {status?.ok && (
          <p className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Thanks! Your message has been
            sent.
          </p>
        )}
        {status && !status.ok && (
          <p role="alert" className="text-sm text-red-400">
            {status.error || "Something went wrong."}
          </p>
        )}
      </div>
    </form>
  );
}
