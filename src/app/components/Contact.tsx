"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Turnstile } from "./Turnstile";
import { SectionHeading } from "./ui/SectionHeading";
import { sectionReveal } from "./animations";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; error?: string }>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  function isValidEmail(value: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
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
    <section id="contact" className="relative isolate overflow-hidden">
      {/* subtle particle backdrop — heavily darkened + masked to transparent
          at top/bottom so it's just a faint glow and the edges blend */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(10,8,16,0.9), rgba(10,8,16,0.9)), url(/contact.jpg)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          eyebrow="Contact"
          title="Let’s build"
          highlight="something great"
          subtitle="Ready to start? Fill out the form or book a call to discuss your project."
        />
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-7">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted">Name</span>
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
            <span className="text-xs uppercase tracking-[0.18em] text-muted">Email</span>
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
            <span className="text-xs uppercase tracking-[0.18em] text-muted">Message</span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClass} min-h-[96px] resize-y`}
              placeholder="How can we help you?"
            />
          </label>
          <div className="flex justify-start">
            <Turnstile key={turnstileKey} siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />
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
                <CheckCircle2 className="h-4 w-4" /> Thanks! Your message has been sent.
              </p>
            )}
            {status && !status.ok && (
              <p role="alert" className="text-sm text-red-400">
                {status.error || "Something went wrong."}
              </p>
            )}
          </div>
        </form>

        <div className="flex flex-col md:border-l md:border-border md:pl-16">
          <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-normal text-foreground">
            Prefer a live chat?
          </h3>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">
            Book a free 30-minute consultation call to discuss your needs.
          </p>
          <a
            href="https://calendar.app.google/cNPgb76hCUcz6vsr8"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-7 inline-flex items-center gap-2 self-start border-b border-foreground/30 pb-1 text-sm uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground"
          >
            Book a call{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
      </div>
    </section>
  );
}

