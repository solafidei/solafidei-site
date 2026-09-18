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
derby"* (present tense, written at T13's time about what was then a T16 stub, where
`?preset=derby` did nothing yet) while the sentence one line below it was rewritten during the
fixer pass from *"has one product page finished end to end"* to *"There is one product page in
this build, on the ice side of the shop."* Under the rule above **both lines were legal at the
time and neither needed to change**: the Size Finder was T16's, the PDP was T14's, and the pack
did not reach Melony until CP8, by which point both sentences would simply be true. **As of T16,
`?preset=derby` is no longer a stub — it pre-sets the discipline branch for real (§3.3 of the T16
build brief) — so the parenthetical above is now a historical note about T13's state, not a
description of today's page.**

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
  (T16's Size Finder, T17's Book a fitting) safely finds no root and does nothing.
  **CORRECTED by T17 (#613):** this note used to predict that "T17's floating WhatsApp button work
  lands in the same guarded region of this file, not a new module" — wrong on both counts. The
  floating WhatsApp button is a static `<a href>` on all five pages and needs no JS at all, and
  T17's actual work (`composeBookingMessage()`/`initBooking()`) landed in a NEW module,
  `assets/booking.js`, not here. See "What T18+ inherits from Book a fitting (T17)" below for what
  actually shipped.
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

## What T16+ inherits from the Aura PDP, part B (T15)

- **The `aura-size-stock-states` trap named above (T14's note) was discharged, not just
  avoided.** The chip sits on `.availability`'s wrapping `<p>` — an element that is always
  rendered and always visible — with the empty `<span aria-live="polite" data-pdp-availability>`
  nested inside it. Group 6 asserts the region is empty on first paint (read from the raw HTML
  bytes on disk, before Playwright ever loads the page, and again from the live DOM before any
  click) and group 11 assertion D never sees a zero-size box for this chip, on load or after any
  size selection.
- **§8's STATES map really did survive with one entry** (ruling #589), now living in
  `assets/pdp.js` as `export const STATES = { leadTime: (mm) => ... }`, not in `site.js` —
  `site.js`'s own `STATES` is a different concern (product stock/sold-out badges for Rail A,
  reused via `stockState()`), not the per-size lead-time line. Group 6's own expected strings are
  typed as literals in `verify-mels-demo.mjs`, independent of this map, so a regression in either
  file is caught (build brief §10's tautology warning).
- **New DOM wiring landed in `assets/pdp.js`, not `site.js`.** PRODUCT.md's earlier note ("T17's
  floating WhatsApp button work lands in the same guarded region of this file, not a new module")
  is about `site.js`'s own guarded block and does not bind the PDP: this build's brief explicitly
  assigns the PDP's interactive module to `assets/pdp.js` (ruling #573 already made that file
  canonical for this page's money maths), and `pdp.js` is not "a new module" — it has existed
  since task 14. `pdp.js` imports `buildWhatsAppLink` from `site.js` for the WhatsApp links (no new
  dependency: same-repo file, and `site.js`'s own bottom guard is a no-op on a page with no
  `[data-derby-filters]`, exactly as documented above for a later page reusing it). Recorded here
  so a later builder does not read the older note as forbidding this.
- **The buy sheet is a native `<dialog>`**, matching `site.css`'s pre-existing `dialog.sheet`
  rules (written for this exact spec section, per that CSS block's own comment) — focus trapping,
  Escape-to-close and inertness all come from the UA, not from hand-rolled JS. `pdp.js` composes
  the WhatsApp CTA text fresh on every open (so a size picked after the sheet was last opened is
  reflected) and returns focus to the buy button on `close` (fires on both Escape and the dismiss
  button, one listener covers both).
- **Rail A renders all six ice-category SKUs with an image on disk** (6395, 6403, 4901, 7941,
  9665, 12043) — no new image, no new `img-alt.json` entry. 6395/6403 (`price: "0"`, out of
  stock) render no price at all rather than a naive "R0"; 4901 carries a `price_range`
  (33000-36000) wider than its flat `price` (33000), rendered as "From R330" rather than a flat
  figure that under-claims the top of the range — a decision taken here, not ruled, and flagged
  as such in task 15's return. **Rail B ships no `<img>`** — there is no photograph of the Sky 50
  or the Sky 200, and reusing `aura-boot.webp` (the Sky 100's own photo) for either would be a
  false image claim.
- **`manifest.json` was not touched.** The live-site product URL brief §14 asked to "record" was
  already present at `manifest.links[5]`, checked 200 — a second row would have been an
  unruled fixture edit. `pdp.ctaLiveSite` points at `product.permalink` for id 11919, which is
  byte-identical to that existing link.
- **`gen-home.mjs`'s two false comments are both gone now**, not just the one #587 named. Measured
  during this task: the `ponytail:` block above the old local `instalments()` copy (T15 deletes it,
  imports the pdp.js version) was equally false as of `5d3077f` (`pdp.js` existed, and ownership
  had moved to T14 per #573, not T15) — both are rewritten to state what is actually true, not
  just the one comment the ruling named by line number. `gen-home.mjs`'s own `moneyWhole()`/
  `moneyCents()` copies are untouched — no ruling reaches them (only `instalments()` moved).

### T15 review — adjudicated findings (amended into the T15 commit)

Five review lenses reported on the commit above; here is what each finding turned into.

- **FIXED (blocker) — the availability line shipped a tilde, banned by ruling #512 for T12-T17.**
  `assets/pdp.js`'s `STATES.leadTime` and `verify-mels-demo.mjs`'s matching literal both read
  `Size <n> · imported to order, ~2 weeks`. `site.css`'s font subset excludes `~`/`\`/`^`; this
  would have been the site's first tilde, rendering off-family in the fallback stack, and group 6
  pinned the same literal so the gate blessed it. Reproduced live: sabotaging `pdp.js` back to the
  tilde while the spine literal reads "approx." drove GROUP 6 to FAIL on all 16 sizes naming the
  exact mismatch; restoring by file copy returned it to PASS (both transcripts are in the task's
  return). Fixed to `Size <n> · imported to order, approx. 2 weeks` — the same house form T14's
  banner and fulfilment note already use for this identical fact.
- **FIXED (major) — `gen-aura-sky-100.mjs`'s own header still called itself a "static half"
  renderer and made three now-false claims about `gen-home.mjs`** (that gen-home.mjs keeps its
  instalments() copy; that deleting it is "not this task's call"; that the interactive half
  "lands... below" as future work). All were true when T14 wrote them and became false the moment
  this same commit finished the work they were describing. Rewritten to describe what the file
  does today, including the runtime `console.log` that printed "(static half)" on every
  regeneration. `pdp.js`'s own header enumeration of gen-home.mjs's "copy" was also tightened to
  name only `instalments()` as deleted, since `moneyWhole()`/`moneyCents()` remain local there.
- **FIXED (major) — the demo sheet claimed a size was "already in it" even when none was
  selected.** The buy button's click handler was unconditional, so a visitor could open the sheet
  before picking a size and the composed WhatsApp message would then carry no size at all, while
  `pdp.demoSheet.body` (verbatim, rendered) told them otherwise. Fixed by baking the buy button
  `disabled` (house `.btn[disabled]` treatment, already in `site.css`) and having `initPdp()`
  enable it the moment a size is first selected, so the sheet is never reachable in the state the
  copy says doesn't happen. No copy string changed. Verified end to end with a Playwright script:
  sheet unreachable before selection, reachable and correctly WhatsApp-linked with the size after.
  Group 8's 44px tap-target floor is unaffected (`.btn[disabled]` only changes opacity).
- **REFUTED (major, only partially) — the finding's premise about #591(1)/legend chipping and
  manifest.json's diff being empty was itself correct** (confirmed independently, no fix needed
  there); it is the header-comment portion of that same finding that was real and is fixed above.
- **NOT FIXED, filed for the owner (minor) — `manifest.json`'s `aura-size-stock-states` fact text
  still enumerates the three plan states (in stock / imported / notify-me) after #589 collapsed the
  page to one.** The finding is correct and the fixture is stale relative to what ships, but brief
  measured fact F is explicit that this task's `manifest.json` diff must be empty — "if your
  `manifest.json` diff is non-empty, you have made a mistake" — and no ruling in §15 authorizes
  editing an illustrative fact's prose (only `links[]` was in scope, and that entry was already
  present). Group 11 keys the bijection on ids, not text, so nothing mechanical breaks; the fact
  text is simply describing a broader mechanism than the one branch this page implements. Left for
  an owner ruling to either narrow the text or record it as describing the general mechanism.

- **FIXED (major, found only in the main-session re-verify) — `pdp.js`'s own top header still
  read "This module has no DOM access and does no DOM wiring".** That was true when T14 wrote it
  about the three money exports and became false the moment this same commit added `initPdp()`
  below it — lines 89–186 are nothing but `querySelector`/`addEventListener`/`showModal`. It is
  also flatly contradicted by this document's own note above ("New DOM wiring landed in
  `assets/pdp.js`, not `site.js`"), so the file and its design record disagreed and the file was
  the wrong one. **The fourth instance of the #540/#587/#592 stale-comment class in four tasks,
  and the first to land in the very file the task's work went into** — five build lenses and the
  adjudicating fixer all missed it while fixing the identical class in `gen-aura-sky-100.mjs`.
  Rewritten to scope the pure-maths claim to the three exports and to state what the rest of the
  file now does. Comment-only: the full spine re-runs exit 0 with the same ten PASS / group 5
  SKIPPED, and every generator still regenerates to an empty diff.

## What T17+ inherits from the Size Finder (T16)

- **`assets/finder.js` is a fourth pure-plus-DOM module, same shape as `site.js` and `pdp.js`.**
  `findSize(brand, input)` and `whichSky(mm, kg, level)` are pure — no DOM, no globals, no network
  — and `initFinder(root)` is guarded behind `typeof document !== "undefined"` at the file's tail,
  exactly like the other two. It does **not** import or call `initDerbyFilters()`: T16's Size
  Finder does not reuse the derby hub's wiring at all (see the corrected note in `site.js` itself,
  where an earlier comment wrongly predicted it would).
- **How `sizes.json` reaches the browser without a `fetch()` or a `readFileSync()`.** Neither is
  permitted (build brief §7: `fetch()` fails the Never list and a would-be group-2 request; a raw
  `readFileSync()` breaks in the browser). The resolution: `finder.js` embeds `sizes.json`'s full
  content as a plain JS object literal — JSON is a syntactic subset of a JS object literal, so no
  parsing step is needed either at runtime or at import time — and both the browser (as an ordinary
  ES module fetch, the same way it already fetches `site.js` and `pdp.js`) and the verify spine's
  plain-Node `import` load it identically. **`scripts/gen-size-finder.mjs` asserts at generation
  time that this literal is deep-equal to `data/sizes.json` on disk**, the same drift guard
  `gen-roller-derby.mjs` already runs for `site.js`'s `TEMPLATE` literal against
  `draft-copy.json` — a hand-edit to either file that lets them diverge fails the generator loudly,
  not silently. This is the discrepancy filed against the build brief's own open question in §7
  ("if you find no shape that is both browser-safe and Node-pure, that is a blocker to report");
  a shape was found, and this is it.
- **`findSize()`'s two lookup directions are asymmetric on purpose.** Forward (`{mm}`) rounds UP to
  the next available row on the five flat-table brands (a boot must be at least as long as the
  foot) and rounds to the NEAREST published 5 mm step for Aura (its scale is a skate-size grid, not
  a shoe-size chart); reverse (`{uk: "8"}`, `{us: "4"}`, etc.) is an exact string match against that
  same brand's own column. Neither direction ever computes a value between two DIFFERENT brands'
  scales — §6.3's rule holds for both lookup directions, not just the forward one.
- **Picker membership is baked HTML, not a `finder.js` constant.** `scripts/gen-size-finder.mjs`
  owns `PICKER_BRAND_KEYS` (the six table brands minus Aura, plus riedell and sure-grip — rulings
  #603(1)/(2)) and renders one `[data-finder-brand]` button per entry; `finder.js` only ever
  queries the buttons the generator already rendered. A future task widening the picker edits the
  generator's list, not `finder.js`.
- **The Aura branch shares the measure step's `mm` field with the five flat-table brands, but not
  its reverse-lookup (shoe-size / already-own-a-skate) controls.** Aura carries no `columns`/
  `lengthColumn` (its own comment in `sizes.json` explains why — its scale is six per-model,
  per-gender grids, not a flat rows table), so those two alt-mode buttons and their scale `<select>`
  are hidden for Aura by `selectBrand()` rather than left showing an empty, non-functional dropdown.
  **This was caught by the first live click-through, not by static review**: the initial version
  threw inside `populateScaleOptions()` the moment "Ice / Figure" was selected, because it iterated
  `b.columns` with no guard for a brand that has none — the throw happened before `show(measurePanel)`
  ever ran, so the whole Ice branch silently never opened. Fixed with an `Array.isArray(b.columns)`
  guard in both `populateScaleOptions()` and `selectBrand()`.
- **A vacuity trap in this task's OWN verify group, caught and fixed before landing:** the WhatsApp
  href assertion originally checked `decoded.includes("8")` against the WHOLE decoded href,
  including the base `https://wa.me/27823706771` — which already contains an "8" from the phone
  number. Negative control (c) (deleting the result from the composed message) still printed PASS
  under that assertion. Fixed to check the decoded `text=` query parameter alone, for the full
  `"US SIZE 8"`/`"UK SIZE 6"` substrings, never a bare digit against the whole href.
- **No new `data-illustrative` chips (§8).** The six size tables are Mel's own published data
  (decision #505); the honesty on this screen lives in copy — the no-table handoff, the
  out-of-range fallback, the Brannock disclosure note — not in a "proposed" stamp.
- **`site.css` gained spacing rules only** (`## 13. Size Finder`) — every interactive control on
  this page (`.btn`, `.input`, `.select`) already cleared the 44 px tap-target floor via `--tap`
  before this task touched anything.

### T16 review — adjudicated findings (amended into the T16 commit)

**Main-session re-verify, after the five lenses and the adjudicating fixer (rulings #605/#606).**
The five verify lenses and the fixer all passed the amended tree. An independent main-session pass
— pure-Node controls against the committed blobs in an isolated copy, plus a browser drive written
from a fresh reading of `sizes.json`'s tables rather than from the spine — confirmed the sizing
logic (54,945 `whichSky` cases, 234 `findSize` brand x input combinations, 19 hand-derived table
literals, all clean) and **found one defect all six agents missed**:

- **A BLANK measurement box is not a measurement of zero (#606).** `Number("")` is `0` and `0` is
  finite, so the `Number.isFinite` guard never fired on an empty field. Clicking **Find my size**
  before typing anything rendered a real out-of-range answer — *"Outside our table … the message
  already has your measurement in it"* — and composed a WhatsApp message to Melony reading
  **"my foot measures 0 mm"**, or on the Ice branch **"my foot measures 0 mm, I weigh 0 kg"**.
  This is the same class as the false-claim blocker the fixer *did* fix in the static Kids panel;
  the fixer's refutation reasoned that "the genuinely-true dynamic usage for real out-of-range
  results elsewhere is untouched", and that premise was simply wrong for an empty input.
  **Fixed** by a `hasValue()` guard checked *ahead* of `Number()` on both branches, whitespace
  included. Negative control (b) demonstrated all four assertions failing on the revert.

**The standing lesson, and why the main-session pass exists at all:** five independent lenses plus
an adjudicating fixer, all instructed to hunt vacuity, drove the finder only with values a
developer would type. None of them clicked the primary CTA with the form empty. **A verify pass
that only ever supplies valid input cannot find an input-validation defect.**


Five review lenses reported on the commit above; here is what each finding turned into.

- **FIXED (blocker) — ruling #600's disclosure obligation was never discharged on the page.**
  The word "Brannock" appeared zero times in `size-finder.html`; the disclosure existed only in
  `finder.js`'s source comments, which no skater ever reads. #600's own text is "the Aura branch
  STATES PLAINLY", not "the source code states plainly". Fixed by rendering the fixture's own
  words (`sizes.json`'s `aura.fittingRules` entry keyed `suggested-not-raw`, resolved, never
  retyped) plus the #600 framing sentence in the Which Sky? step, in a
  `[data-finder-sky-brannock]` paragraph. Reproduced live: sabotaging the generator to emit an
  empty element drove GROUP 5 to FAIL on the new static-HTML assertion; restoring by file copy
  returned it to PASS (both transcripts are in this task's return).
- **FIXED (blocker) — Atom lookups rendered the literal word "null" to the skater and into the
  WhatsApp message.** `findTableBrand()`'s `scales` mapped every column in `brand.columns`
  unconditionally; 13 of Atom's 19 rows have a null `usUnisexWider` cell (no unisex-wider option
  at that length), so a majority of Atom results read "Size US Unisex (wider) | null" on screen
  and in the message sent to Melony — a #540/#603(3) violation (a null cell is a scale that row
  does not carry). Fixed by filtering `matched[col] !== null && matched[col] !== undefined`
  before mapping. Reproduced live: restoring the unfiltered map drove GROUP 5 to FAIL (5 rendered
  rows instead of 4, and the literal word "null" in the decoded WhatsApp text); restoring the
  filter by file copy returned it to PASS.
- **FIXED (blocker) — the Kids & adjustable handoff falsely claimed a measurement was "already in"
  the WhatsApp message.** `selectDiscipline("kids")` reveals the same static
  `[data-finder-fallback]` block used (in the shipped architecture) *only* by that branch — the
  real out-of-range/unknown-brand results from `findSize()` render into `[data-finder-result]` at
  runtime via a separate, genuinely-true dataset attribute. Kids collects no measurement at all
  before showing this panel, so the baked sentence "Not a dead end: the message already has your
  measurement in it" was false every time this panel was ever reachable. Fixed by dropping that
  one sentence from the static block (the dynamic, correctly-true usage is untouched). Reproduced
  live: restoring the sentence drove GROUP 5 to FAIL on both the static-HTML check and a
  browser-driven check of the panel's rendered text; restoring by file copy returned it to PASS.
- **FIXED (minor) — a stale fixture-index citation in `findAura()`'s own comment.** It cited Aura's
  forbidden +5 mm Comfort-Fit step as `fittingRules[6]`; measured on disk, index 6 is
  `width-from-size` (no millimetre figure at all) and index 5 is `length-high-performance` (the
  actual +5 mm rule). Fixed to cite `fittingRules[5]` and both rules' stable `key`s, so a future
  reordering of the array cannot make the comment wrong again the same way.
- **FIXED (minor) — a reverse lookup (shoe size, or a skate already owned) was described to Melony
  as a foot measurement.** `describeInput()` always fed the sentence stem "my foot measures", so a
  UK-size reverse lookup composed "Hi Melony, my foot measures UK SIZE 7" — pooling a shoe size
  into a length claim it never was. Fixed by having `describeInput()` return a `{stem, phrase}`
  pair: "my foot measures 255 mm" for an `{mm}` input, "I gave the Size Finder UK SIZE 7" for a
  reverse lookup.
- **REFUTED (two minors) — the CTA/`disciplinePickerLabel`-style structural literals
  ("Scale"/"Size"/"Body weight (kg)"/"Find my size") lacking a `_meta.refConvention` comment.**
  Correct that no comment justified them the way `DISCIPLINES` justifies its own four labels; the
  suggested fix of templating "Find my size" from `draft-copy.json`'s `home.ctaPrimary` was
  **not** taken — that field's job (navigate to this page) differs from this button's (submit the
  measure step), and coupling two unrelated calls to action for a coincidentally-identical string
  is more fragile than the drift it claims to prevent. Instead, a comment was added next to each
  literal stating the same structural-label rationale `DISCIPLINES` already carries.
- **ESCALATED, not fixed — Aura's raw-mm-to-published-step rounding direction.** `findAura()`
  rounds a raw measurement to the NEAREST published 5 mm step, which rounds down on roughly half
  of all inputs (e.g. 252 mm reads the 250 mm row); the five flat-table brands round UP instead,
  on an explicit "a boot must be at least as long as the foot" rationale stated in their own
  comment. No ruling in brief §15 specifies a direction for Aura's snap-to-grid step specifically
  — #600 only forbids adding the +5 mm Comfort-Fit step, which this is not. Nearest-rounding is
  arguably *more* consistent with Aura's own "designed to fit Very Snug prior to heat moulding"
  philosophy (`fittingRules[10]`) than the flat-table brands' oversize-biased rule; the counter-
  argument is that it is the only one of the six branches where the mapping can under-read the
  measured foot at all. This is a domain fit-safety judgment call, not a measurable fact, so it is
  left for an owner ruling rather than resolved unilaterally.

## T17 — Book a fitting: findings

**Rulings applied:** #607 (CTA always a valid `wa.me` link, emptiness = `String(v).trim() !== ""`
before any coercion, duration/price never enter the message), #608 (five controls, notes ships),
#609/#616 (the R850 collision sentence, verbatim), #610 (day constrained to Wed-Sun, time hint
carries the fixture's window string), #611 (AC2 folds into group 2), #612 (CP5 reworded to stop
counting), #613 (`assets/booking.js` is a new module), #614 (`CHIPS_COMPLETE=1` on every T17 spine
run), #615 (per-type `bring` renders on every card, alongside the unified intake block), #617 (the
message template, authored, four optional sentences).

- **`hasValue()` was promoted out of `finder.js` into `site.js`**, exported, and `finder.js` now
  imports it rather than keeping a second copy — the identical rule `booking.js` needed, and
  `_meta.refConvention` forbids two hand-typed copies of the same guard.
- **`composeBookingMessage(fields)` is pure** (no DOM, no globals) and is driven against all
  seventeen of the build brief's degenerate-input acceptance criteria in plain Node (14 hand-typed
  literal-expectation cases plus 4 structural checks -- cases 13, 15, 16 and 17 -- so 18 assertions
  against a floor of 17), then proved against the REAL rendered CTA href in the browser for 4
  of those cases (first paint, day-only, name-only, type-only) — the pure function alone proves
  nothing about what the page actually does; the browser assertions are what close that gap
  (build brief §8, trap 11).
- **The generator bakes the CTA's initial href from the same pure functions the page runs at
  runtime** (`composeBookingMessage`/`buildWhatsAppLink`, imported into
  `scripts/gen-book-a-fitting.mjs` at generation time), rather than a second hand-typed copy of
  either — so the href is already a valid, non-empty `wa.me` link at first paint, before
  `booking.js` has even finished loading, satisfying case 17 robustly rather than by a JS-timing
  race.
- **AC2 lands in group 2, not a new group 12** (#611). The static scan (part a) strips comments
  before matching — `finder.js:14`/`:18`'s truthful comments containing the substring `fetch(` are
  correctly NOT flagged (the #599 class: a grep that matches comment text is a defective grep) —
  and scans all five built pages plus every file under `assets/`. The click-and-watch half (part b)
  opens its own fresh context, navigates, arms its request listener AFTER `goto`, then clicks the
  real submit CTA and asserts zero new requests on the original page (the CTA's `target="_blank"`
  click opens a popup on a SEPARATE page object, which is closed immediately and never counted).
  **Self-evasion attempt (§9a):** a click handler doing `window['fetch']('/x', { method: 'POST' })`
  contains no literal `fetch(` or `method="post"` substring and evades the static scan cleanly (0
  hits) — but the click-and-watch half still catches it (1 new request observed), which is exactly
  why AC2 needs both halves, not the static scan alone.
- **Discrepancy filed (#531):** the brief states the day-select hint shows "that day's window,
  sourced from the fixture." Measured: `contact.json#hours.detail` is ONE combined string spanning
  the whole Wed-Sun range ("Wed 12:00-18:00 through Sun 09:30-16:00") — there is no per-day
  granular fixture to resolve five distinct windows from. The hint therefore shows that same
  fixture string verbatim regardless of which day is selected; inventing five separate per-day
  windows the fixture does not carry would itself be a `_meta.refConvention`/#540 violation.
- **Discrepancy filed (#531):** brief §12 prohibits "introduc[ing] any new outbound URL," citing the
  link budget as spent at exactly 12 hrefs / 5 external distinct. Measured after this task:
  book-a-fitting now renders 13 hrefs / 11 distinct / 6 external distinct — group 3's
  `HREF_COUNT_FLOOR` is a MINIMUM, not a ceiling, and still passes. Read literally, the prohibition
  would make the ticket's own primary deliverable (a `wa.me` CTA, #607) impossible; the only
  consistent reading is "no new external DESTINATION HOST," and the one href added targets `wa.me`,
  already used elsewhere on this page and site.
- **CSS: zero new rules were needed.** `.field`/`.select`/`.textarea`/`.card`/`.u-stack` and the
  generic `[data-illustrative]::after` chip rule (§16) all applied with no changes. No section 19
  was added. `site.css`'s duplicate section-13 heading (`Live regions` at :785, `Size Finder (task
  16)` at :1071) is left exactly as T16 shipped it (build brief §2.4) — comment-only debt, smallest
  diff, not this task's scope.
- **The three new chips** (`fitting-durations`, `fitting-prices`, `cancellation-policy`) take group
  11's observed set from 6 to 9, matching FROZEN_NINE exactly under `CHIPS_COMPLETE=1` (`B: 9 chip
  id(s) observed across 5 pages`).

### T17 review — adjudicated findings (six lenses, this fix pass)

Six lenses reviewed the T17 commit; two filed `rework` with genuine blockers. Confirmed and fixed:

- **BLOCKER — `composeBookingMessage()`/`BOOKING_DAYS` were never imported or driven by the spine.**
  The commit's own report claimed "19 assertions against a floor of 17" and "4 browser assertions,"
  but `scripts/verify-mels-demo.mjs` never imported `booking.js` at all — that coverage existed only
  in an ephemeral, uncommitted script. Fixed: group 2 now statically imports `composeBookingMessage`
  and `BOOKING_DAYS`, drives 14 hand-typed LITERAL cases (never composed with the function's own
  template logic — the sharpest named trap) plus static-HTML checks on the baked page and 4 browser
  assertions comparing the real rendered CTA href to the pure function's output. Proven by
  negative control: swapping the function body for a constant string now correctly fails 17 of the
  new assertions; restored by file copy.
- **BLOCKER — AC2(a)'s comment stripper truncated at the first `//` on a line with no
  string-literal awareness**, so `const u = \`https://wa.me/x\`; fetch(...)` stripped to
  `` const u = `https: `` and evaded the scan with 0 hits — a defect distinct from, and not caught
  by, the `window['fetch']` evasion the original commit tested. Fixed: `ac2StripComments` now walks
  the source tracking quote/template state so a `//` inside a string is never treated as a comment
  start. Proven live: the same evasion now correctly surfaces a `fetch(` hit; the genuine `finder.js`
  comments at :14/:18 are still correctly stripped (unaffected).
- **MAJOR — the R850 collision paragraph (#609/#616) carried no `data-illustrative` chip**, unlike
  every other illustrative number on the page (§6.0). Fixed at the generator: the paragraph now
  carries `data-illustrative="fitting-prices"` (the string is unchanged, byte-identical to #616).
- **MAJOR — ruling #614 ("every T17 spine invocation ... runs `CHIPS_COMPLETE=1`") was applied only
  to CP5's own bullet and to `--only=2` (where group 11 is not selected and the flag is a no-op),
  never to Task 17's own full-spine verification bullet.** Fixed: `plan.md`'s full-spine bullet now
  carries the flag.
- **MAJOR — the #612 numeral sweep missed `todo.md:41`**, the CP5 checkpoint's own line ("eleven
  groups pass"), while correctly fixing `todo.md:61` (a different, later bullet). Fixed: reworded to
  "every group passes," matching `plan.md`'s CP5 wording.
- **MINOR, fixed:** the day/time hint's source was `contact.json#hours.detail`; ruling #610's own
  text pins `fittings.json` (both fixtures carry the byte-identical string today, so this was
  invisible in the rendered output, but the two could silently drift). Now sourced from
  `fittings.json#availability.detail`.
- **MINOR, fixed:** the two placeholder `<option>` labels ("Choose a fitting"/"Choose a day") carry
  no fixture source anywhere in `draft-copy.json` — the only invented copy in the package. Left as
  is (deleting them would break the form's usability and no ruling covers it) but now carry an
  inline comment naming them as structural, generator-authored labels, same precedent as
  `size-finder.html`'s hand-authored "Scale"/"Size" labels.
- **MINOR, fixed:** AC2(b)'s settle window widened 500ms → 1500ms so a beacon deliberately delayed
  past the old window would still be observed.
- **Refuted / correctly out of scope for the fix pass:** the issue-#36 body text still counting
  "eleven PASS lines"/"six negative controls" is real (confirmed) but that pass's own harness rules
  prohibited editing GitHub issues from it — the reworded body the original commit drafted was the
  correct artifact to hand the owner. **Applied in the completeness-critic rework below (#619).** `todo.md:29-30`, `plan.md:346` (historical
  checkpoints, accurate at their own point in the epic) and `docs/specs/mels-skate-shop-pitch.md:268`
  (edits to the spec are explicitly prohibited) were re-checked and correctly left alone.

### T17 rework — the opus completeness critic, after the fixer

A seventh pass read the fixed commit against the build brief rather than against the diff, and
returned `rework`. **The page itself was not the problem**: the critic clicked the primary CTA on a
completely empty form, read the real destination
(`https://api.whatsapp.com/send/?phone=27823706771&text=Hi+Melony%2C+I%27d+like+to+book+a+fitting.`),
found no price or duration in any composed message and no T16-class "my foot measures 0 mm"
sentence, and its verdict on the rendered screen was *"the page is honest and I would show it to
Melony."* **Every item below is about a gate that keeps that true, or a document that describes it.**

- **BLOCKER — the AC2(a) static scan failed OPEN on regex literals.** The quote-aware walk the
  previous pass added handled `${...}` interpolation and said so in a comment, **but said nothing
  about regexes and did not handle them**, so the comment told the next reader the scanner saw more
  than it did. A regex containing a quote — `const re = /won't/;` — flipped the walker into string
  state at the apostrophe; state stayed open until the next quote character in the file, leaving the
  remainder of that unrelated string literal *outside* quote state, where its `https://` read as a
  line comment and the rest of the line was discarded unscanned. **Measured before the fix:** that
  source stripped to exactly `const re = /won't/;\nconst u = 'https:` — the `fetch(` gone — and
  scanned to **0** hits. **After:** it survives intact and scans to **1** hit. The walk now
  recognises regex literals by the standard previous-significant-token heuristic and emits them
  whole, so an AC2 pattern written inside a regex is still scanned.
- **BLOCKER — the scan's own header comment was false.** It claimed the scan ran "against a
  deliberately evaded copy"; nothing of the kind existed in the tree. Rather than delete the claim,
  `AC2_EVASION_FIXTURES` now makes it true: both evasions that have actually been demonstrated
  against this scanner are re-measured on every run, each a regression test for the fix that closed
  it.
- **BLOCKER — the day-option gate was a two-string blacklist, not set-equality.** It caught exactly
  the Monday/Tuesday sabotage the adversary happened to run and **passed silently if four of the
  five bookable days were deleted**, while the DOM's option set was compared to `BOOKING_DAYS`
  nowhere. Fixed: the day select's baked `<option>` values are parsed out of the HTML and asserted
  as **ordered equality** against `[""] + BOOKING_DAYS`, count printed.
- **MAJOR — a filed finding was neither applied nor refuted; it vanished.** `filesScanned` was
  printed but never asserted, so the scan could cover **zero** JS files and still print PASS. Fixed:
  `AC2_FILES_FLOOR` = 9 (5 built pages + 4 `assets/*.js`), mirroring `CTA_COUNT_FLOOR` and
  `HREF_COUNT_FLOOR`.
- **MAJOR — AC2(b) covered one page and one click.** AC2's claim is that nothing is posted
  *anywhere*; a beacon firing on load, on scroll, or on any of the other five pages was outside what
  a post-click window can see. Fixed (the AC2 lens's second recommendation, dropped without comment
  by the fixer): a request listener is armed **before `goto` on all six pages** and asserts zero
  `fetch`/`xhr`/`websocket`/`eventsource` for the whole page lifecycle, with a floor on the number of
  requests observed so a dead listener cannot pass vacuously.
- **MAJOR — a false comment shipped in a file this commit created, the sixth consecutive task.**
  `booking.js`'s tail said `gen-book-a-fitting.mjs` does not import it; that generator imports
  `composeBookingMessage` and `BOOKING_DAYS` at its line 30, and **its own comment there calls that
  import "part of the purity proof."** Two files in one commit contradicted each other about the
  same fact, and this one was **false when it was typed, not stale**. It passed the builder's own
  named sweep gate and three lenses that spot-checked the file. Fixed in `booking.js`.
- **MAJOR — this document shipped two different counts of the same thing, forty lines apart.** One
  said "19 assertions against a floor of 17", the other "18 hand-typed literal cases"; a third count
  lived in group 2's own title ("17+ literal cases"). **Measured ground truth:
  `BOOKING_LITERAL_CASES` holds 14 entries and `bookingPurityChecks` adds 4 structural checks (cases
  13, 15, 16, 17), so `asserted` is 18 against a floor of 17.** All three sites now say that.
- **MINOR — group 11's assertion D proved nothing about the two chips hosted on paragraphs**,
  including the one the previous pass added: it measures the *host's* box, and a paragraph has a box
  with or without its pill. Fixed as **assertion D2**: for every non-inline chip host, clone it,
  strip `data-illustrative` from the clone, size both copies by their own content off-screen, and
  require the chipped copy to be wider by the same floor probe C uses.

One more finding came from running the main-session re-verify control (#553) for the first time —
it was authored **before** the build landed, so its expected strings are independent literals rather
than anything derived from the implementation. It failed four probes on **case 7**: it fed the
placeholder's *label* to `composeBookingMessage` as a type *value* and expected the function to
recognise it. **Measured: that state is unreachable through the page** — the type select's
placeholder is `<option value="">Choose a fitting</option>`, so the select yields `""` and the
bare-intent sentence. The premise was wrong in the same shape #610's was, and is corrected the same
way rather than by teaching the pure function a blacklist of invented placeholder copy (three of the
four probes name strings that appear nowhere in this product, and such a blacklist would silently
drop a legitimate fitting type that happened to be named one of them — M3's own lesson). **The real
risk is the one the generator owns**: baking a placeholder whose value is its own label. Both
selects now assert structurally that the placeholder's value is empty, proven by negative control —
baking `value="Choose a fitting"` fails group 2 on four separate assertions.

Two owner rulings landed in the same pass. **#618** corrected #610's second clause: #610 chose "the
time field hints that day's window, both sourced from `fittings.json`, which already pins the
window", and **that premise was false** — no fixture gives any day its own window, only one combined
string. What shipped was a completely unconstrained `<input type="time">`, `min` and `max` both null,
so Wednesday + 08:00 composed into Melony's inbox four hours before the hint above it says she opens.
**No lens drove the time input in a browser at all.** The control now carries
`min="09:30" max="18:00"`, the union of the two published windows, derived in the generator from that
same combined string so the control cannot drift from the hint beside it, and asserted in the spine
as hand-typed literals. **#610's day axis is unchanged.** **#619** applied the reworded body to issue
#36 and added the matching "book a fitting through the request form" clause to CP5's owner
walkthrough — the fixer's escalation had told the owner that plan edit was already made, and it was
not.

**Standing lesson this pass bought: nobody reviews the adjudicating fixer.** It refuted three
findings, and one refutation buried a recurrence of #604; its escalation to the owner contained a
false claim about the tree. An opus completeness critic reading the brief rather than the diff, run
*after* the fixer, is the only thing that caught either.

## What T18+ inherits from Book a fitting (T17)

- **`assets/booking.js` is a fifth pure-plus-DOM module**, same shape as `site.js`, `pdp.js` and
  `finder.js`: `composeBookingMessage(fields)` and the exported `BOOKING_DAYS` constant are pure,
  `initBooking(root)` is guarded behind `typeof document !== "undefined"` at the file's tail. A
  later page that wants a WhatsApp-composing form imports `composeBookingMessage`/`buildWhatsAppLink`
  directly rather than writing a third message-builder.
- **`hasValue()` now lives in `site.js`, exported.** Any future control-gating logic imports it from
  there; do not reintroduce a file-local copy in a new page's module.
- **The six-screen demo is functionally complete.** Task 18 (Lighthouse + impeccable, measurement
  only) is next; it makes no code changes. Nothing under `DEMO/data/` changed this task — the
  fixtures remain exactly as task 7 authored them.
- **The link budget moved from 12 to 13 hrefs on book-a-fitting** (11 distinct, 6 external
  distinct) — a later task adding a link to this page should re-measure rather than assume the
  brief's old "spent at 12" figure still holds; `HREF_COUNT_FLOOR` in the spine is a floor, so this
  is headroom, not a ceiling breach.
- **Group 2's `title` and `task` now read `"T10+T17"`** — a future task extending group 2 again
  (there is no ruling against that; #611 only forbids a *new* group 12) should append to that same
  attribution string rather than overwrite it, so the printed table keeps naming every task that
  contributed coverage.

## What is still open for the owner

- **Aura's rounding direction — CLOSED by ruling #605, no longer open.** The T16 adjudication
  escalated this: `findAura()` snapped a raw foot measurement to the NEAREST published 5 mm row,
  which under-read the foot by up to 2.5 mm on roughly half of all inputs, while the five flat
  -table brands round UP on an explicit "a boot must be at least as long as the foot" rationale.
  **#605 ruled Aura matches the other five and rounds UP.** Two consequences the spine now pins as
  literals: a raw length above the published run is out-of-range (there is no higher row to snap
  up to, and clamping back down to 300 would hand back a skate shorter than the foot), and a raw
  length just below the run still answers 210, which is still a snap up. Swept: no raw length in
  210-300 mm answers a shorter row. Negative controls (a) and (c) demonstrated both directions.


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
- **Aura's raw-mm-to-published-step rounding direction (T16 adjudication).** `findAura()` snaps a
  raw measurement to the NEAREST published 5 mm row; the five flat-table brands round UP instead,
  on an explicit boot-must-be-at-least-as-long-as-the-foot rationale. No ruling specifies a
  direction for Aura's snap-to-grid step itself (#600 only forbids the separate +5 mm Comfort-Fit
  step). Nearest-rounding can under-read the measured foot by up to 2.5 mm; whether that is
  acceptable given Aura's own "fit Very Snug prior to heat moulding" design intent, or whether it
  should round up like the other five brands, is a domain fit-safety call for the owner, not a
  measurable fact this build can resolve on its own.

## T19 — image dimensions + lazy loading: findings

**Ruling applied:** #629 (the WebP re-encode/downscale lever is closed — raise it, do not touch a
byte). Scope input: T18's measurement-only pass (`~/handoffs/t18/t18-measurements.md`), not
re-derived here.

- **All 34 `<img>` across the five demo pages now carry explicit `width`/`height`**, read from
  `manifest.images[].width`/`.height` at generation time (never hand-typed). `height` did not
  previously exist on most of the manifest; this task added it to **26** of the manifest's 27
  `images[]` rows — `roll-line-listing.webp` already carried `height: 940` from an earlier task and
  was left untouched, so the diff is 26 insertions, not 27 — machine-derived with `sharp` (resolved
  via `createRequire` from `next`'s dependency
  tree, the `fetch-mels-fixtures.mjs:18` precedent — no new dependency). Every value was
  cross-checked against the shipped file's real pixel dimensions before being written; zero
  mismatches.
- **`loading="lazy"` on every below-the-fold image.** The two above-the-fold image FILES
  (`logo.webp` in the shared header, `aura-boot.webp` on the PDP — the PDP's LCP element),
  rendered as six eager `<img>` tags (the header repeats `logo.webp` on all five demo pages),
  carry no `loading` attribute (eager is the default; adding `loading="eager"` as decoration was
  deliberately skipped per the brief). The edit surface is the generators and
  `demo/.source/header.html` only — the five `.html` pages are never hand-edited (task 8's rule);
  regenerating all six is idempotent (verified byte-identical across three consecutive runs).
- **The four roller-derby hidden-card trap (§4a) held.** `product-7111`/`8159`/`9565`/`9656` render
  inside `<li hidden>` (out-of-stock, filtered by the default "In stock only" toggle) and measure
  `top=0`/`box=0x0` — not "above the fold," genuinely off-screen. All four get `loading="lazy"`
  like the other 11 grid cards; no special-casing was needed in the generator because the fold
  logic here is a flat rule (only the header logo and `aura-boot.webp` are eager — everything this
  generator emits is lazy unconditionally), not a derived top-position calculation that could have
  mis-classified them. A runtime check confirmed `naturalWidth`/`naturalHeight` match the baked
  attributes for these four only after clicking the real "In stock only" toggle to reveal them —
  while `hidden`, their images do not load at all (no layout box, so `loading="lazy"` never
  fires), which is the correct, real-visitor behavior, not a bug.
- **Discrepancy filed:** the brief's own gate 8 states the exact triple must be
  `TOTAL 34, sized=34, lazy=32`, and §4 frames it as "34 total minus the 2 eager." The shipped,
  measurement-faithful, group-4-compliant result is `lazy=28`, not 32, and 32 is unreachable under
  the brief's own constraints: the shared header block (holding `logo.webp`) is byte-identical
  across all five pages by construction (group 4, task 8's rule), so its `loading` attribute is
  necessarily uniform across all five — either all 5 header instances are eager or all 5 are lazy,
  never a mix. §4 itself states the logo measures `top=12`, above the fold, "on all five pages"
  — so keeping it eager (uniformly) is the only reading consistent with §1's "the two above-the-fold
  images stay eager" and with not lazy-loading a genuinely above-the-fold, always-visible header
  image. That gives 5 eager logo instances + 1 eager `aura-boot.webp` = 6 eager, 28 lazy. The only
  other internally-consistent option (logo lazy on all five) gives 33 lazy, not 32 either. 32 is
  simply arithmetically unreachable once the header's five-page repetition is accounted for — this
  reads as an oversight in the brief's own tally, not a fact to silently work around. Shipped with
  28, both because it is the only value the brief's other rules actually allow and because it is
  the one that does not lazy-load a real above-the-fold image.
- **Lighthouse mobile, no-slash URL: PDP holds or beats T18's baseline on its typical run. Home
  does NOT — its median across the three recorded runs is 94, under its 98 baseline — and the dip
  is not charged to this diff, on mechanical grounds set out below. Observed range Home 94–100,
  PDP 99–100 across repeated runs — not "every run" at 100.** Measured across several runs, not a
  single shot, after a rework pass found the first report's single clean run was not
  representative on this shared/noisy sandbox:
  - **Home:** a11y/bp pinned 100/100 across every run; performance is **flaky on this shared
    sandbox** — the three recorded runs gave 100/100/100, 94/100/100, 94/100/100, so the median is
    **94, four points under the 98/100/100 baseline**. Load average does NOT discriminate them:
    `uptime` sat at ~1.25–1.3 throughout all three (other sessions active on the same host,
    confirmed via `ps aux`), so the 100 and both 94s were measured under materially the same load
    and the earlier load-correlation reading does not survive its own data. LCP timing moved with
    the score (1.6s / 3.1s / 3.1s); what caused that is unexplained. **The dip is not charged to
    this diff on mechanical grounds, not statistical ones:** Home's LCP element is
    `<p class="lede">`, the hero text paragraph — present unchanged since before this task, not an
    image — and this task's diff only adds `width`/`height`/`loading` to `<img>` tags, which
    cannot move a text LCP; the one behavioral effect it can have (reserved layout boxes) only
    reduces CLS. Record the range AND the median, never the single best-case number. **Open for
    CP6:** three runs is a thin sample and the 94 is unexplained — re-measure on a genuinely quiet
    box before reading anything into Home's perf score either way.
  - **PDP:** typically **99/100/100** across repeated runs, **100/100/100** on a best run (not
    steady at the single 100/100/100 first reported) — still comfortably clear of the 95/100/100
    baseline. `aura-boot.webp` confirmed
    `eagerlyLoaded: true` (not lazy) on every run; `unsized-images` scores 1 (pass).
- **Group 10 payload, before (T18) → after (T19), cold load:** demo home 243,529 → 201,177 bytes;
  roller-derby 646,455 → 425,933 bytes; aura-sky-100 346,094 → 232,385 bytes; size-finder 87,481 →
  87,498 bytes (a few bytes up — its one image is the eager logo, no lazy savings available, and it
  now carries `width="586" height="360"`); book-a-fitting 76,154 → 76,172 bytes (same reason). All
  five stay clear of the 20,480-byte floor — that number is a measurement-sanity floor (it exists
  so a warm-cache read can never pass as a cold-load measurement), not a performance budget, so a
  larger multiple above it means a heavier page, not a better one. Stated as distance above that
  floor: book-a-fitting is **3.72x** (lightest page, closest to the floor) up to roller-derby at
  **20.80x** (heaviest page at 425,933 bytes, and the worst perf outcome of the five, not the
  widest margin) — home 9.82x, aura-sky-100 11.35x, size-finder 4.27x — not a uniform "4x to 5x."
  The brief's own §7 table's "after lazy (est.)"
  column was explicitly an estimate, not a measured fact like its other tables, and the real
  savings came in lower than it guessed (e.g. roller-derby shed ~221 KB, not the ~500 KB the
  estimate suggested) — real and worth having, just smaller than guessed; not raised as a
  discrepancy since the brief itself flagged that column as an estimate.
- **impeccable: same 18 findings, zero new** (10 low-contrast hover states, 7 cramped-padding, 1
  skipped heading) — none map to the image lever list.
- **CLOSED in-task under ruling #630 — the verify spine's zero regression protection for this
  task's own invariant.** Before this fix pass, `scripts/verify-mels-demo.mjs` was byte-identical
  to `ad38bf9` (empty diff) and asserted nothing on `width=`/`height=`/`loading=`; ruling #630
  ordered the gap closed inside this same commit rather than carried to CP6, overriding T19's named
  edit surface for this one file. (§2's table names `.source/header.html` plus the three page
  generators; `gen-shared-blocks.mjs` was also edited — 13 insertions, 1 deletion — because it
  stamps the shared header and had to fill the new `LOGO_WIDTH`/`LOGO_HEIGHT` placeholders. That is
  a consequence of the logo dimensions, not a second scope override, and is recorded in the commit
  body's edit-surface paragraph.) Group 9
  now asserts: the total/eager/lazy triple (34 / 6 / 28), the named per-page `<img>` counts (index 6,
  roller-derby 16, aura-sky-100 10, size-finder 1, book-a-fitting 1), that every `<img>`'s
  `width`/`height` attributes equal its decoded `naturalWidth`/`naturalHeight` (scrolled into view
  and awaited through `decode()` first, never read before that resolves), and eager/lazy identity
  by NAME — the six-tag eager allowlist (`logo.webp` × 5 + `aura-boot.webp`) and the four hidden
  roller-derby cards (`product-7111`/`8159`/`9565`/`9656`, asserted `loading="lazy"` by name, not
  inferred from their `0x0` rendered box while filtered out). `git diff ad38bf9 HEAD --
  scripts/verify-mels-demo.mjs` is now **211 insertions, 1 deletion**, not empty. Twelve sabotages across two
  negative controls proved every new assertion load-bearing — five at `92cad50`, then those same
  five plus two more at `26c8843`: stripped `width`/`height` (`product-2925.webp`), a transposed
  `width`/`height` pair (`product-5194.webp`), stripped `loading="lazy"` from a hidden card
  (`product-7111.webp`), a wrongly-lazy PDP hero (`aura-boot.webp`), a deleted `<img>`
  (`product-3726.webp`), and — added for the #632 pass — `loading="eager"` on the shared
  `logo.webp` (exercises the F2 fix) and an inline `width:2000px;max-width:none` over-width on a
  hidden card (exercises the F1 fix). Each turned group 9 RED — naming the exact file in every case but the
  deleted-`<img>` sabotage, which necessarily fails on the counts instead (roller-derby 15 not 16,
  total 33 not 34) because there is no tag left to name — with the tree restored byte-identical
  and re-verified clean after every one — see ruling #632's adjudication of
  this same fix pass below.

### The RAISE list for CP6 (fix none of it, carried forward from T18 plus four NEW items this task surfaced)

- `site.css` render-blocking (~600–700 ms), unminified CSS (46% waste) and unminified JS
  (`site.js` 76%, `pdp.js` 69%).
- No `preconnect` hints; longest chain 78 ms (home) / 91 ms (PDP).
- PDP LCP image (`aura-boot.webp`) lacks `fetchpriority="high"` — adjacent to the lever list, not
  on it.
- `label-content-name-mismatch` on the shared WhatsApp FAB: visible "WhatsApp us" vs
  `aria-label="WhatsApp Mel's Skate Shop"`. Zero-weight, a11y still scores 100.
- impeccable's 18 static findings (10 low-contrast hover states `#7e2810` on `#9e3315`, 1.0–1.3:1;
  7 cramped-padding; 1 skipped heading, roller-derby h1→h3) plus 3 distinct viewport-mode findings
  at 390×844. None map to the lever list.
- **NEW — the WebP downscale trade-off (#629).** T18 measured 109 KiB (Home, 4 of 6 flagged) /
  183 KiB (PDP, 9 of 10) of "waste" Lighthouse attributes to image re-encoding, but a `sharp` sweep
  at unchanged pixel dimensions over all 12 flagged files showed the shipped WebPs already sit
  between q80 and q90 — re-encoding at q90 GROWS all 12 of 12 (e.g. `product-10351` 46→53 KB,
  `aura-selection-chart` 81→92 KB, `logo` 30→34 KB); only a lower-quality double-compress or an
  actual pixel downscale would recover the bytes. Downscaling is a spec change: it touches
  `manifest.images[].width` (the encoded width, which verify group 9 asserts rendered ≤, and which
  `below_hero_floor` is derived from at `width < 800`), so dropping e.g. `product-10351` (800px) or
  `product-9656` (1200px) under 800px would silently flip a flag §2.5 ties to Mel's photography.
  Owner ruled "Skip it, raise it" (#629) before this task began.
- **NEW — four roller-derby cards ship `hidden` by default (§4a).** 215 KB (85+32+57+41 KB) of
  product imagery on roller-derby.html is invisible to Lighthouse (home + PDP only) and to
  impeccable (no dimension checks), because the cards sit behind the default "In stock only"
  filter. **Group 9's width check DOES reach them** — #632's F1 fix moved the
  `[data-derby-toggle]` click ahead of the `renderedWidth` capture (`verify-mels-demo.mjs:1128`
  vs `:1136`), all four now measure within manifest width for real, and the sabotage that forced
  `product-7111.webp` to 2000px turned group 9 red naming it. This task's fix (`loading="lazy"` on all 15 grid cards uniformly) already
  gets the right outcome for these four — they do not download on a cold visit unless a visitor
  actually reveals them — but the owner should know the same 215 KB would be invisible to any
  future audit that never clicks that toggle.

- **NEW — `aura-size-guide.webp`'s manifest row renders on no page, so its T19-added `height:
  1408` is verified by no gate.** `manifest.images[]` carries 27 rows; `aura-size-guide.webp` (a
  `duplicate_of` target of `aura-selection-chart.webp`, flagged since before this task) is not
  referenced by any `<img src>` on any of the five demo `.html` pages
  (`TOKENSAVE_DISABLE_GREP_HOOK=1 grep -rl aura-size-guide public/decks/mels-skate-shop/demo/*.html`
  returns nothing), so it is invisible to group 9's per-image width/height/natural-size check the
  same way the roller-derby cards above are invisible to Lighthouse — except these never render at
  all, not even behind a toggle. Ruling #632 raised this to CP6 rather than fixing it in T19's fix
  pass; filed here as the RAISE item itself (previously named only in the commit message, not
  written to this list). Either drop the row or add a fixture check that every `manifest.images[]`
  row matches a real file on disk (not that it renders — `duplicate_of` rows are deliberately kept
  unrendered).
- **NEW — `totalSizedCount` is reported in group 9's detail line but never asserted at group
  level, unlike `totalImgCount`/`totalEagerCount`/`totalLazyCount`.** `scripts/verify-mels-demo.mjs`
  already pushes a per-image failure the moment any `<img>` is missing its `width` or `height`
  attribute (`if (img.hasWidthAttr && img.hasHeightAttr) { totalSizedCount += 1 } else {
  failures.push(...) }`), so this is a symmetry gap, not a live defect — no dimension-missing image
  can pass silently today. Cosmetic: add a group-level `if (totalSizedCount !== TOTAL_IMG_COUNT)`
  check alongside the other three for consistency.

### T19 review — adjudicated findings (six lenses, this fix pass)

Six lenses reviewed the T19 commit; five said `ship`, one (the opus completeness critic) said
`rework` on a single major. Re-verified from scratch against a fresh `build && start`, not taken
on faith:

- **CONFIRMED as real, REFUTED as a defect in this commit — Home's Lighthouse performance score is
  flaky (94–100) on this shared sandbox.** Reproduced independently: 3 fresh runs gave 100, 94, 94
  while `uptime` load average sat at ~1.25–1.3 throughout (other Claude sessions active on the same
  host, confirmed via `ps aux`); a11y and bp held 100/100 in all 3. LCP timing moved with it
  (1.6s / 3.1s / 3.1s). The LCP element is `<p class="lede">` — hero body text, present unchanged
  since before this task — not an image; this task's diff only adds `width`/`height`/`loading` to
  `<img>` tags and cannot mechanically move a text LCP, and the one behavioral effect it can have
  (reserved layout boxes) only reduces CLS. **Not reworked as a code change** — the opus critic's
  own reclassification (minor/process, not major/blocker) is correct. Fixed instead: the T19 note
  above now records both figures as a range with the load-average context, not a single best-case
  number.
- **CONFIRMED — PDP's claimed 100/100/100 was the best of one run, not the typical result.**
  Reproduced: 2 fresh runs both landed at 99/100/100, still clear of the 95/100/100 baseline.
  Fixed: the note above now says 99/100/100, not 100/100/100.
- **CONFIRMED — before this pass, the verify spine (`scripts/verify-mels-demo.mjs`) had no
  assertion on `width=`, `height=`, or `loading=`.** At the time this was found:
  `TOKENSAVE_DISABLE_GREP_HOOK=1 grep -niE 'loading|lazy|getAttribute\("width"\)|getAttribute\("height"\)' scripts/verify-mels-demo.mjs`
  returned only two `errored loading page` error handlers (one in the link-crawl group, one in the
  chip-manifest group), nothing touching image attributes; `git diff ad38bf9 HEAD -- scripts/verify-mels-demo.mjs`
  was empty; group 9 (:1040–1140) checked alt text and `renderedWidth <= manifest width`, never
  attribute presence; group 8 (`groupMobileLayout`, :971) is the mobile-layout/tap-target group,
  unrelated to images despite sharing its number with this brief's own §10 checklist item 8. **Real
  gap, closed in-task under ruling #630** rather than raised to CP6 — see the closure bullet earlier
  in this section for what group 9 now asserts. The same grep against the shipped file now returns
  **38 lines** — 36 new group 9 lines (assertion bodies, the `EAGER_TOTAL`/`LAZY_TOTAL`
  constants, group 9's comment block and its `GROUPS` title string: `loadingAttr`, `getAttribute("width")`,
  `getAttribute("height")`, the `LAZY_TOTAL` constant, etc.) plus the same two pre-existing
  `errored loading page` handlers (`:1493` in `groupLinkCrawl`, `:2355` in `groupChipsManifest`)
  that were the grep's entire output at `ad38bf9` — and `git diff ad38bf9 HEAD -- scripts/verify-mels-demo.mjs` is 211 insertions / 1 deletion.
- **No other lens's finding required a code or markup change.** Coverage, generator-fidelity,
  regression and scope-cap all returned `ship` with no findings; their claims (image triple,
  dimension table, idempotency, byte-identical shared header, empty `.webp`/`package.json` diffs)
  were independently re-derived in this pass and matched exactly — see the re-run gate output in
  the T19 commit's evidence trail.
- **Ruling #632 — opus-critic pass on this fix pass's own execution, five of six findings fixed
  before this issue closed.** F1: group 9's `renderedWidth` capture ran before the "In stock only"
  toggle click, making the four hidden roller-derby cards' manifest-width comparison permanently
  vacuous (`0 > manifestWidth` is always false); fixed by moving the click first, re-measured, all
  four pass for real. F2: the must-be-eager check tested `!isEager` (only "not lazy") instead of
  `loadingAttr !== null`, so an image carrying an explicit `loading="eager"` on the shared header
  would have passed a regression silently; fixed to check `!== null`, proved live by temporarily
  adding `loading="eager"` to the logo and confirming the group turned red naming it on all five
  pages, then restoring byte-identical. F3 and F4 are the PDP-median and payload-margin wording
  already folded into this section's prose above; F6 is the "two image FILES rendered as six eager
  `<img>` tags" distinction, also already reflected above. F5, the sixth finding — the unused
  `aura-size-guide.webp` manifest row — was raised to CP6 rather than fixed here; see the RAISE
  list.

**Every gate in brief §10 was re-run from scratch for this pass** (not summarized from the earlier
report): six generators twice (idempotent, `git status --short` empty both times), all 11 verify
groups PASS with payload bytes matching to the exact byte, the 34 total / 34 sized / 28 lazy image triple (not 32 — see
the discrepancy above, re-confirmed), `impeccable detect` reporting the identical 18 findings plus
the same 1 advisory note with zero new findings, `npm run lint`/`build` green, and
`git diff ad38bf9 HEAD -- package.json package-lock.json` / `-- public/decks/mels-skate-shop/img/`
both empty.

**Do NOT re-raise** the `redirects` audit — T18 struck it (fires only on the plan's own
Lighthouse command's trailing-slash URL, `weight: 0` / `group: "hidden"`, cannot move the score);
this task's own Lighthouse runs used the no-slash URL throughout, keeping before/after comparable.
