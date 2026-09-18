// public/decks/mels-skate-shop/demo/assets/booking.js — task 17 (issue #35),
// rulings #607/#608/#610/#613/#617.
//
// Two exports, same shape as finder.js's findSize()/whichSky() + initFinder()
// and pdp.js's instalments()/moneyCents() + initPdp(): composeBookingMessage()
// is PURE -- no DOM, no globals, no network -- and initBooking(root) is the
// page's DOM wiring, guarded behind `typeof document !== "undefined"` at the
// very bottom of this file, exactly like site.js/finder.js/pdp.js's own tail
// blocks (build brief §2.3's sharpest trap: a module-scope `document` touch
// here would kill every group in the verify spine, not just this page's).
//
// A NEW module, not site.js (ruling #613) -- plan.md's "Files likely
// touched" line predates T14/T16 and site.js's own stale tail comment (fixed
// this task) predicted this wrongly.
//
// buildWhatsAppLink and hasValue are IMPORTED from site.js, never
// reimplemented -- a second wa.me builder or a second blank-value guard
// would be exactly the duplicate-source defect draft-copy.json's
// `_meta.refConvention` forbids (hasValue was itself promoted out of
// finder.js by this same task, for the identical reason).
import { buildWhatsAppLink, hasValue } from "./site.js";

// Ruling #610: the day control offers ONLY these five values -- Wed through
// Sun, nothing else -- which is what structurally discharges degenerate
// case 13 (a past date, or a Monday/Tuesday the shop is shut on) rather than
// a disclaimer. scripts/gen-book-a-fitting.mjs renders one <option> per
// entry, in this order, after a blank placeholder option (value=""), so the
// DOM can never submit a day this array does not contain. Exported so the
// generator and this module share one list instead of two hand-typed
// copies.
export const BOOKING_DAYS = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// composeBookingMessage(fields) -> string. Ruling #617's exact template:
// four OPTIONAL whole sentences, joined by a single space. Never a filled
// template with a blank left in it -- each fact is either a complete
// sentence or it is entirely absent, so a dangling "on"/"at"/"for" is
// impossible by construction, not merely tested for (build brief §5,
// structural property 1).
//
// Ruling #607: emptiness is String(v).trim() !== "", tested BEFORE any
// coercion -- fields.type/day/time/name/notes may arrive as undefined, null,
// or a value carrying only whitespace (an all-space name, a textarea left
// as "  "), and all of those must compose byte-identically to every field
// being absent outright (build brief §8, case 2). The duration and the
// price NEVER enter this function's inputs at all -- there is no parameter
// for either -- so §5.1's "duration/price never enter the message" rule
// cannot be violated by a caller forgetting to omit them.
export function composeBookingMessage(fields) {
  const f = fields || {};
  const type = String(f.type ?? "").trim();
  const day = String(f.day ?? "").trim();
  const time = String(f.time ?? "").trim();
  const name = String(f.name ?? "").trim();
  const notes = String(f.notes ?? "").trim();

  const sentences = [];

  // S1 -- always exactly one real-intent sentence. "the {type}", not
  // "a {type}", per §5's structural property 2: dodges the a/an agreement
  // problem on "Ice boot fitting" without a second branch.
  sentences.push(
    type ? `Hi Melony, I'd like to book the ${type}.` : `Hi Melony, I'd like to book a fitting.`
  );

  // S2 -- present only when day and/or time is given; absent entirely when
  // neither is (never an empty-string placeholder, never a dangling
  // preposition).
  if (day && time) {
    sentences.push(`${day} around ${time} would suit me.`);
  } else if (day) {
    sentences.push(`${day} would suit me.`);
  } else if (time) {
    sentences.push(`Around ${time} would suit me.`);
  }

  // S3
  if (name) sentences.push(`My name is ${name}.`);

  // S4 -- the sender's own words: trimmed, verbatim, no punctuation added.
  if (notes) sentences.push(notes);

  return sentences.join(" ");
}

// initBooking(root) -- guarded DOM wiring, returns early when its expected
// controls are absent (same contract as initDerbyFilters()/initFinder()).
// No <form> element exists anywhere in this demo (build brief §4.1,
// measured precedent on the PDP and the finder, both a bare <fieldset>) --
// this page follows the same shape, so there is no submit event, no Enter-
// navigates trap, and nothing to preventDefault().
export function initBooking(root) {
  if (!root) return;

  const whatsappNumber = root.dataset.bookingWhatsappNumber || "";
  const typeSelect = root.querySelector("[data-booking-type]");
  const daySelect = root.querySelector("[data-booking-day]");
  const timeInput = root.querySelector("[data-booking-time]");
  const nameInput = root.querySelector("[data-booking-name]");
  const notesInput = root.querySelector("[data-booking-notes]");
  const submitCta = root.querySelector("[data-booking-submit]");

  if (!typeSelect || !daySelect || !timeInput || !nameInput || !notesInput || !submitCta) return;

  const controls = [typeSelect, daySelect, timeInput, nameInput, notesInput];

  // hasValue() (imported above, promoted from finder.js) gates every field
  // the same way finder.js gates mmInput/skyKgInput: a whitespace-only
  // control reads as absent, resolved to "" BEFORE composeBookingMessage()
  // ever sees it, never handed to it raw (ruling #607 -- emptiness checked
  // before any coercion). composeBookingMessage() also trims internally, so
  // this is belt-and-braces on the same rule rather than a second, possibly
  // drifting definition of "empty" -- exactly what negative control (c)
  // (build brief §9.1/§13.4) reverts to prove the guard is load-bearing.
  function currentFields() {
    return {
      type: hasValue(typeSelect) ? typeSelect.value : "",
      day: hasValue(daySelect) ? daySelect.value : "",
      time: hasValue(timeInput) ? timeInput.value : "",
      name: hasValue(nameInput) ? nameInput.value : "",
      notes: hasValue(notesInput) ? notesInput.value : "",
    };
  }

  // The href is ALWAYS a valid wa.me URL, recomposed from the CURRENT DOM
  // state on every call -- never appended to, never cached (build brief §8,
  // case 15: submitted twice must not double the message). Case 17: this
  // runs once, synchronously, before any listener fires, so the pre-
  // interaction href already carries the case-1 empty-fields message.
  function refresh() {
    const message = composeBookingMessage(currentFields());
    submitCta.href = buildWhatsAppLink(whatsappNumber, message);
  }

  for (const el of controls) {
    el.addEventListener("input", refresh);
    el.addEventListener("change", refresh);
  }

  refresh();
}

// ponytail: module scripts are deferred, so the DOM is parsed by the time
// this runs -- same guard shape as site.js's/finder.js's/pdp.js's own
// bottom blocks, and for the same reason: it is what keeps the verify
// spine's plain-Node `import { composeBookingMessage } from "./booking.js"`
// working, where `document` does not exist, and what keeps
// scripts/gen-book-a-fitting.mjs's own import of this file working --
// that generator imports composeBookingMessage and BOOKING_DAYS at its
// line 30 TODAY, in Node, and its comment there calls that import "part of
// the purity proof". (T17 rework, M5: this comment previously said the
// generator "does not" import it, which was false the moment it was typed
// -- two files in one commit contradicting each other about the same fact.)
if (typeof document !== "undefined") {
  const root = document.querySelector("[data-booking]");
  if (root) initBooking(root);
}
