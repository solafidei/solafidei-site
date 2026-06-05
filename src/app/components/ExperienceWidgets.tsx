"use client";

import { Search, BadgeCheck } from "lucide-react";
import React, { useMemo } from "react";
import { GlassCard } from "./ui/GlassCard";

export function ExperienceWidgets() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AssistantWidget />
        <LeadsWidget />
      </div>
    </section>
  );
}

function AssistantWidget() {
  return (
    <GlassCard interactive={false} reveal={false}>
      <h4 className="font-heading font-medium">Solafidei Assistant</h4>
      <p className="mt-1 text-sm text-muted">
        Coming soon — a lightweight copilot to help summarize, draft, and organize.
      </p>
      <div className="mt-4 flex items-center gap-2 opacity-70">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-[var(--bg-deep)]/60 px-3 py-2 text-sm text-muted">
          <Search className="h-4 w-4" />
          <span>Coming soon…</span>
        </div>
        <button
          className="cursor-not-allowed rounded-xl border border-border bg-[var(--surface)] px-3 py-2 text-sm text-muted"
          disabled
        >
          Send
        </button>
      </div>
    </GlassCard>
  );
}

function LeadsWidget() {
  const people = useMemo(
    () => [
      { name: "Solomon Razaq", role: "Founder", skills: "TypeScript, JavaScript, C#, SQL, GCP" },
      { name: "Innocent Munyadziwa", role: "Tech Lead", skills: "TypeScript, JavaScript, C#, SQL, Java, AWS, Azure, Terraform" },
      { name: "Muema Kamba", role: "Tech Lead", skills: "TypeScript, JavaScript, Java, Python, Go, Rust, AWS" },
      { name: "Daniel Jorge", role: "Mobile Developer", skills: "Flutter, React Native, Node.js, AWS, Firebase, Code Magic" },
      { name: "Den Radkevich", role: "Developer", skills: "TypeScript, JavaScript, React, React Native, NodeJS, SQL" },
      { name: "Nathan Boyega", role: "Product Strategy & Design", skills: "Product Strategy, Product Design, Design Systems" },
    ],
    []
  );
  return (
    <GlassCard interactive={false} reveal={false}>
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-medium">Leads</h4>
      </div>
      <div className="mt-3 space-y-2">
        {people.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[var(--bg-deep)]/50 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm">{p.name}</div>
              <div className="truncate text-xs text-muted">
                {p.role} · {p.skills}
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--brand-start)]/30 bg-[var(--brand-start)]/10 px-2 py-0.5 text-xs text-[var(--brand-start)]">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
