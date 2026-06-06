"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientButton } from "./ui/GradientButton";
import { GradientShimmerText } from "./GradientShimmerText";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#benefits", label: "Benefits" },
  { href: "#contact", label: "Contact" },
];

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-[rgba(5,5,7,0.6)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="#home" className="flex items-center gap-2">
          <Image
            src="/logo_opaque_smaller.png"
            alt="Solafidei logo"
            height={28}
            width={28}
            className="h-7 w-auto rounded"
            priority
          />
          <span className="font-heading font-semibold tracking-wide">
            <GradientShimmerText>SOLAFIDEI</GradientShimmerText>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          {links.map((l) => (
            <a key={l.href} className="transition-colors hover:text-foreground" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <GradientButton
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="md"
            className="hidden sm:inline-flex"
          >
            Book a call{" "}
            <ArrowRight className="h-4 w-4 -translate-x-0.5 transition group-hover:translate-x-0" />
          </GradientButton>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
            className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground sm:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border sm:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-[var(--surface)] hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <GradientButton
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2"
              >
                Book a call <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
