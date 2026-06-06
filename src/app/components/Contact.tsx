"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Turnstile } from "./Turnstile";
import { SectionHeading } from "./ui/SectionHeading";
import { GradientButton } from "./ui/GradientButton";

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
    "rounded-xl border border-border bg-[var(--bg-deep)]/50 px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-[var(--brand-start)]/60 focus:ring-2 focus:ring-[var(--brand-start)]/30";

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Let’s build"
        highlight="something great"
        subtitle="Ready to start? Fill out the form or book a call to discuss your project."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <form onSubmit={onSubmit} className="glass card-gradient-border flex flex-col gap-4 rounded-2xl p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Name</span>
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
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Email</span>
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
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Message</span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClass} min-h-[110px] resize-y`}
              placeholder="How can we help you?"
            />
          </label>
          <div className="flex justify-center">
            <Turnstile key={turnstileKey} siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />
          </div>
          <GradientButton
            as="button"
            type="submit"
            disabled={submitting || !turnstileToken || !emailIsValid}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : !turnstileToken ? (
              "Verify CAPTCHA"
            ) : (
              <>
                Send Message <ArrowRight className="h-4 w-4" />
              </>
            )}
          </GradientButton>
          <div aria-live="polite">
            {status?.ok && (
              <p className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Thanks! Your message has been sent.
              </p>
            )}
            {status && !status.ok && (
              <p role="alert" className="text-center text-sm text-red-400">
                {status.error || "Something went wrong."}
              </p>
            )}
          </div>
        </form>
        <div className="glass card-gradient-border flex flex-col items-center justify-center rounded-2xl p-6 text-center">
          <div className="font-heading mb-2 text-lg font-medium">Prefer a live chat?</div>
          <p className="mb-5 max-w-sm text-muted">
            Book a free 30-minute consultation call to discuss your needs.
          </p>
          <GradientButton
            href="https://calendar.app.google/cNPgb76hCUcz6vsr8"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a call <ArrowRight className="h-4 w-4" />
          </GradientButton>
        </div>
      </div>
    </section>
  );
}

