#!/usr/bin/env node
// scripts/gen-home.mjs — task 12 (issue #30), decision #545.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script. Never invoked at runtime — the
// demo still ships with no build step and no <script> tag. Reads the demo's
// own fixtures under DEMO/data/*.json plus DEMO/assets/site.js, computes
// every count/price/courier figure from those fixtures (never retyped), and
// splices the result between the `<!-- main:home -->` / `<!-- /main:home -->`
// marker pair inside `<main id="main" class="page__main">` in index.html.
// Touches index.html and nothing else.
//
// Why a script instead of hand-authored HTML: plan AC3 requires that
// flipping a fixture flag (e.g. products.json's is_in_stock) changes the
// rendered set of hero cards. A human-typed <article> cannot react to that.
// A runtime fetch() would race the verify spine's domcontentloaded/load
// groups and make Home the first page on this epic to load JavaScript —
// #545 rejected both in favour of this authoring-time generator, on the
// scripts/gen-shared-blocks.mjs precedent.
//
// Usage: node scripts/gen-home.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  isBuyable,
  stockState,
  buildWhatsAppLink,
} from "../public/decks/mels-skate-shop/demo/assets/site.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO = join(__dirname, "..", "public", "decks", "mels-skate-shop", "demo");
const DATA = join(DEMO, "data");

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), "utf8"));
}

// esc() is copied VERBATIM from gen-shared-blocks.mjs — see that file's own
// comment on the trust boundary it crosses. spliceBetweenMarkers() is copied
// with two changes for this call site: the error-message prefix, and the
// closing marker's indent depth (four spaces here, two there). The copy
// instruction is the T12 build brief §2.1's, not decision #545's — #545 rules
// this generator's shape, not its helpers. Refactoring the two into a shared
// module is deliberately NOT done, and that rationale lives here rather than
// in gen-shared-blocks.mjs: its output is under group 4's byte-identity gate,
// so adding a second caller to it is more risk than a 6-line duplication
// costs. A third caller extracts it.
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function spliceBetweenMarkers(html, openMarker, closeMarker, inner, pageLabel) {
  const openIdx = html.indexOf(openMarker);
  const closeIdx = html.indexOf(closeMarker);
  if (openIdx === -1 || closeIdx === -1 || closeIdx < openIdx) {
    throw new Error(
      `gen-home: ${pageLabel} is missing a ${openMarker} ... ${closeMarker} marker pair`
    );
  }
  const before = html.slice(0, openIdx + openMarker.length);
  const after = html.slice(closeIdx);
  return `${before}\n${inner}\n    ${after}`;
}

// --- the chip-legend + aria-describedby contract (#550) --------------------
const LEGEND_ID = "chip-legend";
const chip = (id) => ` data-illustrative="${id}" aria-describedby="${LEGEND_ID}"`;

// #550's ruling: the helper makes the contract right by construction; this
// assertion catches a builder who later hand-writes a chip and skips the
// helper. Run on the FULLY ASSEMBLED markup, before writeFileSync.
function assertChipContract(html) {
  const legendTags = html.match(/<[a-zA-Z][^<>]*\bclass="chip-legend"[^<>]*>/g) || [];
  if (legendTags.length !== 1) {
    throw new Error(
      `gen-home: expected exactly one class="chip-legend" element, found ${legendTags.length}`
    );
  }
  const idMatch = /\bid="([^"]+)"/.exec(legendTags[0]);
  if (!idMatch) {
    throw new Error(`gen-home: the chip-legend element carries no id`);
  }
  const legendId = idMatch[1];

  const chipTags = html.match(/<[a-zA-Z][^<>]*\bdata-illustrative="[^"]*"[^<>]*>/g) || [];
  for (const tag of chipTags) {
    if (!tag.includes(`aria-describedby="${legendId}"`)) {
      throw new Error(
        `gen-home: an element carrying data-illustrative has no aria-describedby="${legendId}" -- ${tag}`
      );
    }
  }
}

// --- money formatting — measured trap (#517) --------------------------------
// toLocaleString("en-ZA") emits U+00A0 as the thousands separator and a
// comma decimal, both outside site.css's unicode-range and therefore a #517
// violation. "en-US" is ASCII-only (comma thousands, period decimal) and is
// picked here purely as a CHARACTER-SET decision, not a formatting
// preference. Its comma-thousands/period-decimal grouping is also the
// grouping the spec's own printed figures use (spec:127 "R12,050", spec:203
// "R4,016.67"), so the demo's convention is the spec's, not SA's — the two
// disagree, and the figures win (#549).
function moneyWhole(cents) {
  const rands = cents / 100;
  if (!Number.isInteger(rands)) {
    throw new Error(`gen-home: moneyWhole(${cents}) is not a whole-rand amount`);
  }
  return `R${rands.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function moneyCents(cents) {
  const rands = cents / 100;
  return `R${rands.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ponytail: T15 owns the canonical instalments(priceCents, n = 3) in
// assets/pdp.js (spec §8) and spine group 6 asserts it. That file does not
// exist yet, so the three cent amounts are computed here. THE PIN IS THE
// ANCHOR, NOT THE PROSE (decision #549): instalments(1205000) must return
// [401667, 401667, 401666] and display R4,016.67 — the figure spec:31,
// spec:127, spec:203 and the pjn-instalments manifest fact all print. §8's
// "remainder on the first" wording would give R4,016.68 and is the loose
// description, not the rule. When T15 lands pdp.js, delete this and call it;
// the anchor must still hold.
const instalments = (cents, n = 3) => {
  const base = Math.floor(cents / n);
  const rem = cents - base * n; // 0 <= rem < n
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
};

// --- fixture lookups ---------------------------------------------------------
function fact(manifest, id) {
  const row = manifest.facts.find((f) => f.id === id);
  if (!row) throw new Error(`gen-home: manifest is missing fact "${id}"`);
  return row;
}
// Each count fact reads "<Label>: <N> products." — parsed, never retyped.
function parseCount(text) {
  const m = /:\s*(\d+)\s*products\.$/.exec(text);
  if (!m) throw new Error(`gen-home: could not parse a count out of fact text "${text}"`);
  return m[1];
}

// Internal route constants — the demo's own fixed clean-URL paths (there is
// no fixture for internal site routing), same precedent as
// gen-shared-blocks.mjs's four nav hrefs. Root-absolute per the
// /decks/mels-skate-shop/demo trailing-slash trap.
const ROUTE_DERBY_HUB = "/decks/mels-skate-shop/demo/roller-derby";
const ROUTE_SIZE_FINDER = "/decks/mels-skate-shop/demo/size-finder";
const ROUTE_BOOKING = "/decks/mels-skate-shop/demo/book-a-fitting";
// #493 + #547: the one link Home carries to the PDP, discharging both "the
// guarantee terms link to the full terms on the PDP" and "Home gains one
// link so no page is a dead end". The PDP is a stub until T14/T15 and no gate
// catches a missing anchor (group 3's fragment branch only fires on hrefs
// starting with "#"), so T14's obligation to add id="fit-guarantee" to the PDP
// is recorded in PRODUCT.md — "What the next tasks inherit from Home".
const ROUTE_AURA_PDP_FIT_GUARANTEE = "/decks/mels-skate-shop/demo/aura-sky-100#fit-guarantee";

const IMG_ROOT = "/decks/mels-skate-shop/img";

function run() {
  const draft = readJson("draft-copy.json");
  const manifest = readJson("manifest.json");
  const contact = readJson("contact.json");
  const products = readJson("products.json");
  const altMap = readJson("img-alt.json");

  const home = draft.home;
  const shared = draft.shared;

  // -- 0. chip legend, first --------------------------------------------------
  const legendHtml = `<p class="chip-legend" id="${LEGEND_ID}">${esc(shared.chipLegend)}</p>`;

  // -- 1. promise row -----------------------------------------------------------
  const guaranteeLinkHref = ROUTE_AURA_PDP_FIT_GUARANTEE;
  // #547's override (3.1a): link the evidence (the trust-row card that
  // CONTAINS the Roll-Line screenshot), never the query-less locator URL and
  // never the raw .webp — both are dead ends with no context.
  const dealerEvidenceHref = "#roll-line-evidence";
  const whatsappHref = buildWhatsAppLink(contact.whatsapp.number);

  const promiseRowHtml = `<ul class="promise-row wrap">
      <li class="promise-row__item">
        <span class="promise-row__label">${esc(home.promiseRow.courierLabel)}</span>
        <span class="promise-row__note">${esc(contact.courier.line)}</span>
        <span class="promise-row__note">${esc(home.promiseRow.courierNote)}</span>
      </li>
      <li class="promise-row__item"${chip("fit-guarantee")}>
        <span class="promise-row__label">${esc(home.promiseRow.guaranteeLabel)}</span>
        <span class="promise-row__note">${esc(shared.fitGuarantee.shortTerms)}</span>
        <span class="promise-row__note"><a href="${guaranteeLinkHref}">${esc(home.promiseRow.guaranteeLinkLabel)}</a></span>
      </li>
      <li class="promise-row__item">
        <span class="promise-row__label"><a href="${dealerEvidenceHref}">${esc(home.promiseRow.dealerLabel)}</a></span>
        <span class="promise-row__note">${esc(home.promiseRow.dealerNote)}</span>
      </li>
      <li class="promise-row__item">
        <span class="promise-row__label"><a href="${esc(whatsappHref)}">${esc(home.promiseRow.whatsappLabel)}</a></span>
      </li>
    </ul>`;

  // -- 2. hero --------------------------------------------------------------
  const heroHtml = `<section class="section">
      <div class="wrap">
        <h1>${esc(shared.header.brand)}</h1>
        <p class="lede">${esc(home.hero)}</p>
        <p class="source">${esc(home.heroNote)}</p>
        <p><span class="badge badge--evidence">${esc(home.promiseRow.dealerLabel)}</span></p>
        <div class="btn-row">
          <a class="btn btn--primary" href="${ROUTE_SIZE_FINDER}">${esc(home.ctaPrimary)}</a>
          <a class="btn btn--secondary" href="${ROUTE_BOOKING}">${esc(home.ctaSecondary)}</a>
        </div>
      </div>
    </section>`;

  // -- 3. six discipline cards -----------------------------------------------
  // The six card labels are spec §6.1 item 3's own IA labels (docs/specs/...:110),
  // not fixture content — draft-copy.json holds the blurb for each discipline
  // but no label key, and a label asserts nothing checkable. Same precedent
  // as the four nav hrefs in gen-shared-blocks.mjs: structural constants
  // owned by the generator, with the source named here. Every FIGURE beside
  // them is parsed from manifest.facts[] below.
  const derbyCount = parseCount(fact(manifest, "count-roller-derby").text);
  const artisticCount = parseCount(fact(manifest, "count-artistic").text);
  const recreationalCount = parseCount(fact(manifest, "count-recreational").text);
  const adjustableCount = parseCount(fact(manifest, "count-adjustable").text);
  const kidsSizesCount = parseCount(fact(manifest, "count-kids-sizes").text);
  const iceCount = parseCount(fact(manifest, "count-ice-skates").text);
  const inlineCount = parseCount(fact(manifest, "count-inline").text);

  const liveSiteTag = esc(home.disciplines.liveSiteTag);
  const liveSiteBadge = `<span class="badge">${liveSiteTag}</span>`;

  // Note: labels are PLAIN text (a literal "&", never a hand-written entity)
  // and go through esc() at render time below, same as every fixture string.
  // "·" (U+00B7) is likewise the literal character, never "&middot;" — #517's
  // rule (build brief §2.1) is that esc() converts exactly &, <, >, " and
  // nothing else; a hand-written entity would be the same error in reverse.
  const disciplineCards = [
    {
      label: "Roller Derby",
      href: ROUTE_DERBY_HUB,
      blurb: home.disciplines.derby,
      metaText: `${derbyCount} products`,
      metaBadge: false,
    },
    {
      label: "Artistic & Rhythm",
      href: manifest.links[0].href,
      blurb: home.disciplines.artistic,
      metaText: `${artisticCount} products`,
      metaBadge: true,
    },
    {
      label: "Recreational Quad",
      href: manifest.links[1].href,
      blurb: home.disciplines.recreational,
      metaText: `${recreationalCount} products`,
      metaBadge: true,
    },
    {
      label: "Kids & Adjustable",
      href: manifest.links[2].href,
      blurb: home.disciplines.kidsAdjustable,
      metaText: `${adjustableCount} adjustable · ${kidsSizesCount} in kids sizes`,
      metaBadge: true,
      // Card 4's link can only reach the adjustable page (manifest.links[2]); the
      // kids-sizes count has no link of its own and 47 exists in no fixture. Name
      // which figure the link covers rather than implying it covers both (#509/#511
      // class). The foot asserts nothing about how kids sizing is handled: the only
      // kids-and-fitting facts, fitting-prices and fitting-durations, are both
      // source: "illustrative", and a bare claim here would carry no chip.
      foot: "Two figures, not a sum: the link above goes to the adjustable range.",
    },
    {
      label: "Ice & Figure",
      href: manifest.links[3].href,
      blurb: home.disciplines.ice,
      metaText: `${iceCount} products`,
      metaBadge: true,
    },
    {
      label: "Inline",
      href: manifest.links[4].href,
      blurb: home.disciplines.inline,
      metaText: `${inlineCount} products`,
      metaBadge: true,
    },
  ];

  const disciplineCardsHtml = disciplineCards
    .map((c) => {
      const meta = c.metaBadge ? `${esc(c.metaText)} · ${liveSiteBadge}` : esc(c.metaText);
      return `      <li class="card">
        <h3 class="card__title"><a href="${esc(c.href)}">${esc(c.label)}</a></h3>
        <p class="card__body">${esc(c.blurb)}</p>
        <p class="card__meta">${meta}</p>${
          c.foot ? `\n        <p class="card__foot fine">${esc(c.foot)}</p>` : ""
        }
      </li>`;
    })
    .join("\n");

  const disciplinesHtml = `<section class="section section--sunken">
      <div class="wrap">
        <div class="section__head">
          <h2>${esc(home.disciplines.heading)}</h2>
          <p class="lede">${esc(home.disciplines.note)}</p>
        </div>
        <ul class="grid">
${disciplineCardsHtml}
        </ul>
      </div>
    </section>`;

  // -- 4. size finder CTA band -----------------------------------------------
  const sizeFinderHtml = `<section class="section section--accent">
      <div class="wrap">
        <p class="lede">${esc(home.sizeFinderBand.text)}</p>
        <a class="btn btn--primary" href="${ROUTE_SIZE_FINDER}">${esc(home.sizeFinderBand.cta)}</a>
      </div>
    </section>`;

  // -- 5. four in-stock hero cards --------------------------------------------
  // The four SKUs are SELECTED, not hard-coded — this is plan AC3's negative
  // control (G2): flipping is_in_stock on any candidate changes the rendered
  // set. See the fixed selection rule in the build brief §3.5.
  const CATEGORY_ROLLER_DERBY = 120; // "roller-derby-roller-skates"
  const NAME_EXCLUDE_COMPONENTS = /\bboots?\b|\bplate\b/i; // complete skates only
  const imagesByFile = new Map(manifest.images.map((img) => [img.file, img]));

  const heroCandidates = products.products
    .filter((p) => isBuyable(p))
    .filter((p) => imagesByFile.has(`product-${p.id}.webp`))
    .filter((p) => p.categories.some((c) => c.id === CATEGORY_ROLLER_DERBY))
    .filter((p) => !NAME_EXCLUDE_COMPONENTS.test(p.name))
    .sort((a, b) => {
      const wa = imagesByFile.get(`product-${a.id}.webp`).width;
      const wb = imagesByFile.get(`product-${b.id}.webp`).width;
      if (wb !== wa) return wb - wa;
      return a.id - b.id;
    });

  const heroProducts = heroCandidates.slice(0, 4);
  if (heroProducts.length !== 4) {
    throw new Error(
      `gen-home: hero-card selection produced ${heroProducts.length} candidate(s), expected exactly 4`
    );
  }

  const heroCardsHtml = heroProducts
    .map((p) => {
      const cents = Number(p.prices.price);
      if (!Number.isFinite(cents)) {
        throw new Error(`gen-home: product ${p.id} has a non-numeric price`);
      }
      const [first] = instalments(cents, 3);
      const file = `product-${p.id}.webp`;
      const alt = altMap[file];
      if (!alt) throw new Error(`gen-home: img-alt.json is missing an entry for "${file}"`);
      return `      <li class="card">
        <div class="card__media">
          <img src="${IMG_ROOT}/${file}" alt="${esc(alt)}" />
        </div>
        <h3 class="card__title">${esc(p.name)}</h3>
        <p class="price" data-price="${cents}">${moneyWhole(cents)}</p>
        <p class="price__instalment"${chip("pjn-instalments")}>
          or 3 interest-free instalments of ${moneyCents(first)} <small>PayJustNow, once onboarded</small>
        </p>
        <p><span class="badge badge--in-stock">${esc(stockState(p))}</span></p>
      </li>`;
    })
    .join("\n");

  const heroCardsSectionHtml = `<section class="section">
      <div class="wrap">
        <div class="section__head">
          <h2>${esc(home.inStock.heading)}</h2>
          <p class="lede">${esc(home.inStock.note)}</p>
        </div>
        <ul class="grid">
${heroCardsHtml}
        </ul>
        <div class="btn-row">
          <a class="btn btn--secondary" href="${ROUTE_DERBY_HUB}">${esc(home.inStock.cta)}</a>
        </div>
      </div>
    </section>`;

  // -- 6. trust row -----------------------------------------------------------
  const rollLineAlt = altMap["roll-line-listing.webp"];
  if (!rollLineAlt) throw new Error(`gen-home: img-alt.json is missing "roll-line-listing.webp"`);
  const rollLineHref = manifest.links[6].href;
  const roadhouseHref = manifest.links[7].href;

  const trustRowHtml = `<section class="section section--sunken">
      <div class="wrap">
        <div class="section__head">
          <h2>${esc(home.trustRow.heading)}</h2>
        </div>
        <ul class="grid grid--wide">
          <li class="card" id="roll-line-evidence">
            <div class="card__media">
              <img src="${IMG_ROOT}/roll-line-listing.webp" alt="${esc(rollLineAlt)}" />
            </div>
            <h3 class="card__title">${esc(home.trustRow.dealerCardLabel)}</h3>
            <p class="card__body">${esc(home.trustRow.dealerCardNote)}</p>
            <p class="card__foot"><a href="${esc(rollLineHref)}">roll-line.it/en/dealers</a></p>
          </li>
          <li class="card">
            <h3 class="card__title">${esc(home.trustRow.roadhouseCardLabel)}</h3>
            <p class="card__meta">${esc(home.trustRow.roadhouseCardMeta)}</p>
            <p class="card__body">${esc(home.trustRow.roadhouseCardNote)}</p>
            <p class="card__foot"><a href="${esc(roadhouseHref)}">roadhouserollerrink.co.za</a></p>
          </li>
          <li class="card">
            <h3 class="card__title">${esc(home.trustRow.reviewCardLabel)}</h3>
            <p class="card__meta">${esc(home.trustRow.reviewAttribution)}</p>
            <p class="card__body">${esc(home.trustRow.reviewNote)}</p>
          </li>
        </ul>
      </div>
    </section>`;

  // -- assemble, in the ruled order --------------------------------------------
  const mainHtml = [
    legendHtml,
    promiseRowHtml,
    heroHtml,
    disciplinesHtml,
    sizeFinderHtml,
    heroCardsSectionHtml,
    trustRowHtml,
  ].join("\n\n    ");

  // #550's own ruling: assert the contract on the fully assembled markup,
  // before writeFileSync — never trust the helper alone.
  assertChipContract(mainHtml);

  const filePath = join(DEMO, "index.html");
  let html = readFileSync(filePath, "utf8");
  html = spliceBetweenMarkers(html, "<!-- main:home -->", "<!-- /main:home -->", `    ${mainHtml}`, "index.html");
  writeFileSync(filePath, html);

  console.log("gen-home: rendered Home into index.html");
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
