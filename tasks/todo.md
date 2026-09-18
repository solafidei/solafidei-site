# TODO: Mel's Skate Shop pitch

(26 tasks — revised after critic pass; see plan.md's Fix log for what changed from the 23-task draft)

## Phase 1: Spine

- [x] Task 1: Branch, the two rewrites, six stubs, verify skeleton (group 1) — S · sonnet · deps: —

## Phase 2: Fixtures

- [x] Task 2: Fetch A — polite core + Store API → products.json + manifest scaffold — M · sonnet · deps: 1
- [x] Task 3: Fetch B — product/logo images → WebP + manifest.images[] (reserves, does not fetch, roll-line-listing.webp — owner-captured, §9 no forms) — M · sonnet · deps: 2
- [x] Task 4: Fetch C — outbound link enumeration (**11** candidates, not 12 — no buying-guide page exists on Mel's site, recorded `not-published`; maps.google.com/waze.com exempt per #495 → **8** fetched, ≤10 holds), budget check, HEADs → manifest.links[] — S · sonnet · deps: 2
- [ ] CHECKPOINT: fixtures landed — owner eyeballs products.json + manifest, opens the Facebook URL once, ticks manual-ok or drops the link, captures the Roll-Line listing screenshot in a real browser, confirms Maps/Waze recorded exempt (#495) and the 8 fetched links are all 200 (owner gate)
- [ ] GATE NOTE: Phase 3 (task 6 onward) must not be dispatched until every CP1 box above is ticked — task 6's `deps: 3, 4` marks task-completion only, not owner sign-off

## Phase 3: Design and copy

- [x] Task 5: Design pass — impeccable PRODUCT.md, tokens, chip, base components — M · opus · deps: 1
- [x] Task 6: Copy pass A — hand-authored data JSON + manifest.facts[] (nine illustrative ids incl. fitting-durations, per §6.0 — verified against the spec, not the shorter §11 gloss) — M · opus · deps: 3, 4
- [x] Task 7: Copy pass B — Melony-voice draft copy — S · opus · deps: 6
- [x] CHECKPOINT: design and copy foundation — impeccable clean (exit 0, cream-palette negative control reproduced), zero unsourced facts, nine §6.0 illustrative ids (renamed aura-size-stock-states per #505), no CDN/fonts leak · iOS VoiceOver chip spot-check still OPEN, owner action

## Phase 4: Shared chrome and the verify spine

- [x] Task 8: Shared header + contact block byte-identical across five pages (group 4) via scripts/gen-shared-blocks.mjs — deviation from spec §5 tree noted — M · sonnet · deps: 5, 7
- [x] Task 9: site.js — WhatsApp link builder, isBuyable(), stock-state map (split out from the old combined task 8; independent of task 8, both consumed starting task 12) — S · sonnet · deps: 2, 5
- [x] Task 10: Verify spine A — structural/performance groups 2, 8, 9, 10 — S · sonnet · deps: 8, 9
- [x] Task 11: Verify spine B — content-integrity groups 3, 11 with all six negative controls (self-contained injections — no screen exists yet) — M · sonnet · deps: 10
- [x] CHECKPOINT: spine green — eight groups PASS, three SKIPPED, six negative controls demonstrated and captured

## Phase 5: Screens

- [x] Task 12: Home (§6.1, items 1-7) — M · sonnet · deps: 11
- [x] Task 13: Roller Derby hub (§6.2) + in-stock toggle and filters (group 7) — M · sonnet · deps: 12
- [x] Task 14: Aura PDP part A — banner, gallery, price, instalments, Fit Guarantee, spec table — M · sonnet · deps: 13 *(fixed: was 12, breaking the strict-serial chain)*
- [x] Task 15: Aura PDP part B — sizes, services, buy sheet, rails, Q&A + group 6 — M · sonnet · deps: 14
- [x] CHECKPOINT: three screens up — groups 1-4, 6-11 pass (group 6 lands with task 15); instalments sums exactly; nothing hard-coded in HTML
- [ ] Task 16: Size Finder (§6.4) + pure findSize()/whichSky() (group 5) — M · sonnet · deps: 15
- [ ] Task 17: Book a fitting (§6.5) — now chips BOTH duration and price per fitting type, per §6.0's own text — S · sonnet · deps: 16
- [ ] CHECKPOINT: all six screens green — every group passes; owner phone walkthrough of the full path (owner gate)

## Phase 6: Gates

- [ ] Task 18: Lighthouse mobile + impeccable detect — measurement only, no code changes (split from remediation) — S · sonnet · deps: 17
- [ ] Task 19: Capped remediation against the named lever list only; anything bigger raised to owner — M · sonnet · deps: 18
- [ ] Task 20: Six screenshots (now written to gitignored public/decks/mels-skate-shop/.shots/, not /tmp) + full §4 command sweep on a production build — S · sonnet · deps: 19
- [ ] CHECKPOINT: pre-PR evidence — owner reviews Lighthouse numbers, impeccable output and the six screenshots (owner gate)

## Phase 7: Deck

- [ ] Task 21: Deck slide copy pack — 12 slides, claim + evidence, rule-checked (§6.7) — M · opus · deps: 7
- [ ] Task 22: Deck canvas — twelve artboards with the design skill; photography-use ask-first question deferred to CP7, not resolved unilaterally — M · main-session · deps: 20, 21
- [ ] Task 23: Owner exports the canvas to public/decks/mels-skate-shop/index.html — S · owner · deps: 22
- [ ] Task 24: Deck post-export verification — URL, noindex, link crawl and claim scan; NO second fetch pass (§9 one-pass) — S · sonnet · deps: 23
- [ ] CHECKPOINT: deck exported and re-verified — placeholder gone, slide 10 blank intact, group 3 clean over the export (incl. hotlink grep), owner confirms photography use on slides 4/8, OWNER walks the exported deck on a real phone (owner gate)

## Phase 8: Ship

- [ ] Task 25: Manifest audit and §10 success-criteria sign-off (read-only compilation, no new assertions) — S · sonnet · deps: 24
- [ ] Task 26: Open the PR with screenshots, Lighthouse numbers and the evidence trail (every negative control on record, not a fixed count) — S · sonnet · deps: 25
- [ ] CHECKPOINT: PR open — merge gate; merging deploys to solafidei.com and is the owner's call alone (owner gate)
