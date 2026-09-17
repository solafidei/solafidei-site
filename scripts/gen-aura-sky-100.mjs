#!/usr/bin/env node
// scripts/gen-aura-sky-100.mjs — task 14 (issue #32), decision #574.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script. Never invoked at runtime --
// the demo still ships with no build step. Reads the demo's own fixtures
// under DEMO/data/*.json plus DEMO/assets/pdp.js, renders the STATIC half
// of the PDP (banner, gallery, title, price, Fit Guarantee, spec table),
// and splices the result between the `<!-- main:pdp -->` / `<!-- /main:pdp
// -->` marker pair inside `<main id="main" class="page__main">` in
// aura-sky-100.html. Touches aura-sky-100.html and nothing else.
//
// scripts/gen-roller-derby.mjs is this file's template. Copied VERBATIM
// (only the error-message prefix changes, "gen-pdp:"): readJson(), esc(),
// spliceBetweenMarkers(), the chip() helper, LEGEND_ID, assertChipContract().
// These sit under group 4's byte-identity gate elsewhere in the file tree,
// so a second/third/fourth caller is more risk than the small duplication
// costs -- gen-home.mjs's own comment says so and gen-roller-derby.mjs
// already deferred it once; this is the fourth caller.
//
// MONEY MATHS IS DIFFERENT FROM THE HELPERS ABOVE (ruling #573): this task
// is the one that finally lands the canonical instalments(), moneyWhole()
// and moneyCents() in DEMO/assets/pdp.js, and this generator IMPORTS them
// rather than defining its own fourth copy. gen-home.mjs keeps its own
// pre-existing instalments()/moneyWhole()/moneyCents() copy -- this build's
// brief (not a ruling) says "Do NOT edit gen-home.mjs ... at all", because
// gen-home.mjs's own `ponytail:` comment ("T15 owns the canonical
// instalments()") is a faithful transcription of a real, earlier ruling;
// editing that comment now would put a FALSE statement in a shipped file
// (#540), which is worse than an out-of-date one. The correction -- that
// ownership moved from T15 to T14 -- lives here and in this build's brief,
// not by rewriting history in someone else's file. Ruling #573 is singular:
// **T15 deletes gen-home.mjs's copy** when it wires spine group 6; that is
// not this task's call to make on gen-home.mjs's behalf. gen-roller-derby.mjs
// is a different case, unaffected by that deletion: it has no instalments()
// copy at all, and its own moneyWhole()/moneyCents() feed its unrelated
// money() helper (ruling #563's fix for SKU 9571, R700.01) -- no ruling
// touches gen-roller-derby.mjs's helpers.
//
// WHAT T15 (issue #33) INHERITS: T15 owns this generator as well as the
// page. Its interactive half -- the size selector, the service checkboxes,
// the buy sheet, both rails, the Q&A and the two CTAs -- lands as new
// fragments in run() below, and its `<script type="module">` tag lands as
// the last entry in the assembly array, exactly as gen-roller-derby.mjs
// does it. Do NOT hand-edit aura-sky-100.html inside the marker pair: the
// next regeneration wipes it (two such incidents are on record).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  instalments,
  moneyWhole,
  moneyCents,
} from "../public/decks/mels-skate-shop/demo/assets/pdp.js";

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
      `gen-pdp: ${pageLabel} is missing a ${openMarker} ... ${closeMarker} marker pair`
    );
  }
  const before = html.slice(0, openIdx + openMarker.length);
  const after = html.slice(closeIdx);
  return `${before}\n${inner}\n    ${after}`;
}

// --- the chip-legend + aria-describedby contract (#550, widened to this
// page by this task) -- copied verbatim from gen-home.mjs. ------------------
const LEGEND_ID = "chip-legend";
const chip = (id) => ` data-illustrative="${id}" aria-describedby="${LEGEND_ID}"`;

function assertChipContract(html) {
  const legendTags = html.match(/<[a-zA-Z][^<>]*\bclass="chip-legend"[^<>]*>/g) || [];
  if (legendTags.length !== 1) {
    throw new Error(
      `gen-pdp: expected exactly one class="chip-legend" element, found ${legendTags.length}`
    );
  }
  const idMatch = /\bid="([^"]+)"/.exec(legendTags[0]);
  if (!idMatch) {
    throw new Error(`gen-pdp: the chip-legend element carries no id`);
  }
  const legendId = idMatch[1];

  const chipTags = html.match(/<[a-zA-Z][^<>]*\bdata-illustrative="[^"]*"[^<>]*>/g) || [];
  for (const tag of chipTags) {
    if (!tag.includes(`aria-describedby="${legendId}"`)) {
      throw new Error(
        `gen-pdp: an element carrying data-illustrative has no aria-describedby="${legendId}" -- ${tag}`
      );
    }
  }
}

// --- fixture lookups -- fact() copied verbatim from gen-home.mjs. ----------
function fact(manifest, id) {
  const row = manifest.facts.find((f) => f.id === id);
  if (!row) throw new Error(`gen-pdp: manifest is missing fact "${id}"`);
  return row;
}

const IMG_ROOT = "/decks/mels-skate-shop/img";
const PRODUCT_ID_AURA_SKY_100 = 11919;

function run() {
  const draft = readJson("draft-copy.json");
  const manifest = readJson("manifest.json");
  const products = readJson("products.json");
  const altMap = readJson("img-alt.json");

  const pdp = draft.pdp;
  const shared = draft.shared;
  const imagesByFile = new Map(manifest.images.map((img) => [img.file, img]));

  const product = products.products.find((p) => p.id === PRODUCT_ID_AURA_SKY_100);
  if (!product) {
    throw new Error(`gen-pdp: products.json has no product with id ${PRODUCT_ID_AURA_SKY_100}`);
  }

  // Sanity-check both this page's chip facts exist and are illustrative
  // (#548: a chip needs a real manifest twin), same idiom the other two
  // generators use for pjn-instalments.
  const fitGuaranteeFact = fact(manifest, "fit-guarantee");
  if (fitGuaranteeFact.source !== "illustrative") {
    throw new Error(`gen-pdp: fit-guarantee fact is not source: "illustrative"`);
  }
  const pjnFact = fact(manifest, "pjn-instalments");
  if (pjnFact.source !== "illustrative") {
    throw new Error(`gen-pdp: pjn-instalments fact is not source: "illustrative"`);
  }

  // -- 0. chip legend, first, above the first chip (the banner) -----------
  const legendHtml = `<p class="chip-legend" id="${LEGEND_ID}">${esc(shared.chipLegend)}</p>`;

  // -- 1. the top banner -- SIX clauses, verbatim, carrying the
  // fit-guarantee chip (ruling #576: its last clause is the same
  // unpublished carve-out the guarantee states behind a chip). -----------
  const bannerHtml = `<p class="banner"${chip("fit-guarantee")}>${esc(pdp.banner)}</p>`;

  // -- 2. the gallery -- FOUR items (ruling #572). Item 3 is the real
  // published size-and-width grid, re-encoded from the decoded .cache PNG
  // with zero network -- see manifest.images[]'s note on that row for the
  // provenance. Item 4 renders no <img> -- a labelled empty slot, not a
  // placeholder graphic. No link out of any of the four (§4.4): the chart
  // is provenance, the spec table below is the readable data. ------------
  const galleryImage = (file, caption) => {
    if (!imagesByFile.has(file)) {
      throw new Error(`gen-pdp: manifest.images has no entry for "${file}"`);
    }
    const alt = altMap[file];
    if (!alt) throw new Error(`gen-pdp: img-alt.json is missing an entry for "${file}"`);
    return `      <li class="card">
        <div class="card__media">
          <img src="${IMG_ROOT}/${file}" alt="${esc(alt)}" />
        </div>
        <p class="card__title">${esc(caption)}</p>
      </li>`;
  };

  const galleryEmptySlotHtml = `      <li class="card">
        <div class="card__media"></div>
        <p class="card__title">${esc(pdp.gallery.videoSlotCaption)}</p>
        <p class="fine">${esc(pdp.gallery.videoSlotNote)}</p>
      </li>`;

  const galleryHtml = `<ul class="grid">
${galleryImage("aura-boot.webp", pdp.gallery.bootCaption)}
${galleryImage("aura-selection-chart.webp", pdp.gallery.selectionChartCaption)}
${galleryImage("aura-size-width-grid.webp", pdp.gallery.widthGridCaption)}
${galleryEmptySlotHtml}
      </ul>`;

  // -- 3. the title and colour note (ruling #579/#583) -- esc(p.name)
  // verbatim, no em dash, no hand-typed "-- White" suffix. The colour note
  // ships exactly as the fixture holds it, not the spec's "also stocked in
  // black" -- see draft-copy.json's pdp.colourNote for why both are true.
  const titleHtml = `<h1 class="pdp__title">${esc(product.name)}</h1>
    <p class="note">${esc(pdp.colourNote)}</p>`;

  // -- 4. price and instalments (ruling #549/#580/#583) -- following
  // gen-home.mjs:371-376 verbatim in shape. The price is read out of
  // products.json, never typed as a literal; instalments()/moneyWhole()/
  // moneyCents() are the pdp.js imports, not a fifth copy. Render the
  // worked-example sentence only -- NOT pdp.instalmentNote (§5.3: two
  // hand-typed descriptions of one claim on one page is exactly the drift
  // _meta.refConvention forbids). -----------------------------------------
  const cents = Number(product.prices.price);
  if (!Number.isFinite(cents)) {
    throw new Error(`gen-pdp: product ${product.id} has a non-numeric price`);
  }
  const [first] = instalments(cents);
  const priceHtml = `<p class="pdp__price price" data-price="${cents}">${moneyWhole(cents)}</p>
    <p class="price__instalment"${chip("pjn-instalments")}>
      or 3 interest-free instalments of ${moneyCents(first)} <small>PayJustNow, once onboarded</small>
    </p>`;

  // -- 5. the Fit Guarantee (ruling #493/#576/#584) -- id="fit-guarantee"
  // on the SECTION, not a buried span, so a reader lands on the heading and
  // not the middle of a sentence. shared.fitGuarantee.note is NOT rendered
  // -- it is addressed to the builder, not to a visitor (§3.4). -----------
  const fg = shared.fitGuarantee;
  const fitGuaranteeHtml = `<section class="fit-guarantee" id="fit-guarantee"${chip("fit-guarantee")}>
      <p>${esc(fg.oneLiner)}</p>
      <ul>
        <li>${esc(fg.terms[0])}</li>
        <li>${esc(fg.terms[1])}</li>
        <li>${esc(fg.terms[2])}</li>
      </ul>
      <p><strong>${esc(fg.carveOut)}</strong></p>
    </section>`;

  // -- 6. the spec table (ruling #577/#578/#582) -- values are the Sky
  // 100's OWN size and width run, measured off Aura's published grid image
  // (aura-size-width-grid.webp / .cache/mels-fixtures/size-chart-aura-size-
  // width-grids.png), NOT the manifest fact's brand-level "210 to 300" --
  // that string is true across Sky 50/100/200 and false of this boot alone
  // (300mm exists only on the Sky 200 men's panel). Level and stiffness are
  // OMITTED -- published nowhere reachable, per pdp.specTableNote below,
  // which is rendered verbatim. AC4's "confirm" marker is NOT built --
  // ruling #578: `confirm` is a manifest-only audit flag, it renders
  // nothing, and the house precedent (Home's shop-relocated-eastgate fact)
  // already ships that way. No chip on the table (§7.4): every value here
  // is sourced melsskateshop.co.za, and a chip inside .table-scroll is a
  // known blind spot for group 11 assertion D (a chip scrolled out of view
  // still reports a non-zero box). -----------------------------------------
  const specRows = [
    ["Boot only", "blades are sold separately."],
    ["Construction", "carbon."],
    [
      "Heat-mould",
      "required, not optional. Aura publishes it as a requirement; the boot is built to fit very snug before moulding.",
    ],
    ["Size run, Sky 100", "Men's 210-285 mm · Women's 210-280 mm."],
    [
      "Widths, Sky 100",
      "Men's C, plus D at 255-280 · Women's B and C, plus D at 255-280. The E column is printed on Aura's grids and offered in no size.",
    ],
  ];
  const specRowsHtml = specRows
    .map(([label, value]) => `          <tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`)
    .join("\n");

  const specTableHtml = `<div class="table-scroll">
      <table class="table">
        <caption class="u-visually-hidden">Aura Sky 100 spec table</caption>
        <tbody>
${specRowsHtml}
        </tbody>
      </table>
    </div>
    <p class="note">${esc(pdp.specTableNote)}</p>
    <p class="source">Values sourced from Aura's own published size-and-width grid on melsskateshop.co.za.</p>`;

  // -- assemble -------------------------------------------------------------
  const mainHtml = [
    legendHtml,
    bannerHtml,
    galleryHtml,
    titleHtml,
    priceHtml,
    fitGuaranteeHtml,
    specTableHtml,
  ].join("\n\n    ");

  const wrappedHtml = `<section class="section">
      <div class="wrap pdp">
        ${mainHtml}
      </div>
    </section>`;

  assertChipContract(wrappedHtml);

  const filePath = join(DEMO, "aura-sky-100.html");
  let html = readFileSync(filePath, "utf8");
  html = spliceBetweenMarkers(html, "<!-- main:pdp -->", "<!-- /main:pdp -->", `    ${wrappedHtml}`, "aura-sky-100.html");
  writeFileSync(filePath, html);

  console.log("gen-pdp: rendered Aura Sky 100 PDP (static half) into aura-sky-100.html");
  console.log(`gen-pdp: price = ${moneyWhole(cents)}, first instalment = ${moneyCents(first)}`);
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
