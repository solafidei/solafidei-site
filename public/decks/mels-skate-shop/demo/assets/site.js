// site.js — shared behavioral library: stock predicate, stock-state strings, WhatsApp link builder,
// and (as of task 13) the derby hub's DOM wiring. Plain ES2020 module, no bundler, no dependency.
// The exports above the DOM-guarded block at the bottom stay pure — no DOM, no globals, no
// side effects on import — because scripts/gen-home.mjs and scripts/gen-roller-derby.mjs both
// import this file in plain Node at authoring time (build brief §2.3). Only the guarded block
// below touches `document`.

// Composed display strings. inStock and leadTime are still prefixed byte-identically by their
// draft-copy.json derby.stock label (inStockLabel / leadTimeLabel). soldOut is now BYTE-IDENTICAL
// (not merely prefixed) to derby.stock.soldOutLabel — decision #555: "Sold out · notify me" named
// a notify-me service Mel does not offer (manifest facts notify-me-adhoc / no-waitlist both say so
// in writing), so the correction is at the source, not a page-local fork. Callers that want the
// honest handoff render derby.stock.soldOutHandoff / soldOutNote beside this string themselves —
// see scripts/gen-roller-derby.mjs. Separator is U+00B7 (in the font subset).
export const STATES = {
  inStock: 'In stock · ships in 1-3 days',
  leadTime: (weeks) => `Imported to order · approx. ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`,
  soldOut: 'Sold out',
};

// True only when both flags agree the product can actually be bought. Never trust the sampled
// is_in_stock boolean alone as a source of truth (spec section 2.3's trap).
export function isBuyable(p) {
  return p.is_purchasable === true && p.is_in_stock === true;
}

// Reads is_purchasable / is_in_stock / stock_availability.text — never the sampled boolean alone.
export function stockState(p) {
  if (isBuyable(p)) return STATES.inStock;

  // The store's own text corroborates and settles sold-out; it wins over a caller-supplied
  // lead time, so a SKU the store already marked "Out of stock" never reads as "on its way".
  const text = p.stock_availability && p.stock_availability.text;
  if (text === 'Out of stock') return STATES.soldOut;

  // ponytail: the Store API exposes no lead-time signal anywhere in products.json — every
  // out-of-stock SKU in the fixture carries plain "Out of stock" text, never a backorder or
  // week count (decision #511). So the lead-time string is reachable only when the caller
  // supplies an explicit leadTimeWeeks; site.js never manufactures one from the booleans. If
  // Mel's store ever starts exposing a backorder/lead-time text, that is where it plugs in.
  if (typeof p.leadTimeWeeks === 'number') return STATES.leadTime(p.leadTimeWeeks);

  return STATES.soldOut;
}

// Builds a https://wa.me/<digits>?text=<encoded> link. Accepts either contact.json phone form
// ("+27 82 370 6771" or "27823706771") by reducing to digits. Omits ?text= when text is absent
// or empty. Throws on a number with no digits — wa.me/mailto/tel links are exempt from the
// outbound-link fetch check (spec section 7 group 3), so a malformed number would otherwise ship as a
// silent dead link on a pitch demo.
export function buildWhatsAppLink(number, text) {
  const digits = String(number).replace(/\D/g, '');
  if (!digits) throw new Error('buildWhatsAppLink: number has no digits');
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// --- DOM wiring (task 13, decision #556) ------------------------------------
// The derby hub's "In stock only" toggle + five mutually-exclusive decision
// cards. This is the only impure export in the file, and it stays inert on
// import -- see the DOM guard at the bottom of the file and gate G2.
//
// root is the single element carrying [data-derby-filters]. It contains the
// fieldset (the toggle button + five card buttons, OUTSIDE the grid -- build
// brief §6.1/assertion K, so pressing a control never hides itself or steals
// focus into a hidden subtree), the aria-live result-count region, and the
// <ul> grid whose <li> cards carry data-derby-set="<key>" and
// data-derby-buyable="true"|"false".
export function initDerbyFilters(root) {
  const cardButtons = Array.from(root.querySelectorAll('[data-derby-card]'));
  const toggleButton = root.querySelector('[data-derby-toggle]');
  const liveRegion = root.querySelector('[data-derby-count]');
  // #569. Optional on purpose: a later page that reuses this wiring without an
  // empty-state note must not throw. As it turned out, T16's Size Finder does
  // NOT reuse this wiring at all -- it never carries [data-derby-filters], so
  // initDerbyFilters() is never called on it in the first place (see the
  // guard at the bottom of this file); it ships its own initFinder() in
  // finder.js instead. This stays optional for whatever T17's Book a fitting
  // turns out to need, which is still open.
  const emptyState = root.querySelector('[data-derby-empty]');
  const cards = Array.from(root.querySelectorAll('[data-derby-set]'));
  if (!toggleButton || cards.length === 0) return;

  // decision #561: single-select, press-again-to-clear; no "All" control.
  let activeCard = null;
  // Mirrors the button's baked aria-pressed rather than a hard-coded `true`,
  // so the generator's authored default stays the single source of truth.
  let toggleOn = toggleButton.getAttribute('aria-pressed') === 'true';

  // Literal copy of draft-copy.json's derby.filters.resultCountTemplate.
  // site.js has no runtime fetch of the demo's fixtures (spec section 9 --
  // no build step, no third-party script, and a fetch would race the verify
  // spine's load-event groups exactly as decision #545 rejected for Home),
  // so the template string is inlined here, not read from JSON at runtime.
  const TEMPLATE = 'Showing {shown} of {total}';

  // decision #560: {total} is the size of the CURRENT DECISION-CARD SUBSET,
  // ignoring the stock toggle; {shown} is how many of those are actually
  // visible once the toggle is applied too.
  function apply(announce) {
    let shown = 0;
    let total = 0;
    for (const card of cards) {
      const belongsToActive = activeCard === null || card.dataset.derbySet === activeCard;
      if (belongsToActive) total += 1;
      const buyableOk = !toggleOn || card.dataset.derbyBuyable === 'true';
      const visible = belongsToActive && buyableOk;
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    // decision #569: the authored empty-state copy, shown exactly when the
    // current filter combination leaves nothing on screen. Recomputed
    // unconditionally for the same reason the cards' `hidden` is -- what is
    // VISIBLE must never depend on whether this call is allowed to announce.
    // The generator bakes this element's text and its initial `hidden` from
    // draft-copy.json, so there is no second copy of the string here.
    if (emptyState) emptyState.hidden = shown !== 0;

    // Only the live region's TEXT is conditional on `announce`. `hidden` is
    // always recomputed above, so a card's visibility never depends on
    // whether this call is allowed to announce.
    if (announce && liveRegion) {
      liveRegion.textContent = TEMPLATE.replace('{shown}', String(shown)).replace('{total}', String(total));
    }
  }

  for (const button of cardButtons) {
    button.addEventListener('click', () => {
      const key = button.dataset.derbyCard;
      activeCard = activeCard === key ? null : key; // press-again-to-clear
      for (const b of cardButtons) {
        b.setAttribute('aria-pressed', b.dataset.derbyCard === activeCard ? 'true' : 'false');
      }
      apply(true);
    });
  }

  toggleButton.addEventListener('click', () => {
    toggleOn = !toggleOn;
    toggleButton.setAttribute('aria-pressed', String(toggleOn));
    apply(true);
  });

  // Deliberately NO apply(...) call here on init. scripts/gen-roller-derby.mjs
  // already bakes the toggle-on / no-card-active state into each card's
  // `hidden` attribute at authoring time, so the DOM is already correct
  // before this module runs. Calling apply() here would be redundant at
  // best and, worse, would write into the live region before any real user
  // interaction -- plan AC2 requires it empty on first paint.
}

// ponytail: module scripts are deferred, so the DOM is parsed by the time
// this runs. The guard is what keeps `node scripts/gen-home.mjs` and
// `node scripts/gen-roller-derby.mjs` working -- they import this file in
// plain Node, where `document` does not exist. The `if (root)` half matters
// too: T16's Size Finder already exercises exactly this path -- its
// finder.js imports buildWhatsAppLink from this file, so the browser loads
// site.js as a module dependency on a page that carries no
// [data-derby-filters] at all, and the selector below correctly finds
// nothing. T17's Book a fitting is expected to load it the same way for the
// floating WhatsApp button.
if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-derby-filters]');
  if (root) initDerbyFilters(root);
}
