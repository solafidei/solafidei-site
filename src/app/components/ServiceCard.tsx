"use client";

import type { ReactNode } from "react";
import { GlassCard } from "./ui/GlassCard";

type ServiceCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

/** Frosted card with a gradient icon badge, title and description. */
export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <GlassCard className="flex flex-col items-start">
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(167,139,250,0.18))] text-[var(--brand-start)]">
        {icon}
      </span>
      <h3 className="font-heading font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </GlassCard>
  );
}
