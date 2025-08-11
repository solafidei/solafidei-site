"use client";

import { Check } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

type Plan = {
  name: string;
  desc: string;
  features: string[];
  popular?: boolean;
} & (| { custom: true } | { custom?: false; monthly: number });

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans: Plan[] = [
    {
      name: "Starter",
      monthly: 37,
      desc: "Perfect for small teams starting with automation.",
      features: [
        "Basic workflow automation",
        "AI-powered personal assistant",
        "Standard analytics & reporting",
        "Email & chat support",
        "Up to 3 integrations",
      ],
    },
    {
      name: "Professional",
      monthly: 75,
      popular: true,
      desc: "Advanced automation and insights for growing teams.",
      features: [
        "Advanced workflow automation",
        "Sales & marketing tools",
        "Enhanced analytics & insights",
        "Priority support",
        "Up to 10 integrations",
      ],
    },
    {
      name: "Enterprise",
      custom: true,
      desc: "Fully customized with dedicated consulting.",
      features: [
        "Fully customizable automation",
        "Dedicated consultant",
        "Enterprise compliance",
        "24/7 VIP support",
        "Unlimited integrations",
      ],
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setAnnual(false)}
          className={`rounded-full px-3 py-1 text-sm ${
            !annual
              ? "bg-black text-white"
              : "bg-white border border-black/10 text-black/70 dark:bg-transparent dark:border-white/10 dark:text-white/70"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setAnnual(true)}
          className={`rounded-full px-3 py-1 text-sm ${
            annual
              ? "bg-black text-white"
              : "bg-white border border-black/10 text-black/70 dark:bg-transparent dark:border-white/10 dark:text-white/70"
          }`}
        >
          Annually
        </button>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-2xl border border-black/10 bg-white/70 p-6 ${p.popular ? "ring-2 ring-violet-300" : ""} dark:border-white/10 dark:bg-white/5`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{p.name}</h3>
              {p.popular && <span className="text-xs rounded-full border border-violet-300/60 bg-violet-50 px-2 py-0.5 text-violet-700">Popular</span>}
            </div>
            <p className="mt-1 text-sm text-black/60 dark:text-white/70">{p.desc}</p>
            <div className="mt-4">
              {"custom" in p && p.custom ? (
                <div className="text-2xl font-semibold">Custom</div>
              ) : (
                <motion.div
                  key={annual ? "annual" : "monthly"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-semibold"
                >
                  ${annual ? Math.round(p.monthly * 12 * 0.9) : p.monthly}
                  <span className="text-sm font-normal text-black/60">/{annual ? "year" : "month"}</span>
                </motion.div>
              )}
            </div>
            <button className="mt-4 w-full rounded-xl bg-black text-white py-2 text-sm hover:bg-black/90">
              {"custom" in p && p.custom ? "Schedule a call" : "Choose this plan"}
            </button>
            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-black/70 dark:text-white/70">
                  <Check className="h-4 w-4 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}


