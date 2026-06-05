"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Token-based snippet so we can colour while typing character-by-character.
type Tok = { t: string; c?: string };

const C = {
  kw: "text-[var(--brand-end)]", // keywords
  fn: "text-[var(--brand-start)]", // functions / identifiers
  str: "text-emerald-300", // strings
  key: "text-sky-300", // object keys
  com: "text-muted", // comments
  punct: "text-foreground/60",
};

const LINES: Tok[][] = [
  [{ t: "const" , c: C.kw }, { t: " product " }, { t: "=", c: C.punct }, { t: " await " , c: C.kw }, { t: "solafidei", c: C.fn }, { t: ".", c: C.punct }, { t: "build", c: C.fn }, { t: "({", c: C.punct }],
  [{ t: "  design", c: C.key }, { t: ": ", c: C.punct }, { t: '"ui / ux"', c: C.str }, { t: ",", c: C.punct }],
  [{ t: "  stack", c: C.key }, { t: ": ", c: C.punct }, { t: "[", c: C.punct }, { t: '"next.js"', c: C.str }, { t: ", ", c: C.punct }, { t: '"react-native"', c: C.str }, { t: "]", c: C.punct }, { t: ",", c: C.punct }],
  [{ t: "  scale", c: C.key }, { t: ": ", c: C.punct }, { t: "true", c: C.kw }, { t: ",", c: C.punct }],
  [{ t: "});", c: C.punct }],
  [{ t: "" }],
  [{ t: "// ✓ shipped to production", c: C.com }],
];

const FULL = LINES.map((l) => l.map((s) => s.t).join("")).join("\n");
const TOTAL = FULL.length;

export function CodeTerminal({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? TOTAL : 0);

  useEffect(() => {
    if (reduce) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      if (n > TOTAL) {
        // brief pause, then restart the typing loop
        n = 0;
        setCount(0);
      } else {
        setCount(n);
      }
    }, 45);
    return () => clearInterval(id);
  }, [reduce]);

  // render tokens up to `count` characters
  let remaining = count;
  const typedDone = count >= TOTAL;

  return (
    <div className={`glass overflow-hidden rounded-2xl ${className}`}>
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-xs text-muted">solafidei.ts</span>
      </div>

      <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-relaxed">
        <code>
          {LINES.map((line, li) => {
            const prefixNewline = li > 0 ? 1 : 0; // account for "\n" between lines in the char count
            if (prefixNewline) remaining -= 1;
            return (
              <div key={li} className="min-h-[1.4em] whitespace-pre">
                <span className="mr-4 select-none text-muted/50">
                  {String(li + 1).padStart(2, "0")}
                </span>
                {line.map((seg, si) => {
                  if (remaining <= 0) return null;
                  const shown = seg.t.slice(0, remaining);
                  remaining -= seg.t.length;
                  if (!shown) return null;
                  return (
                    <span key={si} className={seg.c}>
                      {shown}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </code>
        {!typedDone && !reduce && (
          <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-[var(--brand-start)]" />
        )}
      </pre>
    </div>
  );
}
