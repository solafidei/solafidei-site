"use client";

import { ArrowRight } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">Contact Us</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-black/60">
        Ready to start? Fill out the form or book a call to discuss your project.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <form className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col gap-4">
          <input type="text" required className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/40" placeholder="Your name" />
          <input type="email" required className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/40" placeholder="Your email" />
          <textarea required className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-black/40 min-h-[90px]" placeholder="How can we help you?" />
          <button type="submit" className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-black/90">Send Message</button>
        </form>
        <div className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col items-center justify-center text-center">
          <div className="text-lg font-medium mb-2">Prefer a live chat?</div>
          <p className="text-black/60 mb-4">Book a free 30-minute consultation call to discuss your needs.</p>
          <a href="https://calendly.com/solafidei-info/coffee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:bg-black/90">
            Book a call <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}


