"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function HeartBackdrop() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: `${(i * 19 + 4) % 100}%`,
        top: `${(i * 29 + 7) % 100}%`,
        size: 14 + (i % 6) * 7,
        opacity: 0.05 + (i % 4) * 0.025,
        rotate: (i * 37) % 360,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute text-pink-300"
          style={{
            left: h.left,
            top: h.top,
            fontSize: h.size,
            opacity: h.opacity,
            transform: `rotate(${h.rotate}deg)`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export function AwarenessLetter() {
  const searchParams = useSearchParams();
  const to = searchParams.get("to")?.trim() || "You";
  const from = searchParams.get("from")?.trim() || "Someone";
  const [opened, setOpened] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#fce7ef] text-neutral-900">
      <HeartBackdrop />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button
              key="lure"
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              onClick={() => setOpened(true)}
              className="w-full max-w-[430px] cursor-pointer rounded-[28px] border-0 bg-white px-7 pb-11 pt-9 text-left shadow-[0_24px_70px_-18px_rgba(124,29,58,0.34)] outline-none ring-pink-300/40 transition-shadow hover:shadow-[0_28px_80px_-18px_rgba(124,29,58,0.4)] focus-visible:ring-4 md:px-9 md:pb-12"
            >
              <p className="text-center font-serif text-[1.35rem] font-bold leading-snug text-[#7c1d3a] md:text-[1.6rem]">
                💌 {from} has sent you something special!
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl bg-[#fce7ef]">
                <Image
                  src="/awareness-preview.png"
                  alt={`${from} has sent you something special`}
                  width={1200}
                  height={630}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </motion.button>
          ) : (
            <motion.article
              key="awareness"
              role="article"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[560px] rounded-[28px] bg-white p-8 text-center shadow-[0_20px_60px_rgba(160,40,90,0.18)] md:p-10"
            >
              <div className="mb-3 text-7xl" aria-hidden>
                💌
              </div>
              <h1 className="m-0 text-2xl font-bold text-[#c0265d] md:text-3xl">
                This was a cybersecurity awareness simulation
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[#3f1d2e]">
                You clicked a link that looked friendly and harmless. Real attackers often use
                emotional, urgent, or personal messages to get people to click.
              </p>

              <section className="mt-6 rounded-[18px] bg-[#fff0f6] p-5 text-left text-[#3f1d2e]">
                <strong>Before clicking next time, check:</strong>
                <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                  <li>Does the domain look correct?</li>
                  <li>Were you expecting this message?</li>
                  <li>Is the sender asking you to act quickly?</li>
                  <li>Does the link preview match the actual URL?</li>
                </ul>
              </section>

              <p className="mt-6 text-sm leading-relaxed text-[#3f1d2e]/75">
                Personalized lure parameters on this demo:{" "}
                <span className="font-medium">
                  to={to}, from={from}
                </span>
                . Real attackers use the same tricks with data they scraped or guessed.
              </p>
            </motion.article>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
