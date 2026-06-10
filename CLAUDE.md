# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server with Turbopack at http://localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)

There is no test suite. Verification is done with throwaway Playwright scripts in `scripts/` (e.g. `node scripts/verify-process-pin.mjs`), which require the dev server to be running. The `chrome-devtools` MCP server is configured for in-browser inspection.

## What this is

Single-page marketing site for Solafidei (Next.js 15 App Router, React 19, Tailwind 4, TypeScript). The design direction, component picks, and build status are documented in **`docs/intent/futuristic-redesign.md`** — that file is the source of truth for design decisions ("engineered, not decorated"; decisions there are owner-confirmed and locked). Read it before changing layout, effects, or visual style.

## Architecture

**Two component trees with different rules:**

- `src/app/components/` — hand-written site sections (Hero, Services, Process, …) plus shared infrastructure (`animations.ts`, `splash-state.ts`). Normal lint rules apply.
- `src/components/` and `src/components/ui/` — vendored library components (reactbits and Aceternity, pulled via shadcn registries). These are intentionally kept close to upstream and have lint exemptions in `eslint.config.mjs` (no-explicit-any, unused-vars, exhaustive-deps disabled). Recolor/retoken them to the design system, but don't restructure them to be lint-clean.

**Page composition:** `src/app/page.tsx` renders all sections in a fixed narrative order (arrive → what we build → proof → how we work → talk to us). Section order is a design decision, not arbitrary.

**Design system:** all tokens live in `src/app/globals.css` — near-black base (`--bg-base` #050709), a single cyan accent family (`--accent-bright` #22d3ee / `--accent-deep` #0e7d86), everything else grayscale. Fonts are loaded via `next/font` in `layout.tsx`: Space Grotesk (headings), Inter (body), JetBrains Mono (eyebrows/numbers). Do not introduce new accent colors or fonts.

**Motion rules** (from the intent doc): scroll animations are the backbone — transform/opacity only, fire once, honor `prefers-reduced-motion`. Shared framer-motion variants are in `src/app/components/animations.ts` (one easing curve, matching the CSS `--ease`). WebGL is confined to the hero background; cursor effects are hero-only and desktop-only.

**Mobile-first constraint:** desktop spectacle is an enhancement, never the baseline. `SmoothScroll` (Lenis) runs desktop + motion-ok only; heavy effects need static/cheap mobile fallbacks. This is the project's hardest constraint — check mobile behavior when touching any effect.

**Splash screen sequencing:** `splash-state.ts` coordinates a once-per-session branded splash with the hero entrance — the hero waits for the `solafidei:splash-done` event instead of animating behind the splash. `?splash=on|off` query param forces either mode (useful when testing, and verification scripts must wait out the splash).

**Server side:** two API routes, both emailing via Resend:
- `src/app/api/contact/route.ts` — contact form, gated by Cloudflare Turnstile.
- `src/app/api/awareness/events/route.ts` — phishing-awareness campaign tracking (paired with the `/letter` page). Links are HMAC-signed (`sig` = hex hmac_sha256 of `JSON.stringify([rid, campaign, to, from])` with `AWARENESS_EVENT_SECRET`); requests are IP rate-limited in memory. Notification emails deliberately omit IP/user-agent/screen data — keep it that way.

Required env vars are listed in README.md (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `AWARENESS_EVENT_SECRET`, `AWARENESS_EMAIL_TO`).

## Conventions

- shadcn is configured in `components.json` (style `radix-nova`, tabler icons); path aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`.
- No light mode and no price-card pricing — both are explicitly out of scope per the intent doc.
