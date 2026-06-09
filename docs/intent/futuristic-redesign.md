# Intent: Futuristic Redesign of solafidei.com

Confirmed 2026-06-09.

## Confirmed intent

- **Outcome:** Ground-up redesign into a dark, premium, "engineered" experience site — the site itself is the proof Solafidei can build.
- **User:** Future clients (founders/business owners needing apps, websites, branding) — most arriving on a phone.
- **Why now:** Current site is a stack of standard agency sections with effects sprinkled on; it doesn't cohere into an experience or sell capability. Current code is not a source of truth — structure, layout, and visual system are all up for grabs.
- **Success:** A visitor thinks *"if their site feels like this, imagine what they'd build for me"* and reaches the contact CTA. Buttery on mobile.
- **Constraint:** Mobile-first performance — desktop spectacle is an enhancement, never the baseline.
- **Out of scope:** Offering changes as blockers (services content discussable, not blocking), price-card pricing (quotes only), light mode, full-volume demo-reel maximalism.

## Design direction: "Engineered, not decorated"

Dark premium base (Linear/Vercel register) with deliberate set-piece moments of spectacle.

Effect hierarchy (all three in, strictly ranked):
1. **Scroll animation is the backbone** — the experience lives here; works on mobile. Page becomes a guided narrative: arrive → what we build → how we work → proof → engagement model → talk to us.
2. **Moving background is one set piece** — hero only; everywhere else stays near-black and calm.
3. **Cursor effects are desktop garnish** — scoped to hero; phones never know it existed.

Visual rules:
- One accent (cyan-teal), near-black base (~#050709), everything else grayscale.
- Type: Space Grotesk headings, Inter body, mono (e.g. JetBrains Mono) for eyebrows/numbers. Replacing Montserrat.
- Scroll animations: transform/opacity only, fire once, 150–400ms, 30–50ms stagger, honor `prefers-reduced-motion`.
- Mobile: static/cheap hero fallback, no cursor layer, full scroll storytelling intact.

## Stack (agreed)

- Next.js 15 + Tailwind 4 (kept) + **shadcn/ui** (added — 21st.dev components assume it)
- framer-motion (`useScroll`/`useTransform`) + **Lenis** smooth scroll = scroll backbone
- WebGL confined to hero background (OGL-weight, e.g. reactbits Aurora/Hyperspeed). No site-wide three.js; r3f only if a future set piece demands it.
- "Image unfolds on scroll" set piece = CSS 3D device-mockup reveal (Aceternity Container Scroll / MacBook Scroll style) showing client work — not WebGL, not image-sequence scrubbing.

## Component picks (LOCKED 2026-06-10, owner confirmed)

| Slot | Pick | Source |
|---|---|---|
| Hero background ★ | Light Rays (cyan-teal, lazy-loaded, static gradient fallback mobile/reduced-motion) | reactbits |
| Hero headline | Blur Text (H1) + Decrypted Text (mono eyebrow) | reactbits |
| Services bento | BorderGlow wrapping our own bento layout (mobile: static borders, `animated` sweep on flagship card) | reactbits |
| Process ★ | Sticky Scroll Reveal × Tracing Beam combined (owner's call 2026-06-10): pinned step list + crossfading detail panel, with a beam that draws down the rail lighting up step nodes. Preview lives at `/sampler` (delete route after real build). | Aceternity-style, hand-rolled framer-motion |
| Work showcase ★ | Container Scroll Animation (3D Marquee benched as alternative if enough screenshots) | Aceternity |
| Stats | Count Up | reactbits |
| Tech stack | Logo Loop | reactbits |
| Final CTA ★ | Background Beams With Collision (owner's call) + Moving Border button | Aceternity |
| Cursor | Existing SplashCursor, hero-only, desktop-only | already in repo |
| Structural (forms/FAQ/inputs) | Origin UI + shadcn primitives | originui.com |

★ = the four set pieces. Other vetted sources: Magic UI, Motion Primitives, Skiper UI (runner-ups live there). Everything normalized into one token system (one accent, one type scale, one easing).

## Build status (2026-06-10)

Real build SHIPPED on branch `alpha` (uncommitted):
- Scaffold: shadcn/ui initialized (`components.json`, vendor lint exemption in eslint.config.mjs), Lenis (`SmoothScroll.tsx`, desktop + motion-ok only), fonts swapped to Space Grotesk/Inter/JetBrains Mono, tokens rewritten in globals.css (near-black `#050709`, single cyan accent: `--accent-bright` #22d3ee / `--accent-deep` #0e7d86; legacy purple tokens remapped in-family).
- Vendored components live in `src/components/` (reactbits) and `src/components/ui/` (Aceternity), pulled via shadcn registries and recolored to the system.
- All sections rebuilt per the locked picks; page order: Nav → Hero → TechStack (LogoLoop strip) → Services (BorderGlow bento) → CaseStudies (ContainerScroll flagship window) → Process (pinned reveal × beam; mobile gets flowing beam variant) → Stats (CountUp) → Benefits → Team → Testimonials → CTASection (beams + MovingBorder) → Contact → Footer.
- Nav gained a Work link + 1px scroll-progress beam. Photographic backdrops (particles/streaks/footer/hero jpgs) removed — sections sit on the calm near-black base.

Remaining / deferred:
- `/sampler` route still exists (winner already ported into Process.tsx) — delete once owner confirms the real section.
- Contact form + FAQ restyle with Origin UI primitives (FAQs/Pricing components are currently not on the page at all).
- Visual QA pass: mobile 375px, reduced-motion, Lighthouse.
- public/ images now unused by the page: hero.jpg, particles.jpg, streaks.jpg, footer.jpg.
