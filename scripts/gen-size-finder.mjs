#!/usr/bin/env node
// scripts/gen-size-finder.mjs — task 16 (issue #34), rulings #597, #600-#603.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script (ruling #545: regeneration is
// idempotent). Never invoked at runtime — the demo still ships with no build
// step. Reads the demo's own fixtures under DEMO/data/*.json and splices the
// result between the `<!-- main:finder -->` / `<!-- /main:finder -->` marker
// pair inside `<main id="main" class="page__main">` in size-finder.html.
// Touches size-finder.html and NOTHING else (the marker pair itself was
// added once, by hand, ahead of this generator's first run — size-finder.html
// carried no `main:` pair at all before this task, unlike the other four
// pages; see the build brief §2.1).
//
// scripts/gen-roller-derby.mjs is the closest analogue (a page that loads a
// module and wires DOM behaviour) and its shape is copied here: esc() and
// spliceBetweenMarkers() are copied VERBATIM from it (which copied them from
// gen-shared-blocks.mjs) — this is now the FOURTH caller of that shape.
// Extraction into a shared module remains explicitly out of scope, per
// gen-roller-derby.mjs's own comment: gen-shared-blocks.mjs's output is under
// group 4's byte-identity gate, so adding a caller to it is more risk than a
// ~20-line duplication costs.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO = join(__dirname, "..", "public", "decks", "mels-skate-shop", "demo");
const DATA = join(DEMO, "data");

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), "utf8"));
}

// esc() and spliceBetweenMarkers() copied verbatim from gen-roller-derby.mjs.
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
      `gen-size-finder: ${pageLabel} is missing a ${openMarker} ... ${closeMarker} marker pair`
    );
  }
  const before = html.slice(0, openIdx + openMarker.length);
  const after = html.slice(closeIdx);
  return `${before}\n${inner}\n    ${after}`;
}

// The picker per rulings #603(1)/(2): the six table brands PLUS riedell and
// sure-grip, which stay in deliberately and hand off (#506's finding about
// Mel's own site — "her picker offers brands her size guide cannot size").
// Aura is NOT in this list: Ice/Figure implies Aura directly (§3.1) and it
// never appears in the derby/recreational brand picker. "Chaya" is two
// entries (#603(2)), never one.
const PICKER_BRAND_KEYS = ["rio", "sfr", "chaya-emerald", "chaya-sapphire", "atom", "riedell", "sure-grip"];

// finder.js embeds sizes.json as a plain JS object literal (build brief §7 —
// browser-safe AND Node-pure, no fetch(), no readFileSync()). This assertion
// is the drift guard: exactly the idiom gen-roller-derby.mjs already uses to
// keep site.js's TEMPLATE literal honest against draft-copy.json, applied
// here to finder.js's SIZES literal against data/sizes.json. A hand-edit to
// either file that lets them diverge fails THIS script loudly at generation
// time, rather than shipping a silently stale table.
function assertFinderJsSizesInSync(sizes) {
  const finderJsPath = join(DEMO, "assets", "finder.js");
  const finderJsSource = readFileSync(finderJsPath, "utf8");
  const match = /export const SIZES = (\{.*?\});\n\nfunction findBrand/s.exec(finderJsSource);
  if (!match) {
    throw new Error(`gen-size-finder: could not find finder.js's "export const SIZES = ...;" literal`);
  }
  let embedded;
  try {
    // The literal is valid JSON (a syntactic subset of the JS object literal
    // finder.js embeds), so JSON.parse reads it without needing a JS eval.
    embedded = JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`gen-size-finder: finder.js's SIZES literal is not valid JSON: ${err.message || err}`);
  }
  const embeddedText = JSON.stringify(embedded);
  const fixtureText = JSON.stringify(sizes);
  if (embeddedText !== fixtureText) {
    throw new Error(
      `gen-size-finder: finder.js's embedded SIZES literal no longer matches data/sizes.json -- ` +
        `regenerate finder.js's embedded copy from the fixture`
    );
  }
}

function run() {
  const draft = readJson("draft-copy.json");
  const sizes = readJson("sizes.json");
  const contact = readJson("contact.json");

  assertFinderJsSizesInSync(sizes);

  const finder = draft.finder;
  const brandByKey = new Map(sizes.brands.map((b) => [b.key, b]));

  for (const key of PICKER_BRAND_KEYS) {
    if (!brandByKey.has(key)) {
      throw new Error(`gen-size-finder: sizes.json has no brand "${key}" named by the picker`);
    }
  }
  const auraBrand = brandByKey.get("aura");
  if (!auraBrand) throw new Error(`gen-size-finder: sizes.json has no "aura" brand`);
  const jumpLevels = auraBrand.selectionMatrix.jumpLevels;
  if (!Array.isArray(jumpLevels) || jumpLevels.length === 0) {
    throw new Error(`gen-size-finder: aura.selectionMatrix.jumpLevels is empty`);
  }

  // Ruling #600: the Brannock Suggested-Size gap is DISCLOSED to the
  // skater, not just noted in a source comment (#600's own text: "the
  // Aura branch STATES PLAINLY that Aura sizes off a Brannock Suggested
  // Size"). Resolved from sizes.json's own words (fittingRules key
  // "suggested-not-raw"), never retyped, per #506/_meta.refConvention.
  // Added during T16 adjudication -- the first cut left this disclosure
  // only in finder.js's comments, which no skater ever reads.
  const auraSuggestedNotRaw = (auraBrand.fittingRules || []).find(
    (r) => r.key === "suggested-not-raw"
  );
  if (!auraSuggestedNotRaw) {
    throw new Error(`gen-size-finder: sizes.json aura.fittingRules has no "suggested-not-raw" entry`);
  }

  // -- 1. intro -------------------------------------------------------------
  const introHtml = `<section class="section">
      <div class="wrap">
        <p class="source">${esc(finder.eyebrow)}</p>
        <h1>${esc(finder.heading)}</h1>
        <p class="lede">${esc(finder.lede)}</p>
      </div>
    </section>`;

  // -- 2. step one: discipline picker ---------------------------------------
  // Labels are the four disciplines named by spec §6.4.1 and plan Task 16 --
  // structural category names, not authored marketing copy, so they are not
  // a `_meta.refConvention` violation the way inventing a persuasive
  // sentence would be.
  const DISCIPLINES = [
    { key: "derby", label: "Derby / Recreational quad" },
    { key: "artistic", label: "Artistic" },
    { key: "ice", label: "Ice / Figure" },
    { key: "kids", label: "Kids & adjustable" },
  ];
  const disciplineButtonsHtml = DISCIPLINES.map(
    (d) =>
      `      <button class="btn" type="button" data-finder-discipline="${d.key}" aria-pressed="false">${esc(
        d.label
      )}</button>`
  ).join("\n");

  const brandButtonsHtml = PICKER_BRAND_KEYS.map((key) => {
    const b = brandByKey.get(key);
    return `        <button class="btn" type="button" data-finder-brand="${key}" aria-pressed="false">${esc(
      b.label
    )}</button>`;
  }).join("\n");

  const stepOneHtml = `<section class="section">
      <div class="wrap">
        <h2>${esc(finder.steps.one)}</h2>
        <fieldset class="sizes" data-finder-discipline-group>
      <legend>${esc(finder.disciplinePickerLabel)}</legend>
${disciplineButtonsHtml}
    </fieldset>
        <div data-finder-brand-wrap hidden>
          <fieldset class="sizes" data-finder-brand-group>
        <legend>${esc(finder.brandPickerLabel)}</legend>
${brandButtonsHtml}
      </fieldset>
          <p class="field__hint">${esc(finder.brandPickerHint)}</p>
        </div>
      </div>
    </section>`;

  // -- 3. the honest no-table handoff (#506's finding, kept as a finding,
  // never closed) and the generic out-of-range/kids fallback -- both static
  // copy, revealed/hidden by finder.js, never re-typed at runtime. ---------
  const notableHtml = `<div class="note" data-finder-notable hidden>
        <p><strong>${esc(finder.handoffs.noTableHeading)}</strong></p>
        <p>${esc(finder.handoffs.noTable)}</p>
        <p><a class="btn btn--primary" data-finder-notable-cta target="_blank" rel="noopener">${esc(
          finder.handoffs.noTableCta
        )}</a></p>
      </div>`;

  // This static block is reached ONLY via the "Kids & adjustable" discipline
  // (finder.js's selectDiscipline("kids")) -- the real out-of-range/
  // unknown-brand results from findSize() render into [data-finder-result]
  // at runtime via the SEPARATE `data-finder-out-of-range-note` dataset
  // attribute below, where finder.handoffs.outOfRangeNote ("Not a dead end:
  // the message already has your measurement in it...") is genuinely true.
  // FIXED during T16 adjudication: the first cut also baked that same
  // sentence into THIS block, but a Kids visitor has entered no measurement
  // at all, so the claim was false every time this panel was reachable --
  // a #540 violation. Kept to `sizes.fallback` ("Outside our table...",
  // true: there is no kids table) plus the hand-off CTA.
  const fallbackHtml = `<div class="note" data-finder-fallback hidden>
        <p>${esc(sizes.fallback)}</p>
        <p><a class="btn btn--primary" data-finder-fallback-cta target="_blank" rel="noopener">${esc(
          finder.handoffs.noTableCta
        )}</a></p>
      </div>`;

  const handoffsHtml = `<section class="section">
      <div class="wrap">
${notableHtml}
${fallbackHtml}
      </div>
    </section>`;

  // -- 4. step two: how will you measure ------------------------------------
  // measure.noteRef resolves to sizes.json#measure.note (`_meta.refConvention`
  // — a key ending "Ref" is a pointer, never retyped prose).
  const measureStepsHtml = finder.measure.steps
    .map((step) => `      <li>${esc(step)}</li>`)
    .join("\n");

  const stepTwoHtml = `<div data-finder-measure hidden>
        <h2>${esc(finder.measure.heading)}</h2>
        <p class="lede">${esc(finder.measure.lede)}</p>
        <ol class="u-stack">
${measureStepsHtml}
        </ol>
        <p class="field__hint">${esc(sizes.measure.note)}</p>
        <div class="field">
          <label class="field__label" for="finder-mm">${esc(finder.measure.unitLabel)}</label>
          <input class="input" type="number" inputmode="decimal" id="finder-mm" data-finder-mm min="0" />
        </div>
        <div data-finder-altmodes-wrap>
        <p>${esc(finder.measure.altInputsLabel)}</p>
        <fieldset class="sizes" data-finder-altmodes>
          <button class="btn" type="button" data-finder-altmode="shoe" aria-pressed="false">${esc(
            finder.measure.altShoeSizeLabel
          )}</button>
          <button class="btn" type="button" data-finder-altmode="own" aria-pressed="false">${esc(
            finder.measure.altOwnSkateLabel
          )}</button>
        </fieldset>
        </div>
        <div data-finder-altpanel hidden>
          <p class="field__hint" data-finder-althint></p>
          <div class="field">
            <!-- "Scale" is a structural form-field label (which column of
            the brand's own table the value below belongs to: UK, EU, US...),
            not authored marketing copy -- same class as DISCIPLINES above,
            not a _meta.refConvention violation. -->
            <label class="field__label" for="finder-scale">Scale</label>
            <select class="select" id="finder-scale" data-finder-scale></select>
          </div>
          <div class="field">
            <!-- "Size" is the matching structural label for the value input
            next to "Scale" above -- same rationale. -->
            <label class="field__label" for="finder-scale-value">Size</label>
            <input class="input" id="finder-scale-value" data-finder-scale-value />
          </div>
        </div>
        <!-- "Find my size" is the same literal string as draft-copy.json's
        home.ctaPrimary/home.sizeFinderBand.cta, but is NOT templated from
        either: this button's job (submit the measure step) differs from
        both of those (navigate to this page), so pointing it at either
        would couple two unrelated calls to action. Kept as a structural
        label, same rationale as "Scale"/"Size" above, not a
        _meta.refConvention violation -- reviewed during T16 adjudication. -->
        <button class="btn btn--primary" type="button" data-finder-submit>Find my size</button>
      </div>`;

  // -- 5. the Which Sky? step (ice/figure only, rulings #600/#602) ----------
  const jumpButtonsHtml = jumpLevels
    .map(
      (j) =>
        `        <button class="btn" type="button" data-finder-jump="${j.key}" aria-pressed="false">${esc(
          j.label
        )}</button>`
    )
    .join("\n");

  const stepSkyHtml = `<div data-finder-sky hidden>
        <h2>${esc(finder.whichSky.heading)}</h2>
        <p>${esc(finder.whichSky.instruction)}</p>
        <p class="field__hint">${esc(finder.whichSky.note)}</p>
        <p class="field__hint" data-finder-sky-brannock>${esc(auraSuggestedNotRaw.text)} This finder measures raw foot length, so the millimetre result below is a starting point - Melony confirms your exact fit against a Brannock device in store.</p>
        <div class="field">
          <!-- Structural form-field label, same rationale as "Scale"/"Size"
          above -- not authored marketing copy. -->
          <label class="field__label" for="finder-sky-kg">Body weight (kg)</label>
          <input class="input" type="number" id="finder-sky-kg" data-finder-sky-kg min="0" />
        </div>
        <fieldset class="sizes" data-finder-sky-jump>
      <legend>${esc(finder.whichSky.jumpLabel)}</legend>
${jumpButtonsHtml}
    </fieldset>
      </div>`;

  const measureSectionHtml = `<section class="section">
      <div class="wrap">
${stepTwoHtml}
${stepSkyHtml}
      </div>
    </section>`;

  // -- 6. step three: the result --------------------------------------------
  const whatsappCtaHtml = `<a class="btn btn--primary" data-finder-whatsapp target="_blank" rel="noopener">${esc(
    finder.result.ctaWhatsapp
  )}</a>`;
  const bookingCtaHtml = `<a class="btn btn--secondary" href="/decks/mels-skate-shop/demo/book-a-fitting">${esc(
    finder.result.ctaBooking
  )}</a>`;

  const resultHtml = `<section class="section">
      <div class="wrap">
        <h2>${esc(finder.result.lead)}</h2>
        <p class="field__hint">${esc(finder.result.liveRegionNote)}</p>
        <div class="live live--result" aria-live="polite" data-finder-result></div>
        <div data-finder-result-ctas hidden>
          <p>${whatsappCtaHtml}</p>
        </div>
        <p>${bookingCtaHtml}</p>
      </div>
    </section>`;

  // -- 7. the module script -- root-absolute (build brief §2.4, ruling #562's
  // trailing-slash trap), last line inside the marker block. ----------------
  const scriptHtml = `<script type="module" src="/decks/mels-skate-shop/demo/assets/finder.js"></script>`;

  const rootAttrs = [
    `class="finder" data-finder`,
    `data-finder-whatsapp-number="${esc(contact.whatsapp.number)}"`,
    `data-finder-disclaimer-lead="${esc(finder.result.disclaimerLead)}"`,
    `data-finder-out-of-range-note="${esc(finder.handoffs.outOfRangeNote)}"`,
  ].join(" ");

  const mainHtml = [
    `<div ${rootAttrs}>`,
    introHtml,
    stepOneHtml,
    handoffsHtml,
    measureSectionHtml,
    resultHtml,
    `</div>`,
    scriptHtml,
  ].join("\n\n    ");

  const filePath = join(DEMO, "size-finder.html");
  let html = readFileSync(filePath, "utf8");
  html = spliceBetweenMarkers(
    html,
    "<!-- main:finder -->",
    "<!-- /main:finder -->",
    `    ${mainHtml}`,
    "size-finder.html"
  );
  writeFileSync(filePath, html);

  console.log("gen-size-finder: rendered Size Finder into size-finder.html");
  console.log(
    `gen-size-finder: picker = ${PICKER_BRAND_KEYS.length} brand(s), aura's Which Sky? matrix = ${jumpLevels.length} jump level(s)`
  );
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
