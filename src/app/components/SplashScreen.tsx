"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import StarField from "./StarField";
import RotatingRingScene from "./RotatingRingScene";

type SplashScreenProps = {
  durationMs?: number;
};

export function SplashScreen({ durationMs = 1000 }: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [fading, setFading] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setFading(true), durationMs);
    const t2 = setTimeout(() => setShow(false), durationMs + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [durationMs]);

  if (!mounted || !show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#0B0F14" }}
      aria-hidden
    >
      <StarField />
      <RotatingRingScene className="pointer-events-none absolute inset-0" gapAngleDeg={36} thickness={8} outerRadius={30} speed={0.7} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Image src="/logo_smaller.png" alt="Solafidei" width={160} height={160} className="h-20 w-auto opacity-90" priority />
      </div>
    </div>
  );
}


