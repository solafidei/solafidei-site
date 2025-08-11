"use client";

import { Check, Plus, Search } from "lucide-react";
import React, { useMemo } from "react";

export function ExperienceWidgets() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AssistantWidget />
        <LeadsWidget />
      </div>
    </section>
  );
}

function AssistantWidget() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
      <h4 className="font-medium">Solafidei Assistant</h4>
      <p className="mt-1 text-sm text-black/60 dark:text-white/70">Coming soon — a lightweight copilot to help summarize, draft, and organize.</p>
      <div className="mt-3 flex items-center gap-2 opacity-60">
        <div className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black/70 flex items-center gap-2 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
          <Search className="h-4 w-4 text-black/40 dark:text-white/50" />
          <span>Coming soon…</span>
        </div>
        <button className="rounded-xl border border-black/10 bg-black text-white px-3 py-2 text-sm" disabled>Send</button>
      </div>
    </div>
  );
}

function LeadsWidget() {
  const people = useMemo(
    () => [
      { name: "Solomon Razaq", role: "Founder", skills: "TypeScript, JavaScript, C#, SQL, GCP" },
      { name: "Innocent Munyadziwa", role: "Tech Lead", skills: "TypeScript, JavaScript, C#, SQL, Java, AWS, Azure, Terraform" },
      { name: "Muema Kamba", role: "Tech Lead", skills: "TypeScript, JavaScript, Java, Python, Go, Rust, AWS" },
    ],
    []
  );
  return (
    <div className="rounded-2xl border border-black/10 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Leads</h4>
      </div>
      <div className="mt-3 space-y-2">
        {people.map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-black/30">
            <div>
              <div className="text-sm">{p.name}</div>
              <div className="text-xs text-black/50 dark:text-white/50">{p.role} · {p.skills}</div>
            </div>
            <span className="text-xs rounded-full border border-emerald-300/50 bg-emerald-50 px-2 py-0.5 text-emerald-700">Verified</span>
          </div>
        ))}
      </div>
    </div>
  );
}


