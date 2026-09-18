#!/usr/bin/env node
// scripts/gen-book-a-fitting.mjs — task 17 (issue #35), rulings #607-#617.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script (ruling #545: regeneration is
// idempotent). Never invoked at runtime — the demo still ships with no build
// step. Reads the demo's own fixtures under DEMO/data/*.json and splices the
// result between the `<!-- main:booking -->` / `<!-- /main:booking -->`
// marker pair inside `<main id="main" class="page__main">` in
// book-a-fitting.html. Touches book-a-fitting.html and NOTHING else — the
// marker pair itself was added once, by hand, ahead of this generator's
// first run (build brief §2.1), exactly as T16 did for size-finder.html.
//
// esc() and spliceBetweenMarkers() are copied VERBATIM from
// gen-size-finder.mjs (which copied them from gen-roller-derby.mjs, which
// copied them from gen-shared-blocks.mjs) — this is now the FIFTH caller of
// that shape. Extraction into a shared module remains explicitly out of
// scope, same rationale every prior generator's comment gives: group 4's
// byte-identity gate makes adding a caller to a shared module more risk than
// a ~20-line duplication costs.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
// The generator bakes the CTA's initial href from the SAME pure functions
// the page runs at runtime, rather than a second hand-typed copy of either
// (build brief §5.1/§8 case 17: the href before any interaction must already
// be the empty-fields message, never absent, never href=""). Both imports
// are Node-pure — see each file's own tail guard — so this import is itself
// part of the purity proof, same idiom the verify spine's own top-level
// imports already rely on.
import { composeBookingMessage, BOOKING_DAYS } from "../public/decks/mels-skate-shop/demo/assets/booking.js";
import { buildWhatsAppLink } from "../public/decks/mels-skate-shop/demo/assets/site.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO = join(__dirname, "..", "public", "decks", "mels-skate-shop", "demo");
const DATA = join(DEMO, "data");

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), "utf8"));
}

// esc() and spliceBetweenMarkers() copied verbatim from gen-size-finder.mjs.
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
      `gen-book-a-fitting: ${pageLabel} is missing a ${openMarker} ... ${closeMarker} marker pair`
    );
  }
  const before = html.slice(0, openIdx + openMarker.length);
  const after = html.slice(closeIdx);
  return `${before}\n${inner}\n    ${after}`;
}

// --- the chip-legend + aria-describedby contract (#550) -- copied verbatim
// from gen-aura-sky-100.mjs (which copied it from gen-home.mjs). -----------
const LEGEND_ID = "chip-legend";
const chip = (id) => ` data-illustrative="${id}" aria-describedby="${LEGEND_ID}"`;

function assertChipContract(html) {
  const legendTags = html.match(/<[a-zA-Z][^<>]*\bclass="chip-legend"[^<>]*>/g) || [];
  if (legendTags.length !== 1) {
    throw new Error(
      `gen-book-a-fitting: expected exactly one class="chip-legend" element, found ${legendTags.length}`
    );
  }
  const idMatch = /\bid="([^"]+)"/.exec(legendTags[0]);
  if (!idMatch) {
    throw new Error(`gen-book-a-fitting: the chip-legend element carries no id`);
  }
  const legendId = idMatch[1];

  const chipTags = html.match(/<[a-zA-Z][^<>]*\bdata-illustrative="[^"]*"[^<>]*>/g) || [];
  for (const tag of chipTags) {
    if (!tag.includes(`aria-describedby="${legendId}"`)) {
      throw new Error(
        `gen-book-a-fitting: an element carrying data-illustrative has no aria-describedby="${legendId}" -- ${tag}`
      );
    }
  }
}

function run() {
  const draft = readJson("draft-copy.json");
  const fittings = readJson("fittings.json");
  const contact = readJson("contact.json");

  const shared = draft.shared;
  const booking = draft.booking;
  if (!shared || !shared.chipLegend) {
    throw new Error(`gen-book-a-fitting: draft-copy.json has no shared.chipLegend`);
  }
  if (!booking) {
    throw new Error(`gen-book-a-fitting: draft-copy.json has no "booking" key`);
  }
  if (!Array.isArray(fittings.types) || fittings.types.length !== 4) {
    throw new Error(`gen-book-a-fitting: fittings.json#types must have exactly 4 entries`);
  }

  // -- 0. the chip-legend, byte-identical convention to every other page ---
  const legendHtml = `<p class="chip-legend" id="${LEGEND_ID}">${esc(shared.chipLegend)}</p>`;

  // -- 1. intro --------------------------------------------------------------
  const introHtml = `<section class="section">
      <div class="wrap">
        <p class="source">${esc(booking.eyebrow)}</p>
        <h1>${esc(booking.heading)}</h1>
        <p class="lede">${esc(booking.lede)}</p>
      </div>
    </section>`;

  // -- 2. the four fitting types ---------------------------------------------
  // Ruling #609/#616: on the ice fitting's own card, and ONLY there, the
  // R850 collision sentence ships verbatim -- typed once, here, never
  // paraphrased.
  const R850_COLLISION_SENTENCE =
    "The R850 here is the same heat-mould that appears on the boot page. One bake, charged once, whichever way you book it.";

  const typeCardsHtml = fittings.types
    .map((t) => {
      const bringHtml = t.bring
        .map((item) => `          <li>${esc(item)}</li>`)
        .join("\n");
      // T17 adjudication fix (major, §6.0 breach): this sentence is the
      // page's own comparison of two invented R850 figures, so the
      // instance doing the comparing must carry the SAME "proposed" chip
      // as every other illustrative number on this page (§6.0: "anything
      // the demo shows that Mel has not published ... carries
      // data-illustrative"). The string stays byte-identical to #616 --
      // only the wrapping tag gains the chip attributes.
      const collisionHtml =
        t.key === "ice-boot-fitting-heat-mould"
          ? `\n        <p class="field__hint"${chip("fitting-prices")}>${esc(R850_COLLISION_SENTENCE)}</p>`
          : "";
      return `      <li class="card">
        <h3 class="card__title">${esc(t.name)}</h3>
        <p class="card__meta"><span${chip("fitting-durations")}>${esc(
        t.durationLabel
      )}</span> · <span${chip("fitting-prices")}>${esc(t.priceLabel)}</span></p>
        <p class="card__body">${esc(t.blurb)}</p>${collisionHtml}
        <p class="field__label">Bring</p>
        <ul class="u-stack">
${bringHtml}
        </ul>
      </li>`;
    })
    .join("\n");

  const typesHtml = `<section class="section">
      <div class="wrap">
        <h2>${esc(booking.typesHeading)}</h2>
        <ul class="grid">
${typeCardsHtml}
        </ul>
      </div>
    </section>`;

  // -- 3. the intake block -- the unified five-item list ALWAYS renders,
  // alongside each type's own `bring` array above (ruling #615: intake.note
  // is a present-tense claim about the rendered page -- "this is the short
  // version of all four" is only true if all four actually render, which
  // typeCardsHtml above does). bringRef resolves, it is never retyped. -----
  const intakeItemsHtml = booking.intake.items
    .map((item) => `          <li>${esc(item)}</li>`)
    .join("\n");

  const intakeHtml = `<section class="section section--sunken">
      <div class="wrap">
        <h2>${esc(booking.intake.heading)}</h2>
        <p class="lede">${esc(booking.intake.lede)}</p>
        <ol class="u-stack">
${intakeItemsHtml}
        </ol>
        <p class="field__hint">${esc(booking.intake.note)}</p>
      </div>
    </section>`;

  // -- 4. the promise (measure -> try -> adjust) -----------------------------
  const promiseHtml = `<section class="section">
      <div class="wrap">
        <h2>${esc(booking.promise.lead)}</h2>
        <p>${esc(fittings.promise.text)}</p>
      </div>
    </section>`;

  // -- 5. cancellation policy, rendered VERBATIM, chipped --------------------
  const cancellationHtml = `<section class="section">
      <div class="wrap">
        <h2>${esc(booking.cancellation.lead)}</h2>
        <p${chip(fittings.cancellation.id)}>${esc(fittings.cancellation.text)}</p>
      </div>
    </section>`;

  // -- 6. availability -- "By appointment" + Mel's real hours, never
  // "walk-ins welcome" anywhere in this page. -------------------------------
  const availabilityHtml = `<section class="section">
      <div class="wrap">
        <h2>${esc(booking.availability.lead)}</h2>
        <p>${esc(contact.hours.detail)}</p>
        <p class="field__hint">${esc(booking.availability.note)}</p>
      </div>
    </section>`;

  // -- 7. the form -- FIVE controls (ruling #608), no <form> element (build
  // brief §4.1, precedent measured on the PDP and the finder: both use a
  // bare <fieldset>). Day is CONSTRAINED to BOOKING_DAYS (ruling #610),
  // imported from booking.js so the generator and the runtime module share
  // one list rather than two hand-typed copies. The time hint carries
  // fittings.json#availability.detail verbatim -- ruling #610's own text
  // pins `fittings.json` as the source (it "already pins the window"), not
  // contact.json (T17 adjudication fix: both fixtures carry the byte-
  // identical string today, but only one is the one the ruling names, and a
  // future edit to one and not the other would otherwise drift silently).
  // There is no per-day-granular fixture to resolve instead (see this
  // task's filed discrepancy). ------------------------------------------
  const typeOptionsHtml = fittings.types
    .map((t) => `            <option value="${esc(t.name)}">${esc(t.name)}</option>`)
    .join("\n");
  const dayOptionsHtml = BOOKING_DAYS.map(
    (d) => `            <option value="${esc(d)}">${esc(d)}</option>`
  ).join("\n");

  // Ruling #618 corrects #610's second clause: the time control was shipped
  // with `min` and `max` both null, so Wednesday + 08:00 composed into
  // Melony's inbox four hours before the hint above it says she opens.
  // #610's premise -- "fittings.json already pins the window" -- was FALSE:
  // no fixture gives any day its own window, only the ONE combined string
  // `availability.detail` carries. So the bound is the UNION of the two
  // published windows, taken from that same string rather than hand-typed
  // here, which is what keeps the control and the hint beside it from ever
  // drifting apart. Deliberately NOT per-day: inferring Thu/Fri/Sat windows
  // the fixture never states is invented data wearing a parser (#618).
  // Zero-padded HH:MM sorts lexicographically == chronologically.
  const windowTimes = [...String(fittings.availability.detail).matchAll(/\b(\d{2}:\d{2})\b/g)]
    .map((m) => m[1])
    .sort();
  if (windowTimes.length < 2) {
    throw new Error(
      `gen-book-a-fitting: fittings.availability.detail (${JSON.stringify(fittings.availability.detail)}) ` +
        `yielded ${windowTimes.length} HH:MM time(s); the #618 min/max union needs at least 2`
    );
  }
  const timeMin = windowTimes[0];
  const timeMax = windowTimes[windowTimes.length - 1];

  // The baked initial href (build brief §8 case 17 / §5.1): computed by the
  // SAME pure functions the page runs at runtime, with every field absent,
  // so first paint -- before booking.js has even finished loading -- already
  // carries a real, non-empty wa.me link, never href="".
  const initialMessage = composeBookingMessage({});
  const initialHref = esc(buildWhatsAppLink(contact.whatsapp.number, initialMessage));

  const formHtml = `<section class="section section--sunken">
      <div class="wrap">
        <h2>${esc(booking.form.heading)}</h2>
        <fieldset class="u-stack">
          <legend class="u-visually-hidden">${esc(booking.form.heading)}</legend>

          <div class="field">
            <label class="field__label" for="booking-type">${esc(booking.form.typeLabel)}</label>
            <select class="select" id="booking-type" data-booking-type>
            <!-- Structural placeholder label, authored by this generator,
                 not fixture copy -- draft-copy.json#booking.form has no key
                 for it (T17 adjudication note, minor, filed in PRODUCT.md).
                 Precedent: size-finder.html's hand-authored "Scale"/"Size"
                 structural labels. -->
            <option value="">Choose a fitting</option>
${typeOptionsHtml}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="booking-day">${esc(booking.form.dayLabel)}</label>
            <select class="select" id="booking-day" data-booking-day>
            <!-- Structural placeholder label, same note as above. -->
            <option value="">Choose a day</option>
${dayOptionsHtml}
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="booking-time">${esc(booking.form.timeLabel)}</label>
            <input class="input" type="time" id="booking-time" data-booking-time min="${esc(timeMin)}" max="${esc(timeMax)}" aria-describedby="booking-time-hint" />
            <span class="field__hint" id="booking-time-hint">${esc(fittings.availability.detail)}</span>
          </div>

          <div class="field">
            <label class="field__label" for="booking-name">${esc(booking.form.nameLabel)}</label>
            <input class="input" type="text" id="booking-name" data-booking-name />
          </div>

          <div class="field">
            <label class="field__label" for="booking-notes">${esc(booking.form.notesLabel)}</label>
            <textarea class="textarea" id="booking-notes" data-booking-notes aria-describedby="booking-notes-hint"></textarea>
            <span class="field__hint" id="booking-notes-hint">${esc(booking.form.notesHint)}</span>
          </div>

          <p><a class="btn btn--primary" data-booking-submit href="${initialHref}" target="_blank" rel="noopener">${esc(
    booking.form.submitLabel
  )}</a></p>
          <p class="field__hint">${esc(fittings.bookingNote)}</p>
        </fieldset>
      </div>
    </section>`;

  // -- 8. the module script -- root-absolute (build brief §2.3), last line
  // inside the marker block. -------------------------------------------------
  const scriptHtml = `<script type="module" src="/decks/mels-skate-shop/demo/assets/booking.js"></script>`;

  const rootAttrs = [`data-booking`, `data-booking-whatsapp-number="${esc(contact.whatsapp.number)}"`].join(
    " "
  );

  const mainHtml = [
    legendHtml,
    introHtml,
    typesHtml,
    intakeHtml,
    promiseHtml,
    cancellationHtml,
    availabilityHtml,
    `<div ${rootAttrs}>`,
    formHtml,
    `</div>`,
    scriptHtml,
  ].join("\n\n    ");

  assertChipContract(mainHtml);

  const filePath = join(DEMO, "book-a-fitting.html");
  let html = readFileSync(filePath, "utf8");
  html = spliceBetweenMarkers(
    html,
    "<!-- main:booking -->",
    "<!-- /main:booking -->",
    `    ${mainHtml}`,
    "book-a-fitting.html"
  );
  writeFileSync(filePath, html);

  console.log("gen-book-a-fitting: rendered Book a fitting into book-a-fitting.html");
  console.log(
    `gen-book-a-fitting: ${fittings.types.length} type(s), ${BOOKING_DAYS.length} bookable day(s), initial CTA message = ${JSON.stringify(
      initialMessage
    )}`
  );
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
