"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll } from "framer-motion";

const links = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#benefits", label: "Benefits" },
  { href: "#contact", label: "Contact" },
];

const CALENDAR_URL = "https://calendar.app.google/cNPgb76hCUcz6vsr8";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  // transparent at the top, solid blurred bar once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[60] border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-[var(--bg-base)]/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* subtle scrim so the nav stays legible over the hero imagery at the
          top; fades out as the solid bar fades in on scroll */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--bg-base)]/85 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#home" className="flex items-center gap-2.5">
          <Image
            src="/logo_opaque_smaller.png"
            alt="Solafidei logo"
            height={24}
            width={24}
            className="h-6 w-auto rounded"
            priority
          />
          <span className="text-sm font-medium uppercase tracking-[0.22em] text-foreground">
            Solafidei
          </span>
        </a>

        <nav className="hidden items-center gap-9 text-xs uppercase tracking-[0.18em] text-muted md:flex">
          {links.map((l) => (
            <a key={l.href} className="transition-colors hover:text-foreground" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href={CALENDAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden border-b border-foreground/30 pb-0.5 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground md:inline-block"
        >
          Book a call
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 1px scroll-progress beam along the bottom edge of the bar */}
      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left bg-accent-bright/60"
      />

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden border-t border-border bg-[var(--bg-base)]/95 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-6 py-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-[0.18em] text-foreground"
              >
                Book a call
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
