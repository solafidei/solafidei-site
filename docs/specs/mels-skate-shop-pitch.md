# Spec: Mel's Skate Shop cold-pitch package (deck + clickable demo)

Status: APPROVED v2 (owner gate #486, 2026-09-14; §11 ruled #487–#493) · next gate: `tasks/plan.md` + `tasks/todo.md` reviewed by the owner before any build · critique folded (15 survivors + 4 extra facts, workflow `wf_77973e97-28a`) and fold-verified (workflow `wf_5d4ebefe-247`: 23 agents, 17 findings applied) · intent: `docs/intent/mels-skate-shop.md` · rulings: orchestrator decision log #476–#493 · evidence: `agentic-code-orchestrator/docs/research/mels-skate-shop/benchmark-report.md` (the "report") + `audit.json`

## 1. Objective

Build the package the owner uses to pitch Mel's Skate Shop (melsskateshop.co.za, Midrand) cold:

1. **The deck** at `/decks/mels-skate-shop` — 12 slides (≤ 14), one claim + one piece of evidence per slide, demo link and "R0 upfront" by slide 4, the retainer ask on slide 10 (rand figure a placeholder), "how we'll know it worked" on slide 11, next step on 12.
2. **The demo** at `/decks/mels-skate-shop/demo` — six screens Melony can tap through on her phone: Home · Roller Derby hub · Aura Sky 100 product page · Size Finder → WhatsApp · Book a fitting · canonical contact block on every page.

**Who:** the presenter (owner) and Melony (reads on a phone, cold, no context). **Why now:** research is done; the current site hides a verified moat and has five faults demonstrable in a minute. **Success:** the deck opens a conversation that lands a monthly retainer (R0 upfront, 12-month minimum, site + social bundled) for a Next.js storefront over her existing WooCommerce.

### Acceptance criteria

- The presenter can step through the deck on a laptop *and* a phone; every slide is legible at 390 px wide.
- Melony can, on a phone, browse Home → Derby hub → a product; get a size from the finder and tap into a pre-filled WhatsApp message; see named fitting types with durations; reach phone / WhatsApp / email / map / hours from every page.
- **No dead links anywhere.** Anything not built links to the matching live page on melsskateshop.co.za (tagged "live site") or to WhatsApp. Every outbound URL is fetched once by the fixture script and its status recorded (§7.3). This is the rule the deck criticises Mel's site for breaking; the demo must not break it.
- Every fact shown in the deck or demo traces to the report, `audit.json`, Mel's live site/Store API, or a manufacturer page — **or carries a visible "proposed" chip** (`data-illustrative`, §6.0). A facts manifest (`demo/data/manifest.json`) records the source of every number, claim, image and outbound link; the verify script asserts the chips and the manifest agree (§7.11).
- Nothing is sent anywhere: no forms post, no analytics, no third-party scripts. Booking and fit-check "submit" compose a WhatsApp or mailto link.

## 2. Assumptions (correct me now or these stand)

1. **The PDP is Store API id 11919 — "Aura Sky 100 Ice Skate Boot White"**, slug `aura-sky-100-ice-skate-boot`, R12,050, a size-less "simple" product, in stock, categories Ice Skates / White Ice Skates (verified live 2026-09-14). The Black record (id 11938) is a WooCommerce duplicate — slug `…-white-copy`, its only boot photo is the Sky 200's at 220 px — and is **not used**; the demo shows the white colourway and says so. "View on the live site" links to `/product/aura-sky-100-ice-skate-boot/` (HTTP 200 in `audit.json`). Mel's own PDP copy supplies the banner facts ("THESE SKATES MUST BE HEAT MOLDED … CONTACT 082 3706771", "imported specifically on order", "prices as of 30 July 2026").
2. **Aura sizing is in mm.** The PDP's second image (`Aura-selection-pdf.jpg`, 1088 × 1408) is Aura's **model-selection chart**: foot-length bands 210–240 / 240–265 / 265–280 / 280+ mm × body weight (22–36 … 81+ kg) × jump level (Singles … Triples/Quads) → Sky 50 / 100 / 200. Real, from Mel's own site; the finder's ice branch and the PDP use it. The per-size run *inside* a band is not published anywhere reachable (auraskates.com, Wix, exposes no sizing page — every guessed URL 404s), so the PDP's size buttons and their stock states are **illustrative structure with a "proposed" chip**.
3. **Roller Derby on Mel's site is category 120, 8 SKUs** (Riedell R3 sets, Chaya Ruby, Sure-Grip Rebel/Phoenix/Avanti, Riedell R3 Derby, a gift voucher). The hub grid shows those (minus the voucher) plus derby-relevant real SKUs from Sets (27), Wheels & Bearings (38) and Toe Stops (17), grouped by decision cards. Store API stock fields: the landed `products.json` carries four distinct `(is_purchasable, is_in_stock, stock_availability.text)` combinations across its 102 SKUs -- `(T,T,"")` x37, `(T,T,"In stock")` x27, `(T,F,"Out of stock")` x35, `(F,F,"Out of stock")` x3 -- so 64 are buyable and 38 are not, and `stock_availability.text` is **empty for 37 of the 64**. (Corrected by decision #511: this item previously claimed `is_in_stock` was true for every sampled SKU, which the landed fixture falsifies. The prescribed remedy was always right and is implemented.) The in-stock toggle therefore reads `is_purchasable && is_in_stock` and `stock_availability.text`, never the sampled boolean alone.
4. **Brand size tables on `/size-chart/` are images** — eleven brand tables per report L188 (Rio, Riedell, Sure-Grip, Atom, SFR, S1, Chaya, Powerslide, Playlife, Jackson, Destiny); the 2026-09-14 look found them served as images, not HTML. The finder's `sizes.json` is transcribed from whichever the fetch script finds (public) and cross-checked against the manufacturers' charts. All marked "demo data — confirm with Mel".
5. **Product images are downloaded once** (≤ 40 files, read-only, polite) into `demo/img/`, re-encoded to WebP ≤ 150 KB, credited in the footer ("Product imagery © Mel's Skate Shop, reproduced for this proposal"). Never hotlinked. **URL rule:** take the widest `srcset` candidate; if there is no srcset, strip any `-WxH` / `_WxH@2x` suffix from the uploads path to reach the original; the fetch script records the source pixel width of every file in `manifest.images[]`. **Hero floor:** a hero/gallery image should be ≥ 800 px source width; anything below is rendered at its source width (never upscaled), flagged `below_hero_floor` in the manifest, and the deck never uses that page's photography as an argument against Mel's. The Store API supplies `alt: ""` for 80 of 83 image objects, so alt text is hand-written in `demo/data/img-alt.json`, one entry per file.
6. **The deck is authored as a design canvas** (`design` skill). The LUX and Optimus decks are Claude Design **"Bundled Page" HTML exports** (`__bundler/*` markers, 11–18 MB) — an owner-side browser export, not something this pipeline produces. So: the build delivers the canvas; the owner exports it to `public/decks/mels-skate-shop/index.html`. Fallback = hand-authored HTML slides, §9 "ask first" (ruled #487).
7. **Shipping is two-tier and Mel's two pages disagree.** Homepage: **R100 Gauteng · R150 elsewhere · 1–3 days** (`audit.json` strengths; report L46). `/shipping-information/`: R100 JHB/PTA · R180 other. The demo shows the homepage figures everywhere (promise row, `contact.json`), sourced to the homepage in the manifest; the deck's slide 3 names the contradiction with both URLs; report §10 Mel-question 5 is the ask.
8. **Instalments:** PayJustNow is pay-in-3 at 0 % (report §7) but Mel's is **not onboarded** (report §10 developer-question 5), so the line is a proposal: "or 3 interest-free instalments of R4,016.67 — PayJustNow, once onboarded" with a "proposed" chip. `instalments(priceCents)` returns three cent amounts that sum exactly to the price (remainder on the first); the display shows the first. The report's "4 × R3,887" line is a pay-in-4 slip and is not reused.
9. **Address** Swallow Drive 20, Midrand 1686 comes from Roll-Line's dealer listing, not Mel's site (which publishes none). Shown, and flagged "confirm" in the manifest (ruled #489).
10. **Hours** are Mel's published **by-appointment** hours (Wed 12:00–18:00 … Sun 09:30–16:00, `audit.json`). The demo says "by appointment" and never "walk-ins welcome" (that line is Double Threat's practice, report L404, not Mel's). Phone +27 82 370 6771 → `tel:` and `https://wa.me/27823706771`; email melony@melsskateshop.co.za. Deep links only; nothing automated.
11. **Reviews:** Mel's has one public review (Facebook, Elizabeth de Lange, 2 Nov 2022). The demo quotes that one, plus the two verifiable credentials (Roll-Line dealer listing, Roadhouse "recommended shop"). **No invented reviews, ratings, follower counts or Lighthouse scores.**
12. **Fit Guarantee is a proposal, not a policy.** Report §5.9 wording is used as the draft terms and every mention carries the "proposed" chip (§6.0); the drafted terms are shown under the chip wherever the guarantee appears (ruled #493).
13. **Single light theme**, Mel's brand direction set in the design pass (impeccable `PRODUCT.md`). Not the Solafidei dark tokens. ≤ 2 self-hosted OFL font families.
14. **Roadhouse Roller Rink is at Eastgate, Bedfordview — not Midrand** (report §7). Any copy mentioning it says so.
15. **Live Store API facts used for counts** (verified 2026-09-14, `GET /wp-json/wc/store/v1/products/categories`): Roller Skates 98 · Artistic 48 · Recreational 71 · Adjustable 17 · Kids/smaller sizes 30 · Roller Derby (id 120) 8 · Ice Skates (id 98) 35 · Ice Blades (id 246) 2 · Ice Accessories 10 · Inline 28 · Sets 27 · Wheels & Bearings 38 · Toe Stops 17. Source in the manifest: `store:categories`. Both `/products` and `/products/categories` returned 200.

## 3. Tech stack

- Host: `solafidei-site` — Next.js 15 App Router, React 19, Tailwind 4, TypeScript. **Unchanged** except two rewrite lines in `next.config.ts`.
- Deck + demo: static files under `public/decks/mels-skate-shop/`. Demo = HTML5 + CSS custom properties + vanilla ES2020 modules. **No build step, no framework, no npm dependency, no CDN, no third-party script.**
- Data: JSON under `demo/data/`. `products.json` and the manifest's `images[]`/`links[]` are produced by one read-only fetch script; `sizes.json`, `fittings.json`, `contact.json`, `img-alt.json` and the manifest's `facts[]` are hand-authored in the copy pass. All committed.
- Verification: Playwright (already a devDependency) via a throwaway script in `scripts/`, per the repo's convention.

## 4. Commands

Run from `~/solafidei-site` (Node 24: `. ~/.nvm/nvm.sh && nvm use 24`).

```
npm run dev                                   # http://localhost:3000/decks/mels-skate-shop and /decks/mels-skate-shop/demo
npm run build && npm run start                # production check of the same URLs
npm run lint                                  # unaffected by static files; must still pass
node scripts/fetch-mels-fixtures.mjs          # one-shot read-only pull: Store API → demo/data/products.json + demo/img/*.webp (polite UA, ≤ 2 req/s); HEADs every outbound URL once → manifest.links[]
node scripts/verify-mels-demo.mjs             # Playwright assertions (section 7); needs the dev server
npx lighthouse http://localhost:3000/decks/mels-skate-shop/demo/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices --output=json --output-path=/tmp/lh-home.json
~/.claude/skills/impeccable/scripts/impeccable detect public/decks/mels-skate-shop/demo   # zero-token design-tell gate (decision #475); not on PATH; URL scans take --viewport 390x844
```

## 5. Project structure

```
public/decks/mels-skate-shop/
  index.html                      ← the deck (owner's Claude Design canvas export, ruled #487; hand-authored HTML only as the §9 "ask first" fallback)
  demo/
    index.html                    ← Home
    roller-derby.html             ← discipline hub
    aura-sky-100.html             ← product page
    size-finder.html              ← the tool
    book-a-fitting.html           ← on-domain booking
    assets/site.css               ← tokens + layout + components (incl. the "proposed" chip)
    assets/site.js                ← shared: in-stock toggle, WhatsApp link builder, floating WA button
    assets/finder.js              ← pure findSize() + whichSky() + page wiring
    assets/pdp.js                 ← size → stock/lead-time, service checkbox → total, instalments()
    assets/fonts/*.woff2
    data/products.json            ← from Store API (id, name, slug, permalink, price, images, categories, is_in_stock, is_purchasable, stock_availability)
    data/sizes.json               ← brand tables: cm → brand size (+ UK/EU/US columns); Aura = mm bands from the selection chart
    data/fittings.json            ← named fitting types, durations, prices (illustrative)
    data/contact.json             ← phone, WhatsApp, email, address, hours, socials, courier line (two-tier)
    data/img-alt.json             ← hand-written alt text per image file (the API supplies none)
    data/manifest.json            ← facts[] {id, text, source, flags?} · images[] {file, from, width, flags} · links[] {href, status, checkedAt}
                                    sources: "report L###" | "audit.json" | "store:<id>" | "store:categories" | "roll-line.it" | "illustrative" · flags: "confirm" = shown but Mel must confirm (address, spec-table values, mail-in heat-mould)
  img/*.webp                      ← product/gallery images + Mel's logo (`logo.webp`, ruled #492); all fetched once read-only, nothing hotlinked
scripts/fetch-mels-fixtures.mjs   ← read-only fetch + WebP re-encode + outbound-link check
scripts/verify-mels-demo.mjs      ← Playwright checks
docs/intent/mels-skate-shop.md    ← confirmed intent
docs/specs/mels-skate-shop-pitch.md ← this spec
next.config.ts                    ← + { "/decks/:deck/demo" → "/decks/:deck/demo/index.html" }, { "/decks/:deck/demo/:page" → "/decks/:deck/demo/:page.html" }
```

Clean URLs matter because the demo pretends to be a real site: `/decks/mels-skate-shop/demo/size-finder`, not `…/size-finder.html`.

**Shared contact block without a build step:** the block is duplicated verbatim in all five pages between `<!-- shared:contact -->` markers; the verify script asserts the five copies are byte-identical. (`// ponytail:` JS-injected partials would make the demo's own contact block client-rendered, contradicting the server-rendered promise the deck makes.)

## 6. Content spec — what each screen contains

Each screen backs a named report pitch angle (report §9). Copy that speaks as Melony is labelled `draft-copy` in the manifest (voice, not a promise — no chip).

### 6.0 The "proposed" chip — how promises Mel hasn't made are shown

Anything the demo shows that Mel has not published — Fit Guarantee (and its terms), PayJustNow instalments, fitting prices and durations, the cancellation policy, heat-mould prices, the illustrative Aura size run and its stock states, the demo buy button — carries `data-illustrative="<manifest id>"` on its element. `site.css` renders it as a small inline chip reading **proposed**. The manifest records the same id with `source: "illustrative"`. §7.11 asserts the two sets are identical. The chip is the honesty mechanism Melony can actually see; the manifest is the one the verify script reads.

### 6.0b Canonical header (every page)
One header duplicated verbatim between `<!-- shared:header -->` markers on all five pages (same byte-identical rule as §6.6): Mel's current logo (ruled #492 — fetched once by the fetch script from melsskateshop.co.za, saved as `img/logo.webp`, recorded in `manifest.images[]` with `from: "melsskateshop.co.za"`, alt "Mel's Skate Shop" in `img-alt.json`) linking to Home · Roller Derby · Size Finder · Book a fitting · WhatsApp. Every page can reach every other page from the header; no page is a dead end.

### 6.1 Home (`/demo`) — angles 2, 6, 7
1. **Promise row** (persistent, top): "R100 Gauteng · R150 elsewhere · 1–3 days" (homepage figures) · "Fit Guarantee" (chip) with the one-line terms beneath — "30 days, unworn outdoors · not on imported-to-order boots" — linking to the full terms on the PDP (ruled #493) · "Official Roll-Line dealer" (links to the saved Roll-Line listing screenshot, §6.7 slide 2 — the locator URL shows nothing without a query) · "WhatsApp us".
2. **Hero:** "South Africa's skate specialists since 2012. First roller derby shop in the country. Official Roll-Line dealer. Fitted by skaters, in Midrand, shipped everywhere." Roll-Line badge beside it. Primary CTA "Find my size", secondary "Book a fitting".
3. **Six discipline cards:** Roller Derby (→ hub, 8) · Artistic & Rhythm (48) · Recreational Quad (71) · Kids & Adjustable (17 adjustable · 30 in kids sizes) · Ice & Figure (35) · Inline (28) — counts from `store:categories`; the five unbuilt cards link to Mel's live category pages built as `/product-category/<slug>/` from the categories endpoint's `slug` (or its `link` field when present), tagged "live site", each checked by the fetch script (§7.3).
4. **Size Finder CTA band** — one sentence + button.
5. **In-stock hero products:** four real derby/rec SKUs from `products.json` with `is_purchasable && is_in_stock`; card = image, name, price, instalment line (chip), stock badge.
6. **Trust row (evidence, not adjectives):** Roll-Line dealer card (screenshot + link) · Roadhouse Roller Rink "Recommended shop" card (link, "Eastgate, Bedfordview") · the one real review, named and dated.
7. **Contact block** (6.6) + floating WhatsApp button on mobile.

### 6.2 Roller Derby hub (`/demo/roller-derby`) — angles 3, 11
1. **Five decision cards**: "Starting derby — complete sets" · "Upgrading — boots & plates" · "Wheels: rink vs tarmac" · "Protective sets (league-required)" · "Kids & smaller sizes". Each filters the grid (client-side; all cards stay in the DOM).
2. **Category copy** 60–120 words + **FAQ** (4 Qs: what size, which plate size for my boot, wheel hardness for Roadhouse vs tarmac, what a league kit list needs).
3. **Grid:** the 7 real derby SKUs + real protective/wheel/toe-stop SKUs (≈ 8), each card: image, name, price, instalment line (chip), **stock state from the Store API** ("In stock · ships in 1–3 days" / "Imported to order · ~N weeks" / "Sold out · notify me"), and an **"In stock only" toggle** defaulting on. A **result-count line** ("Showing N of 15") in an `aria-live="polite"` region, updated on every toggle/filter change — empty on first render, never pre-announced. Sold-out cards stay alive with "Tell us your deadline" → WhatsApp.
4. **Credential quote:** Roadhouse "Recommended shop"; league line: "Kit lists for Golden City Rollers, Durban Roller Derby, Cape Town Rollergirls, P-Town — coming in the build" (links to WhatsApp).
5. Links to the derby size guide (finder pre-set to Derby) and the buying guide (live-site link). Contact block.

### 6.3 Aura Sky 100 PDP (`/demo/aura-sky-100`) — angles 3, 5, 8, 10, 12
1. **Top banner:** "Imported to order · approx. 2 weeks (faster than almost every made-to-order boot we benchmarked — report L693) · price as of 30 Jul 2026 and may move with the exchange rate · size confirmed with you on WhatsApp before we order · no fit-based exchange on imported-to-order boots." (Mel's PDP facts; carve-out in report §5.9's wording; all from Mel's own PDP copy + report §8 ice-line flow).
2. **Gallery (verified for id 11919):** `Aura.jpg` — the white Sky 100, 562 px source, the widest Sky 100 photo on Mel's site; rendered at ≤ 562 CSS px, flagged `below_hero_floor` · the **Aura model-selection chart** (`Aura-selection-pdf.jpg`, 1088 × 1408) captioned "Which Sky? Aura's own selection chart" · the **Aura Size Guide 2026** image, which lives on the Sky 200 record (id 11941), captioned "Aura size guide — from the Sky 200 listing" and recorded as `from: store:11941` in the manifest · a labelled empty slot: "60-second fit video — filmed in the build". No Sky 200 boot photo is used anywhere on this page.
3. **Title** "Aura Sky 100 Ice Skate Boot — White" with a one-line note "also stocked in black" (the black record exists; its listing is a duplicate, so it is not linked).
4. **Price** R12,050 (rendered from `products.json`) → "or 3 interest-free instalments of R4,016.67 — PayJustNow, once onboarded" (chip).
5. **Fit Guarantee** beside the price (chip), with terms shown (ruled #493) — report §5.9 as draft: *"Mel's Fit Guarantee — if it doesn't fit, we exchange it. 30 days, unworn outdoors."* Three literal lines beneath: what qualifies (unworn outdoors, original box, guards unfitted) · who pays the courier each way · how to start (one WhatsApp message with the order number). Then the imported-boot carve-out in bold: **no fit-based exchange on custom or imported-to-order boots — size confirmed with us on WhatsApp before we order.**
6. **Size selector:** buttons for the illustrative mm run inside the selection chart's bands (chip on the fieldset legend; ruled #488); selecting one updates a line: "Size 240 · in stock in Midrand" / "Size 250 · imported to order, ~2 weeks" / "Size 265 · notify me". Measurements shown in the label. "Not sure? Find my size" link (finder pre-set to Ice/Aura, which runs the "Which Sky?" step first).
7. **Fit note in Melony's voice** (`draft-copy`).
8. **Spec table:** boot only (blade sold separately), heat-mouldable, level, stiffness — values marked "confirm" unless sourced from Aura.
9. **Service checkbox:** "Heat-mould & fit in store — R___" (a foot-in-boot custom mould — Mel's own PDP says she performs this) and "Mail-in heat-mould — R___ + courier" (a pre-ship bake; `confirm` flag — report §10 Mel-question 3 asks which she actually does) (chips); ticking updates a running total.
10. **Fulfilment line** under the buy button; the buy button carries the chip and opens a "Demo — cart & checkout land in month 1; order this boot on WhatsApp now" sheet with a WhatsApp CTA (no dead end; the label says what the button does, report §5.10 rule 2).
11. **Rail A — compatible parts:** the 2 real Ice Blades SKUs + real Ice Accessories (guards/soakers). **Rail B — price ladder:** Sky 50 R7,850 · **Sky 100 R12,050** · Sky 200 R15,550 (all real, `store:<id>`).
12. **3 Q&A pairs** (heat-mould: what it is; can I cancel; what if it doesn't fit — the last quotes the guarantee terms above).
13. **WhatsApp CTA** "Ask Melony about this boot" (prefilled with product + selected size). "View on the live site" → `/product/aura-sky-100-ice-skate-boot/`. Contact block.

### 6.4 Size Finder (`/demo/size-finder`) — angle 4
Single page, three steps on one screen, no wizard:
1. **What are you buying:** Derby / Recreational quad · Artistic · Ice / Figure · Kids & adjustable. (Ice implies Aura and adds one step — **"Which Sky?"**: foot-length band × body weight × jump level → Sky 50 / 100 / 200, straight from Aura's selection chart. Artistic implies Roll-Line. Brand picker only where Mel's stocks several: derby/rec → Riedell, Sure-Grip, Chaya, Rio.)
2. **How will you measure:** foot length in cm (inline heel-to-wall method, both feet, standing, use the larger) **or** current shoe size (UK / EU / US) **or** a skate you already own (brand + size).
3. **Output:** the size in that brand's own scale (Aura: mm band + model) + full conversion row (cm · UK · EU · US) + "brands vary by 1–2 sizes; this is a starting point" disclaimer + two CTAs: **"WhatsApp this result to Melony"** (prefilled: inputs + result) and **"Book a fitting"**.
- `findSize(brand, input)` and `whichSky(mm, kg, level)` are pure functions over `sizes.json`; out-of-range or unknown brand → "Outside our table — WhatsApp us your measurement" (never a dead end). Roll-Line: no table available → the tool says so and hands off to WhatsApp (honest about the report's finding).
- Works with keyboard; the result is announced via an `aria-live="polite"` region that is empty until a result exists — never a pre-rendered placeholder.

### 6.5 Book a fitting (`/demo/book-a-fitting`) — angle 6
1. **Named fitting types** (durations and prices illustrative, each with the chip; ruled #490): Quad fitting 30 min · Ice boot fitting + heat-mould 60 min · Kids fitting 20 min · Video consult 20 min.
2. **Pre-appointment intake block:** what to measure and bring.
3. **The three-step promise** (measure → try → adjust) · **cancellation policy** in plain text (chip) — draft: "Move or cancel a fitting up to 24 hours before, by WhatsApp, at no charge; after that the fitting fee is due." · "By appointment" + Mel's real hours. No "walk-ins welcome".
4. **Form:** type + preferred day/time + name → "Request via WhatsApp" composes a prefilled message (no backend). A one-line honest note: "In the build this is a live on-domain calendar."
5. Contact block.

### 6.6 Canonical contact block (every page)
Phone (`tel:`) · WhatsApp (`wa.me`) · email (`mailto:`) · address (Swallow Drive 20, Midrand 1686 — shown, flagged `confirm`, ruled #489) + "Open in Google Maps" / "Waze" links (no embedded map, no third-party script) · hours (by appointment) · Facebook link (facebook.com/melsskateshopofficial — **unconfirmed**: facebook.com and m.facebook.com bot-block scripts, `audit.json` issue 10; the owner opens it once in a real browser before the PR and ticks `manifest.links[]` `status: "manual-ok"`, otherwise it is dropped) · courier line "R100 Gauteng · R150 elsewhere · 1–3 days". Floating WhatsApp button on ≤ 768 px.

### 6.7 The deck (`/decks/mels-skate-shop`) — slide list
| # | Slide | Evidence on the slide |
|---|---|---|
| 1 | Cover — Mel's Skate Shop × Solafidei. One line answering "why did a stranger build this?": "I build storefronts for SA specialist retailers. I read 26 skate shops' websites before I picked yours — the next eleven slides are why." (draft copy) | exempt |
| 2 | The moat nobody can see | Roll-Line dealer listing (saved screenshot of the live locator result — the screenshot is what's linked; the locator URL goes in the footnote, since it shows nothing without a query) · Roadhouse "Recommended shop" (link) · "the only shop in SA covering ice + artistic + derby under one roof — Lino in Cape Town is the only real peer, and it's quads and rec only" (report §1, §7 L649) |
| 3 | Five things I'd fix in your first week — bigger shops ship the same bugs | **Headline:** a pre-rendered "No results" on a 430-product site — twin: SkatePro ships the same hidden placeholder on a 55-SKU category (report L14, L569); fix: server-rendered category pages. **Second:** booking hops off-domain to Koalendar — twin: Spotech routes booking to Naver Booking, one of 4 of 16 new teardowns that do the same (report L352); fix: on-domain booking. **Footnote, three more:** every social icon is `href="#"` — 7 on the homepage (3 Facebook, 3 Instagram, 1 Twitter; `audit.json` issue 1 grep — no peer twin: the report has none, so none is invented) · `/contact-us/` + `/book-an-appointment/` 404 (twin: ProSkaters Place 404s its own `/about-us`) · homepage R100/R150 vs `/shipping-information/` R100/R180 (twin: Willies shows "Sold out" and "Only 3 left!" on one page) |
| 4 | See it fixed — tap through six screens | The demo link as the primary tappable element · six small thumbnails · one line: "**R0 upfront** — the build is paid across the 12 months, not before it" |
| 5 | The lost sale | r/southafrica quote · sold-out accessories beside R12,050 boots · no waitlist (report L846) |
| 6 | I read 26 skate shops' websites, including your Cape Town competitor | ~140 shops surveyed (Appendix E, deduplicated from 165 raw entries), 26 torn down: size finder 2/26 · on-domain booking 2/26 · services as cart products · instalments everywhere overseas, nowhere in SA skate retail |
| 7 | The concept | positioning line — heritage (2012, first derby shop) · credentials (Roll-Line dealer) · service (fitting by a named person) (report L705) · six disciplines with `store:categories` counts (Derby 8 · Artistic 48 · Recreational 71 · Kids & Adjustable 17 + 30 · Ice 35 · Inline 28 — the six Home cards) · "answer which one and what size" |
| 8 | Demo: Size Finder → WhatsApp | hero screenshot + link · "2 of 26 shops have one" (report §5) — the leapfrog, so it leads |
| 9 | How it's built | Next.js storefront over your existing WooCommerce — you keep your admin and 430 products; PayFast + Courier Guy stay. **Why server-rendered:** SkatePro and Spotech ship category pages with zero product markup (report L806) — that is the "No results" bug at scale, and it cannot recur on pre-rendered pages. **Why this is not ProSkaters Place:** their headless-Woo rebuild left `/about-us` 404, dev subdomains crawlable and "- WooNuxt" in titles (report L318, L571); this build ships pre-rendered category pages, a 301 map for every existing URL, no template names in titles, and Woo stays the source of truth |
| 10 | How we work together | Monthly retainer: **R0 upfront · 12-month minimum · from R ______ / month** (the figure stays a placeholder, #484; "from" wording ruled #491a). **Why R0:** the build is paid across the 12 months. **What each month buys** (report §8 launch scope): month 1 — the five fixes, WhatsApp, the contact block, the derby hub; months 2–3 — Size Finder, on-domain booking, the Aura PDP pattern across the ice range; month 4 on — per-size stock truth and notify-me, service SKUs, reviews seeded then switched on; social posting every month. **What's yours:** "the site, the code and the domain are yours from day one." **The get-out:** "if the month-1 list isn't live by day 30, walk away owing nothing." (kept as worded, ruled #491b). **Tools included:** the ≈ R700–R1,550/month of third-party recurring tools (report L808) sits inside the retainer — one monthly number covers labour and tools, no pass-through line (ruled #491c) |
| 11 | How we'll know it worked | report L884 — measurable, none invented: enquiries by channel (WhatsApp / phone / email — no WhatsApp channel exists today) · service-SKU revenue (R0 today) · review count (1 today, from 2022) · notify-me captures (one ad-hoc line on one SKU today, report L287) |
| 12 | Next step | 30-minute call or shop visit · the tappable demo link, primary · QR secondary, labelled "for the laptop or printed copy" · presenter contact | exempt |

Rules: one claim + one piece of evidence per slide, source in a footnote; slides 1 and 12 are exempt; slide 3 carries one headline claim and demotes three faults to a footnote; no two criticism slides run back to back. **Omit** anything the report flags as unverified (§10): Lighthouse scores, Google Business Profile ratings, Instagram/TikTok figures, Figure Skating Boutique's club %, Willies' heat-mould pricing. PayJustNow/Ozow shown as "once onboarded". The five faults on slide 3 are the same five the demo's Home, hub, booking page and contact block fix.

## 7. Testing strategy

`solafidei-site` has no test suite; verification is a throwaway Playwright script, per the repo convention. `scripts/verify-mels-demo.mjs` (run against `npm run dev`) asserts eleven groups:

1. Deck + all six demo clean URLs return 200 (rewrites work); `.html` paths also 200.
2. Zero console errors or warnings on every page.
3. Every `href` on every demo page resolves: internal → 200 live; external → host on the allow-list (melsskateshop.co.za, roll-line.it, roadhouserollerrink.co.za, facebook.com, wa.me, maps.google.com, waze.com, mailto:, tel:) **and** present in `manifest.links[]` with `status: 200` and a `checkedAt` date written by `fetch-mels-fixtures.mjs` (which HEADs each outbound URL once, GET on 405, and fails its run on any non-200) — or `status: "manual-ok"` for the Facebook URL after the owner has opened it. `wa.me`, `mailto:`, `tel:` are exempt from the fetch.
4. The `<!-- shared:contact -->` block is byte-identical across the five pages.
5. `findSize()` fixtures: ≥ 3 known inputs → expected sizes per brand; `whichSky()` fixtures: one input per band; an out-of-range input → the WhatsApp fallback; the WhatsApp href contains the URL-encoded result.
6. PDP: selecting each size updates the availability line; ticking the service checkbox changes the total; `instalments(1205000)` returns three cent amounts that sum to exactly 1205000 and the displayed instalment equals the first; the static price equals `products.json` for id 11919.
7. Derby hub: "In stock only" hides every card that is not `is_purchasable && is_in_stock`; the filter cards narrow the grid; the "Showing N of M" region updates and is empty on first render; all cards remain in the DOM.
8. Mobile 390 × 844: `document.scrollWidth <= innerWidth` on every page; tap targets ≥ 44 px on primary CTAs.
9. Every `<img>` has non-empty `alt` matching `img-alt.json`; no `<img>` renders wider than its `manifest.images[].width`; exactly one `<h1>` per page; `<meta name="robots" content="noindex">` on deck and demo.
10. Payload: each demo page ≤ 1.5 MB transferred on first load.
11. **Chips ↔ manifest:** the set of `data-illustrative` ids across the five pages equals the set of `manifest.facts[]` ids with `source: "illustrative"`; every chip element is visible (not `hidden`, non-zero box) at 390 px.

Also, before the PR: Lighthouse mobile on Home and PDP — **performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95** (scores pasted into the PR); `impeccable detect` on the demo directory with zero error-level findings (or a note that the CLI was unavailable); `npm run lint` and `npm run build` green; the manifest has zero entries without a source; owner walkthrough on a phone.

## 8. Code style

Static, boring, honest. One snippet shows the conventions:

```html
<!-- aura-sky-100.html — product page; data-* carries state, JS only enhances -->
<section class="pdp" data-product="11919" data-price="1205000">
  <h1 class="pdp__title">Aura Sky 100 Ice Skate Boot — White</h1>
  <p class="pdp__price">
    <span class="price" data-role="price">R12,050</span>
    <span class="price__instalment" data-role="instalment" data-illustrative="pjn-instalments">
      or 3 interest-free instalments of R4,016.67 <small>PayJustNow, once onboarded</small>
    </span>
  </p>
  <p class="fit-guarantee" data-illustrative="fit-guarantee">
    Mel's Fit Guarantee — if it doesn't fit, we exchange it. 30 days, unworn outdoors.
    <strong>No fit-based exchange on imported-to-order boots — size confirmed on WhatsApp before we order.</strong>
  </p>
  <fieldset class="sizes" data-role="sizes">
    <legend>Size (mm)</legend>   <!-- no chip: the mm run and its width grid are Aura's own published data (#505) -->
    <button type="button" class="size" data-size="240" data-state="in_stock">240 <small>UK 6</small></button>
    <button type="button" class="size" data-size="250" data-state="lead_time" data-weeks="2">250 <small>UK 7</small></button>
  </fieldset>
  <p class="availability">Choose a size to see availability.
    <span data-role="availability" data-illustrative="aura-size-stock-states" aria-live="polite"></span>   <!-- empty until a size is picked: nothing static inside a live region (report §5.10 rule 5). The chip sits HERE, not on the legend: #505 ruled the size run real and only the per-size stock states illustrative. -->
  </p>
</section>
```

```js
// assets/pdp.js — no framework, no build; one module per page
const STATES = { in_stock: 'in stock in Midrand', lead_time: w => `imported to order, ~${w} weeks`, notify: 'notify me when it lands' };
export function availabilityText(el) { /* ponytail: strings live here, not in HTML, so the copy is editable in one place */ }
export function instalments(priceCents, n = 3) { /* three cent amounts summing exactly to priceCents; remainder on the first */ }
```

```css
/* site.css — the honesty chip; one rule, no JS */
[data-illustrative]::after { content: "proposed"; /* small pill, tokens from :root */ }
```

- Files kebab-case; classes BEM-lite (`.pdp__price`, `.size--selected`); state in `data-*`; strings in one place per module.
- Buttons are `<button>`, links are `<a href>`; every control labelled; visible focus; `prefers-reduced-motion` respected; no inline styles.
- Live regions start empty and receive only real state changes; static prompt text stays outside them.
- Tokens in `site.css` `:root` (colour, type scale, spacing) set by the design pass; nothing hard-coded twice.
- Deliberate shortcuts carry a `// ponytail:` comment naming the ceiling and the upgrade path.
- JSON data files are the single source for products, sizes, fittings and contact; HTML never repeats a price that JSON holds (the PDP's static price is rendered from JSON at build-fixture time by the fetch script, and asserted equal by verify).

## 9. Boundaries

**Always**
- Work on branch `feat/mels-skate-shop-pitch` from `main`; open a PR; never push to `main`.
- Keep the demo self-contained: no new npm dependency, no `src/app` route, no API route, no third-party script, no CDN.
- Every fact sourced in `manifest.json` or chipped "proposed"; no dead links; `noindex` on deck and demo.
- Run `verify-mels-demo.mjs`, `npm run lint`, `npm run build` before the PR; paste Lighthouse scores.
- Commit the fetched fixtures so the build is reproducible without re-fetching.
- Model pins: Sonnet on builders/reviewers/verifiers; Opus on the design and copy pass (decision #175 pattern; the pin hook enforces it).
- Commit trailers follow the harness attribution rule in force at commit time (the `Co-Authored-By` line the session reminder specifies). The trailer names the session model; it is unrelated to the pins above and is never edited by hand.

**Ask first**
- Adding any dependency; touching `src/app`, `globals.css`, `layout.tsx`, or the existing decks.
- Changing `next.config.ts` beyond the two rewrite lines.
- Merging to `main` (deploys to solafidei.com — makes the deck and Mel's imagery public).
- Choosing the deck fallback (hand-authored HTML) if the canvas export path fails.
- Any use of Mel's images beyond the demo pages.

**Never**
- Contact Mel or her business from any channel, automated or not.
- Fetch beyond read-only public GETs/HEADs (Store API, `/size-chart/`, ≤ 40 image files, ≤ 10 outbound link checks, one pass, polite UA, ≤ 2 req/s). No logins, no forms, no scraping of Facebook.
- Invent reviews, ratings, follower counts, Lighthouse scores or turnover figures; quote a report fact flagged as unverified.
- Hotlink Mel's images; commit secrets; put a rand figure on slide 10.
- Show a promise Mel hasn't made without the chip.

## 10. Success criteria

- [ ] `/decks/mels-skate-shop` and `/decks/mels-skate-shop/demo` (+ 5 clean sub-URLs) serve from `npm run start`.
- [ ] `scripts/verify-mels-demo.mjs` passes all eleven assertion groups.
- [ ] Lighthouse mobile: Home and PDP ≥ 90 / 95 / 95.
- [ ] `manifest.json` has zero unsourced facts (manual review of the file — §7.11 scripts only the chip subset); every outbound link has a recorded 200 (or the owner's manual tick); the deck quotes nothing from the report's unverified list.
- [ ] Zero dead links (crawl assertion) and zero console errors.
- [ ] Owner walks the deck and demo on a phone and says yes.
- [ ] PR open with screenshots of the six screens and the Lighthouse numbers; `lint` and `build` green.

## 11. Open questions

All seven ruled by the owner on 2026-09-14 (decision log #487–#493); the sections above record each ruling in place.

| Q | Ruling |
|---|---|
| 1 Deck export | Claude Design canvas, owner exports to `index.html`; hand-authored HTML only as a §9 "ask first" fallback (#487) |
| 2 Aura size run | mm bands + illustrative per-size run, chipped "proposed" (#488) |
| 3 Address | shown, flagged `confirm` (#489) |
| 4 Fitting prices | durations + chipped illustrative prices (#490) |
| 5 Slide 10 | (a) "from R ______ / month", figure still a placeholder (#484); (b) day-30 get-out kept as worded; (c) third-party tools inside the retainer, no pass-through line (#491) |
| 6 Header branding | Mel's current logo, fetched read-only, saved locally, recorded in the manifest (#492) |
| 7 Fit Guarantee | drafted report §5.9 terms shown under the chip wherever the guarantee appears (#493) |

None open.
