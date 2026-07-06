# Intent: Experience-Site Rebuild ("all out")

Confirmed 2026-06-11. Supersedes `futuristic-redesign.md` on branch `beta` and onward.
(`alpha`/`main` remain governed by the old doc until `beta` replaces them.)

## Confirmed intent

- **Outcome:** Rebuild solafidei.com as a full experience site — the awwwards genre, where heavy animation _is_ the site from first pixel to last. This replaces the "engineered, not decorated" restraint of the previous direction. New project on branch `beta`.
- **User:** Prospective clients, and honestly the owner — the bar is that the owner looks at it and feels what he feels browsing heavy-animated showcase sites, instead of admiring them from a distance.
- **Why now:** Interview (2026-06-11) surfaced that the old doc's restraint was the owner talking himself out of what he actually wanted. The itch doesn't go away by adding one component.
- **Success:** Scrolling the site feels like a crafted experience, not a page with effects sprinkled on. Component/library sources are picked to serve that feeling, never the other way around.
- **Constraint:** Mobile still has to work and convert. Desktop is the showpiece; mobile is a deliberately designed simpler experience — not a degraded afterthought, but not the same site. The contact funnel can never break.
- **Out of scope:** Copy, services, section content, and the backend (contact + awareness API routes) stay as-is — this is a re-expression of the same business, not a rebrand. Still no light mode, no price-card pricing. `alpha`/`main` stay live until `beta` earns the swap.

## What carries over from the old direction (until revisited)

- Token system: near-black base, single cyan accent family, grayscale everything else.
- Type: Space Grotesk / Inter / JetBrains Mono.
- `prefers-reduced-motion` is always honored.
- Backend routes and env contract unchanged.

Everything else — section structure, effect hierarchy, the "WebGL confined to hero" rule, component picks — is **unlocked** and up for grabs.

## Component sourcing note: motionsites.ai (evaluated 2026-06-11)

The owner's original question. Verdict after looking at it:

- It is **not a component library** like reactbits/Aceternity. It's a library of AI _prompts_ and animated templates (hero sections, full landing pages, animated backgrounds) meant to be fed to AI coding assistants (Cursor, Lovable, Bolt).
- **Use it as:** art direction reference and prompt-source material for set pieces — exactly the genre the rebuild targets. Outputs would be generated/adapted in-repo, then normalized into our token system like every other vendored component.
- **Do not:** treat it as vendorable code, or ship anything derived from its premium templates before verifying commercial licensing — the site does not publish clear commercial-use terms. Check before launch if any premium-derived design ships.

## Build status (2026-06-12, uncommitted on `beta`)

All five acts built and verified (scripts/verify-\*-scene.mjs, desktop + mobile):

1. **Arrive** (Hero) — GSAP entrance (blur-assemble words, splash-sequenced) + desktop 120vh pinned scrub exit: rows lift, words scatter, rays fade, outlined SOLAFIDEI wordmark surfaces. Mobile: unpinned drift+fade.
2. **What we build** (Services) — scrubbed word-rise heading, bento cards lift+tilt (perspective 900), TechStack section absorbed as closing stack beat. TechStack.tsx deleted.
3. **Proof** — CaseStudies + Stats + Testimonials merged: ContainerScroll set piece (untouched) → second study slides from sides → stats strip → quotes alternate sides. Old three files deleted.
4. **How we work** (Process) — pinned beam set piece untouched (framer); Benefits + Team absorbed as scrubbed beats. Anchors #about/#benefits/#team preserved. Benefits.tsx/Team.tsx deleted.
5. **Talk** — FAQs + CTA + Contact merged: FAQ rows scrub in (accordion stays framer), beams CTA rises+scales, contact columns slide from sides. Form logic copied verbatim; funnel verified (fields, captcha-gated submit, accordion). Old three files deleted.

Stack decisions (settled): GSAP ScrollTrigger = scroll backbone, driven through Lenis via gsap ticker (SmoothScroll.tsx); framer-motion = UI state/micro only; r3f deferred until a set piece demands it. Single GSAP entry: src/app/components/gsap.ts. Shared scrubbed heading: ui/SceneHeading.tsx (framer SectionHeading remains for nothing on the page now — only Pricing.tsx, which is orphaned).

Hard-won rules: never point GSAP at framer-animated nodes (WAAPI fill wins); post-mount layout swaps need useGSAP deps + ScrollTrigger.refresh(); verify scripts must wait ≥900ms after programmatic scroll (Lenis).

## Remaining / deferred

- Feel-tuning pass on a real screen (scatter distances, scrub windows, watermark strength).
- Scene _seams_ — current acts assemble individually; cross-boundary handoffs (type carrying over, pinned transitions between acts) are the next level of craft.
- Performance budget numbers + Lighthouse pass on mobile.
- motionsites.ai prompt mining for set-piece upgrades (licensing check before shipping premium-derived work).
- Orphaned: Pricing.tsx, SectionHeading.tsx (only used by Pricing), animations.ts variants (Nav/Footer still framer).
