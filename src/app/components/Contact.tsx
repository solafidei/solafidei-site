"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; error?: string }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      setStatus({ ok: true });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus({ ok: false, error: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">Contact Us</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-black/60 dark:text-white/70">
        Ready to start? Fill out the form or book a call to discuss your project.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={onSubmit} className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col gap-4 dark:border-white/10 dark:bg-white/5">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/40 dark:border-white/10 dark:bg-white/10 dark:placeholder:text-white/40"
            placeholder="Your name"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/40 dark:border-white/10 dark:bg-white/10 dark:placeholder:text-white/40"
            placeholder="Your email"
          />
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/40 min-h-[90px] dark:border-white/10 dark:bg-white/10 dark:placeholder:text-white/40"
            placeholder="How can we help you?"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
          {status?.ok && (
            <p className="text-sm text-green-600 dark:text-green-400">Thanks! Your message has been sent.</p>
          )}
          {status && !status.ok && (
            <p className="text-sm text-red-600 dark:text-red-400">{status.error || "Something went wrong."}</p>
          )}
        </form>
        <div className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col items-center justify-center text-center dark:border-white/10 dark:bg-white/5">
          <div className="text-lg font-medium mb-2">Prefer a live chat?</div>
          <p className="text-black/60 dark:text-white/70 mb-4">Book a free 30-minute consultation call to discuss your needs.</p>
          <a href="https://calendly.com/solafidei-info/coffee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:bg-black/90">
            Book a call <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}


