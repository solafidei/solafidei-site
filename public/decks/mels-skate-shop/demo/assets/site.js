// site.js — shared behavioral library: stock predicate, stock-state strings, WhatsApp link builder.
// Plain ES2020 module, no bundler, no dependency. Pure functions only — no DOM, no globals.
// (The DOM wiring — in-stock toggle, floating WhatsApp button — lands in later tasks; see spec section 9.)

// Composed display strings. Each is prefixed byte-identically by its draft-copy.json derby.stock
// label (inStockLabel / leadTimeLabel / soldOutLabel) so a future consolidation is a substring
// check, not a rewrite. Separator is U+00B7 (in the font subset).
export const STATES = {
  inStock: 'In stock · ships in 1-3 days',
  leadTime: (weeks) => `Imported to order · approx. ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`,
  soldOut: 'Sold out · notify me',
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
