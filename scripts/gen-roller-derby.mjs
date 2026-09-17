#!/usr/bin/env node
// scripts/gen-roller-derby.mjs — task 13 (issue #31), decision #556.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script. Never invoked at runtime — the
// demo still ships with no build step. Reads the demo's own fixtures under
// DEMO/data/*.json plus DEMO/assets/site.js, and splices the result between
// the `<!-- main:derby -->` / `<!-- /main:derby -->` marker pair inside
// `<main id="main" class="page__main">` in roller-derby.html. Touches
// roller-derby.html and nothing else.
//
// scripts/gen-home.mjs is the template for this file. esc(), readJson(),
// spliceBetweenMarkers(), the chip helper, assertChipContract() and the two
// money formatters are copied from it VERBATIM (only the error-message
// prefix and the closing marker's indent differ), per T13 build brief §2.1.
// This is now the THIRD caller of that shape (gen-shared-blocks.mjs,
// gen-home.mjs, this file) -- the trigger gen-home.mjs's own comment names
// for extracting a shared module. Extraction is explicitly OUT OF SCOPE for
// this task: gen-shared-blocks.mjs's output is under group 4's byte-identity
// gate, so adding a second/third caller to it is more risk than a ~30-line
// duplication costs. Say so and move on, as gen-home.mjs's own comment does.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  isBuyable,
  stockState,
  STATES,
  buildWhatsAppLink,
} from "../public/decks/mels-skate-shop/demo/assets/site.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO = join(__dirname, "..", "public", "decks", "mels-skate-shop", "demo");
const DATA = join(DEMO, "data");

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), "utf8"));
}

// esc() and spliceBetweenMarkers() copied verbatim from gen-home.mjs (which
// copied them from gen-shared-blocks.mjs) -- see that file's own comment on
// the trust boundary and the extraction rationale.
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
      `gen-derby: ${pageLabel} is missing a ${openMarker} ... ${closeMarker} marker pair`
    );
  }
  const before = html.slice(0, openIdx + openMarker.length);
  const after = html.slice(closeIdx);
  return `${before}\n${inner}\n    ${after}`;
}

// --- the chip-legend + aria-describedby contract (#550, widened to this page
// by this task) -- copied verbatim from gen-home.mjs. ------------------------
const LEGEND_ID = "chip-legend";
const chip = (id) => ` data-illustrative="${id}" aria-describedby="${LEGEND_ID}"`;

function assertChipContract(html) {
  const legendTags = html.match(/<[a-zA-Z][^<>]*\bclass="chip-legend"[^<>]*>/g) || [];
  if (legendTags.length !== 1) {
    throw new Error(
      `gen-derby: expected exactly one class="chip-legend" element, found ${legendTags.length}`
    );
  }
  const idMatch = /\bid="([^"]+)"/.exec(legendTags[0]);
  if (!idMatch) {
    throw new Error(`gen-derby: the chip-legend element carries no id`);
  }
  const legendId = idMatch[1];

  const chipTags = html.match(/<[a-zA-Z][^<>]*\bdata-illustrative="[^"]*"[^<>]*>/g) || [];
  for (const tag of chipTags) {
    if (!tag.includes(`aria-describedby="${legendId}"`)) {
      throw new Error(
        `gen-derby: an element carrying data-illustrative has no aria-describedby="${legendId}" -- ${tag}`
      );
    }
  }
}

// --- money formatting -- copied verbatim from gen-home.mjs (en-US is a
// character-set decision, not a formatting preference -- see that file's
// comment; #549/#517). ------------------------------------------------------
function moneyWhole(cents) {
  const rands = cents / 100;
  if (!Number.isInteger(rands)) {
    throw new Error(`gen-derby: moneyWhole(${cents}) is not a whole-rand amount`);
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
// THE PRICE TRAP (build brief §3.1, ruling #549/#563): SKU 9571 is 70001
// cents = R700.01, the only non-whole price in this grid. moneyWhole() alone
// throws on it. money() PICKS a formatter by whether the amount is a whole
// rand -- it never rounds. Rounding, truncating the cents, or special-casing
// 9571 would all pass every gate in the spine with a WRONG PRICE on the
// page: gate G7 exists solely to catch this (grep the rendered HTML for the
// literal "R700.01"). #549's rule is "prices drop a .00; instalments always
// keep two decimals" -- a NOT-whole price keeps its cents instead.
const money = (cents) => (Number.isInteger(cents / 100) ? moneyWhole(cents) : moneyCents(cents));

// --- fixture lookups -- fact() copied verbatim from gen-home.mjs. ----------
// parseCount() is NOT copied: every count this page renders either comes
// straight off products.json's own grid selection (computed below, never
// parsed out of a manifest fact string) or is already baked into
// draft-copy.json's own prose (derby.categoryCopy's "27 protective sets",
// etc.) -- this page has no manifest count-fact figure to parse, so copying
// an unused helper would be dead code, not fidelity to the template.
function fact(manifest, id) {
  const row = manifest.facts.find((f) => f.id === id);
  if (!row) throw new Error(`gen-derby: manifest is missing fact "${id}"`);
  return row;
}

const IMG_ROOT = "/decks/mels-skate-shop/img";
const ROUTE_SIZE_FINDER_DERBY = "/decks/mels-skate-shop/demo/size-finder?preset=derby";
const ROUTE_AURA_PDP = "/decks/mels-skate-shop/demo/aura-sky-100";

// --- the 15-SKU grid, SELECTED by category -- never hard-coded ids (build
// brief §3, gate G3's flag-flip control). Category ids per the ruled keying:
//   120 "Roller Derby"        -> cards "starting"/"upgrading" (split by name regex)
//   151 "Sets"                -> card "protective" (ruling #558, NOT 97)
//   96  "Wheels and Bearings" -> card "wheels"
//   202 "Toe Stops/Jam plugs" -> card "toestops" (ruling #554's relabel)
// Sorted by id ascending WITHIN each category -- deterministic, and it is the
// order the build brief's own measured table renders in.
const CATEGORY_DERBY = 120;
const CATEGORY_PROTECTIVE_SETS = 151; // #558: category 151 "Sets", never 97
const CATEGORY_WHEELS = 96;
const CATEGORY_TOESTOPS = 202;
// Complete skates vs components, same regex gen-home.mjs already uses to
// split card 1 from card 2's hero-candidate selection.
const NAME_COMPONENT = /\bboots?\b|\bplate\b/i;

function byId(a, b) {
  return a.id - b.id;
}

function cardKeyFor(p) {
  if (p.categories.some((c) => c.id === CATEGORY_DERBY)) {
    return NAME_COMPONENT.test(p.name) ? "upgrading" : "starting";
  }
  if (p.categories.some((c) => c.id === CATEGORY_PROTECTIVE_SETS)) return "protective";
  if (p.categories.some((c) => c.id === CATEGORY_WHEELS)) return "wheels";
  if (p.categories.some((c) => c.id === CATEGORY_TOESTOPS)) return "toestops";
  throw new Error(`gen-derby: product ${p.id} matched none of the four grid categories`);
}

// Card keys in the same order as draft.derby.filters.cards[]. cards[4] is
// "Toe stops & jam plugs" as of ruling #554 -- the fixture edit that makes
// this a clean 15/15 partition (see build brief §3.2).
const CARD_KEYS = ["starting", "upgrading", "wheels", "protective", "toestops"];

function run() {
  const draft = readJson("draft-copy.json");
  const manifest = readJson("manifest.json");
  const contact = readJson("contact.json");
  const products = readJson("products.json");
  const altMap = readJson("img-alt.json");

  const derby = draft.derby;
  const shared = draft.shared;
  const imagesByFile = new Map(manifest.images.map((img) => [img.file, img]));

  // Sanity-check the section chip's fact exists and is illustrative (#548:
  // a chip needs a real manifest twin). Not otherwise consumed -- the copy
  // is Melony's voice (derby.instalmentsNote), never the manifest text
  // verbatim, same relation gen-home.mjs's instalment chip has to this fact.
  const pjnFact = fact(manifest, "pjn-instalments");
  if (pjnFact.source !== "illustrative") {
    throw new Error(`gen-derby: pjn-instalments fact is not source: "illustrative"`);
  }

  // site.js keeps its own literal copy of derby.filters.resultCountTemplate
  // rather than fetching it at runtime (decision #545 rejected a runtime
  // fetch for exactly this shape). Nothing previously tied the fixture copy
  // to the site.js copy -- a fixture edit here could silently ship a stale
  // template string in the live region while every gate (including group 7,
  // which asserts against its own hard-coded expected strings) stayed
  // green. Assert byte equality against site.js's own source text at
  // generation time instead of at runtime, so a drift fails THIS script
  // loudly rather than shipping silently.
  const siteJsSource = readFileSync(join(DEMO, "assets", "site.js"), "utf8");
  const templateMatch = /const TEMPLATE = '([^']*)';/.exec(siteJsSource);
  if (!templateMatch) {
    throw new Error(`gen-derby: could not find site.js's TEMPLATE literal to check against the fixture`);
  }
  if (templateMatch[1] !== derby.filters.resultCountTemplate) {
    throw new Error(
      `gen-derby: site.js's TEMPLATE ("${templateMatch[1]}") no longer matches draft-copy.json's derby.filters.resultCountTemplate ("${derby.filters.resultCountTemplate}") -- update site.js's literal copy to match`
    );
  }

  // -- 0. chip legend, first ---------------------------------------------
  const legendHtml = `<p class="chip-legend" id="${LEGEND_ID}">${esc(shared.chipLegend)}</p>`;

  // -- 1. the grid -- selected from products.json, not hard-coded --------
  // Each category id holds many more rows than the grid (categoryCopy's own
  // prose says so: 27 protective sets, 38 wheels/bearings lines, 17 toe
  // stops) -- most have no photograph in the fixture. imagesByFile.has(...)
  // is the second filter, same idiom gen-home.mjs uses for its hero cards:
  // "has an image sampled" is what actually bounds this grid to the 15 the
  // build brief measured, not category membership alone.
  const inCategoryWithImage = (catId) =>
    products.products.filter(
      (p) => p.categories.some((c) => c.id === catId) && imagesByFile.has(`product-${p.id}.webp`)
    );
  const catDerby = inCategoryWithImage(CATEGORY_DERBY).sort(byId);
  const catProtective = inCategoryWithImage(CATEGORY_PROTECTIVE_SETS).sort(byId);
  const catWheels = inCategoryWithImage(CATEGORY_WHEELS).sort(byId);
  const catToeStops = inCategoryWithImage(CATEGORY_TOESTOPS).sort(byId);

  const gridProducts = [...catDerby, ...catProtective, ...catWheels, ...catToeStops];
  if (gridProducts.length !== 15) {
    throw new Error(
      `gen-derby: grid selection produced ${gridProducts.length} product(s), expected exactly 15`
    );
  }
  for (const p of gridProducts) {
    const file = `product-${p.id}.webp`;
    if (!imagesByFile.has(file)) {
      throw new Error(`gen-derby: manifest.images has no entry for "${file}" (product ${p.id})`);
    }
    if (!altMap[file]) {
      throw new Error(`gen-derby: img-alt.json is missing an entry for "${file}" (product ${p.id})`);
    }
  }

  const cardHtml = (p) => {
    const cents = Number(p.prices.price);
    if (!Number.isFinite(cents)) {
      throw new Error(`gen-derby: product ${p.id} has a non-numeric price`);
    }
    const file = `product-${p.id}.webp`;
    const alt = altMap[file];
    const buyable = isBuyable(p);
    const cardKey = cardKeyFor(p);
    // Baked initial state: toggle defaults ON, no decision card active, so a
    // non-buyable card is hidden from first paint -- before any JS runs.
    // site.js's initDerbyFilters() only WIRES listeners on load; it never
    // mutates this baked state on init (see that file's own comment), so
    // what is baked here IS what group 7 assertion A measures pre-click.
    const hiddenAttr = buyable ? "" : " hidden";
    const badgeClass = buyable ? "badge--in-stock" : "badge--sold-out";
    const stateText = stockState(p);

    let soldOutBlock = "";
    if (!buyable) {
      // Plan AC4: a working wa.me link, URL-encoded prefill naming the
      // product, built via buildWhatsAppLink -- never hand-assembled.
      const waText = `${derby.stock.soldOutHandoff} -- ${p.name}`;
      const waHref = buildWhatsAppLink(contact.whatsapp.number, waText);
      soldOutBlock = `
        <p class="card__foot fine">${esc(derby.stock.soldOutNote)}</p>
        <p><a class="btn btn--secondary" href="${esc(waHref)}">${esc(derby.stock.soldOutHandoff)}</a></p>`;
    }

    return `      <li class="card" data-derby-set="${cardKey}" data-derby-buyable="${buyable}"${hiddenAttr}>
        <div class="card__media">
          <img src="${IMG_ROOT}/${file}" alt="${esc(alt)}" />
        </div>
        <h3 class="card__title">${esc(p.name)}</h3>
        <p class="price" data-price="${cents}">${money(cents)}</p>
        <p><span class="badge ${badgeClass}">${esc(stateText)}</span></p>${soldOutBlock}
      </li>`;
  };

  const gridCardsHtml = gridProducts.map(cardHtml).join("\n");

  // -- 2. the filter bar -- OUTSIDE the grid (build brief §6.1, gate
  // assertion K), single `<fieldset>`, reusing `.sizes`'s existing
  // border:0/flex-wrap reset rather than adding new CSS for a second group
  // of pressable buttons (#564's spirit, applied beyond just images: don't
  // add CSS the page does not measurably need). --------------------------
  const cardButtonsHtml = derby.filters.cards
    .map((label, i) => {
      const key = CARD_KEYS[i];
      return `      <button class="btn" type="button" data-derby-card="${key}" aria-pressed="false">${esc(label)}</button>`;
    })
    .join("\n");

  const filtersHtml = `<fieldset class="sizes">
      <legend>${esc(derby.filters.legend)}</legend>
${cardButtonsHtml}
      <button class="btn" type="button" data-derby-toggle aria-pressed="true">${esc(derby.filters.inStockToggle)}</button>
    </fieldset>
    <p class="fine">${esc(derby.filters.inStockToggleNote)}</p>`;

  // -- 3. the ONE section-level instalment chip, above the grid (ruling
  // #557: no per-card instalment lines -- group 11 assertion D fails any
  // [data-illustrative] element shipped `hidden`, and the toggle defaults
  // on, so per-card chips on the 4 sold-out cards would fail at load). ----
  const instalmentChipHtml = `<p class="price__instalment"${chip("pjn-instalments")}>${esc(derby.instalmentsNote)}</p>`;

  // -- 4. the live "Showing N of M" region -- EMPTY on first paint (plan
  // AC2). The prompt copy explaining the template lives OUTSIDE the live
  // region, or it would be announced (build brief §3.4). ------------------
  const liveRegionHtml = `<p class="live live--result" aria-live="polite" data-derby-count></p>
    <p class="fine">${esc(derby.filters.resultCountNote)}</p>`;

  // -- 4b. the empty state (#569). The copy was authored in draft-copy.json
  // and NOTHING rendered it -- `grep -rn emptyState scripts/ public/` outside
  // the fixture returned nothing -- while "Wheels" with the default toggle
  // shows exactly ONE card. That is one fixture stock flip away from a blank
  // grid under a live region reading "Showing 0 of 3", with no copy on screen
  // and no way out of the state.
  //
  // Three placement constraints, each load-bearing:
  //   * OUTSIDE the <ul>, so group 7 assertion B's constant node count of 15
  //     is untouched;
  //   * no data-derby-set, so site.js's `cards` list never picks it up and it
  //     can never be counted into {shown}/{total};
  //   * no data-illustrative, so group 11 assertion D (which fails any chip
  //     shipped `hidden`) has no opinion about it.
  //
  // Baked visibility is COMPUTED from the same predicate the cards use, not
  // hard-coded `hidden`: if a future fixture ever bakes an empty grid, the
  // note ships visible with JavaScript off too. Unlike the live-region
  // template, this string is NOT duplicated in site.js -- baking it here
  // keeps draft-copy.json the single source and makes drift impossible
  // rather than merely detectable.
  const bakedShown = gridProducts.filter((p) => isBuyable(p)).length;
  const emptyStateHtml = `<p class="note" data-derby-empty${bakedShown === 0 ? "" : " hidden"}>${esc(derby.filters.emptyState)}</p>`;

  const filterAndGridHtml = `<section class="section" data-derby-filters>
      <div class="wrap">
        ${filtersHtml}
        ${instalmentChipHtml}
        ${liveRegionHtml}
        <ul class="grid" data-derby-grid>
${gridCardsHtml}
        </ul>
        ${emptyStateHtml}
      </div>
    </section>`;

  // -- 5. heading + category copy ------------------------------------------
  const introHtml = `<section class="section">
      <div class="wrap">
        <p class="source">${esc(derby.eyebrow)}</p>
        <h1>${esc(derby.heading)}</h1>
        <p class="lede">${esc(derby.categoryCopy)}</p>
      </div>
    </section>`;

  // -- 6. FAQ ---------------------------------------------------------------
  const faqItemsHtml = derby.faq
    .map(
      (item) => `      <div class="qa">
        <p class="qa__q">${esc(item.q)}</p>
        <p class="qa__a">${esc(item.a)}</p>
      </div>`
    )
    .join("\n");

  const faqHtml = `<section class="section section--sunken">
      <div class="wrap">
        <h2>FAQ</h2>
${faqItemsHtml}
      </div>
    </section>`;

  // -- 7. credential quote + league line ------------------------------------
  const roadhouseHref = manifest.links[7].href;
  const leagueWhatsappHref = buildWhatsAppLink(contact.whatsapp.number);
  const credentialHtml = `<section class="section">
      <div class="wrap">
        <p class="note"><span class="badge badge--evidence">${esc(derby.credential.quote)}</span> — <a href="${esc(roadhouseHref)}">${esc(derby.credential.attribution)}</a></p>
        <p class="note">${esc(derby.credential.leagueLine)} <a href="${esc(leagueWhatsappHref)}">${esc(derby.credential.leagueCta)}</a></p>
      </div>
    </section>`;

  // -- 8. links -- the derby size guide (?preset=derby, plan task 16) and,
  // per ruling #567, one plain navigation note pointing at the Aura PDP so
  // this page is not a dead end (#547). No buying-guide link -- ruling
  // #559: manifest.links[11].href is null and the fixture carries no key
  // for it, so shipping one means either a dead href or an invented URL. --
  const linksHtml = `<section class="section">
      <div class="wrap">
        <p class="note"><a href="${ROUTE_SIZE_FINDER_DERBY}">${esc(derby.links.sizeGuide)}</a> — ${esc(derby.links.sizeGuideNote)}</p>
        <p class="note">${esc(derby.links.pdpNote)} <a href="${ROUTE_AURA_PDP}">${esc(derby.links.pdpLinkLabel)}</a></p>
      </div>
    </section>`;

  // -- 9. the module script -- last line inside the marker block, deferred
  // execution, no build step (build brief §2.4, ruling #562). -------------
  const scriptHtml = `<script type="module" src="/decks/mels-skate-shop/demo/assets/site.js"></script>`;

  // -- assemble -------------------------------------------------------------
  const mainHtml = [
    legendHtml,
    introHtml,
    filterAndGridHtml,
    faqHtml,
    credentialHtml,
    linksHtml,
    scriptHtml,
  ].join("\n\n    ");

  assertChipContract(mainHtml);

  const filePath = join(DEMO, "roller-derby.html");
  let html = readFileSync(filePath, "utf8");
  html = spliceBetweenMarkers(html, "<!-- main:derby -->", "<!-- /main:derby -->", `    ${mainHtml}`, "roller-derby.html");
  writeFileSync(filePath, html);

  console.log("gen-derby: rendered Roller Derby hub into roller-derby.html");
  console.log(`gen-derby: grid = ${gridProducts.length} products (${gridProducts.filter((p) => isBuyable(p)).length} buyable)`);
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
