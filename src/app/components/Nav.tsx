"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ArrowRight, Moon, Sun } from "lucide-react";

export function Nav() {
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo_opaque_smaller.png" alt="Solafidei logo" height={28} width={28} className="h-7 w-auto rounded" priority />
          <span className="font-semibold tracking-wide">SOLAFIDEI</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-white/70">
          <a className="hover:text-white" href="#home">Home</a>
          <a className="hover:text-white" href="#about">About</a>
          <a className="hover:text-white" href="#services">Services</a>
          <a className="hover:text-white" href="#benefits">Benefits</a>
          <a className="hover:text-white" href="#contact">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://calendar.app.google/cNPgb76hCUcz6vsr8"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black text-white px-3 py-2 text-sm hover:bg-black/90"
          >
            Book a call <ArrowRight className="h-4 w-4 transition -translate-x-0.5 group-hover:translate-x-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render the theme-dependent icon after mount to avoid a hydration
  // mismatch (the resolved theme is unknown during SSR).
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${next} theme` : "Toggle theme"}
      onClick={() => setTheme(next)}
      className="inline-flex items-center justify-center rounded-xl border border-foreground/15 bg-foreground/5 px-2.5 py-2 text-sm text-foreground/80 transition hover:bg-foreground/10"
    >
      {mounted && !isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
}
