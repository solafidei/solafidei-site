"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme?: "auto" | "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => unknown;
      reset?: (id?: unknown) => void;
    };
  }
}

type TurnstileProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  theme?: "auto" | "light" | "dark";
};

export function Turnstile({ siteKey, onVerify, theme = "auto" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<unknown | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "verified" | "error">("idle");
  const timeoutRef = useRef<number | null>(null);
  const verifiedRef = useRef(false);
  const normalizedSiteKey = siteKey.trim();

  useEffect(() => {
    const scriptId = "cf-turnstile-script";
    if (document.getElementById(scriptId)) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleVerify = useCallback(
    (token: string) => {
      if (token) {
        setStatus("verified");
        verifiedRef.current = true;
        onVerify(token);
      } else {
        setStatus("error");
        onVerify("");
      }
    },
    [onVerify]
  );

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !normalizedSiteKey) return;
    const ts = window.turnstile;
    if (!ts || typeof ts.render !== "function") return;
    containerRef.current.innerHTML = "";
    setStatus("loading");
    verifiedRef.current = false;
    widgetRef.current = ts.render(containerRef.current, {
      sitekey: normalizedSiteKey,
      theme,
      callback: handleVerify,
      "expired-callback": () => {
        setStatus("error");
        onVerify("");
      },
      "error-callback": () => {
        setStatus("error");
        onVerify("");
      },
    });
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (!verifiedRef.current) setStatus("error");
    }, 15000);
    return () => {
      try {
        if (ts.reset) ts.reset(widgetRef.current ?? undefined);
      } catch {}
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [scriptLoaded, normalizedSiteKey, theme, handleVerify, onVerify]);

  if (!normalizedSiteKey) {
    return (
      <div className="text-xs text-red-600 dark:text-red-400">
        Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY. Add it to your environment.
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} className="cf-turnstile" />
      {status === "error" && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          Captcha failed to load. Check your site key domain settings and ad/script blockers.
        </div>
      )}
    </div>
  );
}


