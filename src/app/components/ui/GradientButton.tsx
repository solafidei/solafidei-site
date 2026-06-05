"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";
type Size = "md" | "lg";

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

function classes(variant: Variant, size: Size, extra = "") {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-start)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";
  const variants: Record<Variant, string> = {
    primary:
      "text-[#05070a] bg-[linear-gradient(110deg,var(--brand-start),var(--brand-end))] shadow-[0_8px_30px_-8px_var(--accent-glow)] hover:shadow-[0_12px_40px_-8px_var(--accent-glow)] hover:brightness-110",
    ghost:
      "glass text-foreground hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]",
  };
  return [base, sizes[size], variants[variant], extra].join(" ");
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  as?: "a";
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  as: "button";
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function GradientButton(props: AnchorProps | ButtonProps) {
  const { variant = "primary", size = "lg", className = "", children, as, ...rest } = props;
  const cls = classes(variant, size, className);

  if (as === "button") {
    return (
      <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }

  return (
    <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  );
}
