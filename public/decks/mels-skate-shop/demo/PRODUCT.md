# Product

<!-- impeccable:product-schema 1 -->

> Scope note. This file governs **`public/decks/mels-skate-shop/demo/` only** — the five
> static HTML screens of the Mel's Skate Shop cold-pitch demo. It is not the product record
> for `solafidei-site`, which is a different product with a different design system. It sits
> inside `demo/` (not at the repo root) because `tasks/plan.md` Task 5 places it there, where
> `impeccable detect` finds it alongside the files it describes.
>
> It also carries more design direction than impeccable's `init` convention normally allows in
> a PRODUCT.md — palette, type and the chip rule would ordinarily live in a DESIGN.md. Task 5's
> acceptance criteria require them *here*, and five later tasks will read exactly one file
> before they write markup. The plan wins; the sections are labelled so the seam is visible.

## Platform

web

## Stack

Static HTML5 + one hand-written CSS file + (from Task 9) vanilla ES2020 modules. No framework,
no build step, no npm dependency, no CDN, no third-party script — spec §3 and §9. Files are
served straight out of `public/`; `next.config.ts` only rewrites the clean URLs onto them.

## Users

**Melony**, the owner of Mel's Skate Shop, on her phone, cold. She did not ask for this and has
never heard of us. A stranger sent her a link. She will decide in roughly eight seconds whether
the rest of her afternoon is worth spending on it.

That single fact sets every constraint below: 390 px first, legible without zooming, no
cleverness that costs a second of comprehension, and nothing that reads as a template with her
logo dropped into it. A secondary audience — her customers — only matters in so far as Melony
recognises them in the screens.

## Product Purpose

The demo is an argument made in working software: *this is what your shop would look like if
someone who respects it rebuilt the storefront.* Five screens (Home, Roller Derby hub, an Aura
Sky 100 product page, a Size Finder, Book a fitting) show the specific things her current site
cannot do. Success is Melony taking a call — not a conversion, not a sale.

The demo is also a promise about how we would work: everything shown is either a fact sourced in
`data/manifest.json`, or it is visibly marked **proposed**. Nothing is quietly invented. The
chip (below) is not decoration; it is the product.

## Positioning

Mel's is a fitting shop, not a warehouse with a checkout. The demo has to feel like a shop that
**puts skates on feet** — measures, adjusts, heat-moulds, and says "bring it back if it's wrong"
— rather than a marketplace that ships boxes and hopes.

Facts that back that, all already sourced in the spec, none invented here: trading since 2012;
the first roller derby shop in South Africa; an official Roll-Line dealer (Roll-Line's own dealer
listing is the evidence); Roadhouse Roller Rink lists it as a recommended shop; and it is the one
shop in the country covering ice, artistic and derby under one roof. The demo's job is to make
that visible in the first screenful, because her current site does not.

## Operating Context

- Phone first, cold, one-handed, probably in a quiet moment between customers.
- Five pages, no login, no cart, no backend. Every action that would need one ends in WhatsApp,
  a `tel:` link, or an email — labelled as what it is.
- The pages are `noindex`. This is a proposal shown to one person, not a live storefront.
- The five screens must reach each other from a shared header; no page is a dead end (§6.0b).

## Capabilities and Constraints

- One stylesheet, `assets/site.css`, is the entire design system. Later tasks must not add a
  second stylesheet and must not use inline styles.
- Class names are BEM-lite and several are **already fixed by spec §8** — `.pdp`, `.pdp__title`,
  `.pdp__price`, `.price`, `.price__instalment`, `.fit-guarantee`, `.sizes`, `.size`,
  `.size--selected`, `.availability`. Do not rename them; they are in the code sample the
  reviewers will diff against.
- State lives in `data-*` attributes. JS enhances; the page must read correctly without it.
- Live regions start empty and receive only real state changes; static prompt text stays outside
  them. `site.css` reserves one line of height for an empty live region so the layout does not
  jump when a result arrives.
- Tap targets are at least 44 px (`--tap`). Every focusable thing has a visible focus ring;
  `outline: none` without a replacement is a defect.
- `prefers-reduced-motion: reduce` is honoured globally.
- **Still undecided, and later tasks must not decide it for the owner:** the shop's street
  address. Roll-Line's dealer listing and Facebook said one thing, the Google Business Profile
  said another roughly 20 km away (decision #501), and no street ships anywhere in the demo
  (#504/#516). **Settled since (#544/#548):** the area is Eastgate Shopping Centre, sourced from
  Mel's own site's relocation banner (owner-observed single browser load, 2026-09-16) — this file
  and the demo now name that destination, never a street and never a suburb pairing beyond it.
  The address line in the contact block stays flagged `confirm`.

## Brand Commitments

- Melony's own logo is the wordmark (fetched once, `img/logo.webp`, ruled #492). There is no
  invented mark, no re-drawn logo, no alternative lockup.
- Melony's voice, not agency voice. Copy in `draft-copy.json` speaks as her and is labelled as a
  draft, never as a promise.
- No "walk-ins welcome" anywhere — that is a competitor's practice, not hers. The shop is
  by appointment, in her own published hours.

## Evidence on Hand

Real, in the repo: the Store API product and category data (`data/products.json`), her own
product photography and logo under `img/`, the Aura model-selection chart from her own listing,
the Roll-Line dealer listing, the Roadhouse "recommended shop" mention, and exactly **one**
public review (Elizabeth de Lange, Facebook, 2 November 2022).

**Absences that must never be filled in by invention:** there is no Google rating, no review
count beyond that one, no follower count, no Lighthouse score, no turnover figure, and no
per-size stock truth for the Aura run. If a screen needs one of those, the answer is a chip and
a WhatsApp handoff, not a number.

## Product Principles

1. **Fit, not freight.** Every screen answers "which one, and what size for *you*" before it
   mentions price or delivery.
2. **Evidence beats adjectives.** A named review, a dealer listing and a rink's recommendation
   outrank any sentence starting "we are passionate about".
3. **Marked, or sourced. Never neither.** If Mel has not published it, it wears the chip.
4. **No dead ends.** Anything the demo cannot actually do hands over to WhatsApp with the
   context already filled in, and says so on the button.
5. **Respect the eight seconds.** One idea per screenful; nothing that needs a pinch-zoom.

## Accessibility & Inclusion

Target is WCAG 2.2 AA on a 390 × 844 phone. Body and UI text are at or above 4.5:1 (see the
measured table below); the smallest text in the system, the chip at 13 px, measures 10.24:1.
Keyboard order is DOM order, focus is always visible, and the one motion rule is disabled under
`prefers-reduced-motion`. Live regions announce results, never placeholders.

---

# Design Direction

*(Recorded here by `tasks/plan.md` Task 5. Impeccable convention would file this under
DESIGN.md; see the scope note at the top.)*

## Why the Solafidei tokens deliberately do not apply

This is a decision, not an omission.

**The mechanical half — verified, not assumed.** These five pages are static files under
`public/`. `next.config.ts` rewrites `/decks/:deck/demo/:page` onto `/decks/:deck/demo/:page.html`
and Next.js then serves that file verbatim. Fetching the clean URL from the dev server returns the
stub's own bytes: one `<link rel="stylesheet">`, pointing at `assets/site.css`, and no Next-injected
CSS or markup at all. So `src/app/layout.tsx` never wraps these pages and `src/app/globals.css`
never loads. `site.css` is not *a* stylesheet for this demo — it is the only one.

**The design half.** `globals.css` is Solafidei's house system: `color-scheme: dark`, a near-black
base (`#030507`), one cyan accent (`#22d3ee`), "engineered, not decorated". That is a correct system
for an engineering studio's own site and the wrong one for this. Dressing Mel's shop in our colours
would say *look what we made*; the pitch has to say *look what you could have*. And a dark cyan
storefront on a phone, cold, would read as a tech deck rather than a skate shop. So: a single
light theme, warm, hers. Spec §2.13 anticipated exactly this and named it.

Practically, nothing in `site.css` may reference a Solafidei token, and nothing in `src/` may be
touched to support the demo.

## Brand direction

**Rink floor and toe stop.** The page is a cool, pale grey — the colour of a rink surface and a
workshop bench — and the only genuinely warm things on it are Melony's own product photographs and
one burnt-brick accent. That inversion is the whole idea: on her current site the photography
competes with the page; here the page gets out of its way, and the single warm accent is reserved
for the few things that are actually actions.

Type does the rest. One geometric display face carries the voice, and a monospace face is allowed
to carry exactly one thing — **measured values**: millimetres, cm/UK/EU/US conversions, prices,
lead times. That is not ornament. It is a fitting shop; the numbers are the product, and setting
them in a face that aligns in a column says so before any copy does.

What it is **not**: no gradients, no glassmorphism, no hero video, no drop-shadow theatre, no
stock photography, no warm-cream "tasteful" surface. The restraint is the argument — it is what
lets her own product photos carry the page. (The cream surface is called out specifically: it is
the reflex AI-template background, and `impeccable detect` flags it by name. This palette was
changed away from it deliberately, not by accident — see "The gates this passed", below.)

## Palette rationale — checkable in words

All ratios below were computed from the actual hex values with the WCAG 2.x relative-luminance
formula (`(L_lighter + 0.05) / (L_darker + 0.05)`), not estimated.

| Token | Value | What it is for | Measured |
|---|---|---|---|
| `--c-surface` | `#f1f3f5` | the page. Cool pale grey — rink floor | — |
| `--c-surface-raised` | `#ffffff` | cards lift off the floor | — |
| `--c-surface-sunken` | `#e4e8ec` | bands, intake blocks, quiet cards | — |
| `--c-ink` | `#14181c` | all body copy. Cool near-black, never `#000` | **16.04:1** on surface |
| `--c-ink-muted` | `#4d565f` | meta, captions, hints | **6.71:1** on surface |
| `--c-accent` | `#9e3315` | links, primary buttons, eyebrows | **6.43:1** on surface; **7.15:1** white-on-accent |
| `--c-accent-strong` | `#7e2810` | hover / active only | **9.55:1** white-on-accent |
| `--c-focus` | `#1b5fc1` | the focus ring, and nothing else | **5.47:1** on surface |
| `--c-ok` | `#1e6b3a` | "in stock" | **5.86:1** on surface |
| `--c-warn` | `#8a5a00` | "imported to order" | **5.33:1** on surface |
| `--c-border` | `#d3d9de` | **decorative hairlines only** | 1.28:1 — never a control edge |
| `--c-border-strong` | `#7c868f` | inputs, size buttons, real UI edges | **3.33:1** on surface |
| `--c-chip-bg` / `--c-chip-ink` | `#33415c` / `#ffffff` | the "proposed" stamp | **10.24:1** |

Four rules a non-designer can hold the build to:

1. **The page is cool; the accent is the only warm thing that is not a photograph.** A burnt brick
   red — links, primary buttons, the active nav item, the eyebrow above a section. If a red thing
   is not clickable and not a section marker, that is a bug.
2. **Stock states are never colour alone.** Green means in stock and *also* says "In stock";
   amber means imported to order and *also* says how long. A colour-blind reader loses nothing.
3. **`--c-border` is a hairline, not an edge.** It is intentionally faint (1.28:1) and may only
   draw decorative card outlines. Anything a finger or a keyboard can land on uses
   `--c-border-strong` (3.33:1), which clears WCAG 1.4.11.
4. **Slate is reserved.** `#33415c` is the chip and nothing else. It is neither Mel's brand colour
   nor a stock state, which is precisely why the chip can never be mistaken for either.

The focus ring is blue on purpose: it is the one colour in the system that is not part of Mel's
brand and not the chip, so it can never be mistaken for a decorative state.

## Type

Two families, both SIL OFL 1.1, both self-hosted as local `.woff2` with `font-display: swap`. No
Google Fonts, no CDN, no `@import`. Full provenance, versions, axes, checksums and the licence text
are in `assets/fonts/OFL.txt`.

- **Outfit** (display *and* body) — everything that is words. Geometric, a little sporty,
  wide-open counters; it holds up at 44 px in a hero and at 13 px in a caption, and it gives the
  page a voice instead of the default one.
- **JetBrains Mono** (measured values only) — millimetres, size conversions, prices, lead times,
  via the `.num` utility and the `.price` / `.size` components. Tabular figures, so a size run and
  a conversion row line up in a column. **Do not use it for prose.**

**Inter was tried first and deliberately removed.** `impeccable detect` flags Inter by name as an
overused face — one of the handful every AI-generated UI converges on — and on a pitch whose entire
argument is "someone actually thought about your shop", shipping the default face would undercut
the point. Outfit plus a purposeful mono is the more distinctive and more defensible system, and it
happens to be smaller.

Both files are **variable** (Outfit `wght 100–900`, JetBrains Mono `wght 100–800`), so there are
exactly **two `@font-face` rules** for the whole system, **55,364 bytes** combined. The upstream
cache held nine per-weight files per family; they were measured byte-identical within a family, so
declaring nine static faces would have shipped the same bytes nine times for no gain. One face per
family, one range.

**Glyph budget — read this before writing copy.** These are subsets. Coverage was measured by
decoding each file's `cmap` table; it is 94 code points per face and no more:

```
U+0020–U+007E   minus  \  ^  ~
U+00B7  ·  MIDDLE DOT
U+2014  —  EM DASH
```

So `·` and `—` are safe. **`–` (en dash), `’` (curly apostrophe), `“ ”`, `©` and accented letters
are NOT in the fonts.** They will still render — `unicode-range` hands them to the fallback stack
deliberately rather than dropping them — but they will render in the *system* face, mid-sentence,
and a careful eye sees it. Therefore, for Tasks 6, 7 and 12–17:

- write ranges with an em dash or a hyphen (`R100 Gauteng · R150 elsewhere · 1-3 days`), not an
  en dash;
- write apostrophes as the ASCII `'` (`Mel's`, not `Mel’s`);
- use `"` for quotes;
- the one place `©` is genuinely required — the image credit "Product imagery © Mel's Skate
  Shop, reproduced for this proposal" (§2.5) — is a 12 px footer line, and the fallback there is
  an accepted, recorded cost.

The type scale is nine steps, `--t-xs` (12 px) to `--t-4xl` (44 px), all in `rem`. Body copy is
17 px because 16 px is the floor, not the target, when the reader is holding the phone at arm's
length — and that rule binds **every block that says something**, not just `<p>`. Measured at
390 px, these all compute to 17 px: `.promise-row__item`, `.fit-guarantee`, `.banner`, `.note`,
`.chip-legend`, `.availability`, `.price__instalment`, `.live`, `.site-footer`. The shop's
promises, its terms, its contact details and the key that explains the chip are body copy; they
were set at 14 px in the first pass and raised, because a brief that argues for 17 px and ships
14 px is just a brief.

What is deliberately **below** 17 px, and why:

- `--t-md` (14 px) — genuinely secondary UI that labels something else rather than saying
  something: `.card__meta`, `.field__label`, `.field` hints' sibling `.sizes legend`,
  `.site-header__link`, `.table` cells (a four-column conversion row has to fit a 390 px box) and
  `.promise-row__note` (raised from 12 px — it carries the Fit Guarantee terms).
- `--t-xs` (12 px) — fine print only: `small` / `.fine`, `.field__hint`, `.source`, and the
  `<small>` inside a `.size` button.

## The chip contract — spec §6.0

One rule, no JavaScript, defined once in `site.css`:

```css
[data-illustrative]::after { content: "proposed"; /* small pill, tokens from :root */ }
```

**Measured at 390 × 844 in Chromium**, injecting the attribute at runtime onto a stub page (both a
short inline host and a long wrapping `.fit-guarantee` paragraph):

- pill border box **80.016 × 26 CSS px** — non-zero, `display: inline-block`, `visibility: visible`;
- resolved colours `rgb(255, 255, 255)` on `rgb(51, 65, 92)` → **10.24:1**, against a 4.5:1 floor;
- `document.documentElement.scrollWidth === window.innerWidth === 390` with both chips present —
  the pill does not blow out a card or force a horizontal scroll; it wraps as a unit
  (`white-space: nowrap` on the pill, normal wrapping around it).

**Why the chip is a solid slate stamp.** Slate is used for nothing else in the system: it is not
Mel's accent and it is not a stock state, so the pill can never be misread as one of her badges or
as availability. A solid fill rather than a tint, because the chip is the honesty argument — if
Melony can miss it, the mechanism has failed. It reads as a stamp on a proof, which is what it is.

**Accessibility decision, measured rather than assumed.** Chromium's full accessibility tree does
expose the generated content as a `StaticText` node named "proposed"
(`Accessibility.getFullAXTree`, 2026-09-15). A duplicate visually-hidden `<span>proposed</span>`
would therefore make a screen reader say the word twice, so it is **deliberately not added** —
and the trap it protects against is real: the word "proposed", heard alone after a price, means
nothing anyway.

The rule also carries the CSS **alt-text form** — `content: "proposed" / "proposed";` — declared
as a *second* declaration immediately after the plain one. Engines that parse it route the string
through the alt-text path, which assistive technology honours more consistently than raw
generated content; engines that do not parse it drop only that declaration and keep the plain
string above, so the pill can never disappear. Re-measured after the change, with page JavaScript
disabled: the pill is still **80 × 26 CSS px** on both a plain paragraph and on `.btn--primary`.

What is required instead of a hidden duplicate, and later tasks must do it:

> **Every page that shows a chip also shows one visible `.chip-legend`, above the first chip,
> saying what the pill means** — e.g. *"'proposed' marks something we're suggesting. Mel hasn't
> published it, and this demo won't pretend she has."*

That serves everyone at once: sighted visitors get the key they otherwise have to guess at, and
screen-reader users get the explanation as real page text rather than as a hidden duplicate.
> **and every chipped element carries `aria-describedby` pointing at that one legend's `id`.**

The `aria-describedby` half is not optional polish. The Chromium measurement is real but it is
one engine; the reader this demo is built for is on a phone, and iOS VoiceOver's handling of
`::after` content could not be tested here — no device, no network. `aria-describedby` makes the
association exist in markup rather than depending on the pseudo-element being announced at all,
so the worst case degrades to "this claim is described by the legend" instead of to silence. It
is logged for the owner below.

`.chip-legend` is already in `site.css`. `.u-visually-hidden` also exists and is the right tool
for control labels — just not for the chip.

**The chip on the buy button (§6.3.10) has its own rule**, because `.btn` is `inline-flex` with a
`gap`: the pill would otherwise collect the flex gap *plus* its own inline-start margin (16 px
where every other host gets 8 px), and slate-on-brick is 1.43:1, so the stamp's edge disappears
into the button. `.btn[data-illustrative]::after` zeroes the margin and gives the pill a ring in
chip ink — 7.15:1 on the accent. Do not re-style the chip per screen; this is the whole set of
host exceptions.

Also measured at the same time, on the same injected subjects: `document.documentElement.scrollWidth
=== window.innerWidth === 390` with both chips present (no horizontal scroll, the pill wraps as a
unit and does not blow out the card); a `.btn` renders 44 px tall; and a keyboard `Tab` — not a
hover — produces `outline: 3px solid rgb(27, 95, 193)` at `outline-offset: 2px`. Zero console
errors or warnings on the page.

Chips go on the **nine** `data-illustrative` ids §6.0 enumerates and no others; §7.11 asserts the
chip set and the `source: "illustrative"` set in `manifest.facts[]` are identical.

## Components already in `site.css` — use these, do not invent

Page shell (`.page`, `.wrap`, `.page__main`, `.section`, `.section--sunken`, `.section--accent`,
`.section__head`, `.eyebrow`, `.lede`, `.fine`, `.source`) · header (`.site-header` and its
`__inner`, `__brand`, `__logo`, `__nav`, `__link`, `__link--cta`) · promise row (`.promise-row`,
`__item`, `__label`, `__note`) · grid and cards (`.grid`, `.grid--wide`, `.card`, `.card--flat`,
`.card--quiet`, `.card__media`, `__title`, `__meta`, `__body`, `__foot`) · badges (`.badge` with
`--in-stock`, `--lead-time`, `--sold-out`, `--evidence`) · buttons and links (`.btn` with
`--primary`, `--secondary`, `--ghost`, `--block`, plus `.btn-row`, `.link--quiet`) · forms
(`.field`, `__label`, `__hint`, `.input`, `.select`, `.textarea`, `.check`) · the PDP set fixed by
§8 (`.pdp`, `.pdp__title`, `.pdp__price`, `.price`, `.price__instalment`, `.fit-guarantee`,
`.sizes`, `.size`, `.size--selected`, `.availability`) · live regions (`[aria-live]`, `.live`,
`.live--result`, styled so an empty one holds its line without looking broken — bare
`[aria-live]` stays **inline-block** so the §8 availability markup keeps its live `<span>` on the
same line as its prompt text, while `.live` is the block-level variant for a standalone region
such as the derby hub's "Showing N of M") · editorial
(`.banner`, `.note`, `.qa`, `.qa__q`, `.qa__a`, `.rail`, `.rail__title`, `.chip-legend`) ·
contact and footer (`.site-footer`, `.contact`, `.contact__list`, `.contact__item`,
`.contact__label`, `.whatsapp-fab`) · utilities (`.u-visually-hidden`, `.u-measure`, `.u-stack`, `.num`).

Four more exist specifically so the later screens do not have to invent them:

- **`[hidden]`** — `[hidden] { display: none !important; }`. Every primitive above sets `display`,
  and an author declaration beats the UA's `[hidden]` rule on origin alone, so without this the
  `hidden` attribute does nothing. §6.2 filters the derby grid with all cards left in the DOM and
  adds an "In stock only" toggle: use `hidden`, not a class, and not `style="display:none"`.
- **Tables** (`.table-scroll`, `.table`, `.table__cell--num`) — for §6.3.8's spec table, §6.4.3's
  cm · UK · EU · US conversion row and the `sizes.json` brand tables. Numeric cells take the mono
  face and tabular figures, which is the reason that family is in the system. Always wrap a table
  in `.table-scroll`; a four-column table is wider than the 358 px content box at 390 px.
- **`.btn[aria-pressed="true"]`** — the pressed state for §6.2's five decision cards and its
  in-stock toggle. Use it; `.size--selected` is bound to the PDP size buttons and carries mono and
  tabular figures it would drag along.
- **`dialog.sheet`** (`.sheet__title`, `.sheet__body`, `.sheet__foot`, `::backdrop` on `--c-scrim`)
  — §6.3.10's demo sheet. Native `<dialog>` with `showModal()`, so focus trapping, Esc and
  inertness come from the UA. Bottom-anchored on a phone, centred from 40 rem up.

If something you need is genuinely missing, add it to `site.css` as a token-driven rule — never
as an inline style, and never as a second hard-coded copy of a value that is already a token.

## The copy standard for things this build has not finished yet — #568

A demo page **may** describe a destination in the present tense when that destination is scheduled
inside this epic and the pack does not ship before it lands. It **may not** claim a state of the
world outside the epic's control.

That is the whole rule, and it is written here so it stops being re-decided one sentence at a time.
It exists because T13 shipped two sibling sentences under two different standards and nobody noticed
until the re-verification pass: `roller-derby.html` says *"Opens the Size Finder already set to
derby"* (present tense, about a T16 stub where `?preset=derby` does nothing yet) while the sentence
one line below it was rewritten during the fixer pass from *"has one product page finished end to end"* to
*"There is one product page in this build, on the ice side of the shop."* Under the rule above **both
lines are legal and neither changes**: the Size Finder is T16's, the PDP is T14's, and the pack does
not reach Melony until CP8, by which point both sentences are simply true.

Neither sentence is cited by line number on purpose: `roller-derby.html` is generated by
`gen-roller-derby.mjs`, so any number written here goes stale the next time the page is rebuilt —
which is exactly what happened to the first draft of this section, whose `:219`/`:220` were shifted
to `:220`/`:221` by the same commit that wrote them. Quote the sentence, never the line.

What the rule forbids, for the avoidance of the next argument: a sentence asserting something about
Mel's shop, her stock, her suppliers or her customers that no manifest fact supports. That is a
sourcing defect (spec §10, zero unsourced facts), not a tense question, and this rule does not soften
it by one word.

## The one house rule that is graded by grep

Every colour, type step, spacing step, radius, border width and duration is declared **once**, in
`:root`. A raw hex, `rgb()`, `px` font-size or `px` spacing value anywhere below `:root` is a
defect. The survivors in the current file are the two `@media (min-width: …rem)` layout-tier
breakpoints (40rem, 64rem), because media queries cannot read custom properties — both carry a
`ponytail:` comment naming that ceiling — plus one further `@media (min-width: 48.0625rem)` block
that hides `.whatsapp-fab` one step above spec §6.6's own inclusive "<=768px" breakpoint (decision
#518, corrected from where it had drifted into the 64rem block), which is component visibility
pinned by the spec, not a third layout tier.

## The gates this passed, and what they cost

Recorded so the next agent does not undo a deliberate choice by reflex.

- **`impeccable detect … --viewport 390x844` — zero findings, exit 0.** It is worth knowing the
  gate can fail: the first version of this design scored **11 findings** against these same files —
  `overused-font` on `assets/site.css` line 33 and on all five pages (Inter), and `cream-palette`
  on all five pages (`rgb(251, 248, 243)`). Both were real. Inter was replaced with Outfit +
  JetBrains Mono, and the warm-cream surface with the cool rink grey. Re-flipping `--c-surface`
  back to `#fbf8f3` was run as a negative control and the five `cream-palette` findings came
  straight back, which is how we know the scan actually reads this stylesheet and applies it to
  every page rather than passing vacuously over near-empty stubs.
- **Two `@font-face` rules, 55,364 bytes of font.** Task 18's Lighthouse mobile gate is downstream
  and §7.10 budgets the page payload; do not add a third family without paying for it somewhere.
- **No `https://`, `fonts.googleapis`, or `cdn.` anywhere in `site.css`.** Asserted by the task's
  own verification grep. Adding a webfont link or a remote `@import` breaks §9 outright.

## What the next tasks inherit from Home

Home is the first real screen, so two obligations it cannot discharge itself are recorded here
rather than left in a code comment. Both were found by T12's provenance review, not by a gate.

- **DISCHARGED by T14.** `id="fit-guarantee"` now lands on the Aura PDP's Fit Guarantee section,
  so Home's promise row link (#493/#547, `.../demo/aura-sky-100#fit-guarantee`,
  `scripts/gen-home.mjs`'s `ROUTE_AURA_PDP_FIT_GUARANTEE` constant) resolves to something real.
  The gate gap is closed too, not just the anchor: `scripts/verify-mels-demo.mjs` group 3 gained a
  cross-page fragment assertion (ruling #584) that fires on an internal href carrying a `#fragment`
  even when the href is a full cross-page URL rather than a bare `#id` — the shape the old
  fragment branch (which only fired on hrefs that START WITH `#`) missed. It reads the target
  page's response body and asserts the id is actually there, with a suite-level anti-vacuity floor
  of 1. A demonstrated failing control is on record for this task: run before `id="fit-guarantee"`
  landed, the assertion named `#fit-guarantee` and failed group 3; run after, it passed with the
  counter at 1.
- **DISCHARGED by T13.** `scripts/verify-mels-demo.mjs`'s group 11 stdout hard-coded
  `D: every real observed chip visible (vacuous until T12)` at three sites (not two — this passage
  itself undercounted; one of the three does not contain the word "vacuous" and a `vacuous`-only
  grep would have fixed two and silently left the third). T13 corrected all three by hand and made
  assertion D's detail report the observed chip-element count instead of a static phrase.

## What T14+ inherits from the Roller Derby hub (T13)

- **The derby hub was the second link this build owed — DISCHARGED by T14.** T13 pointed a plain
  `.note` link at `/decks/mels-skate-shop/demo/aura-sky-100` (no fragment) so the hub would not be
  a dead end (#547/#567), the same PDP Home's link (above) also targets. Both links depended on
  the PDP existing and on `id="fit-guarantee"` landing on it; as of T14 the PDP is no longer a
  stub, the id is on the page, and group 3's cross-page fragment assertion (#584) gates it — see
  the discharge note above in "What the next tasks inherit from Home". Both links now resolve to
  real content, not an empty page.
- **`site.js` now has DOM wiring.** `initDerbyFilters()` is guarded behind
  `typeof document !== "undefined"` and queries `[data-derby-filters]`; a page with no derby grid
  (T16's Size Finder, T17's Book a fitting) safely finds no root and does nothing. T17's floating
  WhatsApp button work lands in the same guarded region of this file, not a new module.
- **`site.css` gained no new rules.** The filter bar reuses `.sizes`'s existing fieldset reset
  (border:0, flex-wrap) rather than a new class, and no card-image width CSS was added — see the
  measurement below.
- **Card image widths were measured at 390 px and left alone.** Seven of the fifteen grid images
  are under 800 px against eight at 800–1200 px; `img { max-width: 100%; height: auto }` (no
  `width` declaration) already bounds every one of them to its own manifest width inside the
  one-column grid, so the raggedness is real but did not cross into a group-9 failure. If a later
  task wants a uniform media box, the one gate-legal shape is a fixed-height `.card__media` that
  centres the image without ever setting its `width` (see `verify-mels-demo.mjs`'s group 9
  comment) — a `width: 100%` rule or an `object-fit` media box both fail it.
- **A chip must never sit inside a subtree a filter can hide.** Group 11 assertion D fails any
  `[data-illustrative]` element where `el.hasAttribute("hidden") || el.getClientRects().length ===
  0` — that is the entire reason T13 collapsed eleven per-card instalment chips into one
  section-level chip above the grid (#557) instead of one per card. `aura-size-stock-states`
  (manifest.facts, `source: "illustrative"`) is a live trap for T15: if its PDP chip is placed
  inside a size- or service-gated panel that can be hidden by a selection, assertion D fails the
  moment that panel is hidden with the chip still mounted.
- **The grid has an empty state now, and it is gate-checked (#569).** `site.js`'s `apply()` flips a
  `[data-derby-empty]` note whenever the active filter combination leaves zero cards visible. The
  note's TEXT and its baked initial `hidden` come from `gen-roller-derby.mjs` reading
  `draft-copy.json` — it is deliberately NOT a second string literal in `site.js` the way the
  live-region `TEMPLATE` is, so there is nothing to drift. It sits outside the `<ul>` and carries no
  `data-derby-set`, which is what keeps group 7 assertion B's constant node count at 15. **Reuse the
  element, not a new one:** a later page that wires `initDerbyFilters()` without an empty-state note
  still works (the lookup is optional), but a second, differently-named note would ship unchecked.
- **Group 7 no longer loses its failures when it throws (#571), and a control that throws proves
  nothing.** `groupDerbyFilters()` is now a ten-line wrapper around `derbyFiltersBody()`; the body
  takes the `failures`/`details` accumulators instead of owning them. Before this, an uncaught
  `locator.click()` throw discarded every failure already computed, because the verdict was returned
  only at the last statement. **If you write a control for this group, do not build it out of a
  throw** — the pre-wrapper K-control did, and it would have printed byte-identical output with
  assertion K deleted outright. Make the control change a *measurement*, the way assertion L's does.
- **Group 11's assertion-C probe delta wobbles between runs and that is not a defect.** Measured
  three consecutive `--only=11` runs: `88.5/88.5/88.5/88.5/88.5`, then `.../91.5`, then
  `.../91.5/88.5` — the 3 px step moves between pages run to run, a font-load timing artefact in the
  probe, not a page change. The floor is 40, so every observation sits ~2.2x above it. **Do not
  "fix" it into a fixed expected value**; that would convert a stable gate into a flaky one.
- **Three spec overrides are live and `docs/specs/mels-skate-shop-pitch.md` does not reflect
  them.** A later builder reading the spec, not this file, will "repair" them back: 6.2.1's
  decision-card 5 label is "Toe stops & jam plugs", not the spec's original wording (#554); 6.2.3's
  per-card instalment line is gone in favour of the one section-level chip above (#557, same
  constraint as the previous bullet); 6.2.5's buying-guide link does not exist and
  `manifest.links[11].href` is `null` (#559).

## What T15+ inherits from the Aura PDP, part A (T14)

Five more spec overrides are live, this time against §6.3, and the spec does not reflect any of
them either — the same "repair" risk as the register above, so they are recorded here rather
than left for a later builder to rediscover by re-reading `docs/specs/mels-skate-shop-pitch.md`:

- **§6.3.2's gallery item 3 is Aura's real published size-and-width grid**, re-encoded from
  `.cache/mels-fixtures/size-chart-aura-size-width-grids.png`, not the byte-identical duplicate of
  the selection chart the spec describes. Its caption is the new `pdp.gallery.widthGridCaption`;
  the spec's caption "Aura size guide — from the Sky 200 listing" and its `store:11941` sourcing
  do not ship (#572).
- **§6.3.3's title is `esc(p.name)`** — `"Aura Sky 100 Ice Skate Boot White"`, the fixture name —
  not the spec's em-dashed `"… — White"`, which exists in no fixture and which the spec
  contradicts itself about (§2.1 quotes it without the em dash) (#579).
- **§6.3.8 omits level and stiffness.** Both are published nowhere reachable, so they are left
  out rather than guessed (#577).
- **§6.3.8's spec-table size and width values are the Sky 100's own**, measured off Aura's
  published grid image, not the brand-level "210 to 300" the `aura-spec-table` manifest fact
  states — that string is true of the brand (Sky 50/100/200 together) and false of this boot
  alone: 300 mm exists only on the Sky 200 men's panel (#582).
- **§6.3.1's banner carries the `fit-guarantee` chip**, which the spec does not give it — its
  final clause is the same unpublished carve-out the guarantee states behind a chip (#576).

**Recorded for T15:** `draft-copy.json`'s `pdp.sizes.hint` reads *"Aura sizes in millimetres, 210
to 300."* — that is the same brand-level range that over-claims for the Sky 100, this time on the
size selector's own hint text. T15 renders that string on this page; narrow it to the Sky 100's
own run (men's 210–285, women's 210–280) rather than shipping the brand-level figure a second
time. Also: plan Task 15's verification bullet at `plan.md:433` (`grep -nE 'R ?7[,. ]?850|R
?15[,. ]?550' …`) is the same shape of generator-incompatible grep this task's own brief replaced
in its §11.4 — a generator bakes `R7,850` and `R15,550` into the bytes exactly as it bakes
`R12,050` here, so that literal grep will report a match and read as a failure when it is not
one. T15 should replace it the same way, not run it as written.

Also: `scripts/gen-home.mjs:158-162`'s comment above `ROUTE_AURA_PDP_FIT_GUARANTEE` is now false
in both of its clauses ("The PDP is a stub until T14/T15 and no gate catches a missing anchor" —
the PDP is no longer a stub as of this task, and group 3 gained the #584 cross-page fragment
assertion that does catch a missing anchor). T14 does not edit `gen-home.mjs` (out of scope — the
brief forbids it and its `ponytail:` comment is a separate, ruled transcription this file must not
touch), so the false statement is recorded here instead: whoever is next authorised to touch
`gen-home.mjs` should update that comment to say the PDP now exists and the anchor is gated.

## What is still open for the owner

- **The address — CLOSED, no longer open.** Two sources disagreed by about 20 km (decision #501);
  the street address itself stays struck for good (#504/#516) and this design commits to no
  street, no suburb pairing and no map pin. What was open — the shop's area — is settled:
  decision #544/#548 name Eastgate Shopping Centre, sourced from Mel's own relocation banner
  (owner-observed, 2026-09-16), and Home's hero and trust row now say so. The contact block's
  address line stays flagged `confirm` because no street ships.
- **iOS VoiceOver and the chip.** The chip's accessibility was measured in Chromium only
  (`Accessibility.getFullAXTree`, 2026-09-15) because that is the one engine available offline.
  `::after` content is not dependably announced by VoiceOver on iOS, which is the likeliest device
  for the reader this demo is written for. Two things were done about it here — the CSS alt-text
  form, and the standing requirement that every chipped element carry `aria-describedby` to the
  page's one `.chip-legend` — but neither is a substitute for opening the demo on a real iPhone
  with VoiceOver on and confirming the word "proposed" is reachable. **That spot-check is an owner
  action, not something this build can close.**
- **The canonical header at 390 px — the 519 px / 168 px figures below are WITHDRAWN (#547/#565).**
  A previous pass of this file described the §6.0b nav needing "about 519 px of run (five labels at
  14 px plus their padding and gaps)" and the header costing "168 px of an 844 px screen". Ruling
  #547 refuted both numbers in writing: they describe a nav that never shipped. The tree that
  actually landed carries a brand anchor plus exactly **four** `.site-header__link` anchors, not
  five, so the 519 px run was never the real one. No replacement figure is asserted here — #547's
  own finding is that the description was wrong, not what the correct number is. What IS still
  true and gate-checked on every page: every link keeps its 44 px tap height and
  `document.documentElement.scrollWidth === window.innerWidth === 390`, so nothing overflows,
  whatever the header's actual measured height turns out to be. If the owner wants a header-height
  number, that is a fresh measurement against the four-link tree, not a correction to this one.
- **Font attribution depth.** `assets/fonts/OFL.txt` carries the full OFL 1.1 text plus each
  file's own copyright notice, version, weight axis and sha256, read out of the binaries. Upstream
  release notes and designer credits were not available offline and were deliberately not guessed.
  If the owner wants richer attribution before this is shown to Melony, that is a one-line fetch
  from the two upstream projects named in the notices — it is not something this build should
  invent.
