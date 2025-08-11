"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Nav() {
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-black/10 dark:supports-[backdrop-filter]:bg-black/40 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo_opaque_smaller.png" alt="Solafidei logo" height={28} width={28} className="h-7 w-auto rounded" priority />
          <span className="font-semibold tracking-wide">SOLAFIDEI</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-black/70 dark:text-white/70">
          <a className="hover:text-black dark:hover:text-white" href="#home">Home</a>
          <a className="hover:text-black dark:hover:text-white" href="#about">About</a>
          <a className="hover:text-black dark:hover:text-white" href="#services">Services</a>
          <a className="hover:text-black dark:hover:text-white" href="#benefits">Benefits</a>
          <a className="hover:text-black dark:hover:text-white" href="#contact">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <a
            href="https://cal.com/your-handle"
            target="_blank"
            className="group inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black text-white px-3 py-2 text-sm hover:bg-black/90"
          >
            Book a call <ArrowRight className="h-4 w-4 transition -translate-x-0.5 group-hover:translate-x-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

/*
function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="rounded-xl border border-black/10 bg-white px-2.5 py-2 text-sm text-black/70"
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }
  const current = resolvedTheme || theme;
  const next = current === "dark" ? "light" : "dark";
  return (
    <button
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-2.5 py-2 text-sm text-black/70 hover:bg-white/80"
    >
      {current === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
*/


