# Implementation Plan: Mel's Skate Shop pitch (deck + demo)

(Generated 2026-09-14 from spec APPROVED v2, decisions #476-#493 · owner review required before build · revised after critic pass — see fix notes inline)

## Overview

Build, on branch `feat/mels-skate-shop-pitch` in `~/solafidei-site`, a cold-pitch package for Mel's Skate Shop: a 12-slide deck at `/decks/mels-skate-shop` (a Claude Design canvas the owner exports to `index.html`) and a six-screen static demo at `/decks/mels-skate-shop/demo` (Home · Roller Derby hub · Aura Sky 100 PDP · Size Finder · Book a fitting · canonical contact block on every page). The plan is organised around `scripts/verify-mels-demo.mjs` as its spine: the two riskiest unknowns are retired first — the two clean-URL rewrites (task 1, the cheapest possible probe of the only Next.js change the build makes) and the one-pass read-only fetch of Mel's public Store API, images and outbound links (tasks 2-4, split so a shape surprise, an image surprise and a link-status surprise each fail in isolation) — then the design pass, the copy passes and the shared chrome land, then the eight page-agnostic §7 assertion groups land *before* any screen is written so every later task's verify run is a full regression check of every page already built. Each screen task after that is a vertical slice: the page, its ES module, its data and the §7 group it turns green. The three honesty mechanisms the spec singles out (§7.3 link crawl, §7.4 byte-identical shared blocks, §7.11 chip↔manifest bijection) each land with demonstrated negative controls. Opus is used only on the design pass and the two copy passes; the deck canvas is main-session `design`-skill work, the export is an owner action, and nothing reaches `main` without the owner because `main` deploys to solafidei.com.

Shared chrome (formerly one task) and the verify spine (formerly one task) are each now two tasks — the shared-block generator and the reusable JS library are independently reviewable subsystems, and so are the structural/performance groups and the content-integrity groups — and the Lighthouse/impeccable gate is split into measurement and remediation so the owner sees raw numbers before any fix can mask them. This grows the plan from 23 to 26 numbered tasks; nothing else about the architecture changes.

## Architecture decisions

- **The demo is a zero-build static island** under `public/decks/mels-skate-shop/demo/`: HTML5, CSS custom properties, vanilla ES2020 modules. No framework, no build step, no npm dependency, no CDN, no third-party script, no `src/app` route (§3, §9). The Next.js app is host and router only, so the Solafidei dark tokens, `next/font` and the splash cannot leak in (§2.13).
- **Exactly two rewrite lines in `next.config.ts`** (§5), declared *before* the existing `/decks/:deck` rule so the deck-index rewrite cannot swallow `/decks/mels-skate-shop/demo`. Ordering is proven in task 1, not assumed, and re-asserted by group 1 on every run. The two existing decks (lux-fragrance, optimus-plumbing) are regression-checked in the same task.
- **Two sources of truth, never crossed.** The fetch script writes `products.json`, `manifest.images[]` and `manifest.links[]`; the copy passes write `sizes.json`, `fittings.json`, `contact.json`, `img-alt.json`, `draft-copy.json` and `manifest.facts[]`. No task edits the other lane's fields; the manifest is assembled by merge, never overwrite. All fixtures are committed so the build reproduces offline (§9 always).
- **The fetch script is the only code that touches the network**, runs once per build, and enforces the §9 caps as hard fail-fast limits in code: polite descriptive UA, ≤ 2 req/s token bucket, GET/HEAD only, no auth, no cookies, no facebook.com path at all, ≤ 40 image files, ≤ 10 outbound checks, and a `--force` guard so a second run is a no-op (one pass is the default, and stays the default for the life of the build — task 24 was found to violate this by re-invoking the fetch script a second time; it no longer does, see task 24). A `--dry-run` flag prints the request plan with zero requests issued.
- **The verify script is the spine and grows monotonically.** One numbered group per §7 assertion group in a registry keyed by group number, `--only=<n>` for slices, all eleven listed on every run (unimplemented ones print `SKIPPED — task N`). No task may modify an existing group's assertions — only add. The eight page-agnostic groups (1, 2, 3, 4, 8, 9, 10, 11) land before any screen content, across tasks 1, 8, 10 and 11 (group *numbers* 8/9/10 are implemented in task 10, not conflated with task *9*, which is site.js and owns no group), so every screen task's full run re-validates all previously built pages.
- **Every cross-cutting assertion ships with demonstrated negative controls** — inject the fault, show the group fails and names it, revert — captured in the task output for the PR body: a dead internal link and an off-allow-list host for group 3, a one-byte drift for group 4, an orphan chip and a manifest-required-but-unrendered id for group 11 (six controls total; see task 11 for why the group-11 controls are self-contained injections rather than assuming a real chip already exists on a page).
- **Shared blocks are duplicated verbatim, not injected** (§5 ruling): header (§6.0b) and contact block (§6.6) live between `<!-- shared:header -->` / `<!-- shared:contact -->` markers on all five pages, generated from one source string by a single scripted copy step rather than hand-edited five times, with §7.4 asserting byte-identity on every run. This generator (`scripts/gen-shared-blocks.mjs`, task 8) and its `demo/.source/` fragments are not in the spec's §5 tree — they are an engineering addition for byte-identity-by-construction, noted as a deviation in task 8 rather than left unexplained.
- **The chip is a pure-CSS mechanism** (`[data-illustrative]::after { content: "proposed" }`) with `manifest.facts[]` as its machine-readable twin. Group 11 asserts set equality in both directions *and* pins the set against the nine ids §6.0 enumerates (`fit-guarantee`, `pjn-instalments`, `fitting-prices`, `fitting-durations`, `cancellation-policy`, `heat-mould-price`, `mail-in-heat-mould`, `aura-size-stock-states`, `demo-buy-button`), so both sets being wrong together still fails. §6.0's own text — "fitting prices **and durations**... carries `data-illustrative`" — is the source of truth for `fitting-durations` being its own id; task 17 chips both the duration and the price on every fitting type, not price alone.
- **`sharp` for the WebP re-encode**, resolved from `next`'s transitive dependency tree via `createRequire` (never added to `package.json`), with `ffmpeg` on PATH as a documented fallback and a loud failure if neither resolves. A zero `package.json`/`package-lock.json` diff is an acceptance criterion, so "no new npm dependency" is proven rather than asserted.
- **Pure functions carry the logic worth testing**: `findSize(brand, input)`, `whichSky(mm, kg, level)`, `instalments(priceCents, n)` take no DOM and are imported directly by the verify script in plain Node, giving unit-level confidence in a repo with no test suite.
- **Model pins (§9, decision #175):** `sonnet` on every build, verify, review and mechanical task; `opus` only on the design pass and the two copy passes, where judgement is the product; `main-session` for the deck canvas (`design` skill); `owner` for the browser-side canvas export, which this pipeline cannot perform.
- **Branch and PR:** `feat/mels-skate-shop-pitch` from `main`, one commit per task, PR into `main` at the end. Never a push to `main`; merging is an owner decision (§9 ask-first) because it publishes the deck and Mel's imagery on solafidei.com.
- **Every task that starts a dev-mode verify run or curls `localhost:3000` starts its own dev server first** (`(npm run dev &) && sleep 10 && ...`), because each task runs in a fresh subagent session with no guarantee of inheriting a background process from a prior task's shell. This was inconsistently applied in the first draft of this plan; every verification command below that needs a dev server now starts one.

## Dependency graph

```
T1 spine: branch + 2 rewrites + 6 stubs + verify skeleton (grp 1)
 |
 +-- T2 fetch A: polite core + Store API -> products.json
 |     +-- T3 fetch B: images/logo -> WebP + manifest.images[]
 |     +-- T4 fetch C: outbound HEADs -> manifest.links[] (12 candidates, 2 exempt per #495, 9 fetched, ≤10 cap)
 |            [CP1 OWNER: fixtures eyeball + Facebook manual-ok + confirm Maps/Waze exempt (#495)]
 |            [GATE: nothing in Phase 3 dispatches until CP1's boxes are ticked]
 |                  |
 +-- T5 design pass (opus) ------+
       T6 copy A: data + facts[] (opus) --+
       T7 copy B: Melony voice (opus) ----+
             |                            |
             |                     [CP2: design + copy foundation]
             |                            |
             |              +-------------+-------------+
             |              v                           v
             |          T8 shared header/contact     T9 site.js (WhatsApp
             |          + gen-shared-blocks (grp 4)   builder, isBuyable,
             |          [deps: 5, 7]                  stock-state map)
             |              |                         [deps: 2, 5]
             |              +-------------+-------------+
             |                            v
             |                   T10 verify spine A: grp 2, 8, 9, 10
             |                            v
             |                   T11 verify spine B: grp 3, 11 + all six
             |                        negative controls
             |                            |   [CP3: spine green]
             |                            v
             |                        T12 Home
             |                            v
             |                        T13 Derby hub (grp 7)
             |                            v
             |                        T14 PDP A
             |                            v
             |                        T15 PDP B (grp 6)
             |                            |   [CP4: three screens up]
             |                            v
             |                        T16 Size Finder (grp 5)
             |                            v
             |                        T17 Book a fitting
             |                              [CP5 OWNER: phone walkthrough]
             |                            v
             |                        T18 Lighthouse + impeccable (measure only)
             |                            v
             |                        T19 capped remediation
             |                            v
             |                        T20 screenshots + §4 sweep
             |                              [CP6 OWNER: numbers + shots]
             |                            |
             +--> T21 deck slide copy pack (opus) --+
                                                      v
                                          T22 deck canvas (main-session, deps 20+21)
                                                      v
                                          T23 OWNER export -> index.html
                                                      v
                                          T24 deck post-export verification (no re-fetch)
                                                        [CP7 OWNER: export landed, checks
                                                         re-run, photography use confirmed]
                                                      v
                                          T25 manifest audit + §10 sign-off
                                                      v
                                          T26 open PR
                                                        [CP8 OWNER: merge gate]
```

**Diagram note:** the T8/T9 fork is drawn from the CP2 merge box for layout only — it is not a literal dependency edge on T6. The `[deps: …]` labels next to T8 and T9 above are each task's real **Dependencies** field (also given in each task's own section and in the Parallelization section below): T8 depends on 5, 7; T9 depends on 2, 5 — including task 2, the Store API fetch, which this ASCII diagram does not have room to draw an edge for from the T2 branch above.

## Task list

### Phase 1 — Spine

### Task 1: Branch, the two rewrites, six stubs, verify skeleton (group 1)

**Description:** Create `feat/mels-skate-shop-pitch` from `main` and retire the first riskiest unknown with the cheapest possible probe. Add exactly two rewrite entries to `next.config.ts` (`/decks/:deck/demo` → `…/demo/index.html`, `/decks/:deck/demo/:page` → `…/demo/:page.html`) declared before the existing `/decks/:deck` rule. Create the §5 tree: a `noindex` deck placeholder at `public/decks/mels-skate-shop/index.html` (so the deck URL is never a 404 before the canvas exists) and the five demo stubs, each minimal valid HTML5 with `noindex`, one `<h1>`, marker pairs for the shared header and contact blocks, and an empty `assets/site.css`. Create `scripts/verify-mels-demo.mjs` on the `verify-process-pin.mjs` convention: Playwright chromium against the dev server, a group registry keyed by number, `--only=<n>`, a PASS/FAIL/SKIPPED table listing all eleven groups with the owning task id, non-zero exit on any failure. Implement group 1 only.

**Acceptance criteria:**
- [ ] `git diff main -- next.config.ts` adds exactly two rewrite objects; `git diff main --stat -- src/ package.json package-lock.json` is empty.
- [ ] All six clean URLs (the deck placeholder + the five demo screens) and their `.html` twins return 200 under `npm run dev` **and** under `npm run build && npm run start`; `/decks/lux-fragrance` and `/decks/optimus-plumbing` still return 200.
- [ ] Every one of the six HTML files has exactly one `<h1>` and `<meta name="robots" content="noindex">`.
- [ ] `node scripts/verify-mels-demo.mjs` exits 0 printing `GROUP 1 PASS` plus ten SKIPPED rows; renaming one stub makes it exit non-zero naming that URL (negative control run and captured).

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs; echo "exit=$?"`
- [ ] `cd ~/solafidei-site && for p in "" /demo /demo/roller-derby /demo/aura-sky-100 /demo/size-finder /demo/book-a-fitting; do printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/decks/mels-skate-shop$p"; done`
- [ ] `cd ~/solafidei-site && npm run lint && npm run build && git diff main --stat -- src/ package.json`
- [ ] `cd ~/solafidei-site && mv public/decks/mels-skate-shop/demo/size-finder.html /tmp/size-finder.html.bak && node scripts/verify-mels-demo.mjs; echo "expect non-zero naming size-finder: $?"; mv /tmp/size-finder.html.bak public/decks/mels-skate-shop/demo/size-finder.html`

**Dependencies:** none · **Model:** sonnet · **Estimated scope:** S (waived above the ~5-file heuristic: the six demo stubs are identical minimal HTML5 boilerplate, not independent pieces of logic; the task also stands up the Playwright verify-harness scaffold — group registry, `--only` flag, PASS/FAIL/SKIPPED table, negative control — a second, distinct subsystem bundled here deliberately, since group 1 cannot be demonstrated without a harness to run it in and the harness is not separately useful without a group to prove it against. If this pairing proves too much for one turn, split live into stubs+rewrites (1a) then harness+group1 (1b) sharing position 1, per the convention task 13 also uses.)
**Files likely touched:** `next.config.ts`, `public/decks/mels-skate-shop/index.html`, `public/decks/mels-skate-shop/demo/{index,roller-derby,aura-sky-100,size-finder,book-a-fitting}.html`, `public/decks/mels-skate-shop/demo/assets/site.css`, `scripts/verify-mels-demo.mjs`
**Spec refs:** §3, §4, §5, §7.1, §7.9, §9

### Phase 2 — Fixtures

### Task 2: Fetch A — polite core + Store API → products.json + manifest scaffold

**Description:** Create `scripts/fetch-mels-fixtures.mjs` with the politeness core enforced in code: descriptive UA, ≤ 2 req/s token bucket, GET/HEAD only, no auth header, no cookie jar, no facebook.com path, separate hard budgets (≤ 40 images, ≤ 10 outbound checks), a `--dry-run` that prints the request plan issuing zero requests, and a `--force` guard so a second run is a no-op. Pull the WooCommerce Store API: `/products/categories`, product 11919 (Aura Sky 100 White), 11941 (Sky 200, for the size-guide image), the Sky 50 record, all of category 120 (8 SKUs), and the derby-relevant SKUs from Sets (27), Wheels & Bearings (38), Toe Stops (17), Ice Blades (246) and Ice Accessories. Also save `/size-chart/` raw to a gitignored cache so the copy pass can see whether the brand tables are HTML or images (§2.4). Write `demo/data/products.json` with only the nine §5 fields, deterministically key-sorted, and a `manifest.json` scaffold with empty `facts[]`/`images[]`/`links[]`. Record 11938 as a deliberate exclusion with its reason. Fail loudly on any §2.15 category-count drift rather than silently writing a different number.

**Acceptance criteria:**
- [ ] `--dry-run` prints the full ordered request plan with a request counter of 0; a real run logs total requests and observed rate, never exceeding 2 req/s; a second run without `--force` writes nothing.
- [ ] `products.json` holds id 11919 at 1205000 cents, the Sky 50/100/200 ladder, the 8 category-120 SKUs, the 2 Ice Blades SKUs and the derby sets/wheels/toe-stop SKUs, each with all nine §5 fields and no others; id 11938 appears nowhere.
- [ ] The 13 §2.15 category counts match exactly or the script exits non-zero naming the drift; re-running produces a byte-identical `products.json`.
- [ ] `grep -nE 'POST|Authorization|cookie|facebook' scripts/fetch-mels-fixtures.mjs` shows only allow-list comments.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && node scripts/fetch-mels-fixtures.mjs --dry-run && node scripts/fetch-mels-fixtures.mjs 2>&1 | tail -20`
- [ ] `cd ~/solafidei-site && node -e "const p=require('./public/decks/mels-skate-shop/demo/data/products.json');const a=p.products.find(x=>x.id===11919);if(a.prices.price!=='1205000')throw new Error('price');if(p.products.some(x=>x.id===11938))throw new Error('11938 leaked');console.log('OK',p.products.length)"`
- [ ] `cd ~/solafidei-site && node scripts/fetch-mels-fixtures.mjs && git diff --quiet -- public/decks/mels-skate-shop/demo/data/products.json && echo idempotent`
- [ ] `cd ~/solafidei-site && npm run lint && (npm run dev &) && sleep 8 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/mels-skate-shop/demo`

**Dependencies:** 1 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `scripts/fetch-mels-fixtures.mjs`, `demo/data/products.json`, `demo/data/manifest.json`, `.gitignore`
**Spec refs:** §2.1, §2.3, §2.4, §2.15, §4, §5, §9

### Task 3: Fetch B — product/logo images → WebP + manifest.images[]

**Description:** Extend the fetch script with the image layer. Resolve each source URL by the §2.5 rule (widest `srcset` candidate; with no srcset, strip any `-WxH` / `_WxH@2x` suffix from the uploads path), download once through the polite queue under the hard ≤ 40-file budget, record the true source pixel width, and re-encode to WebP ≤ 150 KB with `sharp` resolved via `createRequire` from `next`'s transitive tree (ffmpeg on PATH as the documented fallback; loud failure if neither resolves). Spend the budget from an explicit written list: `logo.webp` (ruled #492), the three Aura gallery images, Home's four in-stock heroes, the derby grid's ~15 cards, the PDP's two rails, and whatever `/size-chart/` exposes. Write one `manifest.images[]` entry per file — `{file, from, width, flags}` — with `from` as `store:<id>` or `melsskateshop.co.za`, the size guide recorded `store:11941`, and `below_hero_floor` on anything under 800 px source width (the Aura boot photo at 562 px). **Reserve, do not fetch, the Roll-Line listing screenshot:** §6.1 items 1 and 6 and §6.7 slide 2 all require a saved screenshot of the live Roll-Line dealer-locator result ("the locator URL shows nothing without a query"), but roll-line.it is a third-party site and reaching its result requires a search interaction the §9 "no forms" boundary makes off-limits for the fetch script. So this file is captured by the owner, not this script — write a placeholder `manifest.images[]` entry `{file: "roll-line-listing.webp", from: "roll-line.it", width: null, flags: ["pending-owner-capture"]}` and leave the actual PNG/WebP for CP1's new owner bullet (below) to supply.

**Acceptance criteria:**
- [ ] `img/` holds ≤ 40 files, all `.webp`, every one ≤ 150 KB, including `logo.webp`, the 562 px Aura boot photo, the 1088×1408 selection chart and the Sky-200-sourced size guide; a 41st request aborts the run.
- [ ] `manifest.images[]` is a bijection with the files on disk **plus** the one reserved `pending-owner-capture` entry for `roll-line-listing.webp`; the Aura boot photo is `width: 562` flagged `below_hero_floor`; the size guide's `from` is `store:11941`.
- [ ] `git diff main -- package.json package-lock.json` is empty (sharp used transitively, no dependency added).
- [ ] No image URL appears in any demo HTML or CSS (no hotlinking), and re-running re-downloads nothing.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && node scripts/fetch-mels-fixtures.mjs --force 2>&1 | grep -i image | tail -20 && ls public/decks/mels-skate-shop/img | wc -l && find public/decks/mels-skate-shop/img -size +150k | wc -l`
- [ ] `cd ~/solafidei-site && node -e "const m=require('./public/decks/mels-skate-shop/demo/data/manifest.json'),fs=require('fs');const d=fs.readdirSync('public/decks/mels-skate-shop/img');const s=new Set(m.images.map(i=>i.file));console.log('onlyDisk',d.filter(f=>!s.has(f)),'onlyManifest',[...s].filter(f=>!d.includes(f)))"`
- [ ] `cd ~/solafidei-site && grep -rn 'melsskateshop.co.za/wp-content' public/decks/mels-skate-shop/demo --include=*.html --include=*.css; echo "expect no matches"`
- [ ] `cd ~/solafidei-site && npm run lint && (npm run dev &) && sleep 8 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/mels-skate-shop/demo`

**Dependencies:** 2 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `scripts/fetch-mels-fixtures.mjs`, `public/decks/mels-skate-shop/img/*.webp`, `demo/data/manifest.json`
**Spec refs:** §2.5, §5, §6.0b, §6.3.2, §7.9, §9, §11 Q6

### Task 4: Fetch C — outbound link enumeration, budget check, HEADs → manifest.links[]

**Description:** Extend the fetch script with the outbound-link layer. First enumerate the exact outbound URL set the demo will use: the five unbuilt discipline-card category pages built as `/product-category/<slug>/` from the categories endpoint's `slug` (or its `link` field when present), the Aura PDP permalink, the derby buying guide, the Roll-Line dealer listing, the Roadhouse page, the Facebook page, **and — a gap found in review — the two contact-block deep links §7.3's own allow-list names as non-exempt: a Google Maps link for the Midrand address and its Waze twin** (e.g. `https://www.google.com/maps/search/?api=1&query=...` and `https://waze.com/ul?q=...`, built from `contact.json`'s address). Enumerate all 12 outbound candidates: the five category pages, the Aura PDP permalink, the derby buying guide, the Roll-Line dealer listing, the Roadhouse page, the Facebook page, and the Google Maps and Waze contact-block deep links. Record the Google Maps and Waze links as exempt per decision #495 (`status: "exempt", reason: "query deep link — status proves nothing about the address (decision #495)"`). Assert the fetched count — the 12 enumerated, minus the 2 exempt, minus the 1 pending-manual Facebook entry, leaving 9 — is ≤ 10 *before issuing a single request*, failing with the full 12-item list if it is not. Then HEAD each of the 9 fetched candidates once (GET on 405) and write `manifest.links[] {href, status, checkedAt}`, exiting non-zero on any non-200 and naming it. The Facebook URL is never fetched (audit.json issue 10) and is written `status: "pending-manual"` for the owner's tick; `wa.me`, `mailto:` and `tel:` are recorded `status: "exempt"` and never fetched. Commit the fixtures.

**Acceptance criteria:**
- [ ] The budget-fit check runs before any request: 12 candidates enumerated, Google Maps and Waze recorded `exempt` per decision #495, Facebook recorded `pending-manual`, leaving 9 to fetch — well within the ≤ 10 cap; a fetched count > 10 fails the task with the full candidate list before any request is issued.
- [ ] Every fetched entry is `status: 200` with an ISO `checkedAt`; a deliberately wrong path makes the run exit non-zero naming the URL (negative control run and captured — see Verification).
- [ ] The Facebook entry reads `pending-manual` and the request log shows zero requests to any facebook.com host; `wa.me`/`mailto:`/`tel:` are `exempt` and cost zero requests; Google Maps and Waze are recorded `exempt` with the decision #495 reason string and also cost zero requests.
- [ ] `products.json`, `img/*.webp` and `manifest.json` are committed; `npm run build` needs no re-fetch.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && node scripts/fetch-mels-fixtures.mjs --force 2>&1 | grep -i link | tee /tmp/links.log && grep -ci facebook /tmp/links.log`
- [ ] `cd ~/solafidei-site && node -e "const m=require('./public/decks/mels-skate-shop/demo/data/manifest.json');const bad=m.links.filter(l=>typeof l.status==='number'&&l.status!==200);if(bad.length)throw new Error(JSON.stringify(bad));const f=m.links.filter(l=>typeof l.status==='number').length;if(f>10)throw new Error('budget '+f);const ex=m.links.filter(l=>l.status==='exempt'&&/maps\.google|waze/.test(l.href));if(ex.length!==2||ex.some(l=>!l.reason))throw new Error('exempt reason missing: '+JSON.stringify(ex));console.table(m.links)"`
- [ ] `cd ~/solafidei-site && cp scripts/fetch-mels-fixtures.mjs /tmp/fetch-mels-fixtures.mjs.bak && sed -i "0,/product-category\//{s//product-category\/does-not-exist-XXXX\//}" scripts/fetch-mels-fixtures.mjs && node scripts/fetch-mels-fixtures.mjs --force 2>&1 | tail -5; echo "expect non-zero naming does-not-exist-XXXX: $?"; cp /tmp/fetch-mels-fixtures.mjs.bak scripts/fetch-mels-fixtures.mjs`
- [ ] `cd ~/solafidei-site && git status --short public/decks/mels-skate-shop/ | head`
- [ ] `cd ~/solafidei-site && npm run lint && (npm run dev &) && sleep 8 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/mels-skate-shop/demo`

**Dependencies:** 2 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `scripts/fetch-mels-fixtures.mjs`, `demo/data/manifest.json`
**Spec refs:** §6.1.3, §6.6, §7.3, §9, §10

### Checkpoint: fixtures landed (owner gate)

- [ ] OWNER: read `demo/data/products.json` — id 11919 is the White Sky 100 at R12,050, the 8 derby SKUs look like Mel's catalogue, 11938 is absent, nothing beyond the nine §5 fields was scraped.
- [ ] OWNER: read `demo/data/manifest.json` — every real `images[]` entry has a source and a real pixel width (the one reserved `roll-line-listing.webp` entry is the exception, still `pending-owner-capture`), `Aura` is `below_hero_floor` at 562 px, every `links[]` entry is a 200 with a `checkedAt`.
- [ ] OWNER: open facebook.com/melsskateshopofficial **once** in a real browser and either tick that entry to `status: "manual-ok"` or rule the link dropped from the contact block.
- [ ] OWNER: capture the Roll-Line dealer-locator result in a real browser (the URL needs a query the fetch script may not submit, §9 no forms) and save it as `public/decks/mels-skate-shop/img/roll-line-listing.webp` (or a PNG a follow-up commit re-encodes); update its `manifest.images[]` entry with the real width and drop the `pending-owner-capture` flag.
- [ ] OWNER: confirm `manifest.links[]` shows Google Maps + Waze as `exempt` with the #495 reason, Facebook `pending-manual`, every other entry 200 — 9 fetched, budget ≤ 10 held in task 4's single pass.
- [ ] OWNER: confirm Mel was not contacted on any channel.
- [ ] MECHANICAL: fetch is idempotent, rate ≤ 2 req/s, ≤ 40 images, ≤ 10 outbound checks, one pass; `git diff main -- package.json package-lock.json src/` empty; `lint`, `build` and `verify` green.

**Gate note:** Task 6 (and everything in Phase 3 onward) must not be dispatched by the workflow runner until every box above is ticked — task 6's formal graph edge (`deps: 3, 4`) marks task-completion only, not owner sign-off, and the copy pass hand-transcribes facts from these fixtures, so it must not start before the owner has actually reviewed them.

### Phase 3 — Design and copy

### Task 5: Design pass — impeccable PRODUCT.md, tokens, chip, base components

**Description:** Opus design pass setting Mel's brand direction: a single light theme explicitly not the Solafidei dark tokens (§2.13). Write the impeccable `PRODUCT.md` (audience: Melony on a phone, cold; tone: a specialist shop that fits people, not a marketplace) and drive `demo/assets/site.css` from it — every colour, type-scale step and spacing step defined once in `:root`, nothing hard-coded twice; ≤ 2 self-hosted OFL families as local `.woff2` under `assets/fonts/` with `font-display: swap` (no Google Fonts, no CDN); the honesty chip as one rule (`[data-illustrative]::after { content: "proposed" }`) rendering a small inline pill legible and ≥ 4.5:1 at 390 px; and the BEM-lite primitives the five pages reuse — page shell, header bar, promise row, card/grid, badge, buttons and links with ≥ 44 px tap targets and a visible focus ring, live-region styling, `prefers-reduced-motion` honoured, no inline styles.

**Acceptance criteria:**
- [ ] `PRODUCT.md` states the brand direction, palette rationale and font choices, and records that the Solafidei dark tokens deliberately do not apply.
- [ ] Every colour / type / spacing value is defined once under `:root`; `grep -rnE 'https://|fonts.googleapis|cdn\.' site.css` returns nothing; at most two `@font-face` families.
- [ ] A test element carrying `data-illustrative` renders a visible "proposed" pill with a non-zero box at 390 × 844, with no JavaScript.
- [ ] `impeccable detect public/decks/mels-skate-shop/demo` returns zero error-level findings; `npm run lint` and `node scripts/verify-mels-demo.mjs` stay green.

**Verification:**
- [ ] `cd ~/solafidei-site && ~/.claude/skills/impeccable/scripts/impeccable detect public/decks/mels-skate-shop/demo --viewport 390x844`
- [ ] `cd ~/solafidei-site && grep -rnE 'https://|fonts.googleapis|cdn\.' public/decks/mels-skate-shop/demo/assets/site.css; grep -c '@font-face' public/decks/mels-skate-shop/demo/assets/site.css`
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs`

**Dependencies:** 1 · **Model:** opus · **Estimated scope:** M
**Files likely touched:** `demo/assets/site.css`, `demo/assets/fonts/*.woff2`, `demo/PRODUCT.md`
**Spec refs:** §2.13, §6.0, §8, §4, §9

### Task 6: Copy pass A — hand-authored data JSON + manifest.facts[]

**Description:** Opus pass producing everything the fetch script cannot, as data. `sizes.json`: brand tables transcribed from whichever of the eleven `/size-chart/` tables the cached page exposes, cross-checked against manufacturers' charts, every table marked "demo data — confirm with Mel"; Aura as the mm foot-length bands × weight × jump level selection matrix; Roll-Line carrying `noTable: true` for the honest handoff. `fittings.json`: the four named types with durations and illustrative prices (#490). `contact.json`: phone/WhatsApp/email, the address flagged `confirm` (#489), by-appointment hours, socials, and the homepage two-tier courier line R100 Gauteng · R150 elsewhere · 1-3 days (§2.7). `img-alt.json`: one hand-written non-empty alt per file in `img/`. `manifest.facts[]`: one `{id, text, source, flags?}` per number, claim and promise the demo will show, source from the §5 vocabulary only, with `flags: ["confirm"]` on the address, the spec-table values and mail-in heat-mould — and `source: "illustrative"` on exactly the nine §6.0 ids (fit-guarantee and its terms, pjn-instalments, fitting-prices, fitting-durations, cancellation-policy, heat-mould-price, mail-in-heat-mould, aura-size-stock-states, demo-buy-button) — **the ninth id is `aura-size-stock-states`, NOT `aura-size-run`, which is not a manifest fact at all.** Ruling #505 falsified §2.2: Aura's mm run and width grid ARE published on Mel's own site and the demo shows them as real data, so only the **per-size stock states** stay illustrative and the id narrowed to match. The chip therefore sits on the `aria-live` availability `<span>` — never on the fieldset legend, which would mark Mel's own published size run as something Solafidei invented. The per-size `<button>` elements carry no `data-illustrative` of their own. **Note on the nine-id count:** §6.0's own operative sentence — "fitting prices **and durations**... carries `data-illustrative`" — is the source of truth for `fitting-durations` being its own id, distinct from `fitting-prices`; §11's ruling-table shorthand for Q4 ("durations + chipped illustrative prices") reads ambiguously in isolation and should not be mistaken for a narrower instruction. Because §7.11 mechanically enforces §6.0's enumeration, that is what this task (and task 17's rendering) follows.

**Acceptance criteria:**
- [ ] `manifest.facts[]` has zero entries without a source, every source is in the §5 vocabulary, and the illustrative id set is exactly the nine ids §6.0's seven prose phrases expand to (per #505 the ninth is `aura-size-stock-states`, covering the per-size stock states only; the mm run itself is real, and **no `aura-size-run` id exists**).
- [ ] `img-alt.json` has exactly one non-empty entry per file in `img/`; `contact.json` carries the homepage courier figures and the `confirm`-flagged address.
- [ ] `sizes.json` contains the Aura mm-band × weight × jump-level matrix, the Roll-Line `noTable` entry, and the "demo data — confirm with Mel" marker on every brand table.
- [ ] Nothing invented: no rating, follower count, Lighthouse score, second review or "walk-ins welcome" anywhere in `demo/data/`.

**Verification:**
- [ ] `cd ~/solafidei-site && node -e "const m=require('./public/decks/mels-skate-shop/demo/data/manifest.json');const ok=s=>/^(report L\d+|audit\.json|store:[a-z0-9]+|roll-line\.it|illustrative)$/.test(s||'');const bad=m.facts.filter(f=>!ok(f.source));if(bad.length)throw new Error(JSON.stringify(bad));console.log(m.facts.filter(f=>f.source==='illustrative').map(f=>f.id).sort())"`
- [ ] `cd ~/solafidei-site && node -e "const a=require('./public/decks/mels-skate-shop/demo/data/img-alt.json'),fs=require('fs');const miss=fs.readdirSync('public/decks/mels-skate-shop/img').filter(f=>!a[f]||!a[f].trim());if(miss.length)throw new Error('missing alt '+miss);console.log('alt OK')"`
- [ ] `cd ~/solafidei-site && grep -riE 'walk-?ins|lighthouse|google business|followers|stars' public/decks/mels-skate-shop/demo/data/; echo "expect no matches"`
- [ ] `cd ~/solafidei-site && npm run lint && (npm run dev &) && sleep 8 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/mels-skate-shop/demo`

**Dependencies:** 3, 4 · **Model:** opus · **Estimated scope:** M
**Files likely touched:** `demo/data/{sizes,fittings,contact,img-alt,manifest}.json`
**Spec refs:** §2.4, §2.7, §2.9, §2.10, §2.11, §2.12, §6.0, §6.5, §6.6, §9

### Task 7: Copy pass B — Melony-voice draft copy

**Description:** Opus pass producing `demo/data/draft-copy.json`: every string the six screens speak in Melony's voice, labelled `draft-copy` in the manifest (voice, not a promise — no chip). Covers the Home hero positioning line and promise-row microcopy; the derby hub's 60-120 word category copy and its four FAQ answers; the PDP fit note (§6.3.7), its three Q&A pairs (the last quoting the guarantee terms verbatim from §6.3.5) and the demo-sheet wording; the Size Finder's heel-to-wall instructions, the "brands vary by 1-2 sizes" disclaimer and the out-of-range fallback; the Book a fitting intake block, three-step promise and the drafted cancellation policy; and the drafted §5.9 Fit Guarantee terms in full. Adds no new claim and no new chip — the illustrative id set is unchanged from task 6.

**Acceptance criteria:**
- [ ] `draft-copy.json` parses and covers every string the six screens need, keyed per screen; each block has a `draft-copy`-labelled manifest entry and carries no chip.
- [ ] The illustrative id set in `manifest.facts[]` is byte-identical to task 6's — the copy pass introduced no promise.
- [ ] Derby category copy is 60-120 words and the FAQ has exactly the four §6.2.2 Q/A pairs (what size · which plate size for my boot · wheel hardness for Roadhouse vs tarmac · what a league kit list needs) — matched by topic, not merely counted; the Roadhouse line says "Eastgate, Bedfordview"; the one review is Elizabeth de Lange, Facebook, 2 Nov 2022.
- [ ] None of the §10 unverified items (Lighthouse score, Google rating, Instagram/TikTok figures, club %, Willies heat-mould pricing) and no "walk-ins welcome" appears.

**Verification:**
- [ ] `cd ~/solafidei-site && node -e "const d=require('./public/decks/mels-skate-shop/demo/data/draft-copy.json');const w=d.derby.categoryCopy.split(/\s+/).length;if(w<60||w>120)throw new Error('words '+w);const faq=d.derby.faq;if(faq.length!==4)throw new Error('faq count');const topics=[/size/i,/plate/i,/hardness|roadhouse|tarmac/i,/league|kit/i];const qs=faq.map(f=>f.q||f.question||'');for(const re of topics)if(!qs.some(q=>re.test(q)))throw new Error('missing topic '+re);console.log('copy OK',w)"`
- [ ] `cd ~/solafidei-site && grep -riE 'walk-?ins|lighthouse|google business|instagram [0-9]|tiktok' public/decks/mels-skate-shop/demo/data/draft-copy.json; echo "expect no matches"`
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs`

**Dependencies:** 6 · **Model:** opus · **Estimated scope:** S
**Files likely touched:** `demo/data/draft-copy.json`, `demo/data/manifest.json`
**Spec refs:** §6.1, §6.2.2, §6.3.5, §6.3.7, §6.3.12, §6.4, §6.5, §9

### Checkpoint: design and copy foundation

- [ ] `impeccable detect` on the demo directory: zero error-level findings; the chip renders with no JS and passes contrast at 390 px.
- [ ] All data files parse; `manifest.facts[]` has zero unsourced entries and exactly the nine §6.0 illustrative ids (including `fitting-durations`); `img-alt.json` covers every image file.
- [ ] No CDN, no Google Fonts, no external script, no `<iframe>`; ≤ 2 self-hosted OFL families.
- [ ] `git diff main --stat -- src/ package.json package-lock.json` empty; `npm run lint` and `npm run build` green.

### Phase 4 — Shared chrome and the verify spine

### Task 8: Shared header + contact block byte-identical across five pages (group 4)

**Description:** Build the two canonical blocks, generated from one source string by a single scripted copy step rather than hand-edited five times, so §7.4 is true by construction. Write `scripts/gen-shared-blocks.mjs`: a one-off, re-runnable authoring-time script (never invoked at runtime — the demo still ships with no build step) that reads two source fragments (`demo/.source/header.html`, `demo/.source/contact.html`) and stamps the identical bytes between the `<!-- shared:header -->` / `<!-- shared:contact -->` markers on all five pages; this is the *only* way header/contact markup is ever edited from this task forward — any later task (at minimum task 19, which touches the header logo `<img>`'s `width`/`height`) edits the source fragment and re-runs the generator rather than hand-editing the five HTML files. **Deviation note:** `scripts/gen-shared-blocks.mjs` and `demo/.source/{header,contact}.html` are not in the spec's §5 tree — they are added here for §7.4 byte-identity by construction, in place of hand-editing five files (which group 4's negative control below still catches if it happens anyway). The header (§6.0b) between `<!-- shared:header -->` markers on all five pages: `img/logo.webp` with its `img-alt.json` alt, linking to Home, plus Roller Derby · Size Finder · Book a fitting · WhatsApp (a plain `wa.me` link built from `contact.json`, not from task 9's reusable builder — that stays decoupled so this task and task 9 can proceed independently), so every page reaches every other and no page is a dead end. The contact block (§6.6) between `<!-- shared:contact -->` markers on all five: `tel:`, `wa.me`, `mailto:`, the `confirm`-flagged address with "Open in Google Maps" and "Waze" links (no embedded map, no third-party script — these are the two links task 4 now also fetches), by-appointment hours, the Facebook link rendered only while `manifest.links[]` says `manual-ok`, the two-tier courier line, and the image credit — all from `contact.json`. The floating WhatsApp button (plain CSS visibility, ≤ 768 px) lives in `site.css` here; its href is the same plain `contact.json`-built link as the header's. Implement §7 group 4.

**Acceptance criteria:**
- [ ] `scripts/gen-shared-blocks.mjs` exists, is re-runnable, and produces the on-page bytes from `demo/.source/{header,contact}.html`; Group 4 passes: the bytes between the header markers are identical across all five pages, and likewise for the contact markers; a one-character edit to one page fails it (negative control run and captured — see Verification).
- [ ] Every header link resolves and reaches the other four pages; no `href="#"` anywhere.
- [ ] The contact block renders every §6.6 element from `contact.json` with no hard-coded value, no `<iframe>`, no embedded map, no external `<script>`, and includes Facebook only on `manual-ok`.
- [ ] The floating WhatsApp button is present and ≥ 44 px at 390 px and absent at 1280 px.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs --only=4`
- [ ] `cd ~/solafidei-site/public/decks/mels-skate-shop/demo && for m in header contact; do for f in index roller-derby aura-sky-100 size-finder book-a-fitting; do awk "/shared:$m/{p=!p} p" $f.html | sha256sum | cut -c1-12 | tr '\n' ' '; done; echo "<- $m"; done`
- [ ] `cd ~/solafidei-site && sed -i 's/<!-- shared:header -->/<!-- shared:header -->X/' public/decks/mels-skate-shop/demo/index.html && node scripts/verify-mels-demo.mjs --only=4; echo "expect non-zero: $?"; git checkout -- public/decks/mels-skate-shop/demo/index.html`
- [ ] `cd ~/solafidei-site && grep -rn '<iframe\|<script src="http\|style="' public/decks/mels-skate-shop/demo/*.html; echo "expect no matches"; npm run lint`

**Dependencies:** 5, 7 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `scripts/gen-shared-blocks.mjs`, `demo/.source/{header,contact}.html`, the five `demo/*.html`, `demo/assets/site.css`, `scripts/verify-mels-demo.mjs`
**Spec refs:** §5, §6.0b, §6.6, §7.4, §8, §11 Q3, §11 Q6

### Task 9: site.js — WhatsApp link builder, isBuyable() and the stock-state map

**Description:** Split out from the old combined "shared chrome" task because it is a different, independently-testable subsystem from task 8's markup generator: a small reusable JS behavioral library that task 8 deliberately does not need (task 8's header/footer WhatsApp links are plain, built once from `contact.json` at authoring time) but every screen task from task 12 onward does. `demo/assets/site.js` holds: the WhatsApp link builder (URL-encoding a prefill message onto `wa.me/<number>?text=...`), the shared `isBuyable(p)` predicate (`is_purchasable && is_in_stock`, never the sampled `is_in_stock` alone — §2.3's trap), and the stock-state string map ("In stock · ships in 1-3 days" / "Imported to order · approx. N weeks" (decision #512 -- the tilde is outside the shipped font subset) / "Sold out · notify me") keyed off `is_purchasable`/`is_in_stock`/`stock_availability.text`. Plain ES2020 module, no bundler, no dependency, no DOM access required to run the pure parts in Node.

**Acceptance criteria:**
- [ ] `site.js` exports `isBuyable(p)`, `stockState(p)` and `buildWhatsAppLink(number, text)`; all three import and run in plain Node with no DOM shim and touch no globals.
- [ ] `buildWhatsAppLink` URL-encodes arbitrary text (spaces, punctuation, a product name) into a valid `https://wa.me/<digits>?text=...` string.
- [ ] `isBuyable` returns `true` only when both `is_purchasable` and `is_in_stock` are true, and `stockState` never returns the sampled `is_in_stock` value alone as its source of truth — it reads `stock_availability.text` when present.
- [ ] Zero network calls anywhere in the file; `git diff main -- package.json package-lock.json` empty.

**Verification:**
- [ ] `cd ~/solafidei-site && node --input-type=module -e "import {isBuyable, stockState, buildWhatsAppLink} from './public/decks/mels-skate-shop/demo/assets/site.js'; console.log(isBuyable({is_purchasable:true,is_in_stock:true}), isBuyable({is_purchasable:true,is_in_stock:false}), buildWhatsAppLink('27823706771','Hi Melony, quick question about the Aura Sky 100'))"`
- [ ] `cd ~/solafidei-site && grep -c 'fetch(\|XMLHttpRequest' public/decks/mels-skate-shop/demo/assets/site.js; echo "expect 0 (no network calls in site.js)"`
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint`

**Dependencies:** 2, 5 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `demo/assets/site.js`
**Spec refs:** §2.3, §6.1, §6.2, §6.6, §8

### Task 10: Verify spine A — structural & performance groups 2, 8, 9, 10

**Description:** Implement the four page-agnostic groups that check structure and performance rather than content, landing separately from task 11's content-integrity groups so each subsystem — and its own negative controls — reviews on its own. Group 2: zero console errors, zero warnings and zero failed requests on all six pages, with the listener attached before navigation. Group 8: at 390 × 844, `scrollWidth <= innerWidth` on every page and every primary CTA ≥ 44 × 44 px. Group 9: every `<img>` alt non-empty and equal to its `img-alt.json` entry, no `<img>` rendered wider than its `manifest.images[].width`, exactly one `<h1>`, `noindex` on all six. Group 10: ≤ 1.5 MB transferred per demo page on a cold load, with the per-page figure printed.

**Acceptance criteria:**
- [x] `node scripts/verify-mels-demo.mjs` reports groups 1, 2, 4, 8, 9, 10 PASS (5, 6, 7, 3, 11 remain SKIPPED with their owning task ids), exiting non-zero only if a landed group fails.
- [x] Group 10 prints the measured transfer for each of the six pages.
- [x] Groups 8 and 9 run headless at 390 × 844 with no manual viewport step.
- [x] The script still imports only `playwright` and node builtins; `--only=2`, `--only=8`, `--only=9`, `--only=10` each run in isolation.

**Verification:**
- [x] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs --only=2 && node scripts/verify-mels-demo.mjs --only=8 && node scripts/verify-mels-demo.mjs --only=9 && node scripts/verify-mels-demo.mjs --only=10 && node scripts/verify-mels-demo.mjs; echo "exit=$?"`
- [x] `cd ~/solafidei-site && npm run lint`

**Dependencies:** 8, 9 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `scripts/verify-mels-demo.mjs`
**Spec refs:** §7.2, §7.8, §7.9, §7.10

### Task 11: Verify spine B — content-integrity groups 3, 11 with all negative controls

**Description:** Implement the two page-agnostic groups that check content honesty — link crawl (group 3) and the chip↔manifest bijection (group 11) — the two riskiest assertions in the whole spine, so this task's own subsystem and its negative controls (five of the plan's six total) land and review together. Group 3: crawl every `href` on all six pages; internal 200 live; external host on the allow-list (melsskateshop.co.za, roll-line.it, roadhouserollerrink.co.za, facebook.com, wa.me, maps.google.com, waze.com, `mailto:`, `tel:`) **and** present in `manifest.links[]` at 200 or `manual-ok`; `wa.me`/`mailto:`/`tel:`/maps.google.com/waze.com exempt from fetching but still host-checked and asserted well-formed against `contact.json` (+27 82 370 6771, melony@melsskateshop.co.za) — maps.google.com and waze.com are recorded `exempt` with the decision #495 reason string in `manifest.links[]` per task 4, not checked at 200. Group 11: the `data-illustrative` id set equals the `manifest.facts[]` illustrative set **and** covers the frozen nine (per #505 the ninth id is `aura-size-stock-states`, standing for the per-size stock states only — `aura-size-run` does not exist; and §6.0 names seven prose phrases, not nine ids, so the pin is a literal constant in the script, not a parse of §6.0), with every chip visibly rendered (non-zero box, rendered `::after`) at 390 px. **No screen carries a real chip yet at this point in the build** (screens land in tasks 12-17), so every group-11 negative control below is self-contained — it injects the fixture it needs into a stub page rather than assuming a real chip already exists — which is why these controls do not depend on, or need reworking after, the later screen tasks.

**Acceptance criteria:**
- [ ] `node scripts/verify-mels-demo.mjs` reports groups 1, 2, 3, 4, 8, 9, 10, 11 PASS and 5, 6, 7 SKIPPED with their owning task ids, exiting 0.
- [ ] Group 3 fails naming the offender for both an injected dead internal link and an injected off-allow-list external host (both negative controls run, output captured).
- [ ] Group 11 fails naming the id for an injected orphan chip (present in the DOM, deleted from the manifest) and separately for a manifest-required id that is entirely missing from the DOM even though the observed id-set is otherwise self-consistent — i.e. the pin against §6.0's nine ids is a real, distinct assertion from plain set-equality (two further negative controls, both self-contained via injection — see Verification).
- [ ] Group 10 prints the measured transfer for each page (regression-carried from task 10); the script imports only `playwright` and node builtins.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs --only=3 && node scripts/verify-mels-demo.mjs --only=11 && node scripts/verify-mels-demo.mjs; echo "exit=$?"`
- [ ] `cd ~/solafidei-site && sed -i 's#</body>#<a href="/decks/mels-skate-shop/demo/nope">x</a></body>#' public/decks/mels-skate-shop/demo/index.html && node scripts/verify-mels-demo.mjs --only=3; echo "expect non-zero naming /demo/nope: $?"; git checkout -- public/decks/mels-skate-shop/demo/index.html`
- [ ] `cd ~/solafidei-site && sed -i 's#</body>#<a href="https://example.com/not-allowed">x</a></body>#' public/decks/mels-skate-shop/demo/index.html && node scripts/verify-mels-demo.mjs --only=3; echo "expect non-zero naming example.com: $?"; git checkout -- public/decks/mels-skate-shop/demo/index.html`
- [ ] `cd ~/solafidei-site && sed -i 's#</body>#<span data-illustrative="fit-guarantee">x</span></body>#' public/decks/mels-skate-shop/demo/index.html && node -e "const fs=require('fs');const p='public/decks/mels-skate-shop/demo/data/manifest.json';const m=JSON.parse(fs.readFileSync(p));m.facts=m.facts.filter(f=>f.id!=='fit-guarantee');fs.writeFileSync(p,JSON.stringify(m,null,2))" && node scripts/verify-mels-demo.mjs --only=11; echo "expect non-zero naming orphan fit-guarantee: $?"; git checkout -- public/decks/mels-skate-shop/demo/index.html public/decks/mels-skate-shop/demo/data/manifest.json`
- [ ] `cd ~/solafidei-site && for id in fit-guarantee pjn-instalments fitting-prices fitting-durations cancellation-policy heat-mould-price mail-in-heat-mould aura-size-stock-states demo-buy-button; do sed -i "s#</body>#<span data-illustrative=\"$id\">x</span></body>#" public/decks/mels-skate-shop/demo/index.html; done && CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs --only=11; echo "expect exit 0 with all nine injected: $?"; sed -i 's#<span data-illustrative="demo-buy-button">x</span>##' public/decks/mels-skate-shop/demo/index.html && CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs --only=11; echo "expect non-zero naming missing demo-buy-button: $?"; git checkout -- public/decks/mels-skate-shop/demo/index.html`
- [ ] `cd ~/solafidei-site && npm run lint`

**Dependencies:** 10 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `scripts/verify-mels-demo.mjs`
**Spec refs:** §7.3, §7.11, §9

### Checkpoint: spine green

- [ ] Eight groups PASS (1, 2, 3, 4, 8, 9, 10, 11), three SKIPPED, exit 0; all six negative controls (dead link, off-allow-list host, block drift, orphan chip, manifest-required-but-unrendered id, plus task 1's URL negative control) demonstrated and their output saved for the PR.
- [ ] Header and contact blocks byte-identical across all five pages; every page reaches every other page.
- [ ] No horizontal scroll at 390 × 844; every page ≤ 1.5 MB; `noindex` and one `<h1>` on all six.
- [ ] `npm run lint` and `npm run build` green; dev server serves all six Mel's-shop URLs.

### Phase 5 — Screens

### Task 12: Home (§6.1, items 1-7)

**Description:** Build `demo/index.html` — all seven §6.1 blocks. (1) Persistent promise row: the homepage courier figures, the Fit Guarantee chip with its one-line terms beneath ("30 days, unworn outdoors · not on imported-to-order boots") linking to the full terms on the PDP, "Official Roll-Line dealer" linking to the saved Roll-Line listing screenshot (`img/roll-line-listing.webp`, owner-captured at CP1) rather than the query-less locator URL, and "WhatsApp us" (via `site.js`'s builder, task 9). (2) Hero with the since-2012 / first-derby-shop / Roll-Line / fitted-in-Midrand line, the Roll-Line badge, primary "Find my size", secondary "Book a fitting". (3) Six discipline cards with counts read from `store:categories` — Derby → the hub; the other five to `/product-category/<slug>/`, tagged "live site", each already 200 in `manifest.links[]`. (4) Size Finder CTA band. (5) Four in-stock heroes selected by `isBuyable()` (task 9), each card image + name + price + chipped instalment line + stock badge from the stock-state map. (6) Trust row of evidence only: Roll-Line dealer card, Roadhouse "Recommended shop" with "Eastgate, Bedfordview", and the single real named-and-dated 2022 review. (7) Contact block plus the floating WhatsApp button.

**Acceptance criteria:**
- [ ] All seven blocks present and every count, price and courier figure rendered from JSON — no such number is hard-coded in the HTML (grep proves it).
- [ ] The six counts equal `store:categories` (8 / 48 / 71 / 17 + 30 / 35 / 28); the five live-site links are tagged and present in `manifest.links[]` at 200.
- [ ] Exactly four hero cards, each `is_purchasable && is_in_stock` in `products.json` via `isBuyable()`; flipping a fixture flag changes the rendered set.
- [ ] Every unpublished promise carries `data-illustrative` with a manifest twin; the trust row has no rating, follower count or invented quote.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs; echo "exit=$?"`
- [ ] `cd ~/solafidei-site && grep -nE '\b(48|71|30|35|28)\b|R ?1[05]0\b' public/decks/mels-skate-shop/demo/index.html; echo "counts/figures must come from JSON"`
- [ ] `cd ~/solafidei-site && node -e "const m=require('./public/decks/mels-skate-shop/demo/data/manifest.json'),fs=require('fs');const h=fs.readFileSync('public/decks/mels-skate-shop/demo/index.html','utf8');for(const x of h.match(/product-category\/[a-z0-9-]+\//g)||[])if(!m.links.some(l=>l.href.includes(x)&&l.status===200))throw new Error('unchecked '+x);console.log('category links OK')"`
- [ ] `cd ~/solafidei-site && npm run lint`

**Dependencies:** 11 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `demo/index.html`, `demo/assets/site.js`, `demo/assets/site.css`
**Spec refs:** §6.1, §6.0, §7.3, §7.11, §2.11, §2.14, §2.15

### Task 13: Roller Derby hub (§6.2) + in-stock toggle and filters (group 7)

**Description:** Build `demo/roller-derby.html` — the five decision cards ("Starting derby — complete sets", "Upgrading — boots & plates", "Wheels: rink vs tarmac", "Protective sets (league-required)", "Kids & smaller sizes"), each filtering the grid client-side while every card stays in the DOM; the 60-120 word category copy and four-question FAQ from `draft-copy.json`; the grid of the 7 real derby SKUs (voucher excluded) plus the real protective/wheel/toe-stop SKUs, each card with image, name, price, chipped instalment line and the Store-API-derived stock state (from `site.js`'s stock-state map, computed from `is_purchasable && is_in_stock` plus `stock_availability.text`, never from the sampled `is_in_stock` alone — §2.3 trap); an "In stock only" toggle defaulting on and a "Showing N of M" line in an `aria-live="polite"` region empty on first render; sold-out cards kept alive with a "Tell us your deadline" WhatsApp CTA (built via `site.js`); the Roadhouse credential and the honest league line linking to WhatsApp; and links to the finder pre-set to Derby and to the live-site buying guide. Implement §7 group 7. **Stays one task, unlike the PDP split:** the PDP's A/B split separates two independently large content blocks (static gallery/price/spec vs. size-selector/services/buy-sheet/rails/Q&A, each with its own multi-item acceptance surface). Here the toggle/filter behavior (group 7) is small and tightly coupled to the grid it filters — same DOM, same render function, no separate content block of its own the way PDP-B's rails and Q&A are — so splitting it out would produce an artificial 13b with almost nothing to build. If a build agent finds this task exceeds one turn in practice, split it live into content (grid, cards, copy, FAQ) then behavior (toggle, filters, group 7) without renumbering the rest of the plan — 13a/13b share position 13.

**Acceptance criteria:**
- [ ] Group 7 passes: the toggle hides every non-buyable card while leaving all cards in the DOM (node count constant), and each decision card narrows the grid to a distinct non-empty subset.
- [ ] The live region's textContent is empty on first paint and updates on every toggle and filter change; no static prompt text lives inside it.
- [ ] ~15 real SKUs render entirely from `products.json`; no SKU is invented and the gift voucher is excluded.
- [ ] Every sold-out card offers a working `wa.me` "Tell us your deadline" link with a URL-encoded prefill naming the product; zero console errors.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs --only=7 && node scripts/verify-mels-demo.mjs`
- [ ] `cd ~/solafidei-site && node -e "const p=require('./public/decks/mels-skate-shop/demo/data/products.json');console.log(p.products.filter(x=>x.categories.some(c=>c.id===120)).map(x=>x.name))"`
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && npm run build`

**Dependencies:** 12 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `demo/roller-derby.html`, `demo/assets/site.js`, `demo/assets/site.css`, `scripts/verify-mels-demo.mjs`
**Spec refs:** §6.2, §2.3, §2.14, §7.7, §8

### Task 14: Aura PDP part A — banner, gallery, title, price, instalments, Fit Guarantee, spec table (§6.3.1-6.3.5, 6.3.8)

**Description:** Build the static half of `demo/aura-sky-100.html` plus `assets/pdp.js`'s money maths. (1) The top banner from Mel's own PDP copy: imported to order · approx. 2 weeks · price as of 30 Jul 2026 and may move with the exchange rate · size confirmed on WhatsApp before we order · no fit-based exchange on imported-to-order boots. (2) The gallery of exactly four items — the 562 px white Sky 100 photo rendered at ≤ 562 CSS px and never upscaled, the selection chart captioned "Which Sky? Aura's own selection chart", the size guide captioned "Aura size guide — from the Sky 200 listing" sourced `store:11941`, and a labelled empty slot "60-second fit video — filmed in the build"; no Sky 200 boot photo anywhere. (3) Title "Aura Sky 100 Ice Skate Boot — White" with the "also stocked in black" note and no link to id 11938. (4) Price rendered from `products.json` with the chipped "or 3 interest-free instalments of R4,016.67 — PayJustNow, once onboarded", computed by `instalments(priceCents, n = 3)`. (5) The Fit Guarantee beside the price, chipped, with the §5.9 draft wording, the three literal lines beneath and the imported-boot carve-out in bold (#493). (8) The spec table with every value marked `confirm` unless sourced from Aura.

**Acceptance criteria:**
- [ ] `instalments(1205000)` returns three integers summing to exactly 1205000 with the remainder on the first, and the rendered string is that first amount as R4,016.67; the static price equals `products.json` for 11919 and no rand literal for it appears in the HTML.
- [ ] The Aura boot photo never renders wider than 562 CSS px at any viewport; the gallery has exactly the four §6.3.2 items; no 11938 asset and no Sky 200 boot photo appears.
- [ ] The Fit Guarantee carries `data-illustrative` with a manifest twin, shows all three literal lines and the bold carve-out, and its chip is visible at 390 px.
- [ ] Spec-table rows without an Aura source show a visible `confirm` marker matching a `flags: ["confirm"]` manifest entry.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && node --input-type=module -e "import {instalments} from './public/decks/mels-skate-shop/demo/assets/pdp.js'; const r=instalments(1205000); if(r.reduce((a,b)=>a+b,0)!==1205000) throw new Error('sum'); console.log(r)"`
- [ ] `cd ~/solafidei-site && grep -c 'data-price="1205000"' public/decks/mels-skate-shop/demo/aura-sky-100.html; echo "expect >= 1 — the price is data-driven, not typed"`
- [ ] `cd ~/solafidei-site && grep -nE 'R ?[0-9]{1,3}[,. ]?[0-9]{3}' scripts/gen-aura-sky-100.mjs; echo "expect no matches — every money string comes from products.json through the pdp.js formatters"`
- [ ] `cd ~/solafidei-site && node scripts/gen-aura-sky-100.mjs && git diff --stat -- public/decks/mels-skate-shop/demo/aura-sky-100.html; echo "expect an empty regeneration diff (#545)"`
- [ ] `cd ~/solafidei-site && grep -n '11938' public/decks/mels-skate-shop/demo/aura-sky-100.html; echo "expect no matches — the excluded duplicate SKU"`
<!-- The generator-incompatible price grep that stood here was REPLACED by these checks: ruled #581, struck in place by #599. The 11938 half of the original grep survives unchanged as the last bullet. -->
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs && npm run lint`

**Dependencies:** 13 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `demo/aura-sky-100.html`, `demo/assets/pdp.js`, `demo/assets/site.css`
**Spec refs:** §6.3.1-§6.3.5, §6.3.8, §2.1, §2.2, §2.5, §2.8, §7.6, §8, §11 Q7

### Task 15: Aura PDP part B — size selector, services, buy sheet, rails, Q&A (§6.3.6, 6.3.7, 6.3.9-6.3.13) + group 6

**Description:** Complete the PDP. (6) The size selector: buttons for **Aura's published mm run** inside the selection chart's bands — real data, **no chip on the fieldset legend** (#505 falsified §2.2; chipping the legend would label Mel's own size chart "proposed") — each selection updating an `aria-live` availability line that is empty until a size is picked and that **carries the chip itself** (`data-illustrative="aura-size-stock-states"`, #488 as narrowed by #505: the stock states are the illustrative part) ("Size 240 · in stock in Midrand" / "Size 250 · imported to order, ~2 weeks" / "Size 265 · notify me"), measurements in the label, and a "Not sure? Find my size" link into the finder pre-set to Ice/Aura. (7) The fit note in Melony's voice (`draft-copy`, no chip). (9) Two chipped service checkboxes ("Heat-mould & fit in store", "Mail-in heat-mould + courier", the latter `confirm`-flagged) updating a running total. (10) The fulfilment line and the chipped buy button opening a "Demo — cart & checkout land in month 1; order this boot on WhatsApp now" sheet with a WhatsApp CTA (via `site.js`), Escape-closable, focus returned. (11) Rail A — the 2 real Ice Blades SKUs plus real ice accessories; Rail B — the real ladder Sky 50 R7,850 · Sky 100 R12,050 · Sky 200 R15,550, all `store:<id>`. (12) Three Q&A pairs, the last quoting the guarantee terms. (13) "Ask Melony about this boot" prefilled with product + selected size, and "View on the live site". Complete §7 group 6. All display strings live in one `STATES` map per §8.

**Acceptance criteria:**
- [ ] Group 6 passes in full: each size button drives the correct availability string, the region is empty before any selection, and each service checkbox changes the running total by the right amount and restores it on untick.
- [ ] The legend and both checkboxes carry illustrative ids; mail-in heat-mould is additionally `confirm`-flagged in the manifest.
- [ ] Both rails render from `products.json` with `store:<id>` sources — no ladder price typed into HTML; the buy sheet has a working `wa.me` CTA and no dead end.
- [ ] The "Ask Melony" href contains the URL-encoded product name and the selected size; "View on the live site" points at `/product/aura-sky-100-ice-skate-boot/`, recorded 200 in `manifest.links[]`.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs --only=6 && node scripts/verify-mels-demo.mjs`
- [ ] `cd ~/solafidei-site && grep -oE 'store:1(1905|1919|1924)' public/decks/mels-skate-shop/demo/data/manifest.json | sort -u; echo "expect all three ladder ids present as store: sources"`
- [ ] `cd ~/solafidei-site && grep -nE 'R ?[0-9]{1,3}[,. ]?[0-9]{3}' scripts/gen-aura-sky-100.mjs; echo "expect no matches — no ladder price typed into the generator source"`
- [ ] `cd ~/solafidei-site && node scripts/gen-aura-sky-100.mjs && git diff --stat -- public/decks/mels-skate-shop/demo/aura-sky-100.html; echo "expect an empty regeneration diff (#545)"`
<!-- The generator-incompatible price grep that stood here was REPLACED by these three checks: ruled #591(2), struck in place by #599. #574 makes the PDP generated and a generator bakes the money strings into the bytes, so the grep reported a match and read as a failure. House reading of "hard-coded" is "typed by a human", not "absent from the output" (#581). -->
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && npm run build`

**Dependencies:** 14 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `demo/aura-sky-100.html`, `demo/assets/pdp.js`, `scripts/verify-mels-demo.mjs`
**Spec refs:** §6.3.6, §6.3.7, §6.3.9-§6.3.13, §7.6, §8, §11 Q2

### Checkpoint: three screens up

- [ ] Groups 1, 2, 3, 4, 6, 7, 8, 9, 10, 11 all PASS in one run.
- [ ] `instalments(1205000)` sums exactly and displays R4,016.67; the static price equals `products.json` for 11919.
- [ ] The in-stock toggle hides without removing; both live regions empty on first paint.
- [ ] No price, count or category number hard-coded in HTML; zero console errors on the three pages; `lint` and `build` green.

### Task 16: Size Finder (§6.4) + pure findSize()/whichSky() (group 5)

**Description:** Build `demo/size-finder.html` and `assets/finder.js`. Three steps on one screen, no wizard: (1) what are you buying — Derby / Recreational quad · Artistic · Ice / Figure · Kids & adjustable, with Ice implying Aura and inserting the "Which Sky?" step (foot-length band × body weight × jump level → Sky 50/100/200 straight from Aura's chart), Artistic implying Roll-Line, and a brand picker only where Mel's stocks several (Riedell, Sure-Grip, Chaya, Rio); the page accepts a `?preset=` query so the hub and PDP land on the right branch. (2) How will you measure — foot length in cm with the inline heel-to-wall method, current shoe size in UK/EU/US, or a skate you already own. (3) Output — the size in that brand's own scale (Aura: mm band + model) plus the cm · UK · EU · US conversion row, the "brands vary by 1-2 sizes" disclaimer, and two CTAs: "WhatsApp this result to Melony" (prefilled with inputs and result, via `site.js`) and "Book a fitting". `findSize` and `whichSky` are pure over `sizes.json` with no DOM access; out-of-range or unknown brand returns the WhatsApp fallback, never a dead end; Roll-Line says it has no table and hands off. Keyboard-operable throughout with a visible focus ring and an `aria-live` result region empty until a result exists. Implement §7 group 5.

**Acceptance criteria:**
- [ ] Group 5 passes: ≥ 3 known inputs per supported brand return the expected size and one input per Aura band returns the expected Sky model.
- [ ] Out-of-range and unknown-brand inputs each return the WhatsApp fallback shape (never null, never a throw); Roll-Line returns the honest "no table" handoff.
- [ ] `findSize` and `whichSky` import and run in plain Node with no DOM shim and touch no globals; the "WhatsApp this result" href contains the URL-encoded inputs and result.
- [ ] The whole flow is completable by keyboard alone with visible focus; the result region is empty on first paint; `?preset=derby` and `?preset=ice-aura` pre-set the branch.

**Verification:**
- [ ] `cd ~/solafidei-site && node --input-type=module -e "import {findSize, whichSky} from './public/decks/mels-skate-shop/demo/assets/finder.js'; console.log(JSON.stringify({sky: whichSky(250,55,'singles'), inRange: findSize('chaya-sapphire',{mm:255}), outOfRange: findSize('chaya-sapphire',{mm:990}), noTable: findSize('roll-line',{mm:255}), unknown: findSize('not-a-brand',{mm:255})}, null, 1))"`
<!-- The bullet that stood here was REPLACED, struck in place by #599's precedent. Two independent defects, both measured 2026-09-18: (1) it passed `{cm: 25.5}`, but every one of the six transcribed tables is in mm, `draft-copy.json` labels the field "Foot length (mm)", and `whichSky(mm,kg,level)` is mm — ruled mm end-to-end by #601. (2) It used `riedell` as BOTH the in-range and the out-of-range case, but `sizes.json` gives riedell `noTable: true` (#506 — Mel's size-chart page publishes no Riedell table), so both calls return the identical no-table handoff and NEITHER case tests what it claims to. The replacement exercises four distinct outcomes against a brand that has a real table. -->
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && node scripts/verify-mels-demo.mjs --only=5 && node scripts/verify-mels-demo.mjs`
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && npm run build`

**Dependencies:** 15 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `demo/size-finder.html`, `demo/assets/finder.js`, `demo/assets/site.css`, `scripts/verify-mels-demo.mjs`
**Spec refs:** §6.4, §2.2, §2.4, §7.5, §8
<!-- T16 rulings that supersede this task's Description, all 2026-09-18: #601 the finder's unit is MILLIMETRES, not the cm this Description says. #603(3) the "conversion row across centimetres, UK, EU and US" is UNBUILDABLE — no brand carries all four scales (rio UK/EU, sfr UK/EU, both Chayas US/UK, atom US/EU/inches, aura mm alone); render only the scales that brand's table carries, per draft-copy's finder.result.conversionLabel, and never compute between scales. #603(1)+(2) the brand picker is the six table brands — aura, rio, sfr, chaya-emerald, chaya-sapphire, atom — plus riedell and sure-grip, which stay in deliberately and hand off (#506); "Chaya" is NOT one entry, Emerald and Sapphire disagree on the US-to-UK offset. #600 the Aura branch DISCLOSES the Brannock Suggested-Size gap rather than converting across it. #602 whichSky's overlapping bands resolve lower-band-wins. -->

### Task 17: Book a fitting (§6.5)

**Description:** Build `demo/book-a-fitting.html`, the sixth screen. Render the four named fitting types from `fittings.json` (Quad 30 min · Ice boot + heat-mould 60 min · Kids 20 min · Video consult 20 min), each row showing **both its duration and its price chipped** (`data-illustrative="fitting-durations"` on the duration text, `data-illustrative="fitting-prices"` on the price text — §6.0's own text lists "fitting prices and durations" together as illustrative, so both are chipped, not price alone; see task 6's note); the pre-appointment intake block; the three-step promise (measure → try → adjust); the cancellation policy in plain text with a chip, verbatim from the drafted wording; "By appointment" with Mel's real published hours and never "walk-ins welcome"; and the form — fitting type + preferred day/time + name — whose "Request via WhatsApp" button composes a prefilled `wa.me` message with no backend (via `site.js`), beside the honest one-liner "In the build this is a live on-domain calendar." Contact block at the foot.

**Acceptance criteria:**
- [ ] All four types render from `fittings.json`, each with its own duration chip and price chip, both ids present in the manifest as `illustrative`; no duration or price is a literal in the HTML.
- [ ] The form posts nothing: no `action`, no `fetch`, no `XMLHttpRequest`, no `method="post"`; the button produces a `wa.me` href with type, day/time and name URL-encoded, and a request log shows no new network request on click.
- [ ] The cancellation policy renders verbatim with its chip; "By appointment" plus Mel's real hours appear; "walk-ins welcome" appears nowhere in the package.
- [ ] The on-domain-calendar note is present exactly once, adjacent to the form; zero console errors.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && (npm run dev &) && sleep 10 && CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs; echo "exit=$?"` <!-- T17 adjudication fix: ruling #614 binds "every T17 spine invocation" to CHIPS_COMPLETE=1; this was the one full-spine bullet in this task's own checklist that was missing it. -->
<!-- The bullet that stood here was REPLACED, struck in place by #599's precedent (fact N1, measured 2026-09-18). It already failed on the tree BEFORE this task touched anything: `finder.js:14` and `:18` match `fetch\(` inside truthful comments explaining why finder.js does NOT call fetch() (the #599 class -- a grep that matches truthful comment text is a defective grep, not a defective comment). Group 2's AC2(a) static scan (this task, ruling #611) is the replacement: it strips comments before matching, over the built HTML of all five pages and every assets/*.js file, and additionally checks `<form`, `method="post"`, `navigator.sendBeacon`, `new WebSocket` and `EventSource`, which this bullet never covered. Do NOT delete finder.js's comments to make this grep pass -- the grep was the defect. -->
- [ ] `cd ~/solafidei-site && CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs --only=2; echo "expect exit=0 (subsumes the old grep -- see the struck bullet above)"`
- [ ] `cd ~/solafidei-site && grep -c 'data-illustrative="fitting-durations"' public/decks/mels-skate-shop/demo/book-a-fitting.html; echo "expect 4 (one per fitting type)"`
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && npm run build`

**Dependencies:** 16 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `demo/book-a-fitting.html`, `demo/assets/site.js`, `demo/assets/site.css`, `scripts/verify-mels-demo.mjs`
**Spec refs:** §6.0, §6.5, §6.6, §2.10, §8, §11 Q4

### Checkpoint: all six screens green (owner gate)

- [ ] MECHANICAL: `CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs` exits 0 with every group PASS; every negative control fails as designed, on record.
- [ ] MECHANICAL: zero console errors/warnings, no horizontal scroll at 390 × 844, every primary CTA ≥ 44 px, every page ≤ 1.5 MB, no form posts anywhere.
- [ ] OWNER: walk all six screens on a real phone — Home → Derby hub → Aura PDP, get a size from the finder and tap into the prefilled WhatsApp message, see the named fitting types with durations and prices, book a fitting through the request form and read the composed message before sending it, reach phone/WhatsApp/email/map/hours from every page.
- [ ] OWNER: confirm the "proposed" chips are legible and read as honest, and that the Fit Guarantee terms under the chip say what the owner intends to offer.
- [ ] OWNER: say yes, or name the changes, before any polish work starts.

### Phase 6 — Gates

### Task 18: Lighthouse mobile + impeccable detect — measurement only

**Description:** Phase A, split from remediation so the owner sees raw numbers before any fix can mask them. Run the two external quality gates against `npm run build && npm run start` (production, not dev). Run Lighthouse first, since it is not installed locally and `npx` needs a network download that must fail early if it is going to: mobile on Home and the PDP with the §4 flags, targeting performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95, JSON saved so the exact scores can be pasted into the PR. If the download is genuinely unavailable, record that and substitute Playwright-measured equivalents (LCP, CLS, transferred bytes, a structural a11y pass) labelled as substitutes — §9 forbids inventing a score. Then run `impeccable detect` on the demo directory and at `--viewport 390x844`. This task makes **no code changes** — it produces a clean go/no-go artifact for task 19's capped remediation and CP6.

**Acceptance criteria:**
- [ ] Lighthouse mobile JSON exists for Home and PDP with all six numbers recorded verbatim, or the unavailability is recorded with labelled substitute measurements and no invented score anywhere.
- [ ] `impeccable detect` output is recorded for the demo directory and at 390x844, or its unavailability is recorded (never silently skipped).
- [ ] Zero files under `demo/` or `scripts/` are changed by this task — a diff/status check proves it.
- [ ] The recorded numbers/findings are handed to task 19 as its scope input; nothing is fixed in this task.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run build && (npm run start &) && sleep 10 && npx lighthouse http://localhost:3000/decks/mels-skate-shop/demo/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices --output=json --output-path=/tmp/lh-home.json --chrome-flags='--headless=new' && npx lighthouse http://localhost:3000/decks/mels-skate-shop/demo/aura-sky-100 --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices --output=json --output-path=/tmp/lh-pdp.json --chrome-flags='--headless=new'`
- [ ] `node -e "for(const f of ['/tmp/lh-home.json','/tmp/lh-pdp.json']){const r=require(f);console.log(f,Object.entries(r.categories).map(([k,v])=>k+'='+Math.round(v.score*100)).join(' '))}"`
- [ ] `cd ~/solafidei-site && ~/.claude/skills/impeccable/scripts/impeccable detect public/decks/mels-skate-shop/demo && git status --short public/decks/mels-skate-shop/ scripts/; echo "expect no changes"`

**Dependencies:** 17 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** none in-repo (produces `/tmp` Lighthouse JSON and recorded `impeccable` output, carried into task 19 and CP6's evidence note)
**Spec refs:** §4, §9, §10

### Task 19: Capped remediation against the named lever list

**Description:** Phase B, gated on task 18's recorded numbers so remediation cannot balloon into an open-ended rewrite. Drive error-level findings and any sub-90/95/95 score to zero using *only* this named lever list: explicit `width`/`height` on every `<img>`, `loading="lazy"` below the fold, deferred `<script type="module">` loading, `font-display: swap`, tighter WebP re-encoding within the existing ≤ 150 KB cap (never a new image pipeline). **Scope cap:** if closing a finding needs anything outside that lever list — a markup restructure, a new asset, a JS behavior change, a font swap — stop, do not silently absorb it, and raise it as a named owner-facing item instead (record it in the evidence note for CP6, do not fix it unilaterally). Header/contact `<img>` fixes (the logo's `width`/`height`) go through `demo/.source/*.html` + `node scripts/gen-shared-blocks.mjs`, never the five pages directly, so group 4 stays byte-identical (task 8's rule). Every remediation keeps every verify group green and adds no dependency, build step, CDN, third-party script or inline style. Re-measure Lighthouse/impeccable after fixes to confirm the targets are met, or record what is still short and why.

**Acceptance criteria:**
- [ ] Every `<img>` carries explicit `width`/`height` and below-the-fold images carry `loading="lazy"`; every fix applied came from the named lever list — any finding that didn't is listed as a raised item, not silently fixed.
- [ ] Re-measured Lighthouse mobile JSON for Home and PDP shows performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95, or the labelled-substitute/raised-item path is documented.
- [ ] `impeccable detect` returns zero error-level findings, or the raised-item path is documented.
- [ ] Every verify group still passes; `npm run lint` and `npm run build` green; `git diff main -- package.json package-lock.json` empty and no inline style or external script was added.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run build && (npm run start &) && sleep 10 && node scripts/verify-mels-demo.mjs; echo "exit=$?"`
- [ ] `cd ~/solafidei-site && npx lighthouse http://localhost:3000/decks/mels-skate-shop/demo/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices --output=json --output-path=/tmp/lh-home-2.json --chrome-flags='--headless=new' && node -e "const r=require('/tmp/lh-home-2.json');console.log(Object.entries(r.categories).map(([k,v])=>k+'='+Math.round(v.score*100)).join(' '))"`
- [ ] `cd ~/solafidei-site && ~/.claude/skills/impeccable/scripts/impeccable detect public/decks/mels-skate-shop/demo && npm run lint`
- [ ] `cd ~/solafidei-site && grep -rLn 'width=\|height=' public/decks/mels-skate-shop/demo/*.html; echo "expect no file listed (every page has sized images)"`

**Dependencies:** 18 · **Model:** sonnet · **Estimated scope:** M
**Files likely touched:** `demo/assets/site.css`, `demo/*.html`, `public/decks/mels-skate-shop/img/*.webp`
**Spec refs:** §4, §7 (pre-PR paragraph), §9, §10

### Task 20: Six screenshots + full §4 command sweep on a production build

**Description:** Produce the PR evidence and prove the §4 command list end to end. Write `scripts/shoot-mels-demo.mjs` (throwaway Playwright, same convention) capturing six 390 × 844 full-page screenshots — the deck page and the five demo screens, with the PDP shot taken after a size is selected so the availability line shows and the Size Finder shot showing a real computed result — waiting for `networkidle` and `document.fonts.ready` so type is not caught mid-swap, named `01-home.png` … `06-deck.png` into `public/decks/mels-skate-shop/.shots/` (a **repo-relative, gitignored** scratch directory — not `/tmp` — so the artifact survives the handoff from this subagent task to task 22's main-session canvas step regardless of sandboxing; a prior draft of this plan used `/tmp/mels-shots`, which a fresh subagent session may not share with the main session). Then run the full sweep against the production build: `npm run lint`, `npm run build`, `npm run start`, all six Mel's-shop URLs 200, every verify group green against `start` (not just `dev`), and the two existing decks still 200. Collect the Lighthouse numbers, the impeccable result, the screenshot paths and the negative-control outputs into an evidence note for the PR body.

**Acceptance criteria:**
- [ ] Six 390 × 844 PNGs exist under `public/decks/mels-skate-shop/.shots/`, covering the deck placeholder and all five demo screens, each non-empty, with the PDP shot showing a selected size and the finder shot showing a result.
- [ ] Every verify group passes against `npm run start`; all six Mel's-shop URLs return 200 from the production server and lux-fragrance / optimus-plumbing still return 200.
- [ ] `npm run lint` and `npm run build` are green; the script adds no npm dependency; `.gitignore` covers `.shots/` so `git status` stays clean.
- [ ] The evidence note collects the Lighthouse numbers, the impeccable result, the screenshot paths and the negative-control outputs, ready to paste into the PR.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run build && (npm run start &) && sleep 10 && node scripts/verify-mels-demo.mjs && node scripts/shoot-mels-demo.mjs --out public/decks/mels-skate-shop/.shots && ls -la public/decks/mels-skate-shop/.shots`
- [ ] `cd ~/solafidei-site && for p in "" /demo /demo/roller-derby /demo/aura-sky-100 /demo/size-finder /demo/book-a-fitting; do printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/decks/mels-skate-shop$p"; done; curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/lux-fragrance`
- [ ] `cd ~/solafidei-site && git status --short`
- [ ] `cd ~/solafidei-site && npm run lint`

**Dependencies:** 19 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `scripts/shoot-mels-demo.mjs`, `.gitignore`, `public/decks/mels-skate-shop/.shots/*.png`
**Spec refs:** §4, §9, §10

### Checkpoint: pre-PR evidence (owner gate)

- [ ] MECHANICAL: Lighthouse mobile on Home and PDP ≥ 90 / ≥ 95 / ≥ 95, JSON saved, numbers transcribed verbatim (or the documented substitute, labelled, with no invented score).
- [ ] MECHANICAL: `impeccable detect` zero primary findings — the CLI has no error-level tier, it reports primary findings (which drive exit 2) and advisory findings (which never count) — or the raised-item path documented as Task 19's acceptance criteria at `:522` already allow for this same command, or the unavailability recorded. (#644)
- [ ] MECHANICAL: six 390 × 844 screenshots captured; every verify group passes against `npm run start`, not just `npm run dev`.
- [ ] OWNER: review the Lighthouse numbers, the impeccable output and the six screenshots and approve them as the PR evidence, or name what to re-shoot / chase.

### Phase 7 — Deck

### Task 21: Deck slide copy pack — 12 slides, claim + evidence, rule-checked (§6.7)

**Description:** Opus copy pass for the deck, authored as a structured pack (one entry per slide: headline, body, the single piece of evidence, the footnote source, any link) the canvas will render. All twelve §6.7 slides: cover with the "why did a stranger build this?" line; the moat nobody can see; the five-things-I'd-fix slide carrying two prominent faults — the headline pre-rendered "No results" on a 430-product site (twinned with SkatePro) and the second, booking hopping off-domain to Koalendar (twinned with Spotech → Naver Booking, report L352) — with three faults demoted to a footnote; see-it-fixed with the demo link and "R0 upfront" by slide 4; the lost sale; the 26-teardown slide; the concept with `store:categories` counts; the Size Finder slide; how it's built (why server-rendered, why this is not ProSkaters Place); how we work together with "R0 upfront · 12-month minimum · from R ______ / month", the tools-inside-the-retainer line and the day-30 get-out kept exactly as worded (#491a/b/c); how we'll know it worked; and the next step. Enforce the §6.7 rules inside the pack: one claim + one evidence per slide, a footnote source on every non-exempt slide (1 and 12 exempt), no two criticism slides adjacent, nothing from the report's omit-list, PayJustNow/Ozow as "once onboarded", no rand figure on slide 10.

**Acceptance criteria:**
- [ ] Exactly 12 entries matching the §6.7 table; each non-exempt slide carries exactly one claim, one evidence item and a footnote source; slides 1 and 12 are marked exempt.
- [ ] Slide 10 contains the literal "from R ______ / month" with no numeric rand amount anywhere on it; the day-30 get-out and the tools-inside-the-retainer line appear exactly as ruled.
- [ ] No slide mentions a Lighthouse score, a Google Business rating, an Instagram/TikTok figure, Figure Skating Boutique's club %, or Willies' heat-mould pricing; no two criticism slides are adjacent and the demo link plus "R0 upfront" both appear by slide 4.
- [ ] The five faults on slide 3 are the same five the demo's Home, hub, booking page and contact block fix; slide 7's counts match `store:categories`; every peer twin carries its report line reference.

**Verification:**
- [ ] `cd ~/solafidei-site && node -e "const d=require('./docs/decks/mels-skate-shop-slides.json');if(d.length!==12)throw new Error('slides '+d.length);const s=JSON.stringify(d[9]);if(/R ?[0-9][0-9,]*\s*\/\s*month/.test(s))throw new Error('rand figure on slide 10');if(!s.includes('from R ______ / month'))throw new Error('placeholder missing');const m=d.filter((x,i)=>i!==0&&i!==11&&!x.footnote);if(m.length)throw new Error('no footnote: '+m.map(x=>x.n));console.log('slide rules OK')"`
- [ ] `cd ~/solafidei-site && grep -inE 'lighthouse|google business|instagram [0-9]|tiktok [0-9]|figure skating boutique.*%|willies.*heat' docs/decks/mels-skate-shop-slides.json; echo "expect no matches"`
- [ ] Manual: read slides 1-12 in order against the §6.7 table and confirm one claim + one evidence per slide and no two adjacent criticism slides.
- [ ] `cd ~/solafidei-site && npm run lint`

**Dependencies:** 7 · **Model:** opus · **Estimated scope:** M
**Files likely touched:** `docs/decks/mels-skate-shop-slides.json`
**Spec refs:** §6.7, §2.6, §2.14, §2.15, §9, §11 Q5

### Task 22: Deck canvas — twelve artboards with the design skill (main session)

**Description:** Main-session step, not a subagent task: use the `design` skill to build the twelve-artboard canvas from the task-21 copy pack and the task-20 screenshots, laid out for a laptop step-through and legible at 390 px wide, in Mel's brand direction from the task-5 design pass (not the Solafidei dark tokens), so the deck and the demo read as one package. Slide 4 embeds the six demo thumbnails and makes the demo URL the primary tappable element; slide 8 uses the Size Finder hero shot; slide 2 uses the saved Roll-Line listing screenshot with the locator URL in the footnote; slide 12 carries the demo link primary and a QR code secondary labelled "for the laptop or printed copy" plus presenter contact. **Note on §9's "ask first — any use of Mel's images beyond the demo pages":** slides 4 and 8 embed task-20's demo screenshots, which carry Mel's product photography and logo. The approved §6.7 slide table already calls for demo thumbnails on slide 4 and the Size Finder hero shot on slide 8, which supports this use — but this plan does not treat that as a closed boundary decided on the spec author's behalf: CP7 below carries an explicit owner confirmation line for this specific use, and the canvas ships pending that sign-off alongside the rest of the deck review, not as a foregone conclusion. Publish the canvas and hand the URL to the owner with the export target path.

**Acceptance criteria:**
- [ ] A published canvas exists with twelve artboards matching the copy pack one-for-one, in Mel's brand direction.
- [ ] Every artboard is legible at 390 px wide and at laptop width, with no clipped or overflowing text at either size.
- [ ] Slides 2, 4, 8 and 12 carry the correct imagery and the demo link is the primary tappable element on 4 and 12.
- [ ] Slide 10 shows "from R ______ / month" with the placeholder intact and no rand figure introduced during layout; no omit-list item appears.

**Verification:**
- [ ] Manual: open the published canvas and step through all twelve artboards against `docs/decks/mels-skate-shop-slides.json`.
- [ ] Manual: view the canvas at 390 px width and confirm every slide is legible with no clipped text.
- [ ] Manual: confirm the canvas URL and the export target `public/decks/mels-skate-shop/index.html` have been sent to the owner, along with the standing photography-use question CP7 will ask.

**Dependencies:** 20, 21 · **Model:** main-session · **Estimated scope:** M
**Files likely touched:** none in-repo (canvas artifact) — consumes `docs/decks/mels-skate-shop-slides.json`, `public/decks/mels-skate-shop/.shots/*.png`
**Spec refs:** §2.6, §6.7, §9 ask-first, §11 Q1

### Task 23: Owner exports the canvas to public/decks/mels-skate-shop/index.html

**Description:** Owner-side browser action this pipeline cannot perform (ruled #487; the LUX and Optimus decks are the precedent — Claude Design "Bundled Page" HTML exports with `__bundler/*` markers, 11-18 MB). The owner reviews and refines the canvas visually, runs the export, and saves the result over the task-1 placeholder on the branch, then confirms `<meta name="robots" content="noindex">` survived (adding it if not) and that the demo link inside the exported deck points at `/decks/mels-skate-shop/demo`. If the export path fails, the §9 "ask first" hand-authored HTML fallback is an owner decision to be raised, never taken by the pipeline.

**Acceptance criteria:**
- [ ] `public/decks/mels-skate-shop/index.html` is the exported deck, not the placeholder, and is committed on the branch.
- [ ] The exported file contains `noindex` and a working link to `/decks/mels-skate-shop/demo`.
- [ ] The existing LUX and Optimus decks are untouched by the export commit.
- [ ] If the export failed, no hand-authored fallback was written — the question was put to the owner.

**Verification:**
- [ ] `cd ~/solafidei-site && wc -c public/decks/mels-skate-shop/index.html && grep -c 'name="robots"' public/decks/mels-skate-shop/index.html && grep -o '/decks/mels-skate-shop/demo' public/decks/mels-skate-shop/index.html | head -1`
- [ ] `cd ~/solafidei-site && git status --short public/decks/ && git diff main --name-only -- public/decks/lux-fragrance public/decks/optimus-plumbing; echo "expect no matches"`
- [ ] Manual: owner confirms the exported deck matches the canvas they signed off.
- [ ] `cd ~/solafidei-site && npm run lint && npm run build`

**Dependencies:** 22 · **Model:** owner · **Estimated scope:** S
**Files likely touched:** `public/decks/mels-skate-shop/index.html`
**Spec refs:** §2.6, §5, §9, §11 Q1

### Task 24: Deck post-export verification — URL, noindex, link crawl and claim scan

**Description:** Verify the exported deck with the same rigour as the demo, since it is an owner-side browser artefact the pipeline did not author. Extend the verify script's deck coverage: `/decks/mels-skate-shop` and `/decks/mels-skate-shop/index.html` both 200 under `npm run start`; `noindex` present; exactly one `<h1>`; zero console errors (bundled exports often ship warnings — this is where they surface, enumerated and judged); every href on the deck crawled under group 3's rules, including any asset or font URL the export may have smuggled in, which must all be self-contained; the demo link present and resolving; and a claim scan asserting the deck text carries no omit-list item and no rand figure in the slide-10 content. **This task does not re-invoke the fetch script.** §9 caps the whole build to one network pass, and task 4 already resolved every outbound link this deck needs (fetching the 9, recording Google Maps and Waze `exempt` per decision #495) — a prior draft of this plan re-ran `fetch-mels-fixtures.mjs --force --links-only` here, which is a second pass and a direct violation of that cap with no owner ruling authorizing it. Instead, this task asserts the existing `manifest.links[]` entries are all resolved (no `pending-manual` left unaddressed) and that the exported deck introduces no external URL absent from that manifest; if it does, that is raised to the owner as a scope question, never fetched silently by this task.

**Acceptance criteria:**
- [ ] Both deck URLs return 200 under `npm run start`; the deck has `noindex`, one `<h1>` and zero console errors; lux-fragrance and optimus-plumbing still 200.
- [ ] Group 3 now covers the exported deck's hrefs and passes: no dead link, no off-allow-list host, no external asset or font URL; a direct grep for hotlinked `melsskateshop.co.za` image/asset URLs in the exported HTML also comes up empty, mirroring task 3's demo-side check.
- [ ] The claim scan over the exported deck finds zero omit-list items and zero rand figures in the slide-10 content.
- [ ] Every verify group passes against the production build with the real deck in place; `lint` and `build` green; every `manifest.links[]` entry is 200/`manual-ok`/`exempt` (none `pending-manual`), and no new external host appears in the deck beyond what `manifest.links[]` already covers — no re-fetch was run to produce this result.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run build && (npm run start &) && sleep 10 && node scripts/verify-mels-demo.mjs; echo "exit=$?"`
- [ ] `cd ~/solafidei-site && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/mels-skate-shop && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/decks/mels-skate-shop/index.html && node scripts/verify-mels-demo.mjs --only=3 && node scripts/verify-mels-demo.mjs --only=2`
- [ ] `cd ~/solafidei-site && node -e "const m=require('./public/decks/mels-skate-shop/demo/data/manifest.json');const bad=m.links.filter(l=>l.status==='pending-manual');if(bad.length)throw new Error('pending: '+JSON.stringify(bad));console.table(m.links)"`
- [ ] `cd ~/solafidei-site && grep -n 'melsskateshop.co.za' public/decks/mels-skate-shop/index.html; echo "expect no matches (no hotlinking on the exported deck)"`

**Dependencies:** 23 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `scripts/verify-mels-demo.mjs`, `public/decks/mels-skate-shop/index.html`
**Spec refs:** §7.1, §7.2, §7.3, §7.9, §9, §10

### Checkpoint: deck exported and re-verified (owner gate)

- [ ] OWNER: the canvas was reviewed, refined and exported by the owner to `public/decks/mels-skate-shop/index.html`; the placeholder is gone.
- [ ] OWNER: open the exported `/decks/mels-skate-shop` on an actual phone and confirm every slide is legible and reads correctly — this is the deck half of §10's combined "owner walks the deck and the demo on a phone and says yes" criterion (the demo half was discharged at CP5).
- [ ] OWNER: confirm slide 10 reads "from R ______ / month" with no rand figure, the day-30 get-out is worded as ruled, and tools sit inside the retainer with no pass-through line.
- [ ] OWNER: confirm embedding Mel's product photography/logo (via task-20 demo screenshots) on deck slides 4 and 8 is acceptable use beyond the demo pages (§9 ask-first) — this is a distinct sign-off from the general phone walkthrough above.
- [ ] MECHANICAL: both deck URLs 200 under `npm run start`; `noindex` present; one `<h1>`; zero console errors; the existing decks still serve.
- [ ] MECHANICAL: group 3 re-run over the exported deck — no dead link, no off-allow-list host, no external asset or font URL smuggled in; claim scan clean; every verify group green with the real deck in place; no second fetch pass was run.

### Phase 8 — Ship

### Task 25: Manifest audit and §10 success-criteria sign-off

**Description:** §10's "zero unsourced facts" is explicitly a manual review of the whole manifest — §7.11 only scripts the chip subset. Read `manifest.json` end to end: every `facts[]` entry has a source from the §5 vocabulary and its text matches what the page actually renders; every `images[]` entry has a `from`, a source width and a file that exists (bijection re-confirmed after all edits); every `links[]` entry is 200, `manual-ok` or `exempt` with a `checkedAt`. Walk the §10 checklist box by box and record the evidence for each. Cross-check that no omit-list item, invented review, rating, follower count or Lighthouse score appears anywhere in the deck or demo, that the `confirm` flags are present where §2.9 and §6.3.8 require, and that the committed fixtures make the build reproducible without network (no runtime fetch to melsskateshop.co.za exists in any page module). **This task is read-only compilation and cross-referencing of evidence already produced by earlier tasks and checkpoints** — it asserts no new fact, adds no new chip, and introduces no new verify-script assertion; any discrepancy found is corrected directly in `manifest.json` (data, not code).

**Acceptance criteria:**
- [ ] Zero `facts[]` entries without a valid source; zero `images[]` entries without `from`/`width`; zero `links[]` entries still `pending-manual`.
- [ ] `manifest.images[]` ↔ `img/*.webp` is a bijection; the address, spec-table values and mail-in heat-mould all carry `confirm`.
- [ ] A grep across the deck and demo finds zero occurrences of the five §10 unverified items and zero invented social proof.
- [ ] No page module fetches anything outside `demo/data/`; a written audit records the evidence for each of the seven §10 boxes, with the owner walkthrough box dated from its checkpoint.

**Verification:**
- [ ] `cd ~/solafidei-site && node -e "const m=require('./public/decks/mels-skate-shop/demo/data/manifest.json'),fs=require('fs');const ok=s=>/^(report L\d+|audit\.json|store:[a-z0-9]+|roll-line\.it|illustrative)$/.test(s||'');console.log('badSource',m.facts.filter(f=>!ok(f.source)).length,'badImg',m.images.filter(i=>!i.from||!i.width).length,'pending',m.links.filter(l=>l.status==='pending-manual').length);const d=fs.readdirSync('public/decks/mels-skate-shop/img');const s=new Set(m.images.map(i=>i.file));if(d.some(f=>!s.has(f)))throw new Error('bijection')"`
- [ ] `cd ~/solafidei-site && grep -rinE 'lighthouse score|google business|instagram|tiktok|[0-9]+% of (its )?club|willies.*heat|walk-?ins' public/decks/mels-skate-shop/; echo "expect no matches"`
- [ ] `cd ~/solafidei-site && grep -rn 'fetch(' public/decks/mels-skate-shop/demo/assets/*.js | grep -v "data/"; echo "expect no matches"`

**Dependencies:** 24 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** `demo/data/manifest.json` (corrections only), the evidence note
**Spec refs:** §7.11, §9, §10

### Task 26: Open the PR with screenshots, Lighthouse numbers and the evidence trail

**Description:** Commit any outstanding work on `feat/mels-skate-shop-pitch` (fixtures included, so the build is reproducible without re-fetching), push the branch, and open a PR into `main` — never push to `main`, never merge without the owner, since `main` deploys to solafidei.com and makes the deck and Mel's imagery public. The PR body carries: the two live URLs; the six screenshots in order; the Lighthouse mobile triples for Home and PDP verbatim; the per-page transferred-byte figures against the 1.5 MB budget; the `impeccable detect` result; the full verify output with every group PASS; every negative-control output on record; the §10 checklist from task 25 with its evidence; the illustrative id list and the `confirm`-flagged list; the image credit line ("Product imagery © Mel's Skate Shop, reproduced for this proposal"); and an explicit note that merging publishes the deck and Mel's imagery, so the merge is the owner's call. Commit trailers follow the harness attribution rule in force at commit time.

**Acceptance criteria:**
- [ ] A PR from `feat/mels-skate-shop-pitch` into `main` is open; `git log origin/main..HEAD` shows no direct push to `main` and the branch carries the committed fixtures.
- [ ] The PR body contains the six screenshots, both Lighthouse triples, the impeccable result, the full verify output, every negative control on record, the §10 checklist, the illustrative/confirm lists and the image credit line, and flags the merge as the owner's decision.
- [ ] `git diff main --name-only` touches only `next.config.ts` (two rewrite lines), `public/decks/mels-skate-shop/**`, `scripts/**` and `docs/**` — nothing in `src/`, `package.json`, `package-lock.json`, `globals.css`, `layout.tsx` or the existing decks.
- [ ] `npm run lint` and `npm run build` are green on the branch head and `CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs` exits 0 with every group PASS.

**Verification:**
- [ ] `. ~/.nvm/nvm.sh && nvm use 24 && cd ~/solafidei-site && npm run lint && npm run build && (npm run start &) && sleep 10 && node scripts/verify-mels-demo.mjs | tee /tmp/verify-final.txt`
- [ ] `cd ~/solafidei-site && git diff main --name-only | grep -E '^src/|^package(-lock)?\.json$|globals\.css|layout\.tsx|decks/(lux|optimus)'; echo "expect no matches"`
- [ ] `cd ~/solafidei-site && git push -u origin feat/mels-skate-shop-pitch && gh pr create --base main --title "feat(decks): Mel's Skate Shop cold-pitch deck + six-screen demo" --body-file /tmp/pr-body.md && gh pr view --json url,state,baseRefName`

**Dependencies:** 25 · **Model:** sonnet · **Estimated scope:** S
**Files likely touched:** branch + PR; `public/decks/mels-skate-shop/**`, `scripts/*.mjs`, `docs/decks/mels-skate-shop-slides.json`
**Spec refs:** §9, §10

### Checkpoint: PR open — merge gate (owner gate)

- [ ] MECHANICAL: PR open from `feat/mels-skate-shop-pitch`; no commit pushed directly to `main`; fixtures committed; diff touches nothing under `src/`, no `package.json`, no `globals.css`, no `layout.tsx`, and only two rewrite lines in `next.config.ts`.
- [ ] MECHANICAL: PR body carries the six screenshots, both Lighthouse triples, the impeccable result, the full verify output with every group PASS, every negative control on record, the manifest audit and the image credit line.
- [ ] OWNER: decide the merge — merging publishes the deck and Mel's imagery on solafidei.com; nothing merges without this.
- [ ] OWNER: confirm Mel has not been contacted on any channel at any point in the build.

## Parallelization

- **Tasks 5 (design, opus) and 6 (copy A, opus)** touch disjoint files (`site.css`/`PRODUCT.md` vs `data/*.json`) and both depend only on the fixtures — run them concurrently to overlap the two Opus passes. Task 7 (copy B) must follow task 6 (it extends the same manifest).
- **Tasks 8 (shared header/contact, sonnet) and 9 (site.js, sonnet)** touch disjoint files and neither needs the other's output — task 8's header/footer WhatsApp links are plain, built once from `contact.json`; task 9's reusable builder is only consumed starting task 12. Run them concurrently once both depend only on tasks 5 and 7 / 2 and 5 respectively. Tasks 10 and 11 (the verify spine) depend on both.
- **Task 21 (deck slide copy, opus)** depends only on task 7 and touches only `docs/decks/mels-skate-shop-slides.json` — run it in parallel with the whole demo build (tasks 8-20) so the canvas step has its input without blocking.
- **Tasks 3 (images) and 4 (links)** may run concurrently only if authored as two modules the fetch script imports and merges into the manifest; if both edit the manifest inline, keep them sequential.
- **NOT parallel past task 12 (Home), and deliberately so.** The screen tasks are strictly serial: task 13 (Derby hub) depends on 12, task 14 (PDP A) on 13, task 15 (PDP B) on 14, task 16 (Size Finder) on 15, task 17 (Book a fitting) on 16 — each landing, and being verified, before the next starts. This is intentional, not an oversight: the plan's core architecture decision is that "every later task's verify run is a full regression check of every page already built," which only holds if each screen lands, and is verified, before the next one starts. (An earlier draft of this plan declared task 14's dependency as task 12 rather than 13, which — combined with tasks 13 and 14 both formally depending only on task 12 — would have made them graph-eligible for concurrent scheduling despite the "strictly serial" claim below contradicting that; the dependency fields above are the corrected, single source of truth.) A wall-clock-motivated parallel variant is possible in principle (Derby hub, Size Finder and Book a fitting touch disjoint HTML/JS and could run concurrently against tasks 10/11 alone), but it trades away the regression guarantee and adds a real collision risk on the two genuinely shared files — `scripts/verify-mels-demo.mjs` (groups 5, 6, 7 land in different tasks) and `demo/assets/site.css` — so it is out of scope for this plan; raise it explicitly with the owner before adopting it rather than assuming it from this section.
- **Tasks 18 (Lighthouse + impeccable measurement), 19 (capped remediation) and 20 (screenshots)** share a production server — run 18 then 19 then 20 in one `build && start` session; 19's fixes must land before 20's shots are taken.
- **NOT parallelizable:** tasks 1 → 2 → 3/4 (the fetch script grows in layers); 8/9 → 10 → 11 (the spine needs the chrome, then the structural checks before the content-integrity checks that share the same file); 22 → 23 → 24 (canvas, owner export and post-export verification are single-threaded by nature); 25 → 26.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| The Store API changes shape, rate-limits or blocks, stranding every downstream task | High | Retired first (task 2, before any page exists); acceptance asserts the §2.15 counts so a shape change fails loudly; output committed so one successful fetch serves the whole build; the hand-written fixture fallback is raised to the owner at CP1, never taken silently |
| The two new rewrites collide with the existing `/decks/:deck` rule and break the live LUX/Optimus decks | High | Demo rules declared first; task 1 tests all six Mel's-shop URLs plus both existing decks before any content; group 1 re-asserts on every run; task 24 re-checks on the production build |
| The ≤ 10 outbound budget — 9 fetched of 12 enumerated (Google Maps + Waze exempt per decision #495, Facebook never fetched) | Low | Task 4 asserts the fetched count before issuing any request and fails with the full candidate list if that ever changes |
| A dead link or an off-allow-list host reaches the demo — the exact fault the deck criticises Mel's site for | High | Group 3 lands at task 11, before any screen content, with both negative controls demonstrated, and runs on every verify invocation thereafter; task 24 extends it over the exported deck using the existing single-pass `manifest.links[]` (no second fetch, §9 one-pass); task 25's manifest audit confirms every entry is still resolved |
| The chip↔manifest bijection passes vacuously, or a chip is added to the manifest to make the assertion green | High | Group 11 pins the set against the nine ids §6.0 enumerates, not merely set-equality, and ships with three self-contained negative controls at task 11 (see that task for why they're injection-based rather than assuming a real screen); CP5 puts the chips in front of the owner on a phone |
| Lighthouse ≥ 90 on mobile is hard with ~15 product images and two font families, and `lighthouse` is not installed (npx needs network) | Med | Payload gated early by group 10 at tasks 10/11, so the problem surfaces on the page that caused it; task 18 runs Lighthouse first (measurement only) so a download failure surfaces early, before task 19's remediation is scoped; ≤ 150 KB per WebP, lazy-loading, explicit dimensions and ≤ 2 self-hosted fonts are acceptance criteria; substitutes are measured and labelled — §9 forbids inventing a score |
| The byte-identical shared blocks drift as later tasks edit the five pages | Med | Generated from one source string by a scripted copy step, never hand-edited five times; group 4 lands at task 8 before any page content and runs on every subsequent invocation, so drift fails the task that introduced it |
| The owner-side canvas export fails, or produces an 11-18 MB bundle with its own external asset/font URLs | High | Task 1 ships a `noindex` placeholder so the deck URL is never a 404; the copy pack (task 21) is a complete standalone artefact, so the fallback would be formatting, not rewriting; task 24 crawls the export under group 3's rules without a second fetch; the §9 "ask first" fallback stays an owner ruling (#487) |
| `sharp` disappears on a Next.js upgrade, silently breaking the WebP re-encode | Low | Resolved explicitly via `createRequire` with a clear failure message, `ffmpeg` on PATH as fallback, loud failure if neither works; zero `package.json` diff is an acceptance criterion; fixtures are committed so the re-encode need not run again |
| Facts drift from their sources — a hard-coded price, count or claim typed into HTML | Med | §8's "HTML never repeats a price JSON holds" is an acceptance criterion and a grep check on tasks 12, 14 and 15; group 6 asserts the rendered price equals `products.json`; task 25's manual manifest review is a gate |
| Scope creep — a framework, CDN, npm package or `src/app` route reached for to solve a layout or data problem | Med | Every task's verification includes a `git diff main` check over `src/`, `package.json` and `package-lock.json` plus greps for `<script src="http`, `<iframe>` and inline styles; task 26 makes the clean diff a merge condition |
| An agent contacts Mel, or fetches beyond the read-only budget, to "confirm" a flagged fact | High | The fetch script is the only network-touching code, GET/HEAD-only with no auth, no cookies and no Facebook path (grep-asserted); every other task works offline against committed fixtures; `confirm` flags are shown flagged, never resolved by contact; CP8 asks the owner to confirm no contact occurred |
| A rand figure or an unverified report fact leaks onto a deck slide | High | Task 21 greps slide 10 for rand figures and the whole pack for the omit-list *before* any layout exists; task 24 re-scans the exported bundle's text |

## Definition of done

- [ ] `/decks/mels-skate-shop` and `/decks/mels-skate-shop/demo` (+ the five clean sub-URLs) serve from `npm run start`; the existing LUX and Optimus decks still serve.
- [ ] `CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs` passes every assertion group against the production build, with every negative control failing as designed and on record.
- [ ] Lighthouse mobile on Home and PDP ≥ 90 performance / ≥ 95 accessibility / ≥ 95 best-practices (or labelled substitutes, never an invented score); `impeccable detect` zero error-level findings.
- [ ] `manifest.json` has zero unsourced facts (manual review, task 25); every outbound link has a recorded 200 or the owner's `manual-ok`; the deck quotes nothing from the report's unverified list.
- [ ] Zero dead links (crawl assertion) and zero console errors or warnings on all six pages.
- [ ] Owner has walked the deck and the demo on a phone and said yes (CP5, CP7).
- [ ] `npm run lint` and `npm run build` green; PR open into `main` with the six screenshots, the Lighthouse numbers and the evidence trail; `git diff main` touches nothing under `src/`, no `package.json`, and only two rewrite lines in `next.config.ts`.

## Open questions

None — the seven §11 questions were ruled #487-#493. Two items are deliberately deferred to owner decisions already scheduled inside the checkpoints rather than raised here: whether the Facebook link survives the manual check (CP1), and the hand-authored deck fallback if the export path fails (CP7, §9 ask-first). Two placement details are agent-level and settled by this plan: `PRODUCT.md` ships inside `demo/` where `impeccable detect` finds it, and the deck slide copy pack lives at `docs/decks/mels-skate-shop-slides.json` (input to the canvas, never served).

## Fix log (this revision)

Applied against critic findings on the prior 23-task draft:
- **Blocker:** task 4/CP1 now enumerate maps.google.com/waze.com (§7.3's allow-list names them as non-exempt), surfacing a real 12-vs-10 budget conflict resolved at CP1, not silently dropped or silently over-budget.
- **Blocker:** task 24 (was 21) no longer re-invokes the fetch script — the §9 one-pass cap is honored; it asserts the existing single-pass manifest instead.
- **Major:** task 14 (was 12, PDP A)'s dependency chain fixed to `deps: 13` so the screen tasks are actually strictly serial, matching the plan's own regression-discipline architecture decision (previously 14 depended on 12, allowing 13/14 to race).
- **Major:** the old task 8 (shared chrome) split into task 8 (`gen-shared-blocks.mjs` + header/contact, group 4) and task 9 (`site.js` library) — two independently reviewable subsystems.
- **Major:** the old task 9 (verify spine) split into task 10 (structural/perf: groups 2, 8, 9, 10) and task 11 (content-integrity: groups 3, 11 + all negative controls).
- **Major:** the old task 16 (Lighthouse/impeccable + remediation) split into task 18 (measurement only) and task 19 (capped remediation), so the owner sees raw numbers before any fix can mask them.
- **Major:** every dev-mode verify/curl command across every task now starts its own dev server (`(npm run dev &) && sleep 10 && ...`) rather than assuming one is already running, since each task is a fresh subagent session.
- **Major:** added the previously-missing runnable negative-control commands for task 4 (wrong-path), task 8 (one-character drift) and task 11 (off-allow-list host, orphan chip, missing-required-id — the last two redesigned as self-contained injections since no screen exists yet at that point in the build).
- **Major:** task 20 (was 17)'s screenshot output moved from `/tmp/mels-shots` to the repo-relative, gitignored `public/decks/mels-skate-shop/.shots/`, so the artifact survives the subagent → main-session handoff into task 22.
- **Coverage / rejected:** the finding proposing to drop `fitting-durations` from the nine-id illustrative set (making it eight) was **rejected** — §6.0's own text ("fitting prices and durations... carries `data-illustrative`") is the spec's source of truth and confirms nine, verified directly against `docs/specs/mels-skate-shop-pitch.md` line 102. The real bug this finding caught — task 17 only chipping price, not duration — is fixed instead by making task 17 chip both.
- **Minor:** added CP7 owner line explicitly confirming Mel's photography/logo use on deck slides 4 and 8, rather than resolving that §9 ask-first boundary unilaterally in task 22's prose.
- **Minor:** task 8 now notes `gen-shared-blocks.mjs`/`demo/.source/` as a deliberate deviation from the spec's §5 tree.
- **Minor:** task 1's scope waiver now names the harness-scaffold bundling explicitly.
- **Minor:** task 25 (was 22) now states plainly that it's read-only compilation, no new assertions.
- **Minor:** tasks 21 and 23 (was 18, 20) now include `npm run lint` / `npm run build` in their verification.
- **Minor (governance):** added a gate note after CP1 stating Phase 3 must not be dispatched before CP1's boxes are ticked, not merely after tasks 3/4 complete.
- **Minor (governance):** task 6 now cites §6.0 explicitly as the source of truth for the nine-id set, so §11's shorter gloss isn't mistaken for a narrower instruction.

## Fix log (round 3)

- **Blocker:** Task 4 / Checkpoint "fixtures landed" (task 4's Description and its first Acceptance-criteria bullet; the CP1 OWNER and MECHANICAL bullets) — task 4's own acceptance criteria required a post-CP1-ruling `manifest.links[] ≤ 10` state that CP1 (the owner ruling on which 2-of-12 links are dropped) is scheduled strictly *after* task 4, making task 4 unexecutable as a single dispatch. Gave `fetch-mels-fixtures.mjs` a `--drop=<slug,...>` flag (documented in task 4's Description) that applies a drop/exemption ruling to the enumerated set before the budget check runs; narrowed task 4's own acceptance criterion to the fail-fast, zero-request 12-item state its dispatch can actually reach; and moved "apply the ruling" onto CP1's own OWNER bullet (re-run with `--drop`, the one real network pass for links) and its MECHANICAL bullet (confirm ≤ 10 after that re-run). Mirrored the mechanism in todo.md's CP1 line. No task was added or renumbered. Superseded the same day by decision #495 (Maps/Waze exempt): `--drop` removed again, task 4's single dispatch is the one link pass.
- **Major:** plan.md Task 26, Verification (first bullet) — the bullet ran `npm run lint && npm run build && node scripts/verify-mels-demo.mjs`, never starting a server, even though `verify-mels-demo.mjs` is Playwright against a live server (task 1's own description) and Task 26 is a fresh subagent session per the plan's own dev-server rule. Added `(npm run start &) && sleep 10 &&` before the verify call, matching the pattern already used in tasks 18/19/20/24. The finding's broader claim — that tasks 1, 8, 11, 19 and 20's later bullets need the same fix — was not applied: each of those reuses a server already started by an earlier bullet in the *same* task, which is the plan's own established convention (Task 1's bullets 2 and 4 do the same against bullet 1's server) rather than a violation of the "fresh subagent session" rule, which is about cross-task, not cross-bullet, persistence.
- **Major:** plan.md Fix log, "task 12 (was 10, PDP A)'s dependency chain fixed to `deps: 13`" — the subject was misnamed; task 12 is Home (deps: 11), not PDP A, and the sentence's own parenthetical ("previously 14 depended on 12") named task 14. Changed the subject to "task 14 (was 12, PDP A)", matching the Parallelization section and todo.md, which both already had it right.
- **Major:** plan.md line 17 (Architecture decisions) — "the eight page-agnostic groups ... land ... across tasks 1, 8, 9, 10 and 11" wrongly included task 9 (site.js), which implements zero §7 groups; group **9** is implemented by task **10** alongside groups 2, 8 and 10. Changed the task list to "1, 8, 10 and 11" and added a clause distinguishing the group-number/task-number conflation.
- **Major:** plan.md dependency graph (ASCII diagram) — the T8/T9 fork drawn from the CP2 merge box implied both tasks depend on tasks 5, 6 *and* 7, but task 9's real `Dependencies` field is `2, 5` (task 8's is `5, 7`) and the diagram never drew an edge from T2 to T9 at all. Added `[deps: 5, 7]` / `[deps: 2, 5]` labels next to T8/T9 in the diagram and a "Diagram note" after the closing fence pointing to each task's own Dependencies field (and the Parallelization section) as authoritative.
- **Major (duplicate):** the standalone "every dev-mode verify/curl command ... starts its own dev server" finding names the same underlying defect as the Task-26 finding above (same location, same evidence). Resolved by the same edit; no separate change was needed.
- **Minor:** three "task 15/17" mentions (Architecture chip bullet, task 6, round-2 fix log) said task 15 also chips fitting durations/prices; task 15 (Aura PDP part B) renders no fitting types — only task 17 (Book a fitting) does. Changed to "task 17".
- **Minor:** task 8 asserted "at minimum task 19" edits the header logo through `demo/.source/` + `gen-shared-blocks.mjs`, but task 19's body never said so. Added the routing sentence to task 19's description (group 4 stays byte-identical).
- **Minor:** task 21's slide-3 description carried one headline fault + three footnotes, omitting the spec's second prominent fault (booking hops off-domain to Koalendar, twin Spotech → Naver, report L352). Now names both prominent faults, matching §6.7 slide 3 and the ruled "two prominent faults" reading.
