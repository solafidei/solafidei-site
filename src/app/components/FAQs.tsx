"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "./ui/SectionHeading";

// Sits right before the final CTA: answers the hesitations that stop a
// visitor from booking the intro call.
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

export function FAQs() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative isolate overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered before the"
          highlight="call."
          subtitle="The things future clients usually ask us first."
        />
        <div className="mx-auto mt-14 max-w-3xl">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-t border-border last:border-b">
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
      </div>
    </section>
  );
}
