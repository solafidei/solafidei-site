#!/usr/bin/env node
// scripts/gen-aura-sky-100.mjs — task 14 (issue #32) + task 15 (issue #33),
// decision #574.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script. Never invoked at runtime --
// the demo still ships with no build step. Reads the demo's own fixtures
// under DEMO/data/*.json plus DEMO/assets/pdp.js, renders the FULL PDP --
// T14's static half (banner, gallery, title, price, Fit Guarantee, spec
// table) and T15's interactive half (size selector, service checkboxes +
// running total, fulfilment/buy button/demo sheet, both rails, Q&A, the two
// CTAs, and the page's first `<script type="module">` tag) -- and splices
// the result between the `<!-- main:pdp -->` / `<!-- /main:pdp -->` marker
// pair inside `<main id="main" class="page__main">` in aura-sky-100.html.
// Touches aura-sky-100.html and nothing else.
//
// scripts/gen-roller-derby.mjs is this file's template. Copied VERBATIM
// (only the error-message prefix changes, "gen-pdp:"): readJson(), esc(),
// spliceBetweenMarkers(), the chip() helper, LEGEND_ID, assertChipContract().
// These sit under group 4's byte-identity gate elsewhere in the file tree,
// so a second/third/fourth caller is more risk than the small duplication
// costs -- gen-home.mjs's own comment says so and gen-roller-derby.mjs
// already deferred it once; this is the fourth caller.
//
// MONEY MATHS IS DIFFERENT FROM THE HELPERS ABOVE (ruling #573): T14 landed
// the canonical instalments(), moneyWhole() and moneyCents() in
// DEMO/assets/pdp.js, and this generator IMPORTS them rather than defining
// its own fourth copy. gen-home.mjs's own instalments() copy has now been
// DELETED by T15 (this task) and replaced with an import from pdp.js, per
// ruling #573's singular instruction ("T15 deletes gen-home.mjs's copy" --
// see gen-home.mjs's own header for the discharged obligation and #587's
// matching comment fix). gen-home.mjs's own moneyWhole()/moneyCents() copies
// remain local -- #573 never ruled on those two, so deleting them as well
// would be unrequested scope; the asymmetry is recorded in PRODUCT.md for
// the owner rather than resolved here. gen-roller-derby.mjs is a different
// case, unaffected by any of this: it has no instalments() copy at all, and
// its own moneyWhole()/moneyCents() feed its unrelated money() helper
// (ruling #563's fix for SKU 9571, R700.01) -- no ruling touches
// gen-roller-derby.mjs's helpers.
//
// Do NOT hand-edit aura-sky-100.html inside the marker pair: the next
// regeneration wipes it (two such incidents are on record).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  instalments,
  moneyWhole,
  moneyCents,
} from "../public/decks/mels-skate-shop/demo/assets/pdp.js";
import {
  stockState,
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

// Rail A -- "goes with this boot" (§6.3.11, build brief §7 measured fact E):
// the 2 real Ice Blades SKUs (both out of stock, price 0 in the fixture) plus
// the 4 real ice accessories that carry both a manifest.images[] row and an
// img-alt.json entry -- no new image, no new alt entry (measured fact G).
const RAIL_A_IDS = [6395, 6403, 4901, 7941, 9665, 12043];
// Rail B -- "the Sky ladder" (§6.3.11): the three real boots, in ascending
// order. 11919 is THIS page -- rendered present, never a link to itself.
const RAIL_B_IDS = [11905, 11919, 11924];

function run() {
  const draft = readJson("draft-copy.json");
  const manifest = readJson("manifest.json");
  const products = readJson("products.json");
  const altMap = readJson("img-alt.json");
  const fittings = readJson("fittings.json");
  const contact = readJson("contact.json");

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
  // Task 15's four chip ids (build brief §9) -- same #548 idiom: every chip
  // this generator emits needs a real manifest twin, source "illustrative".
  for (const id of ["heat-mould-price", "mail-in-heat-mould", "aura-size-stock-states", "demo-buy-button"]) {
    const f = fact(manifest, id);
    if (f.source !== "illustrative") {
      throw new Error(`gen-pdp: ${id} fact is not source: "illustrative"`);
    }
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

  // -- 7. the fit note (§6.3.7) -- Melony's own voice, verbatim, no chip
  // (manifest id copy-pdp-fit-note covers provenance; it is drafted copy,
  // not a claim about the world). --------------------------------------------
  const fitNoteHtml = `<p class="note">${esc(pdp.fitNote)}</p>`;

  // -- 8. the size selector (§6.3.6, rulings #589/#590/#591(1)) --------------
  // ONE run, 210-285, 16 buttons at 5 mm steps (#590) -- computed, never
  // typed sixteen times. No men's/women's toggle: T14's spec table directly
  // below already carries the per-panel split. The legend carries NO chip
  // (#591(1) -- AC2's clause is struck, FROZEN_NINE has no legend id at all).
  // The chip goes on the availability line's own wrapper -- an element that
  // is ALWAYS rendered and ALWAYS visible, with the empty aria-live span
  // nested inside it (build brief measured fact C / PRODUCT.md's named trap
  // for this chip): a chip placed on the live region itself would carry a
  // zero-size box on first paint (empty element, group 11 assertion D) and
  // fail on a clean load before anyone clicks anything.
  const SIZE_RUN_MM = Array.from({ length: 16 }, (_, i) => 210 + i * 5);
  const sizeButtonsHtml = SIZE_RUN_MM.map(
    (mm) =>
      `        <button type="button" class="size" data-pdp-size="${mm}" aria-pressed="false">${mm}<small>mm</small></button>`
  ).join("\n");

  const sizesHtml = `<fieldset class="sizes" data-pdp-sizes>
      <legend>${esc(pdp.sizes.legend)}</legend>
${sizeButtonsHtml}
    </fieldset>
    <p class="availability"${chip("aura-size-stock-states")}>
      <span aria-live="polite" data-pdp-availability></span>
    </p>
    <p class="field__hint">${esc(pdp.sizes.hint)} <a class="link--quiet" href="/decks/mels-skate-shop/demo/size-finder?preset=ice-aura">${esc(pdp.sizes.notSureLink)}</a></p>
    <p class="note">${esc(pdp.sizes.brannockNote)}</p>`;

  // -- 9. the services -- two chipped checkboxes with a running total
  // (§6.3.9, build brief §5/measured fact D). Prices read from fittings.json
  // services[].priceCents, NEVER parsed out of a manifest prose sentence
  // (that fixture only carries the numbers inside English text) and NEVER
  // hand-typed. The `confirm` flag on mail-in-heat-mould is manifest-only
  // and renders NOTHING here (#578). --------------------------------------
  const SERVICE_COPY = {
    "heat-mould-in-store": {
      label: pdp.services.heatMouldInStoreLabel,
      note: pdp.services.heatMouldInStoreNote,
      chipId: "heat-mould-price",
    },
    "mail-in-heat-mould": {
      label: pdp.services.mailInLabel,
      note: pdp.services.mailInNote,
      chipId: "mail-in-heat-mould",
    },
  };
  const serviceRowsHtml = fittings.services
    .map((svc) => {
      const copy = SERVICE_COPY[svc.key];
      if (!copy) throw new Error(`gen-pdp: fittings.json services[] has an unexpected key "${svc.key}"`);
      return `      <label class="check">
        <input type="checkbox" data-pdp-service="${esc(svc.id)}" data-price-cents="${svc.priceCents}" />
        <span>
          <span${chip(copy.chipId)}>${esc(copy.label)} — ${esc(svc.priceLabel)}</span>
          <span class="field__hint">${esc(copy.note)}</span>
        </span>
      </label>`;
    })
    .join("\n");

  const servicesHtml = `<fieldset data-pdp-services data-pdp-base-cents="${cents}">
      <legend class="field__label">${esc(pdp.services.legend)}</legend>
${serviceRowsHtml}
    </fieldset>
    <p class="note">${esc(pdp.services.priceSourceNote)}</p>
    <p class="price" data-pdp-total><span class="field__label">${esc(pdp.services.totalLabel)}:</span> <span data-pdp-total-amount>${moneyWhole(cents)}</span></p>`;

  // -- 10. fulfilment, buy button, demo sheet (§6.3.10) -- the courier line
  // is a REFERENCE (contact.json#courier.line), resolved here, never
  // hand-typed twice. Escape/focus-trap/focus-return come from the native
  // <dialog> (site.css's own comment on dialog.sheet); the wiring is
  // assets/pdp.js's initPdp(). No dead end: the sheet always offers the
  // WhatsApp CTA and a close control (pdp.demoSheet.dismiss). --------------
  // Adjudication fix: pdp.demoSheet.body promises "your selected size is
  // already in it", which was false whenever the sheet was reachable with no
  // size chosen (the composed WhatsApp message then carried no size at all).
  // The buy button is baked `disabled` and pdp.js's initPdp() only enables it
  // once a size is selected, so the sheet is never reachable in the state the
  // copy claims doesn't exist. This is the house .btn[disabled] treatment
  // (site.css), not a new pattern, and changes no fixture/copy string.
  const fulfilmentHtml = `<p class="note">${esc(pdp.fulfilment.text)} ${esc(contact.courier.line)}</p>
    <button type="button" class="btn btn--primary btn--block" data-pdp-buy${chip("demo-buy-button")} disabled>${esc(pdp.buyButtonLabel)}</button>

    <dialog class="sheet" data-pdp-sheet aria-labelledby="pdp-sheet-title">
      <h2 class="sheet__title" id="pdp-sheet-title">${esc(pdp.demoSheet.title)}</h2>
      <p class="sheet__body">${esc(pdp.demoSheet.body)}</p>
      <div class="sheet__foot">
        <a class="btn btn--primary" data-pdp-sheet-cta href="${esc(buildWhatsAppLink(contact.whatsapp.number, `Hi Melony, I'd like to order the ${product.name}.`))}" target="_blank" rel="noopener">${esc(pdp.demoSheet.cta)}</a>
        <button type="button" class="btn btn--ghost" data-pdp-sheet-dismiss>${esc(pdp.demoSheet.dismiss)}</button>
      </div>
    </dialog>`;

  // -- 11. the rails (§6.3.11) -- Rail A ships images (all 6 candidates
  // already have a manifest.images[] row and an img-alt.json entry -- no new
  // image, no new alt entry, measured fact G). Rail B is text-only: no photo
  // exists for the Sky 50 or the Sky 200, and reusing the Sky 100's own
  // aura-boot.webp for either would be a false image claim. No ladder price
  // typed here -- every money string comes from products.json through
  // moneyWhole(). ------------------------------------------------------------
  function railAPriceHtml(p) {
    const priceNum = Number(p.prices.price);
    if (!Number.isFinite(priceNum) || priceNum === 0) return ""; // no price where the fixture has none (measured fact E, 6395/6403)
    const range = p.prices.price_range;
    if (range && Number(range.max_amount) > Number(range.min_amount)) {
      // 4901 carries a price_range wider than its single `price` (measured
      // fact E) -- "From <min>" is honest about the top of the range never
      // being claimed as the whole story; a flat "R330" would under-claim it.
      return `<p class="price">From ${moneyWhole(Number(range.min_amount))}</p>`;
    }
    return `<p class="price">${moneyWhole(priceNum)}</p>`;
  }

  const railACardsHtml = RAIL_A_IDS.map((id) => {
    const p = products.products.find((x) => x.id === id);
    if (!p) throw new Error(`gen-pdp: products.json has no product with id ${id}`);
    const file = `product-${id}.webp`;
    if (!imagesByFile.has(file)) {
      throw new Error(`gen-pdp: manifest.images has no entry for "${file}"`);
    }
    const alt = altMap[file];
    if (!alt) throw new Error(`gen-pdp: img-alt.json is missing an entry for "${file}"`);
    const state = stockState(p);
    const badgeClass = state === "Sold out" ? "badge--sold-out" : "badge--in-stock";
    return `      <li class="card">
        <div class="card__media">
          <img src="${IMG_ROOT}/${file}" alt="${esc(alt)}" />
        </div>
        <p class="card__title">${esc(p.name)}</p>
        ${railAPriceHtml(p)}
        <p class="badge ${badgeClass}">${esc(state)}</p>
      </li>`;
  }).join("\n");

  const railAHtml = `<section class="rail">
      <h2 class="rail__title">${esc(pdp.railA)}</h2>
      <ul class="grid">
${railACardsHtml}
      </ul>
    </section>`;

  const railBCardsHtml = RAIL_B_IDS.map((id) => {
    const p = products.products.find((x) => x.id === id);
    if (!p) throw new Error(`gen-pdp: products.json has no product with id ${id}`);
    const priceNum = Number(p.prices.price);
    const isThisPage = id === PRODUCT_ID_AURA_SKY_100;
    return `      <li class="card card--flat">
        <p class="card__title">${esc(p.name)}</p>
        <p class="price">${moneyWhole(priceNum)}</p>
        ${isThisPage ? '<p class="fine">You are on this page.</p>' : ""}
      </li>`;
  }).join("\n");

  const railBHtml = `<section class="rail">
      <h2 class="rail__title">${esc(pdp.railB)}</h2>
      <ul class="grid">
${railBCardsHtml}
      </ul>
    </section>`;

  // -- 12. Q&A (§6.3.12) -- three pairs, verbatim, no chip. The third quotes
  // the Fit Guarantee terms T14 already ships (shared.fitGuarantee.terms). --
  const qa = pdp.qa;
  const qaHtml = `<div class="qa">
      <p class="qa__q">${esc(qa[0].q)}</p>
      <p class="qa__a">${esc(qa[0].a)}</p>
    </div>
    <div class="qa">
      <p class="qa__q">${esc(qa[1].q)}</p>
      <p class="qa__a">${esc(qa[1].a)}</p>
    </div>
    <div class="qa">
      <p class="qa__q">${esc(qa[2].q)}</p>
      <p class="qa__a">${esc(qa[2].a)}</p>
      <ul>
        <li>${esc(fg.terms[0])}</li>
        <li>${esc(fg.terms[1])}</li>
        <li>${esc(fg.terms[2])}</li>
      </ul>
      <p class="qa__a">${esc(qa[2].aAfter)}</p>
    </div>`;

  // -- 13. the two CTAs (§6.3.13) -- "Ask Melony" is wired live by pdp.js
  // (carries the selected size once one is picked); baked here with the
  // product-only message so the link works before any JS runs. "View on the
  // live site" points at product.permalink, which is byte-identical to
  // manifest.links[5]'s already-vouched href (build brief measured fact F --
  // do NOT add a second manifest.links row for it). --------------------------
  const initialAskWhatsappHref = buildWhatsAppLink(
    contact.whatsapp.number,
    `Hi Melony, I have a question about the ${product.name}.`
  );
  const ctasHtml = `<div class="btn-row">
      <a class="btn btn--secondary" data-pdp-ask-whatsapp href="${esc(initialAskWhatsappHref)}">${esc(pdp.ctaWhatsapp)}</a>
      <a class="btn btn--ghost" href="${esc(product.permalink)}">${esc(pdp.ctaLiveSite)}</a>
    </div>`;

  // -- 14. the module script -- last, inside the marker block, deferred, and
  // ROOT-ABSOLUTE (the /decks/mels-skate-shop/demo trailing-slash trap --
  // gen-home.mjs:150-152's own comment names it). This is the page's FIRST
  // <script> tag. -------------------------------------------------------------
  const scriptHtml = `<script type="module" src="/decks/mels-skate-shop/demo/assets/pdp.js"></script>`;

  // -- assemble -------------------------------------------------------------
  const mainHtml = [
    legendHtml,
    bannerHtml,
    galleryHtml,
    titleHtml,
    priceHtml,
    fitGuaranteeHtml,
    specTableHtml,
    fitNoteHtml,
    sizesHtml,
    servicesHtml,
    fulfilmentHtml,
    railAHtml,
    railBHtml,
    qaHtml,
    ctasHtml,
    scriptHtml,
  ].join("\n\n    ");

  const wrappedHtml = `<section class="section">
      <div class="wrap pdp" data-pdp data-pdp-product-name="${esc(product.name)}" data-pdp-whatsapp-number="${esc(contact.whatsapp.number)}">
        ${mainHtml}
      </div>
    </section>`;

  assertChipContract(wrappedHtml);

  const filePath = join(DEMO, "aura-sky-100.html");
  let html = readFileSync(filePath, "utf8");
  html = spliceBetweenMarkers(html, "<!-- main:pdp -->", "<!-- /main:pdp -->", `    ${wrappedHtml}`, "aura-sky-100.html");
  writeFileSync(filePath, html);

  console.log("gen-pdp: rendered Aura Sky 100 PDP into aura-sky-100.html");
  console.log(`gen-pdp: price = ${moneyWhole(cents)}, first instalment = ${moneyCents(first)}`);
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
