"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./ui/SectionHeading";
import { GlassCard } from "./ui/GlassCard";
import { GradientButton } from "./ui/GradientButton";

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

  const toggle = (value: boolean, label: string) => (
    <button
      onClick={() => setAnnual(value)}
      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors ${
        annual === value
          ? "bg-[linear-gradient(110deg,var(--brand-start),var(--brand-end))] text-[#05070a]"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <SectionHeading eyebrow="Pricing" title="Plans that" highlight="scale with you" />

      <div className="mt-8 flex justify-center">
        <div className="glass inline-flex items-center gap-1 rounded-full p-1">
          {toggle(false, "Monthly")}
          {toggle(true, "Annually")}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <GlassCard
            key={p.name}
            reveal={false}
            className={`flex flex-col p-6 ${
              p.popular ? "border-[var(--brand-end)]/50 ring-1 ring-[var(--brand-end)]/40" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-medium">{p.name}</h3>
              {p.popular && (
                <span className="rounded-full border border-[var(--brand-end)]/40 bg-[var(--brand-end)]/15 px-2 py-0.5 text-xs text-[var(--brand-end)]">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">{p.desc}</p>
            <div className="mt-4">
              {"custom" in p && p.custom ? (
                <div className="font-heading text-3xl font-semibold">Custom</div>
              ) : (
                <motion.div
                  key={annual ? "annual" : "monthly"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="font-heading text-3xl font-semibold tabular-nums"
                >
                  ${annual ? Math.round(p.monthly * 12 * 0.9) : p.monthly}
                  <span className="text-sm font-normal text-muted">
                    /{annual ? "year" : "month"}
                  </span>
                </motion.div>
              )}
            </div>
            <GradientButton
              as="button"
              variant={p.popular ? "primary" : "ghost"}
              className="mt-5 w-full"
            >
              {"custom" in p && p.custom ? "Schedule a call" : "Choose this plan"}
            </GradientButton>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-muted">
                  <Check className="h-4 w-4 shrink-0 text-[var(--brand-start)]" /> {f}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
