"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function FAQs() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "How can automation help my business?", a: "It reduces manual work, increases speed, and improves reliability across processes." },
    { q: "Is integration difficult?", a: "We design to fit your current stack, minimizing change management." },
    { q: "Do you support non‑technical teams?", a: "Yes. We prioritize clear handovers, docs, and simple operations." },
    { q: "What industries do you serve?", a: "B2B SaaS, services, fintech, logistics, and more." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">We’ve got the answers</h2>
      <div className="mx-auto mt-6 max-w-3xl divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/50 dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
        {faqs.map((f, i) => (
          <div key={i} className="px-4 py-3">
            <button onClick={() => setOpen((v) => (v === i ? null : i))} className="w-full text-left">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.q}</span>
                <ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-1 text-sm text-black/60 dark:text-white/70"
                >
                  {f.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}


