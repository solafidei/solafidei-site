"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "./ui/SectionHeading";

export function FAQs() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "How can automation help my business?", a: "It reduces manual work, increases speed, and improves reliability across processes." },
    { q: "Is integration difficult?", a: "We design to fit your current stack, minimizing change management." },
    { q: "Do you support non‑technical teams?", a: "Yes. We prioritize clear handovers, docs, and simple operations." },
    { q: "What industries do you serve?", a: "B2B SaaS, services, fintech, logistics, and more." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <SectionHeading eyebrow="FAQ" title="We’ve got the" highlight="answers" />
      <div className="glass mx-auto mt-10 max-w-3xl divide-y divide-[var(--border)] rounded-2xl">
        {faqs.map((f, i) => (
          <div key={i} className="px-5 py-4">
            <button
              onClick={() => setOpen((v) => (v === i ? null : i))}
              aria-expanded={open === i ? "true" : "false"}
              className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
            >
              <span className="font-heading font-medium">{f.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted transition ${open === i ? "rotate-180 text-[var(--brand-start)]" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-2 overflow-hidden text-sm text-muted"
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
