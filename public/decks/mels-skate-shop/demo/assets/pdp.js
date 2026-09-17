// public/decks/mels-skate-shop/demo/assets/pdp.js — task 14 (issue #32),
// ruling #573.
//
// The canonical instalments() and the two money formatters, extracted here
// so a fourth caller (this generator, gen-aura-sky-100.mjs) does not paste a
// fifth copy. gen-home.mjs's own instalments()/moneyWhole()/moneyCents()
// copy is NOT deleted by this task -- that is T15's job when it wires spine
// group 6 (ruling #573 is singular: T15 deletes gen-home.mjs's copy).
// gen-roller-derby.mjs is unaffected -- it has no instalments() copy at
// all, and no ruling touches its own moneyWhole()/moneyCents(), which feed
// its unrelated money() helper (#563). This module has no DOM access and
// does no DOM wiring: PRODUCT.md's rule that new DOM wiring lands in
// site.js, "not a new module", is about DOM wiring, and these three
// functions are pure maths.
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
