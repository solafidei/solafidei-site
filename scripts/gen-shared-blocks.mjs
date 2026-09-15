#!/usr/bin/env node
// scripts/gen-shared-blocks.mjs — task 8 (issue #26), decision log #516-#519.
//
// One-off, RE-RUNNABLE, AUTHORING-TIME script. Never invoked at runtime — the
// demo still ships with no build step. Reads the two source fragments under
// demo/.source/ plus the demo's own fixtures, interpolates every value
// (nothing hard-coded — see the SOURCE map in buildHeader/buildContact below),
// and stamps the identical bytes between the `<!-- shared:header -->` and
// `<!-- shared:contact -->` marker comments on all five demo pages.
//
// From task 8 forward this is the ONLY way header/contact markup is edited —
// at minimum task 19 (the header logo's width/height) edits a .source
// fragment and re-runs this rather than hand-editing the five pages.
//
// Usage: node scripts/gen-shared-blocks.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO = join(__dirname, "..", "public", "decks", "mels-skate-shop", "demo");
const SRC = join(DEMO, ".source");
const DATA = join(DEMO, "data");

const PAGES = ["index", "roller-derby", "aura-sky-100", "size-finder", "book-a-fitting"];

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), "utf8"));
}

// Trust boundary: every value below crosses from a JSON fixture into either
// HTML text or a double-quoted HTML attribute. `&`, `<`, `>` and `"` are the
// four characters that change meaning in either context, so escape exactly
// those. The ASCII apostrophe ("Mel's") and the middle dot (·) are plain
// characters in both contexts and need no escaping — do not "helpfully"
// convert them to entities or curly forms.
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Fills a .source/*.html template's {{TOKEN}} placeholders, then trims
// trailing whitespace per line and drops lines left blank by an empty
// conditional token (e.g. {{FACEBOOK_ITEM}} when the Facebook gate is
// closed) — deterministic, so the output is byte-identical every run.
function fill(template, tokens) {
  const replaced = template.replace(/\{\{(\w+)\}\}/g, (whole, key) => {
    if (!(key in tokens)) {
      throw new Error(`gen-shared-blocks: template references unknown token {{${key}}}`);
    }
    return tokens[key];
  });
  return replaced
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .filter((line) => line.trim() !== "")
    .join("\n");
}

function spliceBetweenMarkers(html, openMarker, closeMarker, inner, pageLabel) {
  const openIdx = html.indexOf(openMarker);
  const closeIdx = html.indexOf(closeMarker);
  if (openIdx === -1 || closeIdx === -1 || closeIdx < openIdx) {
    throw new Error(
      `gen-shared-blocks: ${pageLabel} is missing a ${openMarker} ... ${closeMarker} marker pair`
    );
  }
  // Splice from the END of the opening marker to the START of the closing
  // marker (string-index based, not line based — a hand-edit that lands on
  // the marker's own line, inside or outside the markers, is still caught).
  const before = html.slice(0, openIdx + openMarker.length);
  const after = html.slice(closeIdx);
  return `${before}\n${inner}\n  ${after}`;
}

function buildHeader(contact, copy, alt, manifest) {
  const template = readFileSync(join(SRC, "header.html"), "utf8");
  // manifest.images[0] is the logo (spec §5, task instructions); its `file`
  // drives both the <img> src and the img-alt.json lookup, so the filename
  // is never typed twice.
  const logoFile = manifest.images[0].file;
  return fill(template, {
    SKIP_LINK: esc(copy.header.skipLink),
    // The four internal nav hrefs are the demo's fixed clean-URL routes
    // (spec §5 project structure + next.config.ts rewrites) — there is no
    // fixture for internal site routing, so these are the generator's own
    // structural constants, not fixture content. Root-absolute per the
    // trailing-slash trap on /decks/mels-skate-shop/demo.
    HOME_HREF: "/decks/mels-skate-shop/demo",
    LOGO_SRC: `/decks/mels-skate-shop/img/${logoFile}`,
    LOGO_ALT: esc(alt[logoFile]),
    DERBY_HREF: "/decks/mels-skate-shop/demo/roller-derby",
    NAV_DERBY: esc(copy.header.navDerby),
    FINDER_HREF: "/decks/mels-skate-shop/demo/size-finder",
    NAV_FINDER: esc(copy.header.navFinder),
    BOOKING_HREF: "/decks/mels-skate-shop/demo/book-a-fitting",
    NAV_BOOKING: esc(copy.header.navBooking),
    WHATSAPP_HREF: esc(contact.whatsapp.href),
    NAV_WHATSAPP: esc(copy.header.navWhatsapp),
  });
}

function buildContact(contact, copy, manifest) {
  const template = readFileSync(join(SRC, "contact.html"), "utf8");

  // The Facebook link renders ONLY when manifest.links[] says manual-ok —
  // evaluated here, at generate time, against the fixtures on disk. Not a
  // runtime check, not a CSS trick: if the status ever stops being
  // manual-ok, re-running this generator drops the link from all five
  // pages on its own.
  const facebookManifestEntry = manifest.links[8];
  const facebookSocial = contact.socials[0];
  if (facebookManifestEntry?.status !== facebookSocial?.status) {
    throw new Error(
      `gen-shared-blocks: manifest.links[8].status (${facebookManifestEntry?.status}) ` +
        `disagrees with contact.json socials[0].status (${facebookSocial?.status}) — ` +
        `refusing to guess which one is right`
    );
  }
  const facebookGateOpen = facebookManifestEntry.status === "manual-ok";
  const facebookItem = facebookGateOpen
    ? `<li class="contact__item"><span class="contact__label">${esc(copy.contact.facebookLabel)}</span><a href="${esc(facebookSocial.href)}">${esc(copy.contact.facebookLabel)}</a></li>`
    : "";

  return fill(template, {
    HEADING: esc(copy.contact.heading),
    PHONE_LABEL: esc(copy.contact.phoneLabel),
    PHONE_HREF: esc(contact.phone.href),
    PHONE_TEXT: esc(contact.phone.label),
    WHATSAPP_LABEL: esc(copy.contact.whatsappLabel),
    WHATSAPP_HREF: esc(contact.whatsapp.href),
    WHATSAPP_TEXT: esc(contact.whatsapp.label),
    EMAIL_LABEL: esc(copy.contact.emailLabel),
    EMAIL_HREF: esc(contact.email.href),
    EMAIL_TEXT: esc(contact.email.label),
    HOURS_LABEL: esc(copy.contact.hoursLabel),
    HOURS_TEXT: esc(contact.hours.label),
    HOURS_DETAIL: esc(contact.hours.detail),
    PLACE_NOTE: esc(copy.contact.placeNote),
    FACEBOOK_ITEM: facebookItem,
    COURIER_LABEL: esc(copy.contact.courierLabel),
    COURIER_LINE: esc(contact.courier.line),
    LIVE_SITE_LABEL: esc(copy.contact.liveSiteLabel),
    LIVE_SITE_HREF: esc(contact.liveSite.href),
    LIVE_SITE_TEXT: esc(contact.liveSite.label),
    PREFERRED_NOTE: esc(copy.contact.preferredNote),
    IMAGE_CREDIT: esc(copy.imageCredit),
    FAB_HREF: esc(contact.whatsapp.href),
    FAB_LABEL: esc(copy.whatsapp.fabLabel),
    FAB_TEXT: esc(copy.whatsapp.defaultLabel),
  });
}

function run() {
  const contact = readJson("contact.json");
  const copy = readJson("draft-copy.json").shared;
  const alt = readJson("img-alt.json");
  const manifest = readJson("manifest.json");

  const headerBlock = buildHeader(contact, copy, alt, manifest);
  const contactBlock = buildContact(contact, copy, manifest);

  for (const page of PAGES) {
    const filePath = join(DEMO, `${page}.html`);
    let html = readFileSync(filePath, "utf8");

    // Decision #519(i): the generator is the enforcement point that keeps
    // T12-T17 from silently dropping the skip-link's landmark when they
    // rewrite the page bodies.
    if (!html.includes('id="main"')) {
      throw new Error(
        `gen-shared-blocks: ${page}.html has no id="main" landmark — the skip link ` +
          `(decision #519) would point at nothing. Add <main id="main"> and re-run.`
      );
    }

    html = spliceBetweenMarkers(html, "<!-- shared:header -->", "<!-- /shared:header -->", headerBlock, `${page}.html`);
    html = spliceBetweenMarkers(html, "<!-- shared:contact -->", "<!-- /shared:contact -->", contactBlock, `${page}.html`);

    writeFileSync(filePath, html);
  }

  console.log(`gen-shared-blocks: stamped header + contact blocks on ${PAGES.length} pages`);
}

try {
  run();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
