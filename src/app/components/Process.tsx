"use client";

import { Check } from "lucide-react";

export function Process() {
  // Step 1 checklist for app design/discovery
  const step1Checklist = [
    "Clarify business goals and success metrics.",
    "Identify target users and use cases.",
    "Define core features and MVP scope.",
    "Establish project timelines and priorities.",
  ];
  // Step 2 checklist for app design/architecture
  const step2Checklist = [
    "Wireframes: low‑fidelity flows for app navigation and interactions.",
    "UI Design System: components, typography, and palette for a consistent look and feel.",
    "High‑Fidelity Mockups: pixel‑perfect app screens for review and handoff.",
    "Architecture Diagram: app modules, backend services, and integrations.",
    "Technical Spec: chosen stack, API contracts, and third‑party integrations.",
  ];
  // Step 3 checklist for build & integrate
  const step3Checklist = [
    "Front‑end and back‑end development.",
    "Feature implementation and integration.",
    "API connections and data handling.",
    "Quality assurance and testing.",
  ];
  // Step 4 checklist for launch & optimize
  const step4Checklist = [
    "Deployment to production environments.",
    "Performance monitoring.",
    "User feedback collection.",
    "Continuous improvements and updates.",
  ];
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-3xl font-semibold">
        Our simple, smart, and scalable process for app design and development
      </h2>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5 flex flex-col">
          <div className="text-xs text-black/50">Step 1</div>
          <h3 className="mt-1 font-medium">Discover &amp; Define</h3>
          <p className="mt-2 text-sm text-black/60 dark:text-white/70">
            We work with you to understand your goals, target users, and the features your app needs to succeed.
          </p>
          <div className="mt-3 space-y-2 flex-1">
            {step1Checklist.map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500" />{" "}
                <span className="text-black/70 dark:text-white/70">{c}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Step 2 */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5 flex flex-col">
          <div className="text-xs text-black/50">Step 2</div>
          <h3 className="mt-1 font-medium">Design &amp; Architecture</h3>
          <p className="mt-2 text-sm text-black/60 dark:text-white/70">
            We craft intuitive UI/UX and plan robust technical architecture for your app.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-black/70 dark:text-white/70 list-disc list-inside flex-1">
            {step2Checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {/* Step 3 */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5 flex flex-col">
          <div className="text-xs text-black/50">Step 3</div>
          <h3 className="mt-1 font-medium">Build &amp; Integrate</h3>
          <p className="mt-2 text-sm text-black/60 dark:text-white/70">
            Develop front‑end and back‑end, implement features, connect APIs, and perform QA.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-black/70 dark:text-white/70 list-disc list-inside flex-1">
            {step3Checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {/* Step 4 */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5 flex flex-col">
          <div className="text-xs text-black/50">Step 4</div>
          <h3 className="mt-1 font-medium">Launch &amp; Optimize</h3>
          <p className="mt-2 text-sm text-black/60 dark:text-white/70">
            Deploy the app, monitor performance, gather feedback, and iterate.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-black/70 dark:text-white/70 list-disc list-inside flex-1">
            {step4Checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
