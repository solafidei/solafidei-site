// public/decks/mels-skate-shop/demo/assets/pdp.js — task 14 (issue #32),
// ruling #573.
//
// The canonical instalments() and the two money formatters, extracted here
// so a fourth caller (this generator, gen-aura-sky-100.mjs) does not paste a
// fifth copy. gen-home.mjs's own instalments()/moneyWhole()/moneyCents()
// copy was NOT deleted by T14 -- that was T15's job when it wired spine
// group 6 (ruling #573 is singular: T15 deletes gen-home.mjs's copy). As of
// T15, only the instalments() copy has been deleted and imported from here;
// gen-home.mjs's own moneyWhole()/moneyCents() remain local, an asymmetry
// #573 does not rule on (see gen-home.mjs's own header and PRODUCT.md).
// gen-roller-derby.mjs is unaffected -- it has no instalments() copy at
// all, and no ruling touches its own moneyWhole()/moneyCents(), which feed
// its unrelated money() helper (#563). The three exports this paragraph
// describes have no DOM access and are pure maths. THE REST OF THIS FILE
// DOES NOT: as of task 15 everything below the task-15 banner is the PDP's
// interactive module and is nothing but DOM wiring. PRODUCT.md's rule that
// new DOM wiring lands in site.js, "not a new module", is about site.js's
// own guarded block and does not bind the PDP -- the reconciliation is
// recorded in PRODUCT.md's T15 section, which says so in those words.
//
// THE INSTALMENTS ANCHOR (ruling #549/#580), verified by the main session:
//   instalments(1205000) -> [401667, 401667, 401666], summing to 1205000.
//   moneyCents(401667)   -> "R4,016.67", zero non-ASCII codepoints.
// The remainder is distributed ONE CENT AT A TIME FROM THE FIRST INDEX
// FORWARD -- which puts the odd cent on the EARLIER instalments and leaves
// the LAST one light. Plan Task 14 AC1's "remainder on the first" phrase
// describes the opposite distribution ([401668, 401666, 401666] ->
// R4,016.68) and is STRUCK by ruling #580: the number R4,016.67 is the pin
// (printed in the spec three times and in the pjn-instalments manifest
// fact), not that sentence. Do not "fix" this to match that phrase.
export const instalments = (cents, n = 3) => {
  const base = Math.floor(cents / n);
  const rem = cents - base * n; // 0 <= rem < n
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
};

// en-US is a CHARACTER-SET decision, not a formatting preference (#549,
// #517): toLocaleString("en-ZA") emits U+00A0 as the thousands separator
// (rendering R12,050 as "12 050,00"), which is outside site.css's unicode
// range and banned outright. Prices drop a trailing ".00"; instalments
// always keep two decimals. A not-whole price keeps its cents -- that is
// why moneyWhole throws rather than rounding (see gen-home.mjs's own
// comment on SKU 9571, R700.01, the one non-whole price in this build).
export function moneyWhole(cents) {
  const rands = cents / 100;
  if (!Number.isInteger(rands)) {
    throw new Error(`pdp: moneyWhole(${cents}) is not a whole-rand amount`);
  }
  return `R${rands.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
export function moneyCents(cents) {
  const rands = cents / 100;
  return `R${rands.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// --- interactive module (task 15, issue #33) --------------------------------
// The three exports above stay byte-identical (ruling #573). Everything below
// is new: the PDP's size selector, service-total and buy-sheet wiring. Same
// shape as site.js's initDerbyFilters() — inert on import, guarded behind
// `typeof document !== "undefined"` at the bottom of this file, a single init
// entry point (initPdp) that finds its root or does nothing. site.js is
// imported for buildWhatsAppLink() only (no new dependency: same-repo file,
// and its own DOM-guarded block at the bottom is a no-op on a page with no
// `[data-derby-filters]`, exactly as PRODUCT.md documents for a later page
// that reuses it).
import { buildWhatsAppLink } from "./site.js";

// §8's STATES map, survives with ONE entry (ruling #589): every size reads
// the same true fact — Aura Sky boots are imported to order, never held in
// stock, approx. 2-week lead time (manifest fact aura-imported-to-order). The
// two struck states ("in stock in Midrand", "notify me") asserted the
// opposite of that fact and a service Mel does not run (notify-me-adhoc,
// no-waitlist) — see the build brief §3.2. Middle dot (U+00B7), already in
// the font subset and already in this page's character budget.
//
// "approx.", not "~" (ruling #512, standing rule for T12-T17): site.css's
// @font-face unicode-range is U+0020-007E minus `\`, `^` and `~` -- a tilde
// here would be the site's first, rendering off-family in the fallback
// stack. T14's banner and fulfilment note already ship "approx. 2 weeks" for
// the identical fact (draft-copy.json `pdp.banner`/`pdp.fulfilment.text`),
// so this is the existing house form, not a new one (adjudication fix,
// T15's own build shipped the tilde and this corrects it before merge).
export const STATES = {
  leadTime: (mm) => `Size ${mm} · imported to order, approx. 2 weeks`,
};

export function initPdp(root) {
  const sizeButtons = Array.from(root.querySelectorAll("[data-pdp-size]"));
  const availability = root.querySelector("[data-pdp-availability]");
  const servicesFieldset = root.querySelector("[data-pdp-services]");
  const serviceInputs = Array.from(root.querySelectorAll("[data-pdp-service]"));
  const totalAmount = root.querySelector("[data-pdp-total-amount]");
  const buyButton = root.querySelector("[data-pdp-buy]");
  const sheet = root.querySelector("[data-pdp-sheet]");
  const sheetCta = root.querySelector("[data-pdp-sheet-cta]");
  const sheetDismiss = root.querySelector("[data-pdp-sheet-dismiss]");
  const askLink = root.querySelector("[data-pdp-ask-whatsapp]");

  const productName = root.dataset.pdpProductName || "";
  const whatsappNumber = root.dataset.pdpWhatsappNumber || "";

  // decision, taken here (no ruling pins the exact sentence): selection state
  // lives in this closure, not on the DOM, so a re-read of the DOM can never
  // disagree with what the page last announced.
  let selectedSize = null;

  function updateAskLink() {
    if (!askLink || !whatsappNumber) return;
    const suffix = selectedSize !== null ? ` (size ${selectedSize} mm)` : "";
    const text = `Hi Melony, I have a question about the ${productName}${suffix}.`;
    askLink.href = buildWhatsAppLink(whatsappNumber, text);
  }

  // --- size selector, single-select, no press-again-to-clear: a boot always
  // has exactly zero or one selected size, never a toggle-off (unlike the
  // derby hub's decision cards). ---------------------------------------------
  for (const button of sizeButtons) {
    button.addEventListener("click", () => {
      const mm = Number(button.dataset.pdpSize);
      selectedSize = mm;
      for (const b of sizeButtons) {
        const isSelected = b === button;
        b.classList.toggle("size--selected", isSelected);
        b.setAttribute("aria-pressed", String(isSelected));
      }
      if (availability) availability.textContent = STATES.leadTime(mm);
      updateAskLink();
      // Adjudication fix: the buy button is baked `disabled` (the sheet's
      // copy promises "your selected size is already in it", which is only
      // ever true once one has been picked) -- enable it the moment the
      // first size is selected. No ruling pins this; it is a correctness
      // fix for a false-claim defect the size selector introduced.
      if (buyButton) buyButton.disabled = false;
    });
  }

  // --- services: running total, computed in cents, formatted with
  // moneyWhole -- never string-concatenated (build brief §5). ----------------
  function recomputeTotal() {
    if (!servicesFieldset || !totalAmount) return;
    const baseCents = Number(servicesFieldset.dataset.pdpBaseCents || "0");
    let sum = baseCents;
    for (const input of serviceInputs) {
      if (input.checked) sum += Number(input.dataset.priceCents || "0");
    }
    totalAmount.textContent = moneyWhole(sum);
  }

  for (const input of serviceInputs) {
    input.addEventListener("change", recomputeTotal);
  }

  // --- the demo buy sheet: a native <dialog>, which gives focus trapping,
  // Escape-to-close and inertness for free (site.css's own comment on
  // dialog.sheet). The CTA text is composed fresh on every open so a size
  // picked after the sheet was last opened is always reflected. -------------
  if (buyButton && sheet) {
    buyButton.addEventListener("click", () => {
      if (sheetCta && whatsappNumber) {
        const suffix = selectedSize !== null ? ` (size ${selectedSize} mm)` : "";
        const text = `Hi Melony, I'd like to order the ${productName}${suffix}.`;
        sheetCta.href = buildWhatsAppLink(whatsappNumber, text);
      }
      if (typeof sheet.showModal === "function") sheet.showModal();
    });
  }
  if (sheetDismiss && sheet) {
    sheetDismiss.addEventListener("click", () => sheet.close());
  }
  if (sheet) {
    // Fires on Escape too (native <dialog> behaviour), so this one listener
    // covers both ways of leaving the sheet -- focus returns to the control
    // that opened it, per the build brief §6.
    sheet.addEventListener("close", () => {
      if (buyButton) buyButton.focus();
    });
  }

  updateAskLink();
}

// ponytail: module scripts are deferred, so the DOM is parsed by the time
// this runs -- same guard shape as site.js's own bottom block, and for the
// same reason: it is what keeps `node scripts/gen-aura-sky-100.mjs` and
// `node scripts/gen-home.mjs` (which now imports instalments() from this
// file) working in plain Node, where `document` does not exist.
if (typeof document !== "undefined") {
  const root = document.querySelector("[data-pdp]");
  if (root) initPdp(root);
}
