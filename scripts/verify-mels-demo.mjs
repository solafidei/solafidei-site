// Throwaway verification harness for the Mel's Skate Shop demo build
// (docs/specs/mels-skate-shop-pitch.md §7 — eleven assertion groups).
// Playwright chromium against the dev server, per the verify-process-pin.mjs
// convention. Groups are keyed 1-11 and each is owned by the task that
// implements it; unimplemented groups always print SKIPPED, never PASS.
//
// Usage:
//   node scripts/verify-mels-demo.mjs              # run every implemented group
//   node scripts/verify-mels-demo.mjs --only=1      # run just group 1
//   BASE_URL=http://localhost:4000 node scripts/verify-mels-demo.mjs
//   CHIPS_COMPLETE=1 node scripts/verify-mels-demo.mjs --only=11   # tighten group 11's
//     assertion B from subset to full set-equality against the manifest illustrative
//     set (default off; can only turn a PASS red, never the reverse) — the T17 gate.
import { chromium } from "playwright";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
// Group 6 (T15) tests the ACTUAL exported function against literals fixed by
// ruling #549/#580, independent of pdp.js's internals -- this is the same
// shape build brief gate §13.3 already runs standalone, not the "read the
// expected string out of the same map the page renders from" tautology
// warned against in §10: nothing here is DERIVED from pdp.js, it is compared
// against hard literals typed in this file.
import { instalments, moneyCents } from "../public/decks/mels-skate-shop/demo/assets/pdp.js";
// Group 5 (T16) does the identical thing against finder.js's two pure
// exports -- a top-level static import, exactly like the one above. If
// finder.js touched `document` at module scope this import would already
// have thrown, killing every group in this file (build brief §2.3's
// sharpest trap), so this line is itself part of trap 11's purity proof.
import { findSize, whichSky } from "../public/decks/mels-skate-shop/demo/assets/finder.js";
// Group 2 (task 17, rulings #607/#608/#610/#617) does the identical thing
// against booking.js's pure composeBookingMessage()/BOOKING_DAYS -- T17
// adjudication fix (blocker): before this fix, NOTHING in this file ever
// imported or called composeBookingMessage, so a perfect pure function the
// page never calls (or a broken one) passed every gate. If booking.js ever
// touched `document` at module scope this import would already have
// thrown, killing every group (build brief §2.3's trap), so this line is
// itself part of trap 11's purity proof, same as the two imports above.
import { composeBookingMessage, BOOKING_DAYS } from "../public/decks/mels-skate-shop/demo/assets/booking.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DECK = `${BASE}/decks/mels-skate-shop`;
const DEMO_DIR = join(__dirname, "..", "public", "decks", "mels-skate-shop", "demo");
const DEMO_PAGES = ["index", "roller-derby", "aura-sky-100", "size-finder", "book-a-fitting"];

// All six pages (ruling #523): the deck placeholder plus the five demo pages,
// at their clean URLs. Separate from DEMO_PAGES above (five, filenames, used
// by group 4 for disk reads) — the deck has no .html twin under demo/ and is
// not a demo page, but is in scope for groups 2, 8 and 9 (group 10 measures
// it too but only gates the five demo pages, ruling #524).
const SIX_PAGES = [
  { label: "deck", url: `${DECK}` },
  { label: "demo home", url: `${DECK}/demo` },
  { label: "roller-derby", url: `${DECK}/demo/roller-derby` },
  { label: "aura-sky-100", url: `${DECK}/demo/aura-sky-100` },
  { label: "size-finder", url: `${DECK}/demo/size-finder` },
  { label: "book-a-fitting", url: `${DECK}/demo/book-a-fitting` },
];

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? Number(onlyArg.slice("--only=".length)) : null;

// Shared "fresh context per page" iterator. Mandatory for group 10's cold
// load measurement (ruling #527 — a shared/warm page under-reports transfer
// by about 34x) and harmless for the others, so one helper that always opens a
// new context is simpler than one that sometimes does. Closes every context
// it opens, even on error.
async function forEachSixPages(browser, viewport, fn) {
  for (const target of SIX_PAGES) {
    const context = await browser.newContext(viewport ? { viewport } : {});
    const p = await context.newPage();
    try {
      await fn(p, target);
    } finally {
      await context.close();
    }
  }
}

// --- group 1 -----------------------------------------------------------
// Deck + all six demo clean URLs return 200 (rewrites work); the six
// underlying .html files also return 200 when hit directly (the .html
// twin). A failure names the offending URL.
async function groupCleanUrlsAndTwins(page) {
  const checks = [
    { url: `${DECK}`, label: "deck clean URL" },
    { url: `${DECK}/index.html`, label: "deck .html twin" },
    { url: `${DECK}/demo`, label: "demo home clean URL" },
    { url: `${DECK}/demo/index.html`, label: "demo home .html twin" },
    { url: `${DECK}/demo/roller-derby`, label: "roller-derby clean URL" },
    { url: `${DECK}/demo/roller-derby.html`, label: "roller-derby .html twin" },
    { url: `${DECK}/demo/aura-sky-100`, label: "aura-sky-100 clean URL" },
    { url: `${DECK}/demo/aura-sky-100.html`, label: "aura-sky-100 .html twin" },
    { url: `${DECK}/demo/size-finder`, label: "size-finder clean URL" },
    { url: `${DECK}/demo/size-finder.html`, label: "size-finder .html twin" },
    { url: `${DECK}/demo/book-a-fitting`, label: "book-a-fitting clean URL" },
    { url: `${DECK}/demo/book-a-fitting.html`, label: "book-a-fitting .html twin" },
  ];

  const failures = [];
  for (const { url, label } of checks) {
    let status = null;
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      status = response ? response.status() : null;
    } catch (err) {
      failures.push(`${label} (${url}) errored: ${err.message || err}`);
      continue;
    }
    if (status !== 200) {
      failures.push(`${label} (${url}) returned ${status ?? "no response"}`);
    }
  }

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: `${checks.length}/${checks.length} URLs returned 200` };
}

// --- group 4 -------------------------------------------------------------
// The <!-- shared:header --> and <!-- shared:contact --> blocks are
// byte-identical across the five demo pages (task 8). Byte-identity is a
// property of the files on disk, so this reads the five .html files with
// node:fs rather than driving the browser (the harness's `page` argument is
// accepted but unused, per its own contract).
//
// TRAP: extraction must be by STRING INDEX, not by line. The plan's negative
// control appends a character on the marker's own line, immediately after
// the opening marker — `sed -i 's/<!-- shared:header -->/<!-- shared:header
// -->X/'`. Extracting "the lines strictly between the two markers" leaves
// that X outside the compared region and the control passes vacuously.
// Extracting from the END of the opening marker's string index to the START
// of the closing marker's string index catches it.
function extractBetween(html, openMarker, closeMarker, pageLabel, blockLabel) {
  const openIdx = html.indexOf(openMarker);
  const closeIdx = html.indexOf(closeMarker);
  if (openIdx === -1 || closeIdx === -1 || closeIdx < openIdx) {
    throw new Error(`${pageLabel}: missing a ${blockLabel} marker pair`);
  }
  return html.slice(openIdx + openMarker.length, closeIdx);
}

function assertBlockIdentical(blockLabel, openMarker, closeMarker, contents) {
  const extracted = contents.map(({ page, html }) =>
    extractBetween(html, openMarker, closeMarker, `${page}.html`, blockLabel)
  );
  const [first, ...rest] = extracted;
  const mismatches = [];
  rest.forEach((value, i) => {
    if (value !== first) {
      mismatches.push(contents[i + 1].page);
    }
  });
  if (mismatches.length > 0) {
    return {
      pass: false,
      detail: `${blockLabel} differs on: ${mismatches.join(", ")} (compared against ${contents[0].page})`,
    };
  }
  return { pass: true };
}

async function groupSharedBlocksByteIdentical() {
  let contents;
  try {
    contents = DEMO_PAGES.map((page) => ({
      page,
      html: readFileSync(join(DEMO_DIR, `${page}.html`), "utf8"),
    }));
  } catch (err) {
    return { pass: false, detail: `could not read a demo page: ${err.message || err}` };
  }

  const header = assertBlockIdentical(
    "shared:header",
    "<!-- shared:header -->",
    "<!-- /shared:header -->",
    contents
  );
  if (!header.pass) return header;

  const contact = assertBlockIdentical(
    "shared:contact",
    "<!-- shared:contact -->",
    "<!-- /shared:contact -->",
    contents
  );
  if (!contact.pass) return contact;

  return {
    pass: true,
    detail: `shared:header and shared:contact both byte-identical across all ${DEMO_PAGES.length} pages`,
  };
}

// --- group 2 -------------------------------------------------------------
// Zero console errors, zero console warnings, zero failed requests (both
// network-level failures AND >=400 responses) on all six pages. Listeners
// attached BEFORE page.goto so nothing during initial load can slip past
// (the issue's own wording).
//
// Four channels, none of which subsumes the others (measured against a
// synthetic page carrying a 404 asset, a console.warn, a console.error and
// an uncaught throw):
//   - console         catches console.error/warn, and a 404'd asset also
//                      surfaces here as a bare "Failed to load resource:
//                      404" line with no URL in the text.
//   - pageerror        the ONLY channel that catches an uncaught JS
//                      exception; it never reaches console.
//   - response>=400    the ONLY channel that reliably names a 404'd asset's
//                      URL.
//   - requestfailed    network-level failures (DNS/abort/blocked). Does NOT
//                      fire on a 4xx/5xx, so it cannot replace the
//                      response>=400 check — a "zero failed requests" gate
//                      built only on this channel misses every 404.
// --- AC2 (task 17, ruling #611) --------------------------------------------
// Acceptance criterion 2 ("no form action / fetch / XHR / POST, and no new
// network request on click") folds into GROUP 2, not a new group 12 (#611 --
// a new group cascades into ~15 "all eleven groups" bullets across plan.md,
// the spec, todo.md and issue #36). Two halves, both required.
//
// (a) STATIC SCAN, over the built HTML of all five demo pages and every
// file in DEMO/assets/. The probe this brief warns against scoped its own
// proposed grep to assets/booking.js alone -- a file plan.md never names --
// which would scan a file that might not even exist while the real risk
// sits anywhere in assets/ or in the shipped HTML. This scan covers both.
//
// Matches CODE, never comment text (#599 class): finder.js:14 and :18 carry
// truthful comments that happen to contain the literal substring "fetch(",
// describing why the file does NOT call it. A grep that fails on that text
// is a defective grep, not a defective comment (#599) -- so every file is
// stripped of its comments (HTML `<!-- -->`, JS `/* */` and `//`) before
// any pattern below is tested, and the stripped text is what is scanned.
const AC2_PATTERNS = [
  { name: "<form", re: /<form\b/i },
  { name: "action=", re: /\baction\s*=/i },
  { name: 'method="post"', re: /\bmethod\s*=\s*["']post["']/i },
  { name: "fetch(", re: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", re: /\bXMLHttpRequest\b/ },
  { name: "navigator.sendBeacon", re: /\bnavigator\.sendBeacon\b/ },
  { name: "new WebSocket", re: /\bnew\s+WebSocket\b/ },
  { name: "EventSource", re: /\bEventSource\b/ },
];

// T17 adjudication fix (blocker, AC2 evasion): this used to be
//   `source.replace(/\/\*[\s\S]*?\*\//g, "")` (JS block comments) followed
//   by `source.replace(/\/\/.*$/gm, "")` (JS line comments) -- two plain
// regexes with ZERO string-literal awareness. Every wa.me URL literal in
// this codebase is written `https://wa.me/...`, so the line-comment regex
// truncated at the FIRST "//" on the line -- including the one inside that
// URL string -- silently discarding everything after it, real code
// included. PROVEN live: `const u = \`https://wa.me/x\`; fetch("/collect",
// { method: "post" });` stripped to `const u = \`https:` and AC2_PATTERNS
// matched 0 hits, a clean evasion of the static scan (distinct from, and
// not caught by, the `window['fetch']` evasion this task's own commit
// already tried and documented -- that one only survives because
// click-and-watch (part b) catches it; this one is invisible to BOTH
// halves whenever the beacon fires outside book-a-fitting's specific
// submit click).
//
// Fixed with a character-by-character walk that tracks single/double/
// template-quote state (with backslash-escape handling) so `//` or `/*`
// occurring INSIDE a string or template literal is never mistaken for the
// start of a comment -- comments are only recognised OUTSIDE any open
// quote. This does not attempt to parse `${...}` template interpolation as
// its own code region (no file under DEMO/assets/ nests a comment or a
// second string inside an interpolation today), which is a known, narrow
// limitation, not a claim of a full JS parser.
//
// T17 rework (M2): the walk now also recognises REGEX LITERALS, because
// without that it failed OPEN in exactly the shape the fix above closed.
// A regex containing a quote character -- `const re = /won't/;` -- flipped
// the walker into string state at the apostrophe; state then stayed open
// until the NEXT quote character in the file, which is typically the
// opening quote of an unrelated string literal, leaving the REST of that
// literal outside quote state. A `https://...` there then read as a line
// comment and everything after it on that line -- real code, a `fetch(`
// included -- was discarded unscanned. PROVEN before the fix: a file
// containing `const re = /won't/;` followed by
// `const u = 'https://wa.me/x'; fetch("/collect", { method: "post" });`
// stripped to exactly `const re = /won't/;\nconst u = 'https:` -- the
// `fetch(` discarded -- and scanned to 0 AC2 hits; after the fix the same
// source survives intact and scans to 1 hit (`fetch(`). Both numbers are
// measured, and AC2_EVASION_FIXTURES below re-measures them on every run.
// The previous comment claimed the walk handled interpolation and said
// nothing about regexes, so it told the next reader the scanner saw more
// than it did.
//
// A `/` starts a regex when the previous significant token cannot end an
// expression -- an operator, an opening bracket, or one of the keywords
// below. After an identifier, a number, a closing `)`/`]` or a string, `/`
// is division. This is the standard lexer heuristic, not a parser; the one
// known gap it shares with every such heuristic is the ASI case
// `return\n/re/`, which no file here writes.
const AC2_REGEX_PRECEDERS = new Set([
  "=", "(", ",", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^", "",
]);
const AC2_REGEX_KEYWORDS = new Set([
  "return", "typeof", "case", "in", "of", "do", "else", "void", "delete", "instanceof", "new", "yield", "await",
]);

function ac2StripJsComments(source) {
  let out = "";
  let i = 0;
  const n = source.length;
  let quote = null; // "'", '"', "`", or null when not inside a string
  // The last significant token emitted outside strings/comments: either a
  // single punctuation character or a whole identifier/keyword run.
  // Whitespace never changes it, which is what makes `return /re/` work.
  let prevTok = "";
  while (i < n) {
    const ch = source[i];
    if (quote) {
      out += ch;
      if (ch === "\\" && i + 1 < n) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      out += ch;
      prevTok = ch;
      i += 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i + 2);
      i = end === -1 ? n : end;
      continue;
    }
    if (ch === "/" && (AC2_REGEX_PRECEDERS.has(prevTok) || AC2_REGEX_KEYWORDS.has(prevTok))) {
      // Emit the literal whole (so an AC2 pattern written INSIDE a regex is
      // still scanned, never hidden by this branch) and skip the walker
      // past it so its contents can never open a phantom string or comment.
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const c = source[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "\n") break; // unterminated: bail rather than eat the file
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          j += 1;
          break;
        }
        j += 1;
      }
      out += source.slice(i, j);
      prevTok = "/regex/";
      i = j;
      continue;
    }
    out += ch;
    if (!/\s/.test(ch)) {
      prevTok = /[A-Za-z0-9_$]/.test(ch) && /[A-Za-z0-9_$]$/.test(prevTok) ? prevTok + ch : ch;
    }
    i += 1;
  }
  return out;
}

function ac2StripComments(source, kind) {
  if (kind === "html") {
    // HTML has only one comment syntax (<!-- -->) and no string-literal
    // ambiguity for "//" -- a URL's "//" inside markup text or an
    // attribute value is never itself comment syntax, so a plain regex is
    // correct here (unlike the JS case above).
    return source.replace(/<!--[\s\S]*?-->/g, "");
  }
  return ac2StripJsComments(source);
}

function ac2ScanSource(label, source, kind) {
  const code = ac2StripComments(source, kind);
  return AC2_PATTERNS.filter((p) => p.re.test(code)).map(
    (p) => `AC2(a): ${label} matched "${p.name}"`
  );
}

// Every .js file under DEMO/assets/ plus every built page. T17 rework (M8):
// a filed finding -- that `filesScanned` was printed but never asserted
// against anything -- was neither applied nor refuted last pass, it simply
// vanished. Without a floor the scan can cover ZERO files (a renamed
// directory, a changed extension, a readdirSync that returns nothing) and
// still print PASS with "0 file(s) scanned, 0 hits". The floor mirrors
// CTA_COUNT_FLOOR and HREF_COUNT_FLOOR: 5 built pages + 4 assets/*.js
// modules (site.js, pdp.js, finder.js, booking.js) == 9 today.
const AC2_FILES_FLOOR = 9;

// T17 rework (M2): the scan's own evadability, MEASURED on every run rather
// than asserted in prose. The header comment here used to say this function
// ran "against a deliberately evaded copy" -- it did not; nothing of the
// kind existed in the tree. These two fixtures are the two evasions that
// have actually been demonstrated against this scanner, each one a
// regression test for the fix that closed it. If a future edit to
// ac2StripJsComments reopens either, the scan reports it instead of
// silently passing a codebase it can no longer see into.
const AC2_EVASION_FIXTURES = [
  {
    name: "wa.me URL mistaken for a line comment (quote-awareness)",
    // Pre-quote-awareness this stripped to `const u = ` and scanned clean.
    source: 'const u = `https://wa.me/x`; fetch("/collect", { method: "post" });\n',
    expect: ["fetch("],
  },
  {
    name: "regex literal containing a quote flips the walker into string state",
    // Pre-regex-awareness this stripped to `const re = /won't/;\nconst u = 'https:`
    // and scanned clean -- the fetch( discarded with the rest of the line.
    source: "const re = /won't/;\nconst u = 'https://wa.me/x'; fetch(\"/collect\", { method: \"post\" });\n",
    expect: ["fetch("],
  },
];

function ac2SelfEvasionFailures() {
  const failures = [];
  for (const f of AC2_EVASION_FIXTURES) {
    const hits = ac2ScanSource("evasion-fixture", f.source, "js").map((h) =>
      (/matched "([^"]+)"/.exec(h) || [, h])[1]
    );
    for (const want of f.expect) {
      if (!hits.includes(want)) {
        failures.push(
          `AC2(a) SELF-EVASION: fixture "${f.name}" should still be caught by "${want}", ` +
            `but the scan found [${hits.join(", ")}] -- the comment stripper has regressed and ` +
            `real code is being discarded unscanned`
        );
      }
    }
  }
  return failures;
}

// Run against the CURRENT tree, and against the deliberately evaded copies
// above, so this scan's own evadability is on record rather than assumed
// (build brief §9a: "try to evade your own scan and report what you found").
function ac2StaticScan() {
  const failures = [];
  let filesScanned = 0;

  for (const page of DEMO_PAGES) {
    const source = readFileSync(join(DEMO_DIR, `${page}.html`), "utf8");
    filesScanned += 1;
    failures.push(...ac2ScanSource(`${page}.html`, source, "html"));
  }

  const assetsDir = join(DEMO_DIR, "assets");
  for (const name of readdirSync(assetsDir)) {
    if (!name.endsWith(".js")) continue;
    const source = readFileSync(join(assetsDir, name), "utf8");
    filesScanned += 1;
    failures.push(...ac2ScanSource(`assets/${name}`, source, "js"));
  }

  if (filesScanned < AC2_FILES_FLOOR) {
    failures.push(
      `AC2(a): only ${filesScanned} file(s) scanned, expected >= ${AC2_FILES_FLOOR} -- ` +
        `the scan is covering less of the tree than it claims to`
    );
  }

  failures.push(...ac2SelfEvasionFailures());

  return { failures, filesScanned };
}

// (b) CLICK-AND-WATCH, on book-a-fitting only. Group 2's existing `page.on`
// listeners (below, in the per-page loop) are armed BEFORE goto and never
// re-armed around a click, so a "zero new requests on click" assertion
// inherited from them would observe nothing and pass always -- this is its
// own fresh context, its own page, and the request listener is armed AFTER
// navigation completes, specifically so the click is the first thing it can
// possibly observe. The submit CTA is `target="_blank"` (a real link, not a
// form post): clicking it opens a POPUP that navigates to wa.me on a
// SEPARATE Page object, so that expected external navigation is never
// counted as "a new request" here by construction -- this listens only on
// the original page, closes the popup immediately so it cannot leak or hang
// the harness, and asserts the original page itself made zero new requests.
const AC2_SUBMIT_SELECTOR = "[data-booking-submit]";

// T17 rework (M2): the AC2 lens's SECOND recommendation, dropped without
// comment last pass. Click-and-watch below covers ONE page and ONE click.
// AC2's claim is that NOTHING is posted ANYWHERE -- a beacon that fires on
// load, on scroll, on blur, or on any of the other five pages is outside
// what a single post-click window can see. These resource types are the
// ones only a script can produce; a page built the way this demo is built
// (documents, stylesheets, scripts, fonts, images) emits none of them, so
// the assertion is "zero of these, on every page, for the whole page
// lifecycle" and it is armed BEFORE goto in group 2's own per-page loop.
const AC2_SCRIPTED_RESOURCE_TYPES = new Set(["fetch", "xhr", "websocket", "eventsource", "manifest"]);
// Every page necessarily fetches at least its own document, so a listener
// that observes nothing at all is broken rather than clean.
const AC2_LIFECYCLE_REQUESTS_FLOOR = 6;

async function ac2ClickAndWatch(browser) {
  const context = await browser.newContext();
  const p = await context.newPage();
  try {
    await p.goto(`${DECK}/demo/book-a-fitting`, { waitUntil: "networkidle" });

    const newRequests = [];
    p.on("request", (req) => newRequests.push(req.url()));

    const cta = p.locator(AC2_SUBMIT_SELECTOR);
    if ((await cta.count()) === 0) {
      return { pass: false, detail: `AC2(b): ${AC2_SUBMIT_SELECTOR} not found on book-a-fitting` };
    }

    const [popup] = await Promise.all([
      p.waitForEvent("popup", { timeout: 5000 }).catch(() => null),
      cta.click(),
    ]);
    if (popup) await popup.close().catch(() => {});

    // Give any stray same-page request a moment to actually fire before
    // asserting there were none. T17 adjudication fix (minor): widened from
    // 500ms -- a deliberately delayed beacon (setTimeout(fetch, 600)) would
    // fire after a 500ms window and this context's teardown, and never be
    // observed. 1500ms is still well inside the harness's own timeouts and
    // catches any handler that fires within one and a half seconds of the
    // click, without making the negative control meaningfully slower.
    await p.waitForTimeout(1500);

    if (newRequests.length > 0) {
      return {
        pass: false,
        detail: `AC2(b): ${newRequests.length} new request(s) fired on the page itself after clicking the submit CTA: ${newRequests.join(", ")}`,
      };
    }
    return {
      pass: true,
      detail: "AC2(b): request listener armed post-navigation, 0 new requests after clicking the submit CTA",
    };
  } finally {
    await context.close();
  }
}

// --- BOOKING PURITY (task 17, rulings #607/#608/#610/#617) ----------------
// Folds into group 2, not a new group 12 (#611). T17 adjudication fix
// (blocker): none of this existed in the committed tree before this fix --
// composeBookingMessage was never imported or driven by the spine, so a
// perfect pure function the page never calls, or a broken one, passed every
// group. THE SHARPEST TRAP: every expected string below is a LITERAL typed
// by hand here, never composed with composeBookingMessage's own template
// logic -- if that template changes, this must FAIL, not follow it.
const BOOKING_CASES_FLOOR = 17;
const BOOKING_LITERAL_CASES = [
  { n: "1 nothing filled", fields: {}, expect: "Hi Melony, I'd like to book a fitting." },
  {
    n: "2 every field whitespace-only",
    fields: { type: "   ", day: " ", time: "\t", name: " ", notes: "   " },
    expect: "Hi Melony, I'd like to book a fitting.",
  },
  { n: "3 only the name", fields: { name: "Sol" }, expect: "Hi Melony, I'd like to book a fitting. My name is Sol." },
  {
    n: "4 only the day",
    fields: { day: "Wednesday" },
    expect: "Hi Melony, I'd like to book a fitting. Wednesday would suit me.",
  },
  {
    n: "5 a day with no time",
    fields: { day: "Friday" },
    expect: "Hi Melony, I'd like to book a fitting. Friday would suit me.",
  },
  {
    n: "6 a time with no day",
    fields: { time: "14:00" },
    expect: "Hi Melony, I'd like to book a fitting. Around 14:00 would suit me.",
  },
  { n: "7 type left on the placeholder", fields: { type: "" }, expect: "Hi Melony, I'd like to book a fitting." },
  {
    n: "8 type chosen, nothing else",
    fields: { type: "Ice boot fitting + heat-mould" },
    expect: "Hi Melony, I'd like to book the Ice boot fitting + heat-mould.",
  },
  {
    n: "9 name with & # + = ? %",
    fields: { name: "Ben & Jo #1 A+B=?%" },
    expect: "Hi Melony, I'd like to book a fitting. My name is Ben & Jo #1 A+B=?%.",
  },
  {
    n: "10 unicode/emoji/RTL name",
    fields: { name: "🛼 עברית Zoë" },
    expect: "Hi Melony, I'd like to book a fitting. My name is 🛼 עברית Zoë.",
  },
  {
    n: "11 very long name (220 chars)",
    fields: { name: "A".repeat(220) },
    expect: `Hi Melony, I'd like to book a fitting. My name is ${"A".repeat(220)}.`,
  },
  {
    n: "12 name is a URL/phone number",
    fields: { name: "https://evil.example.com/+27821234567" },
    expect: "Hi Melony, I'd like to book a fitting. My name is https://evil.example.com/+27821234567.",
  },
  {
    n: "14 notes only",
    fields: { notes: "The brand I want is Riedell" },
    expect: "Hi Melony, I'd like to book a fitting. The brand I want is Riedell",
  },
  {
    n: "bonus: every field filled at once",
    fields: { type: "Quad fitting", day: "Saturday", time: "10:30", name: "Zoë", notes: "First timer." },
    expect: "Hi Melony, I'd like to book the Quad fitting. Saturday around 10:30 would suit me. My name is Zoë. First timer.",
  },
];

function bookingPurityChecks() {
  const failures = [];
  let asserted = 0;

  for (const c of BOOKING_LITERAL_CASES) {
    const got = composeBookingMessage(c.fields);
    if (got !== c.expect) {
      failures.push(
        `composeBookingMessage case "${c.n}": got ${JSON.stringify(got)}, expected the LITERAL ${JSON.stringify(c.expect)}`
      );
    }
    asserted++;
  }

  // Case 13: day/time are CONSTRAINED (#610), discharged structurally by
  // BOOKING_DAYS rather than by a note -- assert the exact set, and that
  // neither Monday nor Tuesday (the shop's shut days) can ever appear.
  const expectedDays = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  if (JSON.stringify(BOOKING_DAYS) !== JSON.stringify(expectedDays)) {
    failures.push(`13 day control: BOOKING_DAYS is ${JSON.stringify(BOOKING_DAYS)}, expected exactly ${JSON.stringify(expectedDays)}`);
  }
  if (BOOKING_DAYS.includes("Monday") || BOOKING_DAYS.includes("Tuesday")) {
    failures.push("13 day control: BOOKING_DAYS must never include Monday or Tuesday");
  }
  asserted++;

  // Case 15: submitted twice -- recomposed from the current fields, never
  // appended to ("My name is Sol. My name is Sol.").
  const twiceFields = { name: "Sol" };
  const first = composeBookingMessage(twiceFields);
  const second = composeBookingMessage(twiceFields);
  if (first !== second) {
    failures.push(`15 submitted twice: composeBookingMessage(sameFields) returned different strings: ${JSON.stringify(first)} vs ${JSON.stringify(second)}`);
  }
  const nameClauseCount = (second.match(/My name is Sol\./g) || []).length;
  if (nameClauseCount !== 1) {
    failures.push(`15 submitted twice: "My name is Sol." appears ${nameClauseCount} time(s) in the composed message, expected exactly 1`);
  }
  asserted++;

  // Case 16: a field cleared after a successful compose -- the clause
  // drops, no stale value survives (finder.js's resetDownstream() is the
  // precedent this mirrors).
  const filled = composeBookingMessage({ name: "Sol" });
  const cleared = composeBookingMessage({ name: "" });
  if (filled === cleared) {
    failures.push('16 cleared field: compose({name:"Sol"}) and compose({name:""}) must differ, but did not');
  }
  if (cleared !== "Hi Melony, I'd like to book a fitting.") {
    failures.push(`16 cleared field: compose({name:""}) is ${JSON.stringify(cleared)}, expected the exact case-1 literal`);
  }
  asserted++;

  // Case 17: before any interaction (first paint) -- the pure function's
  // own empty-fields output must equal the case-1 literal exactly. This is
  // ALSO proved against the REAL DOM below, in bookingBrowserAssertions
  // (trap 11) -- this half proves the pure function itself, that half
  // proves the page actually uses it.
  const firstPaint = composeBookingMessage({});
  if (firstPaint !== "Hi Melony, I'd like to book a fitting.") {
    failures.push(`17 first paint: composeBookingMessage({}) is ${JSON.stringify(firstPaint)}, expected the case-1 literal`);
  }
  asserted++;

  return { failures, asserted };
}

// STATIC-HTML checks on book-a-fitting.html's raw bytes, independent of the
// browser -- same idiom group 5 uses for size-finder.html's static
// fallback. Backstops three adversary-lens sabotages that a purely dynamic
// check would miss or that are cheaper to prove on disk.
function bookingStaticChecks() {
  const failures = [];
  let html;
  try {
    html = readFileSync(join(DEMO_DIR, "book-a-fitting.html"), "utf8");
  } catch (err) {
    return { failures: [`STATIC: could not read book-a-fitting.html: ${err.message || err}`] };
  }

  // Ruling #609/#616: the R850 collision sentence ships VERBATIM, exactly
  // once, ON THE ICE FITTING CARD -- "present somewhere on the page" is not
  // enough (trap 13: a contradicting sentence could sit right beside it).
  const R850_SENTENCE =
    "The R850 here is the same heat-mould that appears on the boot page. One bake, charged once, whichever way you book it.";
  const sentenceCount = html.split(R850_SENTENCE).length - 1;
  if (sentenceCount !== 1) {
    failures.push(`STATIC: the #616 R850 sentence appears ${sentenceCount} time(s) verbatim in book-a-fitting.html, expected exactly 1`);
  } else {
    const iceCardMatch = /<h3 class="card__title">Ice boot fitting \+ heat-mould<\/h3>[\s\S]*?<\/li>/.exec(html);
    if (!iceCardMatch || !iceCardMatch[0].includes(R850_SENTENCE)) {
      failures.push("STATIC: the #616 R850 sentence is present but not inside the Ice boot fitting card");
    }
  }

  // Ruling #610, asserted as SET EQUALITY against BOOKING_DAYS. T17 rework
  // (M3): this used to be `html.includes('value="Monday"') ||
  // html.includes('value="Tuesday"')` -- a two-string BLACKLIST that caught
  // exactly the Monday/Tuesday sabotage the adversary happened to run and
  // PASSED SILENTLY if four of the five bookable days were deleted, while
  // PRODUCT.md claimed the option set was "asserted against BOOKING_DAYS".
  // It never was: the DOM's option set was compared to BOOKING_DAYS
  // nowhere. It is now, as ORDERED equality (stronger than set equality,
  // and what the generator deterministically emits), against the exact
  // array [""] + BOOKING_DAYS -- the leading "" being the structural
  // placeholder option. Monday and Tuesday are excluded by construction
  // rather than by name, and an undershoot is a named failure.
  let dayOptionCount = 0;
  const daySelectMatch = /<select[^>]*\bdata-booking-day\b[^>]*>([\s\S]*?)<\/select>/.exec(html);
  if (!daySelectMatch) {
    failures.push("STATIC: no <select ... data-booking-day> found in book-a-fitting.html");
  } else {
    const optionValues = [...daySelectMatch[1].matchAll(/<option[^>]*\bvalue="([^"]*)"/g)].map((m) => m[1]);
    const expectedOptions = ["", ...BOOKING_DAYS];
    if (JSON.stringify(optionValues) !== JSON.stringify(expectedOptions)) {
      failures.push(
        `STATIC: the day select's baked <option> values are ${JSON.stringify(optionValues)}, ` +
          `expected exactly ${JSON.stringify(expectedOptions)} ([""] + BOOKING_DAYS)`
      );
    }
    dayOptionCount = optionValues.length;
  }

  // Case 7, discharged STRUCTURALLY rather than by a blacklist in the pure
  // function. The independent main-session control (#553) drove
  // composeBookingMessage({ type: "Choose a fitting" }) and expected the
  // placeholder's LABEL not to reach the message. Measured: through the
  // page that state is unreachable -- the placeholder option carries
  // value="", so the select yields "" and case 7 above already covers it.
  // Teaching the pure function to recognise placeholder-looking STRINGS
  // would be a blacklist of invented copy (M3's own lesson), and would drop
  // a legitimate fitting type that happened to be named one of them. The
  // real risk is the one the generator owns: baking a placeholder whose
  // value is its own label. That is what is asserted here, on BOTH selects
  // -- the day select's leading "" is asserted by the ordered-equality
  // check above, and this covers the type select.
  const typeSelectMatch = /<select[^>]*\bdata-booking-type\b[^>]*>([\s\S]*?)<\/select>/.exec(html);
  if (!typeSelectMatch) {
    failures.push("STATIC: no <select ... data-booking-type> found in book-a-fitting.html");
  } else {
    const firstOption = /<option[^>]*\bvalue="([^"]*)"[^>]*>([\s\S]*?)<\/option>/.exec(typeSelectMatch[1]);
    if (!firstOption || firstOption[1] !== "") {
      failures.push(
        `STATIC: the type select's first <option> has value ${JSON.stringify(firstOption && firstOption[1])}, ` +
          `expected "" -- a placeholder whose value is its own label would compose ` +
          `"I'd like to book the ${firstOption ? firstOption[2].trim() : "<label>"}." into Melony's inbox`
      );
    }
  }

  // Trap 9 / case 17: the submit CTA's href ON DISK, before any JS runs,
  // must never be absent and never href="" (which resolves to the page
  // itself and passes group 3 silently as an internal 200).
  const hrefMatch = /data-booking-submit href="([^"]*)"/.exec(html);
  if (!hrefMatch || !hrefMatch[1] || !hrefMatch[1].startsWith("https://wa.me/")) {
    failures.push(`STATIC: [data-booking-submit]'s baked href is ${JSON.stringify(hrefMatch && hrefMatch[1])}, expected a non-empty https://wa.me/ URL`);
  }

  // Ruling #618: the time control carries min/max -- the union of the two
  // published windows. HAND-TYPED LITERALS here, never read back out of
  // fittings.json, so that a fixture edit which moves the union has to be
  // ruled on rather than followed silently (the same trap the booking
  // literal cases above are built around).
  const timeMinMatch = /data-booking-time[^>]*\bmin="([^"]*)"/.exec(html);
  const timeMaxMatch = /data-booking-time[^>]*\bmax="([^"]*)"/.exec(html);
  if (!timeMinMatch || timeMinMatch[1] !== "09:30" || !timeMaxMatch || timeMaxMatch[1] !== "18:00") {
    failures.push(
      `STATIC: [data-booking-time]'s baked min/max are ` +
        `${JSON.stringify(timeMinMatch && timeMinMatch[1])}/${JSON.stringify(timeMaxMatch && timeMaxMatch[1])}, ` +
        `expected "09:30"/"18:00" (ruling #618, the union of the published windows)`
    );
  }

  return { failures, dayOptionCount };
}

// BROWSER-DRIVEN: the REAL rendered CTA href vs the pure function (trap
// 11). A perfect pure function the page never calls would still pass every
// check above -- drive the REAL page's controls and assert the REAL
// [data-booking-submit] href's DECODED text= param (never the whole href --
// the base already contains an "8" from the phone number, T16's own
// #602-class lesson) equals composeBookingMessage()'s output for the SAME
// fields, in the browser, for 4 cases.
async function bookingBrowserAssertions(browser) {
  const failures = [];
  const details = [];
  const context = await browser.newContext();
  const p = await context.newPage();
  try {
    await p.goto(`${DECK}/demo/book-a-fitting`, { waitUntil: "load" });

    async function assertHrefMatches(label, fields) {
      const expected = composeBookingMessage(fields);
      const href = await p.locator(AC2_SUBMIT_SELECTOR).getAttribute("href");
      if (!href || !href.startsWith("https://wa.me/")) {
        failures.push(`booking browser "${label}": href is ${JSON.stringify(href)}, expected it to start with "https://wa.me/"`);
        return;
      }
      const textParam = new URL(href).searchParams.get("text") || "";
      if (textParam !== expected) {
        failures.push(
          `booking browser "${label}": rendered href text= is ${JSON.stringify(textParam)}, expected the pure function's output ${JSON.stringify(expected)}`
        );
        return;
      }
      details.push(`"${label}": rendered href === pure fn output`);
    }

    // Case 17: first paint, zero interaction.
    await assertHrefMatches("17 first paint", {});

    // Case 4: select a day only.
    await p.selectOption("[data-booking-day]", "Wednesday");
    await assertHrefMatches("4 day only", { day: "Wednesday" });
    await p.selectOption("[data-booking-day]", "");

    // Case 3: type a name only.
    await p.fill("[data-booking-name]", "Sol");
    await assertHrefMatches("3 name only", { name: "Sol" });
    await p.fill("[data-booking-name]", "");

    // Case 8: choose the fitting type only.
    await p.selectOption("[data-booking-type]", "Ice boot fitting + heat-mould");
    await assertHrefMatches("8 type only", { type: "Ice boot fitting + heat-mould" });
    await p.selectOption("[data-booking-type]", "");
  } catch (err) {
    failures.push(`booking browser: threw before finishing: ${err.message || err}`);
  } finally {
    await context.close();
  }
  return { failures, details };
}

async function groupZeroConsoleErrors(page, browser) {
  const failures = [];

  const ac2Static = ac2StaticScan();
  failures.push(...ac2Static.failures);

  const ac2Click = await ac2ClickAndWatch(browser);
  if (!ac2Click.pass) failures.push(ac2Click.detail);

  const bookingStatic = bookingStaticChecks();
  failures.push(...bookingStatic.failures);

  const bookingPurity = bookingPurityChecks();
  failures.push(...bookingPurity.failures);
  if (bookingPurity.asserted < BOOKING_CASES_FLOOR) {
    failures.push(`composeBookingMessage cases asserted (${bookingPurity.asserted}) is below the floor of ${BOOKING_CASES_FLOOR}`);
  }

  const bookingBrowser = await bookingBrowserAssertions(browser);
  failures.push(...bookingBrowser.failures);

  let ac2LifecycleRequests = 0;

  await forEachSixPages(browser, null, async (p, { label, url }) => {
    const pageFailures = [];

    // Armed before goto, never removed: the whole page lifecycle, not a
    // window around one click (M2, second half).
    p.on("request", (req) => {
      ac2LifecycleRequests += 1;
      const type = req.resourceType();
      if (AC2_SCRIPTED_RESOURCE_TYPES.has(type)) {
        pageFailures.push(`AC2(b) lifecycle: a "${type}" request fired: ${req.url()}`);
      }
    });

    p.on("console", (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        pageFailures.push(`console.${type}: ${msg.text()}`);
      }
    });
    p.on("pageerror", (err) => {
      pageFailures.push(`uncaught exception (pageerror): ${err.message || err}`);
    });
    p.on("response", (response) => {
      if (response.status() >= 400) {
        pageFailures.push(`response ${response.status()}: ${response.url()}`);
      }
    });
    p.on("requestfailed", (request) => {
      pageFailures.push(`request failed: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
    });

    try {
      // networkidle, not load: a late-firing request (e.g. the webfont,
      // which the browser can defer past the load event) must still be
      // caught if it 404s or triggers a console message.
      await p.goto(url, { waitUntil: "networkidle" });
    } catch (err) {
      pageFailures.push(`goto errored: ${err.message || err}`);
    }

    if (pageFailures.length > 0) {
      failures.push(`${label} (${url}): ${pageFailures.join(" | ")}`);
    }
  });

  if (ac2LifecycleRequests < AC2_LIFECYCLE_REQUESTS_FLOOR) {
    failures.push(
      `AC2(b) lifecycle: only ${ac2LifecycleRequests} request(s) observed across all ${SIX_PAGES.length} pages, ` +
        `expected >= ${AC2_LIFECYCLE_REQUESTS_FLOOR} -- the listener is not observing anything, so "zero scripted ` +
        `requests" would pass vacuously`
    );
  }

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return {
    pass: true,
    detail:
      `zero console errors/warnings, zero uncaught exceptions, zero failed/>=400 requests across ${SIX_PAGES.length} pages | ` +
      `${ac2Static.filesScanned} file(s) AC2(a)-scanned (floor ${AC2_FILES_FLOOR}), 0 hit(s), ` +
      `${AC2_EVASION_FIXTURES.length} self-evasion fixture(s) still caught | ${ac2Click.detail} | ` +
      `AC2(b) lifecycle: ${ac2LifecycleRequests} request(s) observed across ${SIX_PAGES.length} pages, ` +
      `0 fetch/xhr/websocket/eventsource | ` +
      `composeBookingMessage cases asserted: ${bookingPurity.asserted} (floor ${BOOKING_CASES_FLOOR}) | ` +
      `booking static checks: R850 sentence + ${bookingStatic.dayOptionCount} day option(s) == [""]+BOOKING_DAYS + ` +
      `baked href + #618 time min/max, 0 hit(s) | ` +
      `booking browser: ${bookingBrowser.details.join(", ")}`,
  };
}

// --- group 8 ---------------------------------------------------------------
// At 390x844: document.documentElement.scrollWidth <= window.innerWidth on
// every page (documentElement, not body -- body measured 374 against
// documentElement's 390 on the deck page, so body is the weaker measure and
// can mask an overflow. document.scrollWidth does not exist). Every primary
// CTA >= 44x44 px.
//
// .skip-link is the only excluded selector (ruling #525): a keyboard-only
// WCAG bypass affordance, positioned off-screen until focused, so it is
// never a pointer target and the 44px enhanced touch-target rule does not
// apply to it.
const CTA_SELECTOR = 'a.site-header__link, a.whatsapp-fab, button, [role="button"], a[class*="btn"], [data-cta]';
// Every demo page (not the deck placeholder) carries at least this many CTA
// elements today (3 nav links + 1 header CTA + 1 floating WhatsApp button).
// If the selector above ever stops matching -- a class rename, a typo -- the
// count silently drops to zero and the gate would pass vacuously with
// nothing checked. This floor turns that into a named failure instead.
const CTA_COUNT_FLOOR = 5;

async function groupMobileLayout(page, browser) {
  const failures = [];
  const details = [];

  await forEachSixPages(browser, { width: 390, height: 844 }, async (p, { label, url }) => {
    try {
      await p.goto(url, { waitUntil: "load" });

      const overflow = await p.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (overflow.scrollWidth > overflow.innerWidth) {
        failures.push(`${label}: scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}`);
      }

      // Hidden-by-design controls (a closed .sheet, a filtered-out card) sit
      // behind [hidden]/display:none and correctly measure a zero-size box --
      // that is not a tap-target defect, so they are excluded before the 44px
      // floor applies rather than reported as one.
      const ctaBoxes = await p.evaluate((selector) =>
        Array.from(document.querySelectorAll(selector))
          .filter((el) => !el.matches(".skip-link"))
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { text: (el.textContent || "").trim().slice(0, 40), width: r.width, height: r.height };
          }), CTA_SELECTOR);

      for (const cta of ctaBoxes) {
        if (cta.width < 44 || cta.height < 44) {
          failures.push(
            `${label}: CTA "${cta.text}" is ${Math.round(cta.width)}x${Math.round(cta.height)}px, below 44x44`
          );
        }
      }

      if (label !== "deck" && ctaBoxes.length < CTA_COUNT_FLOOR) {
        failures.push(
          `${label}: CTA selector matched only ${ctaBoxes.length} element(s), expected >= ${CTA_COUNT_FLOOR} -- selector may be broken`
        );
      }

      details.push(`${label}: scrollWidth ${overflow.scrollWidth}/${overflow.innerWidth}, ${ctaBoxes.length} CTA(s) checked`);
    } catch (err) {
      failures.push(`${label}: errored: ${err.message || err}`);
    }
  });

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: details.join(" | ") };
}

// --- group 9 ---------------------------------------------------------------
// Every <img>: alt non-empty and byte-equal to img-alt.json's entry for its
// basename; rendered width <= manifest.images[].width for that basename.
// Exactly one <h1> per page. noindex meta on all six pages.
//
// Direction is DOM -> fixtures, never fixtures -> DOM (ruling #529): the
// manifest is a superset (26 entries) recording a retained audit trail, and
// only one image is rendered today. A basename missing from either fixture
// is a FAIL naming the file -- the fixtures are the source of truth, not a
// checklist to render everything.
//
// Ruling #630: T19 shipped 34 sized/lazy <img> tags with nothing in this
// spine asserting width/height/loading -- 11/11 PASS both before and after
// that diff, provably blind to it. Extended here, same group, no new
// dependency, per the ruling:
//   A. total <img> count across the FIVE demo pages (deck excluded -- it
//      carries zero <img> and is absent from EXPECTED_IMG_COUNT_BY_PAGE) is
//      exactly 34, with a named per-page count (index 6, roller-derby 16,
//      aura-sky-100 10, size-finder 1, book-a-fitting 1).
//   B. every <img> carries BOTH a width and a height attribute -- every
//      image counted, never a spot check.
//   C. that attribute pair EQUALS naturalWidth/naturalHeight once the
//      browser has actually decoded the image -- reading naturalWidth
//      before decode() resolves returns 0 and would pass every comparison
//      vacuously. Below-the-fold and `hidden` images never start
//      downloading on their own (lazy-loading's near-viewport heuristic
//      never fires for a 0x0 box), so each image is scrolled into view --
//      and, on roller-derby, the "In stock only" toggle is clicked first to
//      reveal the four out-of-stock cards -- before decode() is awaited.
//   D. exactly 6 tags are eager and 28 carry loading="lazy", asserted by
//      NAME, not only by count (a count-only check passes if the wrong six
//      are eager): logo.webp is eager on all five demo pages (group 4
//      stamps the shared header byte-identical, so its loading attribute is
//      necessarily uniform across all five) and aura-boot.webp is eager on
//      the PDP (its LCP element); every other <img> must be loading="lazy".
//   E. the four hidden roller-derby cards -- product-7111/8159/9565/9656,
//      `<li hidden>`, 0x0 while filtered out -- are asserted lazy by name.
//      They are the easiest pair to get backwards: a naive
//      "top < viewportHeight" rule marks them eager because they render at
//      top=0. Their `loading` attribute is read directly, never inferred
//      from their (currently 0x0) rendered box.
function basenameFromSrc(src) {
  return src.split(/[?#]/)[0].split("/").pop();
}

// Per-page <img> totals + eager identity for assertions A/D/E above.
// EXTRA_EAGER_BY_PAGE lists non-logo basenames that must stay eager;
// logo.webp is checked directly on every demo page (not listed here)
// because it is eager everywhere by construction (group 4's byte-identical
// shared header).
const EXPECTED_IMG_COUNT_BY_PAGE = {
  "demo home": 6,
  "roller-derby": 16,
  "aura-sky-100": 10,
  "size-finder": 1,
  "book-a-fitting": 1,
};
const TOTAL_IMG_COUNT = 34; // sum of the five values above
const EAGER_TOTAL = 6; // 5x logo.webp + aura-boot.webp
const LAZY_TOTAL = TOTAL_IMG_COUNT - EAGER_TOTAL; // 28
const EXTRA_EAGER_BY_PAGE = { "aura-sky-100": ["aura-boot.webp"] };
const HIDDEN_ROLLER_DERBY_BASENAMES = [
  "product-7111.webp",
  "product-8159.webp",
  "product-9565.webp",
  "product-9656.webp",
];

async function groupImageAndDocHygiene(page, browser) {
  let altMap;
  let manifest;
  try {
    altMap = JSON.parse(readFileSync(join(DEMO_DIR, "data", "img-alt.json"), "utf8"));
    manifest = JSON.parse(readFileSync(join(DEMO_DIR, "data", "manifest.json"), "utf8"));
  } catch (err) {
    return { pass: false, detail: `could not read fixtures: ${err.message || err}` };
  }
  const manifestWidthByFile = new Map(manifest.images.map((img) => [img.file, img.width]));

  const failures = [];
  const details = [];
  let totalImgCount = 0;
  let totalSizedCount = 0;
  let totalEagerCount = 0;
  let totalLazyCount = 0;

  await forEachSixPages(browser, { width: 390, height: 844 }, async (p, { label, url }) => {
    try {
      await p.goto(url, { waitUntil: "load" });

      // Reveal roller-derby's four "In stock only"-hidden cards BEFORE any
      // rendered-width or sizing capture below, exactly like a real visitor
      // pressing the toggle. Moved up from right before the sizing capture
      // (#632/F1): `[hidden]` is `display: none !important` (site.css),
      // which zeroes getBoundingClientRect().width, so capturing renderedWidth
      // before this click made the manifest-width comparison for those four
      // cards permanently vacuous (0 > manifestWidth is always false). A
      // no-op on every other page -- none of them carry [data-derby-toggle].
      // Harmless on alt/manifest-key lookups and the <img> COUNT check below:
      // `hidden` never removes elements from the DOM, so images.length and
      // every img's src/alt attribute are unaffected by this click.
      await p.evaluate(() => {
        const toggle = document.querySelector("[data-derby-toggle]");
        if (toggle) toggle.click();
      });

      const images = await p.evaluate(() =>
        Array.from(document.querySelectorAll("img")).map((img) => ({
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt"),
          renderedWidth: img.getBoundingClientRect().width,
        }))
      );

      for (const img of images) {
        const basename = basenameFromSrc(img.src);

        if (!Object.prototype.hasOwnProperty.call(altMap, basename)) {
          failures.push(`${label}: ${basename} has no entry in img-alt.json`);
        } else {
          const expectedAlt = altMap[basename];
          if (!img.alt) {
            failures.push(`${label}: ${basename} has empty/missing alt, expected "${expectedAlt}"`);
          } else if (img.alt !== expectedAlt) {
            failures.push(`${label}: ${basename} alt is "${img.alt}", expected "${expectedAlt}"`);
          }
        }

        if (!manifestWidthByFile.has(basename)) {
          failures.push(`${label}: ${basename} has no entry in manifest.images[]`);
        } else {
          const manifestWidth = manifestWidthByFile.get(basename);
          // A non-numeric width must FAIL, not silently pass every rendered
          // width -- `renderedWidth > undefined` is always false, which would
          // otherwise let the whole check go quiet for that file.
          if (typeof manifestWidth !== "number") {
            failures.push(`${label}: ${basename} has no numeric width in manifest.images[]`);
          } else if (img.renderedWidth > manifestWidth) {
            failures.push(
              `${label}: ${basename} renders at ${Math.round(img.renderedWidth)}px, wider than manifest width ${manifestWidth}px`
            );
          }
        }
      }

      // --- #630: total count + width/height/loading, five demo pages only.
      // The deck is excluded exactly like group 10's payload floor/ceiling
      // (`label !== "deck"`) -- it carries zero <img> today and is absent
      // from EXPECTED_IMG_COUNT_BY_PAGE.
      if (label !== "deck") {
        const expectedCount = EXPECTED_IMG_COUNT_BY_PAGE[label];
        if (expectedCount === undefined) {
          failures.push(`${label}: no expected <img> count configured for this page (add one to EXPECTED_IMG_COUNT_BY_PAGE)`);
        } else if (images.length !== expectedCount) {
          failures.push(`${label}: ${images.length} <img>(s), expected exactly ${expectedCount}`);
        }
        totalImgCount += images.length;

        // The derby toggle click already ran above, before renderedWidth was
        // captured (#632/F1). It still had to run before this decode() pass
        // regardless: while `hidden`, an image never starts downloading (no
        // layout box, so lazy-loading's near-viewport heuristic never
        // fires), so decode() below would hang/time out on them otherwise.
        const sizing = await p.evaluate(async () => {
          const DECODE_TIMEOUT_MS = 8000;
          const imgs = Array.from(document.querySelectorAll("img"));
          const out = [];
          for (const img of imgs) {
            const hasWidthAttr = img.hasAttribute("width");
            const hasHeightAttr = img.hasAttribute("height");
            const widthAttr = img.getAttribute("width");
            const heightAttr = img.getAttribute("height");
            const loadingAttr = img.getAttribute("loading");
            // Scrolled into view so lazy-loading's near-viewport heuristic
            // fires and the browser actually starts fetching the image --
            // otherwise naturalWidth/naturalHeight read 0 below and every
            // comparison would pass vacuously, defeating assertion C's
            // whole purpose.
            img.scrollIntoView({ block: "center" });
            let decodeError = null;
            try {
              const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("decode timed out")), DECODE_TIMEOUT_MS)
              );
              await Promise.race([img.decode(), timeout]);
            } catch (err) {
              decodeError = (err && err.message) || String(err);
            }
            out.push({
              src: img.getAttribute("src") || "",
              hasWidthAttr,
              hasHeightAttr,
              widthAttr,
              heightAttr,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              loadingAttr,
              decodeError,
            });
          }
          return out;
        });

        for (const img of sizing) {
          const basename = basenameFromSrc(img.src);

          if (img.hasWidthAttr && img.hasHeightAttr) {
            totalSizedCount += 1;
          } else {
            const missing = [!img.hasWidthAttr && "width", !img.hasHeightAttr && "height"].filter(Boolean).join("/");
            failures.push(`${label}: ${basename} is missing its ${missing} attribute`);
          }

          if (img.decodeError) {
            failures.push(
              `${label}: ${basename} failed to decode (${img.decodeError}), cannot verify its width/height attributes match naturalWidth/naturalHeight`
            );
          } else if (
            img.hasWidthAttr &&
            img.hasHeightAttr &&
            (String(img.widthAttr) !== String(img.naturalWidth) || String(img.heightAttr) !== String(img.naturalHeight))
          ) {
            failures.push(
              `${label}: ${basename} width/height attributes (${img.widthAttr}x${img.heightAttr}) do not equal its decoded naturalWidth/naturalHeight (${img.naturalWidth}x${img.naturalHeight})`
            );
          }

          const isEager = img.loadingAttr !== "lazy";
          if (isEager) {
            totalEagerCount += 1;
          } else {
            totalLazyCount += 1;
          }

          // #632/F2: `mustBeEager && !isEager` could never fire for an image
          // carrying loading="eager" -- isEager is only "not lazy", so an
          // explicit loading="eager" attribute (which the must-be-eager
          // contract says must be ABSENT, per PRODUCT.md and this failure
          // string) satisfied isEager and skipped the branch entirely. The
          // must-be-eager set requires genuine absence of the attribute --
          // getAttribute("loading") is confirmed to return null when the
          // attribute is not present (see loadingAttr's own capture above) --
          // so this must check `!== null`, not `!isEager`. isEager itself is
          // untouched and still tallies loading="eager" into totalEagerCount,
          // never into totalLazyCount.
          const mustBeEager = basename === "logo.webp" || (EXTRA_EAGER_BY_PAGE[label] || []).includes(basename);
          if (mustBeEager && img.loadingAttr !== null) {
            failures.push(`${label}: ${basename} must be eager (no loading attribute) but has loading="${img.loadingAttr}"`);
          } else if (!mustBeEager && img.loadingAttr !== "lazy") {
            failures.push(`${label}: ${basename} must carry loading="lazy" but has loading="${img.loadingAttr}"`);
          }
        }

        if (label === "roller-derby") {
          for (const basename of HIDDEN_ROLLER_DERBY_BASENAMES) {
            const found = sizing.find((img) => basenameFromSrc(img.src) === basename);
            if (!found) {
              failures.push(`roller-derby: hidden card ${basename} not found among rendered <img> tags`);
            } else if (found.loadingAttr !== "lazy") {
              failures.push(
                `roller-derby: hidden card ${basename} must carry loading="lazy" but has loading="${found.loadingAttr}"`
              );
            }
          }
        }
      }

      const h1Count = await p.evaluate(() => document.querySelectorAll("h1").length);
      if (h1Count !== 1) {
        failures.push(`${label}: ${h1Count} <h1> element(s), expected exactly 1`);
      }

      const robotsContent = await p.evaluate(
        () => document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null
      );
      if (robotsContent !== "noindex") {
        failures.push(`${label}: robots meta is "${robotsContent}", expected "noindex"`);
      }

      details.push(`${label}: ${images.length} img(s), h1=${h1Count}, robots=${robotsContent}`);
    } catch (err) {
      failures.push(`${label}: errored: ${err.message || err}`);
    }
  });

  if (totalImgCount !== TOTAL_IMG_COUNT) {
    failures.push(`total <img> across the five demo pages is ${totalImgCount}, expected exactly ${TOTAL_IMG_COUNT}`);
  }
  if (totalEagerCount !== EAGER_TOTAL) {
    failures.push(`total eager <img> across the five demo pages is ${totalEagerCount}, expected exactly ${EAGER_TOTAL}`);
  }
  if (totalLazyCount !== LAZY_TOTAL) {
    failures.push(`total loading="lazy" <img> across the five demo pages is ${totalLazyCount}, expected exactly ${LAZY_TOTAL}`);
  }
  details.push(
    `image triple: total=${totalImgCount}/${TOTAL_IMG_COUNT}, sized=${totalSizedCount}/${TOTAL_IMG_COUNT}, eager=${totalEagerCount}/${EAGER_TOTAL}, lazy=${totalLazyCount}/${LAZY_TOTAL}`
  );

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: details.join(" | ") };
}

// --- group 10 ----------------------------------------------------------------
// Total bytes transferred on a COLD load must not exceed 1.5 MB per demo
// page; the measured figure is printed for all six (deck included, ruling
// #524) but the threshold only gates the five demo pages -- the deck is a
// placeholder that becomes an owner-exported canvas later and the spec
// deliberately scoped the budget to the demo.
//
// "Cold" is the whole game here (ruling #527): a shared/warm page reused
// across pages reports revalidation bytes (about 1.9 KB), not payload
// (about 65 KB) -- a 34x under-count that would pass with a 1000x margin
// and prove nothing.
// forEachSixPages opens a fresh browser.newContext() per page for exactly
// this reason. Measured with Playwright's own response.request().sizes()
// API (responseBodySize + responseHeadersSize summed per response) -- no
// CDP session, no extra dependency.
const PAYLOAD_LIMIT_BYTES = 1.5 * 1024 * 1024; // 1.5 MB, spec section 7.10
// A demo page transfers about 65 KB today (the webfont alone is 23,358 B) and
// a warm/shared-context read (ruling #527) under-reports to about 1.9 KB.
// Comfortably below the real figure and comfortably above the warm one, this
// floor turns a silent sizes()-failure or a cache-reuse regression into a
// named failure instead of a vacuous pass -- the same protection
// CTA_COUNT_FLOOR gives group 8.
const PAYLOAD_FLOOR_BYTES = 20 * 1024; // 20 KB

async function groupPagePayload(page, browser) {
  const failures = [];
  const details = [];

  await forEachSixPages(browser, null, async (p, { label, url }) => {
    const responses = [];
    p.on("response", (response) => {
      responses.push(response);
    });

    try {
      // networkidle, not load: measured directly (see comment above) --
      // the webfont request can fire after the load event, and a "load"
      // wait under-counts a cold demo page by about 23 KB depending on timing.
      await p.goto(url, { waitUntil: "networkidle" });
    } catch (err) {
      failures.push(`${label}: errored: ${err.message || err}`);
      return;
    }

    let total = 0;
    for (const response of responses) {
      try {
        const sizes = await response.request().sizes();
        total += sizes.responseBodySize + sizes.responseHeadersSize;
      } catch {
        // a response whose sizing info is unavailable (e.g. cancelled mid-flight)
        // contributes 0 rather than throwing the whole group.
      }
    }

    const isDemoPage = label !== "deck";
    details.push(`${label}: ${total} bytes transferred`);
    if (isDemoPage && total > PAYLOAD_LIMIT_BYTES) {
      failures.push(`${label}: ${total} bytes exceeds the ${PAYLOAD_LIMIT_BYTES}-byte (1.5 MB) budget`);
    }
    if (isDemoPage && total < PAYLOAD_FLOOR_BYTES) {
      failures.push(
        `${label}: ${total} bytes is below the ${PAYLOAD_FLOOR_BYTES}-byte floor -- looks like a warm cache or an unmeasured response, not a real cold load`
      );
    }
  });

  console.log(details.join("\n"));

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: details.join(" | ") };
}

// --- group 3 ---------------------------------------------------------------
// Every href on every demo page resolves correctly and is where it claims to
// be. Restructured from §7.3's literal wording per decisions #536/#516/#538:
//
//   - maps.google.com and waze.com are BANNED, not allow-listed-and-exempt.
//     The plan's own rule ("allow-listed host, present in manifest.links[]
//     at 200/manual-ok") is satisfied by BOTH halves for the rejected
//     Midrand address (manifest index 9), so as written it would BLESS
//     re-introducing it. Both hosts fail immediately, citing #504.
//   - wa.me / mailto: / tel: are entirely ABSENT from manifest.links[] (not
//     one of the 13 entries is any of them) -- a literal "present in
//     manifest.links[]" rule fails all five pages on all five of these. They
//     are checked by host + validated against contact.json instead.
//   - manifest.links[] is a superset by design (2 exempt audit rows, 1 null
//     not-published row): direction is always demo href -> manifest entry,
//     never the reverse (#516/#529).
//
// SCOPE: SIX_PAGES (the deck is crawled too -- roll-line.it is rendered only
// there once T12 swaps in the local screenshot, §6.7 slide 2) but EXEMPT
// from every count floor via `label !== "deck"`, the same idiom group 8 uses
// for CTA_COUNT_FLOOR and group 10 uses for PAYLOAD_FLOOR_BYTES. The deck
// has zero href attributes today.
//
// SELECTOR: a[href], not [href] -- each demo page carries 13 href
// attributes, 12 on <a> and 1 on the site.css <link rel=stylesheet>. That
// 13th is already covered: group 2 fails on any response >= 400, naming its
// URL, so a dead stylesheet is a group-2 failure, not group 3's job.
const ALLOWED_HOSTS = ["melsskateshop.co.za", "roll-line.it", "roadhouserollerrink.co.za", "facebook.com"];
// Exact hostname EQUALITY only, never endsWith/includes -- "evilwa.me" and
// "melsskateshop.co.za.evil.com" must not pass as roadhouserollerrink.co.za
// or melsskateshop.co.za respectively.
const BANNED_HOSTS = ["maps.google.com", "waze.com"]; // decision #504: the demo asserts no location at all
const WHATSAPP_HOST = "wa.me";
const CANARY_404_PATH = `${DECK}/demo/__verify-canary-404`;

// Per-demo-page floors, measured identical on all five pages today. Deck is
// exempt (label !== "deck") -- it has none of these.
const HREF_COUNT_FLOOR = 12; // a[href] elements
const DISTINCT_HREF_FLOOR = 10; // distinct href values
const INTERNAL_FETCH_FLOOR = 4; // internal paths actually fetched at 200
const FRAGMENT_CHECKED_FLOOR = 1; // #main, the skip link, always first
const EXTERNAL_DISTINCT_FLOOR = 5; // wa.me, mailto:, tel:, facebook.com, liveSite root
const MANIFEST_CHECKED_FLOOR = 2; // facebook.com (index 8) + liveSite root (index 12)

// Ruling #584 (T14 build brief §10.2): an internal href that carries a
// #fragment (e.g. Home's cross-page ".../aura-sky-100#fit-guarantee") must
// resolve to a matching id in the TARGET page, not just a 200. The existing
// fragment branch above (step 2) only fires on hrefs that START WITH "#" --
// a full cross-page URL with a trailing fragment takes the internal-fetch
// branch (4a) instead and the fragment was never checked, which is exactly
// how the PDP's dead #fit-guarantee anchor shipped invisibly for two tasks.
// SUITE-LEVEL floor, not per-page (#538's per-page floors are the wrong
// shape here): only Home currently carries a cross-page fragment link, so a
// per-page floor would fail the other five pages that are correct.
const CROSS_PAGE_FRAGMENT_FLOOR = 1;

async function groupLinkCrawl(page, browser) {
  let manifest, contact;
  try {
    manifest = JSON.parse(readFileSync(join(DEMO_DIR, "data", "manifest.json"), "utf8"));
    contact = JSON.parse(readFileSync(join(DEMO_DIR, "data", "contact.json"), "utf8"));
  } catch (err) {
    return { pass: false, detail: `could not read fixtures: ${err.message || err}` };
  }
  // manifest.links[11] is {href: null, status: "not-published"} -- no
  // buying-guide page exists on melsskateshop.co.za. Any string method (a
  // Map key included) over a null href throws, so it is filtered out here
  // rather than crashing group 3 on the very entry that documents an absent
  // page. EXACT FULL-URL keys only -- decision #530 rejected origin matching:
  // "an origin match would weaken group 3 for every future link -- a dead
  // deep link on a live host would pass."
  const linkRows = manifest.links.filter((l) => typeof l.href === "string");
  const byHref = new Map(linkRows.map((l) => [l.href, l]));

  const failures = [];
  const details = [];
  let crossPageFragmentChecked = 0; // suite-level counter, #584

  await forEachSixPages(browser, null, async (p, { label, url }) => {
    const gate = (msg) => failures.push(`${label}: ${msg}`);

    let hrefs;
    try {
      await p.goto(url, { waitUntil: "domcontentloaded" });
      hrefs = await p.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href"))
      );
    } catch (err) {
      gate(`errored loading page: ${err.message || err}`);
      return;
    }

    const distinctHrefs = new Set(hrefs);
    if (label !== "deck" && hrefs.length < HREF_COUNT_FLOOR) {
      gate(`a[href] matched ${hrefs.length}, expected >= ${HREF_COUNT_FLOOR} -- selector may be broken`);
    }
    if (label !== "deck" && distinctHrefs.size < DISTINCT_HREF_FLOOR) {
      gate(`only ${distinctHrefs.size} distinct href value(s), expected >= ${DISTINCT_HREF_FLOOR}`);
    }

    const pageOrigin = new URL(url);
    let internalFetched = 0;
    let fragmentChecked = 0;
    let manifestChecked = 0;
    const externalDistinct = new Set();

    // for...of + await, NEVER .forEach(async ...) and never an un-awaited
    // .map -- either shape would read failures[] empty and print PASS with
    // zero links actually checked. The count floors above are the second
    // line of defence against a zero-iteration loop; this loop shape is the
    // first.
    for (const raw of hrefs) {
      const v = (raw ?? "").trim();

      // 1. Empty href first: new URL("", base) resolves to the page's own
      // URL and 200s vacuously.
      if (v === "") {
        gate(`empty href attribute`);
        continue;
      }

      // 2. Fragment branch, BEFORE any URL construction: new URL("#main",
      // pageUrl) collapses to the page's own URL, indistinguishable from a
      // real link, so a naive crawler that fetches it gets a vacuous 200.
      // Kept GENERAL (any leading #), not special-cased to the literal
      // "#main", so a second in-page anchor from T14-T17 is covered free.
      // This mechanically pins the <main id="main"> element #519 created.
      if (v.startsWith("#")) {
        const targetId = decodeURIComponent(v.slice(1));
        const found = await p.evaluate((id) => !!document.getElementById(id), targetId);
        if (!found) {
          gate(`fragment "${v}" has no matching id in the DOM`);
        } else {
          fragmentChecked++;
        }
        continue;
      }

      let u;
      try {
        u = new URL(v, url);
      } catch (err) {
        gate(`href "${v}" is not a valid URL: ${err.message || err}`);
        continue;
      }

      // 3. Protocol switch BEFORE hostname classification. mailto:/tel:
      // hostnames are "" -- an `if (!hostname) continue` would silently skip
      // them AND any future javascript:/data: href.
      if (u.protocol === "mailto:") {
        externalDistinct.add(v);
        if (v !== contact.email.href) {
          gate(`mailto href "${v}" does not match contact.json email.href "${contact.email.href}"`);
        }
        continue;
      }
      if (u.protocol === "tel:") {
        externalDistinct.add(v);
        if (v !== contact.phone.href) {
          gate(`tel href "${v}" does not match contact.json phone.href "${contact.phone.href}"`);
        }
        continue;
      }
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        gate(`href "${v}" uses unrecognised protocol "${u.protocol}"`);
        continue;
      }

      // 4. Hostname classification, strictly in this order.
      if (u.hostname === pageOrigin.hostname) {
        // 4a. internal -- fetch, do not follow redirects (§9's one-network-
        // pass cap, and a 3xx must be reported naming the href, not wherever
        // it ends up -- same reasoning as #527).
        let resp;
        try {
          resp = await p.request.get(u.href, { maxRedirects: 0 });
        } catch (err) {
          gate(`internal href "${v}" errored: ${err.message || err}`);
          continue;
        }
        const status = resp.status();
        if (status >= 300 && status < 400) {
          let location = null;
          try {
            location = resp.headers()["location"] ?? null;
          } catch {
            // headers() unavailable -- report without the location rather
            // than throwing the whole group.
          }
          gate(`internal href "${v}" redirected (${status}) to "${location}", not followed`);
        } else if (status !== 200) {
          gate(`internal href "${v}" returned ${status}, expected 200`);
        } else {
          internalFetched++;
          // #584: a fragment does not travel over HTTP, so this 200 body IS
          // the target page's full markup regardless of the hash -- read it
          // and assert the id actually exists there. u.hash is "" when the
          // href carries no fragment; skip those (this is the "carries a
          // #fragment" branch, not every internal href).
          if (u.hash) {
            const frag = decodeURIComponent(u.hash.slice(1));
            let body;
            try {
              body = await resp.text();
            } catch (err) {
              gate(`cross-page fragment "${v}" -- could not read response body: ${err.message || err}`);
              body = "";
            }
            // A plain substring search for `id="${frag}"` also matches
            // `data-id="${frag}"`, `aria-id="${frag}"` etc -- an attribute
            // that merely ENDS in "id=" is not the "id" attribute. Require
            // no identifier/hyphen character immediately before "id=" so
            // only the real attribute name matches; the frag itself is
            // escaped since it comes from an href, not a literal.
            const escapedFrag = frag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const idAttrRe = new RegExp(`(?<![-\\w])id=(["'])${escapedFrag}\\1`);
            if (idAttrRe.test(body)) {
              crossPageFragmentChecked++;
            } else {
              gate(`cross-page fragment "${v}" has no matching id in ${u.pathname}`);
            }
          }
        }
        continue;
      }

      externalDistinct.add(v);

      if (BANNED_HOSTS.includes(u.hostname)) {
        // 4b. banned -- decision #504/#536. Name the host and the manifest
        // audit-trail index, but NEVER the href or a manifest reason string:
        // indices 9 and 10 carry the rejected address URL-encoded, and this
        // control's output is saved for the PR (#521's evidence gate is
        // zero Midrand/Swallow/Bradford/maps/waze across every changed file).
        const idx = manifest.links.findIndex(
          (l) => typeof l.href === "string" && l.href.startsWith(`https://${u.hostname}`)
        );
        gate(
          `href on banned host "${u.hostname}" -- decision #504 ruled the demo asserts no location; ` +
            `manifest.links index ${idx} is a retained audit-trail row emitted by no page`
        );
        continue;
      }

      if (u.hostname === WHATSAPP_HOST) {
        // 4c. wa.me -- digits against contact.json, NOT string equality
        // against whatsapp.href: site.js's buildWhatsAppLink appends an
        // encoded ?text= that T12 wires through the FAB and the promise row,
        // so exact-href equality is a booby trap two tasks from now.
        const digits = u.pathname.replace(/^\//, "");
        if (digits !== contact.whatsapp.number) {
          gate(
            `wa.me href "${v}" path "${digits}" does not match contact.json whatsapp.number "${contact.whatsapp.number}"`
          );
        } else if (u.hash) {
          gate(`wa.me href "${v}" carries a hash fragment, not allowed`);
        } else {
          const extraParams = [...u.searchParams.keys()].filter((k) => k !== "text");
          if (extraParams.length > 0) {
            gate(`wa.me href "${v}" carries unexpected query param(s): ${extraParams.join(",")}`);
          }
        }
        continue;
      }

      if (ALLOWED_HOSTS.includes(u.hostname)) {
        // 4d. manifest-presence rule. No fetch here -- the manifest IS the
        // record of the fetch (§9's one-network-pass cap).
        const entry = byHref.get(v);
        if (!entry) {
          gate(`href "${v}" (host "${u.hostname}") is not present in manifest.links[]`);
          continue;
        }
        if (entry.status !== 200 && entry.status !== "manual-ok") {
          gate(`href "${v}" is present in manifest.links[] but status is "${entry.status}", expected 200 or "manual-ok"`);
          continue;
        }
        // §7.3 requires "status: 200 AND a checkedAt date written by
        // fetch-mels-fixtures.mjs" (or manual-ok, which is also always dated
        // at CP1) -- a hand-typed {href, status: 200} row that was never
        // actually fetched must not pass. Both rows that reach this rule
        // today (facebook.com index 8, liveSite root index 12) carry
        // checkedAt, so this is a closed hole, not a behavior change.
        if (typeof entry.checkedAt !== "string" || entry.checkedAt === "") {
          gate(`href "${v}" is present in manifest.links[] at status "${entry.status}" but has no checkedAt date`);
          continue;
        }
        if (Array.isArray(entry.flags) && entry.flags.includes("dropped-from-demo")) {
          gate(`href "${v}" is present in manifest.links[] but flagged "dropped-from-demo"`);
          continue;
        }
        manifestChecked++;
        continue;
      }

      // 4e. off-allow-list.
      gate(`href "${v}" is on an off-allow-list host "${u.hostname}"`);
    }

    if (label !== "deck") {
      if (internalFetched < INTERNAL_FETCH_FLOOR) {
        gate(`only ${internalFetched} internal href(s) fetched at 200, expected >= ${INTERNAL_FETCH_FLOOR}`);
      }
      if (fragmentChecked < FRAGMENT_CHECKED_FLOOR) {
        gate(`only ${fragmentChecked} fragment href(s) checked, expected >= ${FRAGMENT_CHECKED_FLOOR}`);
      }
      if (externalDistinct.size < EXTERNAL_DISTINCT_FLOOR) {
        gate(`only ${externalDistinct.size} distinct external href(s), expected >= ${EXTERNAL_DISTINCT_FLOOR}`);
      }
      if (manifestChecked < MANIFEST_CHECKED_FLOOR) {
        gate(`only ${manifestChecked} manifest.links[] entr(y/ies) matched, expected >= ${MANIFEST_CHECKED_FLOOR}`);
      }
    }

    details.push(
      `${label}: ${hrefs.length} href(s)/${distinctHrefs.size} distinct, ${internalFetched} internal, ` +
        `${fragmentChecked} fragment, ${externalDistinct.size} external distinct, ${manifestChecked} manifest-checked`
    );
  });

  // Suite-level anti-vacuity floor (#584/#532): a crawl that silently
  // visited zero cross-page fragments would read as PASS with nothing
  // checked. Suite-level, not per-page -- see the floor's own comment above.
  if (crossPageFragmentChecked < CROSS_PAGE_FRAGMENT_FLOOR) {
    failures.push(
      `only ${crossPageFragmentChecked} cross-page fragment href(s) resolved to a matching id, expected >= ${CROSS_PAGE_FRAGMENT_FLOOR}`
    );
  }
  details.push(`cross-page fragments resolved: ${crossPageFragmentChecked}`);

  // PERMANENT CANARY: fetch a path that must never exist, on every run, not
  // just once at T11 time on one machine -- proves the dead-link branch can
  // still see a dead link.
  try {
    const canaryResp = await page.request.get(CANARY_404_PATH, { maxRedirects: 0 });
    if (canaryResp.status() === 200) {
      failures.push(`canary: ${CANARY_404_PATH} returned 200 -- the 404 detector is not detecting`);
    }
  } catch (err) {
    failures.push(`canary: errored requesting ${CANARY_404_PATH}: ${err.message || err}`);
  }

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: `${details.join(" | ")} | canary 404-detector OK` };
}

// --- group 11 --------------------------------------------------------------
// data-illustrative chip ids <-> manifest.facts[] illustrative set (spec
// §7.11, §6.0). Restructured into four independent assertions per decision
// #535, stated as it was measured WHEN #535 WAS TAKEN: §7.11's literal
// wording ("the set... equals... across the five pages") could not PASS,
// because zero data-illustrative attributes existed anywhere in the repo, so
// DOM-observed {} against the manifest's 9-member set was FALSE by
// construction.
//
// As of T13 that paragraph was stale in its premise and still correct in its
// conclusion; #570 repaired the premise once already. As of T14 the count
// moved again -- NINE data-illustrative elements now ship -- Home's 5 from
// T12, the derby hub's 1 section-level chip from T13, and the PDP's 3
// (banner + Fit Guarantee section + instalment line) from T14 -- still
// carrying only TWO distinct ids (fit-guarantee, pjn-instalments) out of the
// manifest's nine. Full set-equality therefore STILL cannot pass until the
// remaining chips land in T15-T17, which is exactly what CHIPS_COMPLETE=1
// below turns on. Both numbers are printed by this group's own detail line
// on every run (assertion B's id list, assertion D's element count), so they
// cannot go stale again without the output disagreeing with this comment in
// the same terminal.
//
// This is recorded rather than quietly rewritten because for one commit the
// paragraph above contradicted assertion D's note fifteen lines below, which
// already said the chips were live -- the #540/#565 defect class reproducing
// itself inside the file that names it.
//
//   A: fixture pin, no DOM -- catches a 10th illustrative id, a rename or a
//      drop. The only assertion that can fail before any screen exists.
//   B: orphan gate, DOM -> manifest, one direction only -- catches a chip id
//      invented by a later screen task that was never in the manifest.
//      CHIPS_COMPLETE=1 (default off) tightens B from subset to full
//      set-equality; it can only turn a PASS red, never the reverse.
//   C: render probe -- the ONLY assertion with a DOM instrument that can go
//      red today, replacing the deleted "getComputedStyle(...).content"
//      ratchet (#537: that check is TRUE for every element on every page --
//      content's initial value is "normal" and computes to "none" only ON a
//      pseudo-element, so it was 100% vacuous with no symptom in the output).
//   D: every REAL observed chip is visible (non-hidden, non-zero box).
//      Genuinely live as of T12 (Home's 5 chip elements) and widened by T13
//      (the derby hub's 1 section-level chip) -- see the repair note in
//      PRODUCT.md, "What the next tasks inherit from Home". Its detail
//      string reports the observed element count rather than a static
//      phrase, so a future task cannot leave a stale count behind the way
//      this one was found.
//
// NO RATCHET, NO LOOSENING FLAG (#535): a ratchet only asserts "the number
// did not go down since someone last edited this line" and costs six
// hand-edits across T12-T17. A flag that LOOSENS a gate is a hole regardless
// of its banner, because the banner lives in stdout and stdout is the
// evidence pasted into the PR.
//
// SCOPE: the FIVE demo pages (DEMO_PAGES), NOT SIX_PAGES -- §7.11 says
// "across the five pages", and decisively the deck (444-byte placeholder)
// loads no stylesheet at all (its <head> carries only charset, viewport,
// robots and title), so the pill cannot render there and assertion C is
// unprovable on it. forEachSixPages is reused (not duplicated) with an
// explicit `if (label === "deck") return` skip inside the callback.
const CHIP_PROBE_MIN_WIDTH_PX = 40; // half PRODUCT.md's measured 80.016 CSS px pill (lines 283-287), same runtime-injection technique
// Assertion D2's height floor (M10): a chip hosted on an element whose own
// children are blocks lands on a line of its own and adds no width. Measured
// across the five pages: the two such hosts (an <li> on Home, a <section> on
// the PDP) grow by 29-30px, while every host that grows sideways instead
// moves 0.8-3.9px vertically. 20 sits clear of both bands.
const CHIP_HOST_MIN_HEIGHT_PX = 20;
// FROZEN_NINE: the nine illustrative ids. Per decision #505 the ninth id is
// aura-size-stock-states (renamed from the now-dead aura-size-run, retired
// from spec/plan by commit 6acdd39 under #533). NOT parsed from spec §6.0 --
// §6.0 (spec line 102) names SEVEN comma-delimited PROSE PHRASES and ZERO
// ids, so this cannot be described as "the ids §6.0 enumerates". Each id is
// justified against the section that actually pins it:
//   fit-guarantee          -- §6.0 + §6.1.1
//   pjn-instalments         -- §6.0 + §6.3.4
//   fitting-prices          -- §6.0's "fitting prices AND durations"
//   fitting-durations       -- §6.0's "fitting prices AND durations"
//   cancellation-policy     -- §6.0 + §6.5.3
//   heat-mould-price        -- §6.0's plural "heat-mould prices" + §6.3.9's "(chips)" plural
//   mail-in-heat-mould      -- §6.0's plural "heat-mould prices" + §6.3.9's "(chips)" plural
//   aura-size-stock-states  -- §6.0 as narrowed by #505 + §6.3.6
//   demo-buy-button         -- §6.0 + §6.3.10
const FROZEN_NINE = [
  "fit-guarantee",
  "pjn-instalments",
  "fitting-prices",
  "fitting-durations",
  "cancellation-policy",
  "heat-mould-price",
  "mail-in-heat-mould",
  "aura-size-stock-states",
  "demo-buy-button",
];

function setEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}
function setDiff(a, b) {
  return [...a].filter((x) => !b.has(x));
}

// --- group 7 -----------------------------------------------------------
// Derby hub (task 13, issue #31): the "In stock only" toggle + the five
// mutually-exclusive decision cards narrow the grid; the "Showing N of M"
// live region updates. THE ONLY GATE IN THIS SPINE THAT EVER INTERACTS WITH
// A PAGE -- measured across the whole file before this group existed: zero
// occurrences of .click(/.check(/.fill(/.type(/.press(/.tap(/.dispatchEvent(/
// .selectOption(. A version of this group that only read the generator's
// baked `hidden` attributes and never pressed a control would let a
// completely broken click handler ship at exit 0. Precisely: assertions C,
// D, E and I are click-driven throughout -- their expected values (the id
// sets, the pressed count, the "Showing N of M" strings) are recomputed by
// site.js's handlers, not by the generator. Assertions B, F, G and H (and
// A's toggle-on half) are read once on page load, before any click --
// exercised through a real browser render rather than a static file parse,
// but for those five, nothing in site.js has mutated the DOM yet, so their
// pre-click values equal the generator's own baked markup (confirmed by
// scripts/gen-roller-derby.mjs's own comment on assertion A). K is checked
// after every click below, never on load. A group that dropped every click
// and read only the loaded page would still catch a malformed generator,
// but would ship a broken click handler at exit 0 -- which is the risk this
// group exists to close, and why C/D/E/I/K exist below.
//
// Expected id sets per decision card are the build brief §3.2 partition,
// measured twice independently against products.json + manifest.images in
// the main session: 15 SKUs, 5/2/3/3/2, pairwise disjoint, zero orphans.
const DERBY_URL = `${DECK}/demo/roller-derby`;
const DERBY_GRID_SELECTOR = "[data-derby-grid] > li";
const DERBY_CARD_ID_SETS = {
  starting: [2925, 3726, 5194, 7696, 10351],
  upgrading: [5030, 7827],
  wheels: [4368, 8159, 9565],
  protective: [2923, 7111, 11847],
  toestops: [9571, 9656],
};

function sortedIds(arr) {
  return [...arr].sort((a, b) => a - b);
}

async function visibleGridIds(page) {
  return page.$$eval(`${DERBY_GRID_SELECTOR}:not([hidden])`, (els) =>
    els
      .map((el) => {
        const img = el.querySelector("img");
        const m = img && (img.getAttribute("src") || "").match(/product-(\d+)\.webp/);
        return m ? Number(m[1]) : null;
      })
      .filter((id) => id !== null)
  );
}

// ASSERTION K's positive measurement: count how many of the six derby
// controls (5 cards + toggle) are themselves buried -- either inside a
// [hidden] ancestor, or laid out with zero client rects (display:none
// without an explicit `hidden` attribute would still zero this out). This
// replaces an earlier version of K that called `toggleButton.focus()`
// immediately before reading `document.activeElement`: that forced refocus
// onto a control that is never conditionally hidden, so the check could not
// fail regardless of what regressed. Measured directly (adversarial review,
// T13 fixer pass): even reading `document.activeElement` right after the
// click that buries a focused control does not catch it either, because
// hiding the focused element makes the browser blur it to <body> on its
// own -- so this check must inspect the CONTROL ELEMENTS themselves, not
// whichever element currently holds focus. Demonstrated failing: moving
// `[data-derby-card="wheels"]` inside its own `[data-derby-set="wheels"]`
// <li>, clicking it, then clicking a different card (which hides that <li>)
// takes this from 0 to 1; the unmodified page holds it at 0 through every
// state below.
async function buriedControlCount(page) {
  return page.$$eval("[data-derby-card], [data-derby-toggle]", (els) =>
    els.filter((el) => el.closest("[hidden]") !== null || el.getClientRects().length === 0).length
  );
}

// ponytail: this wrapper exists for one reason -- to stop group 7 discarding
// its own diagnosis. Decision #571: every `await` in the body below can throw
// (a click on a node a regression has just hidden or detached, a navigation, a
// timeout) and the body reports its verdict only at its LAST statement, so
// before this wrapper existed a mid-flight throw dropped every failure already
// computed and printed a bare `threw:` line in their place.
//
// Demonstrated failing control (#528), run on the pre-wrapper code: assertion
// B's expected load count temporarily set to 16 (so a real failure is pushed
// on load) plus a click on `[data-derby-card="__CONTROL_NO_SUCH_CARD__"]`
// injected into the assertion-C loop. The output reported ONLY `threw:
// locator.click: Timeout 1500ms exceeded` -- the B failure, already in the
// array, never appeared. Re-run with the wrapper in place, the same control
// prints the B failure AND the throw.
//
// That is also why a group-7 "control" which works by throwing proves nothing
// about the assertions it never reached: the K-control built that way would
// print byte-identical output with assertion K deleted outright. K's
// non-vacuity rests on the second K-control and on the direct probe, not on
// that one.
//
// Generalises past this group, which is why it is written here rather than in
// a commit message: a verify function that accumulates failures in an array
// and returns them only at its last statement converts any mid-flight throw
// into a silent, all-clear-shaped crash.
async function groupDerbyFilters(page) {
  const failures = [];
  const details = [];
  try {
    await derbyFiltersBody(page, failures, details);
  } catch (err) {
    failures.push(`threw before finishing: ${(err && err.message) || String(err)}`);
  }
  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: details.join(" | ") };
}

// The group's actual body. It takes the two accumulators rather than owning
// them, so a throw anywhere inside still leaves the caller holding everything
// that was measured before it. Nothing else about the body changed.
async function derbyFiltersBody(page, failures, details) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(DERBY_URL, { waitUntil: "load" });

  const liveRegion = page.locator("[data-derby-count]");
  const toggleButton = page.locator("[data-derby-toggle]");

  // ASSERTION B (part 1) + ASSERTION F (first paint) + ASSERTION G + a
  // sanity count, all read from the loaded page BEFORE any click.
  const loadCount = await page.locator(DERBY_GRID_SELECTOR).count();
  if (loadCount !== 15) failures.push(`B: grid has ${loadCount} <li> on load, expected 15`);

  const firstPaintText = ((await liveRegion.textContent()) ?? "").trim();
  if (firstPaintText !== "") {
    failures.push(`F: live region textContent on first paint was "${firstPaintText}", expected empty`);
  }

  const liveAttr = await liveRegion.getAttribute("aria-live");
  if (liveAttr !== "polite") {
    failures.push(`G: result region carries aria-live="${liveAttr}", expected the literal "polite"`);
  }

  // ASSERTION H -- every decision control (5 cards + the toggle) carries
  // aria-pressed. Checked structurally at load; the click handlers below
  // only ever set it to "true"/"false", never remove it, so this is an
  // invariant, not a one-time snapshot.
  const controlCount = await page.locator("[data-derby-card], [data-derby-toggle]").count();
  if (controlCount !== 6) {
    failures.push(`H: expected 6 derby controls (5 cards + toggle), found ${controlCount}`);
  }
  const controlsWithoutAriaPressed = await page.$$eval("[data-derby-card], [data-derby-toggle]", (els) =>
    els.filter((el) => el.getAttribute("aria-pressed") !== "true" && el.getAttribute("aria-pressed") !== "false")
      .map((el) => (el.textContent || "").trim())
  );
  for (const label of controlsWithoutAriaPressed) {
    failures.push(`H: control "${label}" carries no aria-pressed`);
  }

  // ASSERTION A (part 1) -- toggle ON (default): every non-buyable card hidden.
  const nonBuyableVisibleOnLoad = await page
    .locator('[data-derby-set][data-derby-buyable="false"]:not([hidden])')
    .count();
  if (nonBuyableVisibleOnLoad !== 0) {
    failures.push(`A: with the toggle on (default), ${nonBuyableVisibleOnLoad} non-buyable card(s) are visible`);
  }
  const buyableVisibleOnLoad = await page
    .locator('[data-derby-set][data-derby-buyable="true"]:not([hidden])')
    .count();
  if (buyableVisibleOnLoad !== 11) {
    failures.push(`sanity: ${buyableVisibleOnLoad} buyable card(s) visible on load, expected 11`);
  }

  // ASSERTION L (part 1 of 3, #569) -- the GENERATOR'S BAKE, read before any
  // click. It has to live up here with A/B/F/G/H, not down with the rest of L,
  // for the reason this file's own load-block comment already states: site.js's
  // apply() recomputes this note's `hidden` on EVERY interaction, so a read
  // taken after even one click measures the JS and never the bake.
  //
  // The first version of this check sat at the bottom with the rest of L and
  // therefore could not fail. Measured by the audit, not argued: serving the
  // page with the baked ` hidden` stripped off the note gives a visitor a
  // 133 px "Nothing in stock under that filter right now" panel sitting over
  // 11 visible in-stock cards at first paint -- and group 7 still printed
  // PASS. Moving the read up here is what makes it the spine's only cover for
  // the bake half of #569. With JS off it is the ONLY thing between a visitor
  // and that note, because site.js deliberately never calls apply() on init.
  const emptyNote = page.locator("[data-derby-empty]");
  const emptyNoteCount = await emptyNote.count();
  if (emptyNoteCount !== 1) {
    failures.push(`L: expected exactly 1 [data-derby-empty] note, found ${emptyNoteCount}`);
  } else if (!(await emptyNote.evaluate((el) => el.hasAttribute("hidden")))) {
    failures.push(
      `L: the empty-state note is baked VISIBLE on first paint, with ${buyableVisibleOnLoad} card(s) on screen`
    );
  }

  // --- click 1: toggle OFF. Exercises the real handler, not baked markup. --
  await toggleButton.click();

  const gridAfterToggleOff = await page.locator(DERBY_GRID_SELECTOR).count();
  if (gridAfterToggleOff !== 15) {
    failures.push(`B: grid has ${gridAfterToggleOff} <li> with the toggle off, expected 15 (node count must stay constant)`);
  }
  const nonBuyableVisibleOff = await page
    .locator('[data-derby-set][data-derby-buyable="false"]:not([hidden])')
    .count();
  if (nonBuyableVisibleOff !== 4) {
    // ASSERTION A (part 2) -- toggle OFF: none is hidden.
    failures.push(`A: with the toggle off, only ${nonBuyableVisibleOff} of 4 non-buyable card(s) are visible, expected all 4`);
  }

  const textAfterToggleOff = ((await liveRegion.textContent()) ?? "").trim();
  if (textAfterToggleOff === "") {
    failures.push(`F: live region is still empty after the first toggle press`);
  }
  if (textAfterToggleOff !== "Showing 15 of 15") {
    failures.push(`I: no card + toggle off reads "${textAfterToggleOff}", expected "Showing 15 of 15"`);
  }

  // ASSERTION K (1 of 8 checkpoints) -- after the toggle-off click, none of
  // the six controls is buried inside a hidden subtree.
  const buriedAfterToggleOff = await buriedControlCount(page);
  if (buriedAfterToggleOff !== 0) {
    failures.push(`K: ${buriedAfterToggleOff} control(s) buried after the toggle-off click`);
  }

  // ASSERTION C -- with the toggle OFF (so the count is unaffected by
  // buyability), each of the five decision cards narrows the grid to its
  // exact, distinct, non-empty id set from the build brief's §3.2 table.
  // "Distinct" is proven by exact-match against five pairwise-disjoint
  // fixture sets, not re-derived here.
  const cardKeysInOrder = Object.keys(DERBY_CARD_ID_SETS);
  for (const key of cardKeysInOrder) {
    await page.locator(`[data-derby-card="${key}"]`).click();
    const visible = sortedIds(await visibleGridIds(page));
    const expected = sortedIds(DERBY_CARD_ID_SETS[key]);
    if (visible.length === 0) {
      failures.push(`C: card "${key}" narrows the grid to an EMPTY set`);
    } else if (JSON.stringify(visible) !== JSON.stringify(expected)) {
      failures.push(`C: card "${key}" shows ids [${visible.join(",")}], expected [${expected.join(",")}]`);
    }
    const gridDuringCard = await page.locator(DERBY_GRID_SELECTOR).count();
    if (gridDuringCard !== 15) {
      failures.push(`B: grid has ${gridDuringCard} <li> with card "${key}" active, expected 15`);
    }
    // ASSERTION K (2-6 of 8 checkpoints) -- one per card button, individually
    // -- none of the six controls is buried after THIS card's own click.
    const buriedDuringCard = await buriedControlCount(page);
    if (buriedDuringCard !== 0) {
      failures.push(`K: ${buriedDuringCard} control(s) buried with card "${key}" active`);
    }
  }
  // Clear the last-pressed card (press-again) before re-enabling the toggle,
  // so the toggle-on assertions below start from the clean "no card" state.
  await page.locator(`[data-derby-card="${cardKeysInOrder[cardKeysInOrder.length - 1]}"]`).click();

  // --- click: toggle back ON. -----------------------------------------------
  await toggleButton.click();
  const gridAfterToggleOn = await page.locator(DERBY_GRID_SELECTOR).count();
  if (gridAfterToggleOn !== 15) {
    failures.push(`B: grid has ${gridAfterToggleOn} <li> after re-enabling the toggle, expected 15`);
  }
  const textNoCardToggleOn = ((await liveRegion.textContent()) ?? "").trim();
  if (textNoCardToggleOn !== "Showing 11 of 15") {
    // ASSERTION I (part 1) -- the literal string spec:119 prints.
    failures.push(`I: no card + toggle on reads "${textNoCardToggleOn}", expected "Showing 11 of 15"`);
  }

  // ASSERTION K (7 of 8 checkpoints) -- after re-enabling the toggle.
  const buriedAfterToggleOn = await buriedControlCount(page);
  if (buriedAfterToggleOn !== 0) {
    failures.push(`K: ${buriedAfterToggleOn} control(s) buried after re-enabling the toggle`);
  }

  // --- click: the Wheels card, toggle still ON. -----------------------------
  await page.locator('[data-derby-card="wheels"]').click();

  // ASSERTION E -- single-select: exactly one of the five CARD controls (the
  // toggle is a separate binary control and is excluded from this count by
  // design) carries aria-pressed="true".
  const pressedCardCount = await page.locator('[data-derby-card][aria-pressed="true"]').count();
  if (pressedCardCount !== 1) {
    failures.push(`E: ${pressedCardCount} card control(s) carry aria-pressed="true" after pressing Wheels, expected exactly 1`);
  }
  const wheelsPressedIsWheels = await page.locator('[data-derby-card="wheels"]').getAttribute("aria-pressed");
  if (wheelsPressedIsWheels !== "true") {
    failures.push(`E: the pressed Wheels card itself carries aria-pressed="${wheelsPressedIsWheels}", expected "true"`);
  }

  const textWheelsToggleOn = ((await liveRegion.textContent()) ?? "").trim();
  if (textWheelsToggleOn !== "Showing 1 of 3") {
    // ASSERTION I (part 2) -- spec:184's general "Showing N of M" form.
    failures.push(`I: Wheels + toggle on reads "${textWheelsToggleOn}", expected "Showing 1 of 3"`);
  }
  const wheelsVisibleIds = sortedIds(await visibleGridIds(page));
  if (JSON.stringify(wheelsVisibleIds) !== JSON.stringify([4368])) {
    failures.push(`A/I: Wheels + toggle on shows ids [${wheelsVisibleIds.join(",")}], expected [4368]`);
  }

  // ASSERTION L (part 2 of 3, #569) -- the note must be ABSENT at shown === 1,
  // sampled here because the page is already in that state. Without this the
  // group only ever sees the note at 11 cards and at 0, so a predicate loosened
  // from `shown !== 0` to `shown > 1` would pass while showing "Nothing in
  // stock under that filter right now" on the three natural one-result filters
  // (Wheels, Toe stops, and Starting derby with the toggle off). Free: no extra
  // click, no extra state.
  if (emptyNoteCount === 1 && !(await emptyNote.evaluate((el) => el.hasAttribute("hidden")))) {
    failures.push(`L: the empty-state note is visible with 1 card on screen`);
  }

  // ASSERTION K (8 of 8 checkpoints) -- after pressing Wheels with the
  // toggle on (the state that hides the most cards at once: 14 of 15).
  const buriedAfterWheels = await buriedControlCount(page);
  if (buriedAfterWheels !== 0) {
    failures.push(`K: ${buriedAfterWheels} control(s) buried with Wheels active and the toggle on`);
  }

  // --- click: press Wheels again. -------------------------------------------
  await page.locator('[data-derby-card="wheels"]').click();

  // ASSERTION D -- pressing the active card again clears it: back to 11 of 15.
  const textAfterClear = ((await liveRegion.textContent()) ?? "").trim();
  if (textAfterClear !== "Showing 11 of 15") {
    failures.push(`D: pressing the active card again reads "${textAfterClear}", expected "Showing 11 of 15" (cleared)`);
  }
  const pressedAfterClear = await page.locator('[data-derby-card][aria-pressed="true"]').count();
  if (pressedAfterClear !== 0) {
    failures.push(`D: ${pressedAfterClear} card control(s) still carry aria-pressed="true" after clearing`);
  }
  const gridAfterClear = await page.locator(DERBY_GRID_SELECTOR).count();
  if (gridAfterClear !== 15) {
    failures.push(`B: grid has ${gridAfterClear} <li> after clearing the card, expected 15`);
  }

  // ASSERTION K -- checked at 8 checkpoints above (toggle-off, each of the
  // five card clicks individually, toggle-back-on, Wheels-with-toggle-on):
  // none of the six controls (5 cards + toggle) is ever buried inside a
  // [hidden] ancestor or laid out with zero client rects. This is the
  // runtime confirmation of the structural invariant the toggle and all
  // five card buttons live OUTSIDE the grid (build brief §6.1) -- a later
  // layout change that moved one of them inside a hideable card would flip
  // buriedControlCount() from 0 to a nonzero count at the checkpoint right
  // after that card's sibling gets hidden. Demonstrated failing (T13 fixer
  // pass, adversarial review): moving `[data-derby-card="wheels"]` inside
  // its own `[data-derby-set="wheels"]` <li>, then clicking Wheels followed
  // by a different card, took the count from 0 to 1 at exactly that
  // checkpoint. An earlier version of this assertion forced focus onto the
  // toggle right before reading `document.activeElement`, and a version
  // before that read `document.activeElement` after the click with no
  // forced refocus -- both were measured to still report 0 (pass) on that
  // same reproduction, because a browser auto-blurs a focused element to
  // <body> the instant it becomes display:none, so `document.activeElement`
  // never carries the regression once the click that would hide it has
  // actually run. buriedControlCount() inspects the control elements
  // directly rather than following focus, which is why it is the one form
  // of this check that fails on the reproduction above.

  // ASSERTION J -- the chip contract on THIS page (#550, widened here):
  // exactly one .chip-legend with an id, every [data-illustrative] element
  // carries aria-describedby pointing at it.
  const legendIds = await page.$$eval(".chip-legend", (els) => els.map((el) => el.id));
  if (legendIds.length !== 1) {
    failures.push(`J: expected exactly one .chip-legend, found ${legendIds.length}`);
  } else if (!legendIds[0]) {
    failures.push(`J: the .chip-legend element carries no id`);
  } else {
    const [legendId] = legendIds;
    const badChips = await page.$$eval(
      "[data-illustrative]",
      (els) => els.map((el) => ({ id: el.getAttribute("data-illustrative"), describedby: el.getAttribute("aria-describedby") }))
    );
    for (const c of badChips) {
      if (c.describedby !== legendId) {
        failures.push(`J: chip "${c.id}" has aria-describedby="${c.describedby}", expected "${legendId}"`);
      }
    }
  }

  // ASSERTION L (part 3 of 3, #569) -- the empty state actually renders. No card+toggle
  // combination reaches zero with today's fixture (Wheels + toggle on is the
  // narrowest at 1 of 3), so this DRIVES the state instead of waiting for a
  // stock change to make it reachable: flip the one buyable Wheels card's
  // data-derby-buyable to "false" in the DOM, press Wheels, and site.js's
  // apply() -- which re-reads the dataset on every call -- computes shown === 0
  // for real. Nothing is faked: the real handler runs, the real live region
  // updates, and the note un-hides or it does not.
  //
  // Fixture-independent by construction, so a later stock change can never
  // make it vacuous -- unlike a check that waited for an empty set to occur
  // naturally, which would pass silently forever by never running.
  //
  // Demonstrated failing (#528): deleting the single
  // `if (emptyState) emptyState.hidden = shown !== 0;` line from site.js
  // leaves the note hidden and prints
  // `L: the empty-state note is still hidden with 0 cards shown`.
  //
  // Runs LAST and restores the flag BEFORE the clearing click, so apply() puts
  // the grid back through the real handler and the DOM mutation cannot
  // contaminate assertions A-K above.
  if (emptyNoteCount === 1) {
    const wheelsBuyable = await page.$('[data-derby-set="wheels"][data-derby-buyable="true"]');
    if (!wheelsBuyable) {
      failures.push(`L: no buyable Wheels card to drive the empty state with`);
    } else {
      await wheelsBuyable.evaluate((el) => {
        el.dataset.derbyBuyable = "false";
      });
      await page.locator('[data-derby-card="wheels"]').click();

      const shownZero = await page.locator("[data-derby-set]:not([hidden])").count();
      const zeroText = ((await liveRegion.textContent()) ?? "").trim();
      const hiddenDuring = await emptyNote.evaluate((el) => el.hasAttribute("hidden"));

      // The note's OWN text, against the fixture the generator baked it from.
      // Un-hiding an empty <p> would otherwise pass every check above: the
      // audit's point is that "the note appeared" and "the note says the thing
      // Melony's copy says" are different claims. Reading the data file here is
      // in-idiom -- group 11 does exactly this with manifest.json -- and it
      // closes the same drift class gen-roller-derby.mjs already guards for
      // resultCountTemplate.
      let expectedEmptyCopy = null;
      try {
        expectedEmptyCopy = JSON.parse(readFileSync(join(DEMO_DIR, "data", "draft-copy.json"), "utf8"))
          .derby.filters.emptyState;
      } catch (err) {
        failures.push(`L: could not read derby.filters.emptyState from draft-copy.json: ${err.message || err}`);
      }
      const noteText = ((await emptyNote.textContent()) ?? "").trim();
      if (expectedEmptyCopy !== null && noteText !== expectedEmptyCopy.trim()) {
        failures.push(`L: the empty-state note reads "${noteText}", expected draft-copy's derby.filters.emptyState`);
      }
      if (shownZero !== 0) {
        failures.push(`L: the probe left ${shownZero} card(s) visible, expected 0 -- it never reached the empty state`);
      } else if (hiddenDuring) {
        failures.push(`L: the empty-state note is still hidden with 0 cards shown (live region reads "${zeroText}")`);
      }
      if (zeroText !== "Showing 0 of 3") {
        failures.push(`L: live region reads "${zeroText}" in the empty state, expected "Showing 0 of 3"`);
      }

      // Restore the flag FIRST, then clear the card, so the real handler
      // recomputes every card's `hidden` from the restored dataset.
      await wheelsBuyable.evaluate((el) => {
        el.dataset.derbyBuyable = "true";
      });
      await page.locator('[data-derby-card="wheels"]').click();
      const hiddenAfter = await emptyNote.evaluate((el) => el.hasAttribute("hidden"));
      const restoredVisible = await page.locator("[data-derby-set]:not([hidden])").count();
      if (!hiddenAfter) {
        failures.push(`L: the empty-state note stayed visible after the grid refilled`);
      }
      if (restoredVisible !== 11) {
        failures.push(`L: ${restoredVisible} card(s) visible after restoring the probe, expected 11`);
      }
    }
  }

  details.push(
    `A/B/F/G/H verified on load and after toggle | C: all 5 card id-sets matched | D: press-again clears | E: single-select held | I: "11 of 15"/"1 of 3"/"15 of 15" all matched | J: chip contract on this page | K: 0 buried controls at all 8 checkpoints | L: empty state rendered at "Showing 0 of 3" and withdrawn again`
  );
}

async function groupChipsManifest(page, browser) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(DEMO_DIR, "data", "manifest.json"), "utf8"));
  } catch (err) {
    return { pass: false, detail: `could not read manifest: ${err.message || err}` };
  }
  // NEVER compare against the unfiltered 92-entry facts array: aura-size-run-mm
  // and aura-size-run-published (both source melsskateshop.co.za) are strict
  // superstrings of the dead id, and 2 of the 4 "heat-mould" ids are NOT
  // illustrative. All comparisons below are EXACT Set membership -- never
  // startsWith/includes/some() in either direction.
  const manifestIllustrative = new Set(
    manifest.facts.filter((f) => f.source === "illustrative").map((f) => f.id)
  );

  const failures = [];

  // ASSERTION A -- fixture pin. Not a length check, not a sorted-join, not a
  // subset test: report BOTH sides separately so a rename can never masquerade
  // as a match.
  const frozen = new Set(FROZEN_NINE);
  if (!setEqual(manifestIllustrative, frozen)) {
    const inManifestNotFrozen = setDiff(manifestIllustrative, frozen);
    const inFrozenNotManifest = setDiff(frozen, manifestIllustrative);
    failures.push(
      `A: manifest illustrative set != FROZEN_NINE -- in manifest but not FROZEN_NINE: [${inManifestNotFrozen.join(", ")}]; ` +
        `in FROZEN_NINE but not manifest: [${inFrozenNotManifest.join(", ")}]`
    );
  }

  const chipsComplete = process.env.CHIPS_COMPLETE === "1";
  const observed = new Set();
  const probeDeltas = [];
  let visibleChipElementCount = 0; // total data-illustrative ELEMENTS checked by assertion D, not the unique id count `observed` holds
  let blockHostCount = 0; // non-inline chip hosts measured by assertion D2 (M10)

  await forEachSixPages(browser, { width: 390, height: 844 }, async (p, { label, url }) => {
    if (label === "deck") return; // group 11 scope is the five demo pages only

    try {
      await p.goto(url, { waitUntil: "load" });
    } catch (err) {
      failures.push(`${label}: errored loading page: ${err.message || err}`);
      return;
    }

    // ASSERTION B ingredient: observed chip ids on this page, DOM -> manifest
    // only, never the reverse.
    const pageObserved = await p.evaluate(() =>
      Array.from(document.querySelectorAll("[data-illustrative]")).map((el) =>
        el.getAttribute("data-illustrative")
      )
    );
    for (const id of pageObserved) {
      observed.add(id);
      if (!manifestIllustrative.has(id)) {
        failures.push(`B: orphan chip "${id}" observed on ${label} but not in manifest illustrative set`);
      }
    }

    // ASSERTION C -- render probe. Created, measured and REMOVED inside ONE
    // evaluate, and run before assertion D's crawl -- a probe left in the DOM
    // is itself an orphan chip that would self-fail B.
    const delta = await p.evaluate(() => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.whiteSpace = "nowrap";
      const plain = document.createElement("span");
      plain.textContent = "x";
      const chipped = document.createElement("span");
      chipped.textContent = "x";
      chipped.setAttribute("data-illustrative", "__probe__");
      wrapper.appendChild(plain);
      wrapper.appendChild(chipped);
      document.body.appendChild(wrapper);
      const plainWidth = plain.getBoundingClientRect().width;
      const chippedWidth = chipped.getBoundingClientRect().width;
      wrapper.remove();
      return chippedWidth - plainWidth;
    });
    probeDeltas.push(delta);
    if (delta < CHIP_PROBE_MIN_WIDTH_PX) {
      failures.push(
        `C: render probe delta on ${label} was ${delta.toFixed(1)}px, below the ${CHIP_PROBE_MIN_WIDTH_PX}px floor`
      );
    }

    // ASSERTION D -- every REAL observed chip element is visible.
    visibleChipElementCount += pageObserved.length;
    const invisible = await p.evaluate(() =>
      Array.from(document.querySelectorAll("[data-illustrative]"))
        .filter((el) => el.hasAttribute("hidden") || el.getClientRects().length === 0)
        .map((el) => el.getAttribute("data-illustrative"))
    );
    for (const id of invisible) {
      failures.push(`D: chip "${id}" on ${label} is not visible (hidden or zero-size box)`);
    }

    // ASSERTION D2 -- T17 rework (M10). Assertion D measures the HOST
    // element's box. For a chip hosted on a <span> that is fine: the span
    // wraps only the illustrative value, so a vanished ::after collapses
    // it. For a chip hosted on a PARAGRAPH -- book-a-fitting has two, the
    // #616 R850 sentence and the cancellation policy, one of them added by
    // the previous fix pass -- the paragraph has a non-zero box with or
    // without its pill, so D proves nothing at all about those two.
    //
    // So measure the pill's own footprint: clone the host, strip
    // data-illustrative from the clone so the ::after rule stops matching
    // it, and compare the two copies' geometry. TWO axes are needed, and
    // both are MEASURED rather than assumed:
    //   - WIDTH, sized by content (width:max-content, max-width:none --
    //     without that override every paragraph clamps to its readable
    //     measure, 608px, and both copies measure identically at 608).
    //     Actuals across the five pages: 88-96px.
    //   - HEIGHT, at the host's own natural width, because a chip on a
    //     host whose children are blocks (an <li>, a <section>) lands on a
    //     line of its OWN below them and adds no width at all. Actuals for
    //     those two hosts: 29-30px, against 0.8-3.9px for the hosts that
    //     grow sideways.
    // Either axis clearing its floor proves the pill occupies real space;
    // a chip that stops rendering moves neither, and fails. Both clones are
    // removed synchronously inside the same evaluate, so nothing is left in
    // the DOM for any later crawl to count.
    const blockHostDeltas = await p.evaluate(() => {
      const widthOf = (node) => {
        const wrap = document.createElement("div");
        wrap.style.cssText = "position:fixed;left:-10000px;top:0;width:max-content;max-width:none;";
        node.style.maxWidth = "none";
        node.style.width = "max-content";
        wrap.appendChild(node);
        document.body.appendChild(wrap);
        const w = node.getBoundingClientRect().width;
        wrap.remove();
        return w;
      };
      const heightOf = (node, px) => {
        const wrap = document.createElement("div");
        wrap.style.cssText = `position:fixed;left:-10000px;top:0;width:${px}px;`;
        node.style.maxWidth = "none";
        node.style.width = "100%";
        wrap.appendChild(node);
        document.body.appendChild(wrap);
        const h = node.getBoundingClientRect().height;
        wrap.remove();
        return h;
      };
      const out = [];
      for (const el of document.querySelectorAll("[data-illustrative]")) {
        if (getComputedStyle(el).display === "inline") continue; // D already bites on these
        const natural = Math.round(el.getBoundingClientRect().width) || 400;
        const copy = (strip) => {
          const n = el.cloneNode(true);
          if (strip) n.removeAttribute("data-illustrative");
          return n;
        };
        out.push({
          id: el.getAttribute("data-illustrative"),
          tag: el.tagName.toLowerCase(),
          dW: widthOf(copy(false)) - widthOf(copy(true)),
          dH: heightOf(copy(false), natural) - heightOf(copy(true), natural),
        });
      }
      return out;
    });
    blockHostCount += blockHostDeltas.length;
    for (const d of blockHostDeltas) {
      if (d.dW < CHIP_PROBE_MIN_WIDTH_PX && d.dH < CHIP_HOST_MIN_HEIGHT_PX) {
        failures.push(
          `D2: chip "${d.id}" on ${label} is hosted on a non-inline <${d.tag}>, and removing ` +
            `data-illustrative changed its geometry by only ${d.dW.toFixed(1)}px wide / ` +
            `${d.dH.toFixed(1)}px tall (floors ${CHIP_PROBE_MIN_WIDTH_PX}px / ${CHIP_HOST_MIN_HEIGHT_PX}px) -- ` +
            `the host has a box but the pill does not render`
        );
      }
    }
  });

  // The one permitted flag, load-bearing at T11 (plan verification command
  // #4's second half needs it, else it cannot bite under subset-only
  // semantics) and the T17 checkpoint gate that replaces the ratchet's
  // "must reach 9" property. It can only TIGHTEN.
  if (chipsComplete && !setEqual(observed, manifestIllustrative)) {
    const missing = setDiff(manifestIllustrative, observed);
    const extra = setDiff(observed, manifestIllustrative);
    failures.push(
      `B (CHIPS_COMPLETE=1): observed chip set != manifest illustrative set -- ` +
        `observed (${observed.size}): [${[...observed].sort().join(", ")}]; ` +
        `missing: [${missing.join(", ")}]; extra: [${extra.join(", ")}]`
    );
  }

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }

  const bDetail =
    observed.size === 0
      ? `0 chip ids observed across ${DEMO_PAGES.length} pages -- NO CHIP HAS BEEN OBSERVED ON ANY PAGE`
      : `${observed.size} chip id(s) observed across ${DEMO_PAGES.length} pages: [${[...observed].sort().join(", ")}]`;
  const cDetail = probeDeltas.map((d) => d.toFixed(1)).join("/");
  const detail =
    `A: manifest illustrative set == FROZEN_NINE (${FROZEN_NINE.length} ids) | ` +
    `B: ${bDetail} | ` +
    `C: probe delta ${cDetail} px vs floor ${CHIP_PROBE_MIN_WIDTH_PX} | ` +
    `D: ${visibleChipElementCount} real chip element(s) observed across ${DEMO_PAGES.length} pages, all visible | ` +
    `D2: ${blockHostCount} non-inline chip host(s) each grown by their own pill ` +
    `(>= ${CHIP_PROBE_MIN_WIDTH_PX}px wide or >= ${CHIP_HOST_MIN_HEIGHT_PX}px tall)`;
  return { pass: true, detail };
}

// --- group 6 (task 15, issue #33) ------------------------------------------
// PDP: size selection, service checkbox total, instalments(), static price
// vs products.json. Wrapper/body split in ONE try (#571, same shape as group
// 7's groupDerbyFilters/derbyFiltersBody) so a mid-flight throw never
// discards failures already accumulated.
const PDP_URL = `${DECK}/demo/aura-sky-100`;
const PDP_PRODUCT_ID = 11919;
// Literal size run, typed here independently of the generator's own loop
// (build brief §3.1, ruling #590) -- 16 values, 5 mm steps, 210-285.
const PDP_SIZE_RUN = Array.from({ length: 16 }, (_, i) => 210 + i * 5);
// Literal expected availability strings (ruling #589) -- typed once, NEVER
// imported from pdp.js's STATES map (that would be the exact tautology named
// in build brief §10: "reading the expected string out of the same STATES
// map the page renders from"). Each pins the FULL string including the size
// number, so a size->string mapping that returns the wrong size's text (or
// the same text for every button) is caught, not just "contains the phrase".
// "approx.", not "~" (ruling #512): a tilde is outside site.css's font
// subset and would be the site's first. Matches pdp.js's STATES.leadTime.
const pdpExpectedAvailability = (mm) => `Size ${mm} · imported to order, approx. 2 weeks`;
// Literal arithmetic (build brief §10 trap #4): the four combinations are
// typed here, not recomputed from the page's own total function or from
// fittings.json at runtime.
const PDP_BASE_CENTS = 1205000;
const PDP_HEAT_MOULD_CENTS = 85000;
const PDP_MAIL_IN_CENTS = 65000;
const PDP_TOTAL_NONE = "R12,050";
const PDP_TOTAL_HEAT_MOULD = "R12,900";
const PDP_TOTAL_MAIL_IN = "R12,700";
const PDP_TOTAL_BOTH = "R13,550";

async function groupPdpInteractive(page) {
  const failures = [];
  const details = [];
  try {
    await pdpInteractiveBody(page, failures, details);
  } catch (err) {
    failures.push(`threw before finishing: ${(err && err.message) || String(err)}`);
  }
  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: details.join(" | ") };
}

async function pdpInteractiveBody(page, failures, details) {
  // --- STATIC (JS-off) proof, read from disk, before the browser touches the
  // page at all (build brief §10 trap #8: a gate that only ever measures
  // post-JS state cannot tell a baked page from an injected one). ------------
  let staticHtml;
  try {
    staticHtml = readFileSync(join(DEMO_DIR, "aura-sky-100.html"), "utf8");
  } catch (err) {
    failures.push(`STATIC: could not read aura-sky-100.html from disk: ${err.message || err}`);
    staticHtml = "";
  }
  if (staticHtml) {
    // the live region is baked EMPTY -- nothing between its open/close tags.
    const liveMatch = /<span[^>]*data-pdp-availability[^>]*>([^<]*)<\/span>/.exec(staticHtml);
    if (!liveMatch) {
      failures.push(`STATIC: no [data-pdp-availability] span found in the baked HTML`);
    } else if (liveMatch[1] !== "") {
      failures.push(`STATIC: [data-pdp-availability] is baked with text "${liveMatch[1]}", expected empty`);
    }
    // all 16 size buttons are baked, not injected.
    const bakedSizeCount = (staticHtml.match(/data-pdp-size="\d+"/g) || []).length;
    if (bakedSizeCount !== 16) {
      failures.push(`STATIC: ${bakedSizeCount} baked [data-pdp-size] button(s) found, expected 16`);
    }
    // the script tag is root-absolute (measured fact A) -- a relative src
    // resolves against whatever trailing slash the clean URL carries and a
    // miss 404s, failing group 2 on the spot.
    if (!staticHtml.includes('<script type="module" src="/decks/mels-skate-shop/demo/assets/pdp.js">')) {
      failures.push(`STATIC: no root-absolute <script type="module" src="/decks/mels-skate-shop/demo/assets/pdp.js"> tag found`);
    }
    // non-interactive copy (Q&A, rails) is in the markup, not injected.
    if (!staticHtml.includes("What is a heat-mould?")) {
      failures.push(`STATIC: Q&A question "What is a heat-mould?" not found in baked HTML`);
    }
    if (!staticHtml.includes("Aura Sky 50 Ice Skate Boot- White")) {
      failures.push(`STATIC: Rail B's 11905 fixture name (no space before the hyphen, #579) not found baked`);
    }
  }

  // --- LOAD, before any click ------------------------------------------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PDP_URL, { waitUntil: "load" });

  const availability = page.locator("[data-pdp-availability]");
  const sizeButtons = page.locator("[data-pdp-size]");

  const sizeButtonCount = await sizeButtons.count();
  if (sizeButtonCount !== 16) {
    failures.push(`selector: [data-pdp-size] matched ${sizeButtonCount} button(s), expected 16 -- selector may be broken`);
  }

  // ASSERTION: the aria-live region is EMPTY before any selection, on first
  // paint -- read BEFORE any click (build brief §10 trap #3).
  const firstPaintText = ((await availability.textContent()) ?? "").trim();
  if (firstPaintText !== "") {
    failures.push(`region: [data-pdp-availability] textContent on first paint was "${firstPaintText}", expected empty`);
  }
  const liveAttr = await availability.getAttribute("aria-live");
  if (liveAttr !== "polite") {
    failures.push(`region: [data-pdp-availability] carries aria-live="${liveAttr}", expected "polite"`);
  }

  // the chip lives on the ALWAYS-VISIBLE wrapper, never inside the (empty at
  // first paint) live region itself (measured fact C / group 11 assertion D):
  // an element with zero client rects would fail that assertion on load.
  const chipHost = page.locator('[data-illustrative="aura-size-stock-states"]');
  const chipHostCount = await chipHost.count();
  if (chipHostCount !== 1) {
    failures.push(`chip: expected exactly 1 [data-illustrative="aura-size-stock-states"], found ${chipHostCount}`);
  } else {
    const chipBox = await chipHost.first().boundingBox();
    if (!chipBox || chipBox.width === 0 || chipBox.height === 0) {
      failures.push(`chip: aura-size-stock-states host has a zero-size box on first paint`);
    }
    const chipInsideLive = await chipHost.first().evaluate((el) => el.querySelector("[data-pdp-availability]") !== null);
    if (!chipInsideLive) {
      failures.push(`chip: aura-size-stock-states is not the live region's wrapper (expected to contain [data-pdp-availability])`);
    }
  }

  // --- ASSERTION: static price equals products.json for 11919 --------------
  let productsJson;
  try {
    productsJson = JSON.parse(readFileSync(join(DEMO_DIR, "data", "products.json"), "utf8"));
  } catch (err) {
    failures.push(`price: could not read products.json: ${err.message || err}`);
  }
  const priceAttr = await page.locator("[data-price]").getAttribute("data-price");
  const priceCents = Number(priceAttr);
  if (priceCents !== PDP_BASE_CENTS) {
    failures.push(`price: page's data-price is "${priceAttr}", expected literal ${PDP_BASE_CENTS}`);
  }
  if (productsJson) {
    const fixtureProduct = productsJson.products.find((p) => p.id === PDP_PRODUCT_ID);
    const fixtureCents = fixtureProduct ? Number(fixtureProduct.prices.price) : null;
    if (fixtureCents !== PDP_BASE_CENTS) {
      failures.push(`price: products.json id ${PDP_PRODUCT_ID} price is ${fixtureCents}, expected literal ${PDP_BASE_CENTS}`);
    }
  }

  // --- ASSERTION: instalments(1205000) sums to exactly 1205000 and displays
  // R4,016.67 -- checked BOTH ways: against the real exported function
  // (compared to a hard literal, not derived from it) AND against the page's
  // own baked instalment sentence, so a regression in either the function or
  // the generator's use of it is caught. -------------------------------------
  const instalmentsResult = instalments(PDP_BASE_CENTS);
  if (JSON.stringify(instalmentsResult) !== JSON.stringify([401667, 401667, 401666])) {
    failures.push(`instalments: instalments(${PDP_BASE_CENTS}) returned ${JSON.stringify(instalmentsResult)}, expected [401667,401667,401666]`);
  }
  if (instalmentsResult.reduce((a, b) => a + b, 0) !== PDP_BASE_CENTS) {
    failures.push(`instalments: sum is ${instalmentsResult.reduce((a, b) => a + b, 0)}, expected exactly ${PDP_BASE_CENTS}`);
  }
  if (moneyCents(instalmentsResult[0]) !== "R4,016.67") {
    failures.push(`instalments: moneyCents(${instalmentsResult[0]}) is "${moneyCents(instalmentsResult[0])}", expected "R4,016.67"`);
  }
  const instalmentSentence = ((await page.locator(".price__instalment").textContent()) ?? "");
  if (!instalmentSentence.includes("R4,016.67")) {
    failures.push(`instalments: the page's own .price__instalment sentence does not contain the literal "R4,016.67" (reads "${instalmentSentence.trim()}")`);
  }

  // --- each size button, CLICKED, drives the correct availability string ---
  let sizesVerified = 0;
  const seenTexts = new Set();
  for (const mm of PDP_SIZE_RUN) {
    const button = page.locator(`[data-pdp-size="${mm}"]`);
    const buttonCount = await button.count();
    if (buttonCount !== 1) {
      failures.push(`size ${mm}: expected exactly 1 button, found ${buttonCount}`);
      continue;
    }
    await button.click();
    const text = ((await availability.textContent()) ?? "").trim();
    if (text === "") {
      failures.push(`size ${mm}: region is still empty after clicking`);
      continue;
    }
    const expected = pdpExpectedAvailability(mm);
    if (text !== expected) {
      failures.push(`size ${mm}: region reads "${text}", expected "${expected}"`);
    }
    seenTexts.add(text);
    sizesVerified++;
  }
  if (sizesVerified < 16) {
    failures.push(`sizes: only ${sizesVerified} of 16 size buttons were verified (floor 16)`);
  }
  // Different sizes must yield DIFFERENT strings -- catches a completely
  // broken size->string mapping that always renders the same (correct-looking)
  // text (build brief §10, trap #1).
  if (seenTexts.size < 16) {
    failures.push(`sizes: only ${seenTexts.size} distinct availability string(s) observed across 16 clicks, expected 16`);
  }

  // --- services: each checkbox changes the total by the right amount, and
  // restores it exactly on untick. Read the RENDERED TEXT throughout, never
  // `.checked` (build brief §10 trap #5). -------------------------------------
  const serviceInputs = page.locator("[data-pdp-service]");
  const serviceCount = await serviceInputs.count();
  if (serviceCount !== 2) {
    failures.push(`services: [data-pdp-service] matched ${serviceCount} checkbox(es), expected 2 -- selector may be broken`);
  }
  const totalAmount = page.locator("[data-pdp-total-amount]");

  const totalBefore = ((await totalAmount.textContent()) ?? "").trim();
  if (totalBefore !== PDP_TOTAL_NONE) {
    failures.push(`total: before any tick reads "${totalBefore}", expected literal "${PDP_TOTAL_NONE}"`);
  }

  // Resolve the two checkboxes by their own data-price-cents rather than by
  // an assumed DOM order, so a re-ordering in the generator cannot silently
  // swap which combination this test exercises.
  const heatMould = page.locator(`[data-pdp-service][data-price-cents="${PDP_HEAT_MOULD_CENTS}"]`);
  const mailIn = page.locator(`[data-pdp-service][data-price-cents="${PDP_MAIL_IN_CENTS}"]`);
  const heatMouldCount = await heatMould.count();
  const mailInCount = await mailIn.count();
  if (heatMouldCount !== 1) failures.push(`services: expected exactly 1 checkbox at ${PDP_HEAT_MOULD_CENTS} cents, found ${heatMouldCount}`);
  if (mailInCount !== 1) failures.push(`services: expected exactly 1 checkbox at ${PDP_MAIL_IN_CENTS} cents, found ${mailInCount}`);

  let combosVerified = 0;

  if (heatMouldCount === 1) {
    await heatMould.check();
    const t1 = ((await totalAmount.textContent()) ?? "").trim();
    if (t1 !== PDP_TOTAL_HEAT_MOULD) failures.push(`total: heat-mould ticked reads "${t1}", expected literal "${PDP_TOTAL_HEAT_MOULD}"`);
    else combosVerified++;

    await heatMould.uncheck();
    const tRestored1 = ((await totalAmount.textContent()) ?? "").trim();
    if (tRestored1 !== PDP_TOTAL_NONE) failures.push(`total: heat-mould unticked reads "${tRestored1}", expected restore to literal "${PDP_TOTAL_NONE}"`);
    else combosVerified++;
  }

  if (mailInCount === 1) {
    await mailIn.check();
    const t2 = ((await totalAmount.textContent()) ?? "").trim();
    if (t2 !== PDP_TOTAL_MAIL_IN) failures.push(`total: mail-in ticked reads "${t2}", expected literal "${PDP_TOTAL_MAIL_IN}"`);
    else combosVerified++;
  }

  if (heatMouldCount === 1 && mailInCount === 1) {
    await heatMould.check();
    const tBoth = ((await totalAmount.textContent()) ?? "").trim();
    if (tBoth !== PDP_TOTAL_BOTH) failures.push(`total: both ticked reads "${tBoth}", expected literal "${PDP_TOTAL_BOTH}"`);
    else combosVerified++;

    await heatMould.uncheck();
    await mailIn.uncheck();
    const tRestoredBoth = ((await totalAmount.textContent()) ?? "").trim();
    if (tRestoredBoth !== PDP_TOTAL_NONE) failures.push(`total: both unticked reads "${tRestoredBoth}", expected restore to literal "${PDP_TOTAL_NONE}"`);
    else combosVerified++;
  }

  if (combosVerified < 4) {
    failures.push(`total: only ${combosVerified} combination(s) verified (floor 4)`);
  }

  details.push(
    `STATIC: live region baked empty, 16 size buttons baked, root-absolute script tag, Q&A + Rail B copy baked | ` +
      `region empty on load, aria-live="polite", chip on the always-visible wrapper | ` +
      `price: data-price ${PDP_BASE_CENTS} == products.json | instalments(): [401667,401667,401666] -> R4,016.67, baked sentence matches | ` +
      `${sizesVerified}/16 size buttons verified, ${seenTexts.size} distinct strings | ` +
      `${combosVerified}/4+ total combinations verified: ${PDP_TOTAL_NONE}/${PDP_TOTAL_HEAT_MOULD}/${PDP_TOTAL_MAIL_IN}/${PDP_TOTAL_BOTH}`
  );
}

// --- group 5 (task 16, issue #34) ------------------------------------------
// findSize()/whichSky() fixtures, including the out-of-range/no-table/
// unknown-brand fallback shapes, plus a browser-driven WhatsApp-href proof.
// Wrapper/body split in ONE try (#571, same shape as groups 6 and 7's own
// wrapper/body pairs) so a mid-flight throw never discards failures already
// accumulated.
const SIZE_FINDER_URL = `${DECK}/demo/size-finder`;

// VACUITY TRAP 1 (build brief §10): every expected value below is a LITERAL
// typed in THIS file, independent of data/sizes.json. If the fixture ever
// changes, this group must FAIL, not follow it -- reading the expected
// values out of the same table findSize() reads would pass for an
// implementation that ignored its input entirely. Each was measured against
// the live functions in the main session (gate 13.5's purity command) before
// being pinned here, never derived from finder.js's own source.
//
// VACUITY TRAP 4: riedell/sure-grip are `noTable: true` and cannot serve as
// a positive fixture (plan Task 16's original bullet made exactly this
// mistake). Every positive fixture below comes from one of the SIX brands
// that actually have a table -- aura, rio, sfr, chaya-emerald,
// chaya-sapphire, atom -- 3 each, giving 18, at the floor build brief §10
// names (VACUITY TRAP 2: the count is asserted against that floor, and
// printed, below).
const FINDSIZE_FIXTURES = [
  // brand, input, expected row (or availability, for aura), expected first scale value
  { brand: "rio", input: { mm: 220 }, expectRow: { uk: "1", eu: "33", insoleMm: 220 } },
  { brand: "rio", input: { mm: 245 }, expectRow: { uk: "5", eu: "38", insoleMm: 253 } },
  { brand: "rio", input: { mm: 300 }, expectRow: { uk: "12", eu: "47", insoleMm: 300 } },
  { brand: "sfr", input: { mm: 166 }, expectRow: { uk: "J10", eu: "28", footLengthMm: 166, ballGirthMm: 174 } },
  { brand: "sfr", input: { mm: 200 }, expectRow: { uk: "1", eu: "33", footLengthMm: 206, ballGirthMm: 204 } },
  { brand: "sfr", input: { mm: 302 }, expectRow: { uk: "10A", eu: "44.5", footLengthMm: 302, ballGirthMm: 276 } },
  { brand: "chaya-emerald", input: { mm: 227 }, expectRow: { us: "4", uk: "3.5", mm: 227 } },
  { brand: "chaya-emerald", input: { mm: 250 }, expectRow: { us: "8", uk: "7", mm: 255 } },
  { brand: "chaya-emerald", input: { mm: 289 }, expectRow: { us: "13", uk: "12", mm: 289 } },
  { brand: "chaya-sapphire", input: { mm: 228 }, expectRow: { us: "4", uk: "2", mm: 228 } },
  { brand: "chaya-sapphire", input: { mm: 260 }, expectRow: { us: "9", uk: "7", mm: 262 } },
  { brand: "chaya-sapphire", input: { mm: 301 }, expectRow: { us: "15", uk: "13", mm: 301 } },
  { brand: "atom", input: { mm: 217 }, expectRow: { usWomens: "4", usUnisexWider: null, inches: "8.5", mm: 217, eu: "36.5" } },
  { brand: "atom", input: { mm: 250 }, expectRow: { usWomens: "8", usUnisexWider: "7", inches: "9.94", mm: 252, eu: "40.5" } },
  { brand: "atom", input: { mm: 294 }, expectRow: { usWomens: null, usUnisexWider: "13", inches: "11.87", mm: 294, eu: "46.5" } },
];
const FINDSIZE_FIXTURES_FLOOR = 18; // six table brands x three, build brief §10

// Aura has its own row shape (row.availability across six model/gender
// grids), so its three positive fixtures are asserted separately from the
// generic table-brand loop above but count toward the same floor.
const AURA_FIXTURES = [
  {
    mm: 210,
    expectAvailability: [
      { model: "Sky 50", gender: "mens", label: "SKY50 - Men's", widths: ["C"] },
      { model: "Sky 50", gender: "womens", label: "SKY50 - Women's", widths: ["B", "C"] },
      { model: "Sky 100", gender: "mens", label: "SKY100 - Men's", widths: ["C"] },
      { model: "Sky 100", gender: "womens", label: "SKY100 - Women's", widths: ["B", "C"] },
      { model: "Sky 200", gender: "mens", label: "SKY200 - Men's", widths: [] },
      { model: "Sky 200", gender: "womens", label: "SKY200 - Women's", widths: [] },
    ],
  },
  {
    mm: 250,
    expectAvailability: [
      { model: "Sky 50", gender: "mens", label: "SKY50 - Men's", widths: ["C", "D"] },
      { model: "Sky 50", gender: "womens", label: "SKY50 - Women's", widths: ["B", "C", "D"] },
      { model: "Sky 100", gender: "mens", label: "SKY100 - Men's", widths: ["C"] },
      { model: "Sky 100", gender: "womens", label: "SKY100 - Women's", widths: ["B", "C"] },
      { model: "Sky 200", gender: "mens", label: "SKY200 - Men's", widths: ["C"] },
      { model: "Sky 200", gender: "womens", label: "SKY200 - Women's", widths: ["B", "C"] },
    ],
  },
  {
    mm: 285,
    expectAvailability: [
      { model: "Sky 50", gender: "mens", label: "SKY50 - Men's", widths: [] },
      { model: "Sky 50", gender: "womens", label: "SKY50 - Women's", widths: [] },
      { model: "Sky 100", gender: "mens", label: "SKY100 - Men's", widths: ["C"] },
      { model: "Sky 100", gender: "womens", label: "SKY100 - Women's", widths: [] },
      { model: "Sky 200", gender: "mens", label: "SKY200 - Men's", widths: ["C"] },
      { model: "Sky 200", gender: "womens", label: "SKY200 - Women's", widths: ["B", "C"] },
    ],
  },
];

// One fixture per Aura length band (build brief §10: floor 4, four bands),
// each a LITERAL typed here, never derived from the matrix -- and ruling
// #602's lower-band-wins is asserted directly by the fifth, boundary entry
// (mm=240/kg=36 sits in two bands on EACH axis; lower-band-wins must land
// it on the SAME cell as mm=220/kg=30, not the neighbouring 240-265/36-45
// cell, which would answer differently).
const WHICHSKY_FIXTURES = [
  { mm: 220, kg: 30, level: "singles", expect: { models: ["Sky 50"], lengthBand: "210-240", weightBand: "22-36" } },
  { mm: 250, kg: 50, level: "triples", expect: { models: ["Sky 100"], lengthBand: "240-265", weightBand: "45-54" } },
  { mm: 270, kg: 75, level: "doubles-triple", expect: { models: ["Sky 100"], lengthBand: "265-280", weightBand: "68-81" } },
  { mm: 285, kg: 90, level: "singles-doubles", expect: { models: ["Sky 200"], lengthBand: "280-plus", weightBand: "81-plus" } },
];
const WHICHSKY_BOUNDARY = {
  mm: 240,
  kg: 36,
  level: "singles",
  expect: { models: ["Sky 50"], lengthBand: "210-240", weightBand: "22-36" },
};
const WHICHSKY_FIXTURES_FLOOR = 4;

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function groupSizeFinder(page, browser) {
  const failures = [];
  const details = [];
  try {
    await sizeFinderBody(page, browser, failures, details);
  } catch (err) {
    failures.push(`threw before finishing: ${(err && err.message) || String(err)}`);
  }
  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return { pass: true, detail: details.join(" | ") };
}

async function sizeFinderBody(page, browser, failures, details) {
  // --- PURE-FUNCTION fixtures, in plain Node, no DOM (trap 11: the top-level
  // import already proves module-scope purity; calling both functions here
  // proves findSize/whichSky THEMSELVES never touch `document`, since this
  // whole file runs under plain Node with no DOM shim). -----------------------
  let findSizeAsserted = 0;
  for (const fx of FINDSIZE_FIXTURES) {
    const result = findSize(fx.brand, fx.input);
    if (!result || result.ok !== true) {
      failures.push(`findSize(${fx.brand}, ${JSON.stringify(fx.input)}) returned ${JSON.stringify(result)}, expected ok:true`);
      continue;
    }
    if (!deepEqual(result.row, fx.expectRow)) {
      failures.push(
        `findSize(${fx.brand}, ${JSON.stringify(fx.input)}).row is ${JSON.stringify(result.row)}, expected ${JSON.stringify(fx.expectRow)}`
      );
      continue;
    }
    findSizeAsserted++;
  }
  for (const fx of AURA_FIXTURES) {
    const result = findSize("aura", { mm: fx.mm });
    if (!result || result.ok !== true) {
      failures.push(`findSize(aura, {mm:${fx.mm}}) returned ${JSON.stringify(result)}, expected ok:true`);
      continue;
    }
    if (!deepEqual(result.row.availability, fx.expectAvailability)) {
      failures.push(
        `findSize(aura, {mm:${fx.mm}}).row.availability is ${JSON.stringify(result.row.availability)}, expected ${JSON.stringify(fx.expectAvailability)}`
      );
      continue;
    }
    findSizeAsserted++;
  }
  details.push(`findSize fixtures asserted: ${findSizeAsserted}`);
  if (findSizeAsserted < FINDSIZE_FIXTURES_FLOOR) {
    failures.push(`findSize fixtures asserted (${findSizeAsserted}) is below the floor of ${FINDSIZE_FIXTURES_FLOOR}`);
  }

  let whichSkyAsserted = 0;
  for (const fx of WHICHSKY_FIXTURES) {
    const result = whichSky(fx.mm, fx.kg, fx.level);
    if (!result || result.ok !== true) {
      failures.push(`whichSky(${fx.mm}, ${fx.kg}, "${fx.level}") returned ${JSON.stringify(result)}, expected ok:true`);
      continue;
    }
    if (
      !deepEqual(result.models, fx.expect.models) ||
      result.lengthBand !== fx.expect.lengthBand ||
      result.weightBand !== fx.expect.weightBand
    ) {
      failures.push(
        `whichSky(${fx.mm}, ${fx.kg}, "${fx.level}") returned ${JSON.stringify(result)}, expected ${JSON.stringify(fx.expect)}`
      );
      continue;
    }
    whichSkyAsserted++;
  }
  details.push(`whichSky fixtures asserted: ${whichSkyAsserted}`);
  if (whichSkyAsserted < WHICHSKY_FIXTURES_FLOOR) {
    failures.push(`whichSky fixtures asserted (${whichSkyAsserted}) is below the floor of ${WHICHSKY_FIXTURES_FLOOR}`);
  }

  // Ruling #602's lower-band-wins, asserted directly at the boundary: mm=240
  // and kg=36 each sit in TWO bands, and the answer must match the
  // lower-band cell (mm=220/kg=30's cell), not 240-265/36-45's.
  const boundary = whichSky(WHICHSKY_BOUNDARY.mm, WHICHSKY_BOUNDARY.kg, WHICHSKY_BOUNDARY.level);
  if (
    !boundary ||
    boundary.ok !== true ||
    !deepEqual(boundary.models, WHICHSKY_BOUNDARY.expect.models) ||
    boundary.lengthBand !== WHICHSKY_BOUNDARY.expect.lengthBand ||
    boundary.weightBand !== WHICHSKY_BOUNDARY.expect.weightBand
  ) {
    failures.push(
      `#602 lower-band-wins: whichSky(240, 36, "singles") returned ${JSON.stringify(boundary)}, expected ${JSON.stringify(WHICHSKY_BOUNDARY.expect)} (the LOWER band on both axes)`
    );
  }

  // Ruling #605: Aura snaps UP to the next published 5 mm row, never to the
  // nearest one, so the answer is never SHORTER than the measured foot.
  // Literals typed here, not derived from brand.range: a nearest-rounding
  // implementation answers 210 for 211 and 300 for 301, so each of these
  // fails loudly if the direction is ever reverted.
  const AURA_ROUNDING = [
    { raw: 211, expect: 215 },   // nearest would answer 210 -- 1 mm SHORTER than the foot
    { raw: 214, expect: 215 },
    { raw: 215, expect: 215 },   // an exact row stays put, it is not pushed to 220
    { raw: 251, expect: 255 },   // nearest would answer 250
    { raw: 207.5, expect: 210 }, // below the run still snaps UP to the first row
  ];
  let auraRoundingAsserted = 0;
  for (const fx of AURA_ROUNDING) {
    const r = findSize("aura", { mm: fx.raw });
    if (!r || r.ok !== true || r.row.mm !== fx.expect) {
      failures.push(
        `#605 round-up: findSize(aura, {mm:${fx.raw}}).row.mm is ${r && r.ok ? r.row.mm : JSON.stringify(r)}, expected ${fx.expect}`
      );
      continue;
    }
    if (r.row.mm < fx.raw) {
      failures.push(`#605 round-up: findSize(aura, {mm:${fx.raw}}) answered ${r.row.mm}, which is SHORTER than the foot`);
      continue;
    }
    auraRoundingAsserted++;
  }
  // and above the published run there is no higher row to snap up to, so it
  // is out-of-range rather than clamped down to 300 (which #605 forbids).
  const auraAbove = findSize("aura", { mm: 301 });
  if (!auraAbove || auraAbove.ok !== false || auraAbove.reason !== "out-of-range") {
    failures.push(`#605: findSize(aura, {mm:301}) returned ${JSON.stringify(auraAbove)}, expected ok:false reason:"out-of-range"`);
  }
  details.push(`#605 Aura round-up literals asserted: ${auraRoundingAsserted}`);
  if (auraRoundingAsserted < AURA_ROUNDING.length) {
    failures.push(`#605 round-up fixtures asserted (${auraRoundingAsserted}) is below the floor of ${AURA_ROUNDING.length}`);
  }
  // Sweep, not a spot check (#602's lesson): no raw length in the published
  // run may ever answer a row SHORTER than itself.
  const shortReads = [];
  for (let raw = 210; raw <= 300; raw += 0.5) {
    const r = findSize("aura", { mm: raw });
    if (r && r.ok === true && r.row.mm < raw) shortReads.push(`${raw}->${r.row.mm}`);
  }
  if (shortReads.length) {
    failures.push(`#605: ${shortReads.length} raw length(s) answered a SHORTER row, e.g. ${shortReads.slice(0, 4).join(", ")}`);
  } else {
    details.push(`#605 swept 181 raw lengths, none answered a shorter row`);
  }

  // VACUITY TRAP 3: a fallback gate that only checks `ok === false` passes
  // for every input, including valid ones, if the function is broken to
  // always fail. Assert the `reason` DISCRIMINATES: out-of-range, no-table
  // and unknown-brand each return their OWN reason, and (above) a valid
  // input returns ok:true.
  const outOfRange = findSize("chaya-sapphire", { mm: 990 });
  if (!outOfRange || outOfRange.ok !== false || outOfRange.reason !== "out-of-range") {
    failures.push(`findSize(chaya-sapphire, {mm:990}) returned ${JSON.stringify(outOfRange)}, expected ok:false reason:"out-of-range"`);
  }
  const unknownBrand = findSize("not-a-brand", { mm: 255 });
  if (!unknownBrand || unknownBrand.ok !== false || unknownBrand.reason !== "unknown-brand") {
    failures.push(`findSize(not-a-brand, {mm:255}) returned ${JSON.stringify(unknownBrand)}, expected ok:false reason:"unknown-brand"`);
  }
  const noTable = findSize("roll-line", { mm: 255 });
  if (!noTable || noTable.ok !== false || noTable.reason !== "no-table") {
    failures.push(`findSize(roll-line, {mm:255}) returned ${JSON.stringify(noTable)}, expected ok:false reason:"no-table"`);
  }
  // riedell/sure-grip are ALSO noTable -- confirm both, not just roll-line
  // (VACUITY TRAP 4 in the other direction: proving the picker's two
  // hand-off brands behave identically to the one named in the copy).
  const riedell = findSize("riedell", { mm: 255 });
  const sureGrip = findSize("sure-grip", { mm: 255 });
  if (!riedell || riedell.ok !== false || riedell.reason !== "no-table") {
    failures.push(`findSize(riedell, {mm:255}) returned ${JSON.stringify(riedell)}, expected ok:false reason:"no-table"`);
  }
  if (!sureGrip || sureGrip.ok !== false || sureGrip.reason !== "no-table") {
    failures.push(`findSize(sure-grip, {mm:255}) returned ${JSON.stringify(sureGrip)}, expected ok:false reason:"no-table"`);
  }
  const whichSkyOutOfRange = whichSky(100, 30, "singles");
  if (!whichSkyOutOfRange || whichSkyOutOfRange.ok !== false || whichSkyOutOfRange.reason !== "out-of-range") {
    failures.push(`whichSky(100, 30, "singles") returned ${JSON.stringify(whichSkyOutOfRange)}, expected ok:false reason:"out-of-range"`);
  }

  // --- BROWSER-DRIVEN: the page itself, mobile viewport -----------------
  await page.setViewportSize({ width: 390, height: 844 });

  // TRAP 10: the page must degrade honestly with JavaScript off. Check the
  // RAW HTML BYTES from disk, before the browser touches the page at all --
  // a gate that only ever measures post-JS state cannot tell a baked page
  // from an injected one.
  let staticHtml;
  try {
    staticHtml = readFileSync(join(DEMO_DIR, "size-finder.html"), "utf8");
  } catch (err) {
    failures.push(`STATIC: could not read size-finder.html from disk: ${err.message || err}`);
    staticHtml = "";
  }
  if (staticHtml) {
    const liveMatch = /data-finder-result><\/div>/.exec(staticHtml);
    if (!liveMatch) {
      failures.push(`STATIC: [data-finder-result] is not baked empty (expected an immediately self-closing "><...></div>")`);
    }
    const disciplineCount = (staticHtml.match(/data-finder-discipline="/g) || []).length;
    if (disciplineCount !== 4) {
      failures.push(`STATIC: ${disciplineCount} baked [data-finder-discipline] button(s) found, expected 4`);
    }
    const brandCount = (staticHtml.match(/data-finder-brand="/g) || []).length;
    if (brandCount !== 7) {
      failures.push(`STATIC: ${brandCount} baked [data-finder-brand] button(s) found, expected 7 (#603(1)/(2))`);
    }
    if (!staticHtml.includes('<script type="module" src="/decks/mels-skate-shop/demo/assets/finder.js">')) {
      failures.push(`STATIC: no root-absolute <script type="module" src="/decks/mels-skate-shop/demo/assets/finder.js"> tag found`);
    }
    // T16 ADJUDICATION FIX: ruling #600 requires the Aura branch to STATE
    // PLAINLY (to the skater, not just in a source comment) that Aura sizes
    // off a Brannock Suggested Size. Literal substring, independent of
    // sizes.json's own fittingRules text (trap 1) -- "Brannock" alone would
    // pass on an unrelated stray mention, so pin the full phrase.
    if (!staticHtml.includes("Brannock Suggested Size")) {
      failures.push(`STATIC: size-finder.html does not disclose the Brannock Suggested-Size gap (#600) -- expected the phrase "Brannock Suggested Size" baked into the page`);
    }
    // T16 ADJUDICATION FIX: the Kids & adjustable handoff panel must never
    // claim a measurement is "already in" a WhatsApp message it never
    // collected one for (#540). This is the STATIC fallback block only --
    // the genuine out-of-range runtime path carries this sentence via a
    // dataset attribute and is untouched.
    const fallbackBlockMatch = /data-finder-fallback hidden>([\s\S]*?)<\/div>/.exec(staticHtml);
    if (!fallbackBlockMatch) {
      failures.push(`STATIC: could not find the [data-finder-fallback] block to check for the false-measurement claim`);
    } else if (fallbackBlockMatch[1].includes("already has your measurement")) {
      failures.push(`STATIC: [data-finder-fallback] (the Kids & adjustable handoff) falsely claims a measurement is already in the message -- Kids collects none (#540)`);
    }
  }

  await page.goto(SIZE_FINDER_URL, { waitUntil: "load" });

  // VACUITY TRAP 5 (part 1) + TRAP 7: assert-empty -> act -> assert-content,
  // read BEFORE any interaction, in the load block.
  const resultRegion = page.locator("[data-finder-result]");
  const firstPaintText = ((await resultRegion.textContent()) ?? "").trim();
  if (firstPaintText !== "") {
    failures.push(`region: [data-finder-result] textContent on first paint was "${firstPaintText}", expected empty`);
  }
  const liveAttr = await resultRegion.getAttribute("aria-live");
  if (liveAttr !== "polite") {
    failures.push(`region: [data-finder-result] carries aria-live="${liveAttr}", expected "polite"`);
  }

  // VACUITY TRAP 9: every querySelectorAll needs its COUNT asserted before
  // its contents are.
  const disciplineButtons = page.locator("[data-finder-discipline]");
  const disciplineButtonCount = await disciplineButtons.count();
  if (disciplineButtonCount !== 4) {
    failures.push(`selector: [data-finder-discipline] matched ${disciplineButtonCount} button(s), expected 4`);
  }
  const brandButtons = page.locator("[data-finder-brand]");
  const brandButtonCount = await brandButtons.count();
  if (brandButtonCount !== 7) {
    failures.push(`selector: [data-finder-brand] matched ${brandButtonCount} button(s), expected 7`);
  }

  // --- drive the derby -> Chaya Sapphire -> mm=255 branch to a REAL result --
  await page.locator('[data-finder-discipline="derby"]').click();
  const brandWrapVisible = await page.locator("[data-finder-brand-wrap]").isVisible();
  if (!brandWrapVisible) {
    failures.push(`derby: brand picker did not become visible after selecting "derby"`);
  }
  await page.locator('[data-finder-brand="chaya-sapphire"]').click();
  const measureVisible = await page.locator("[data-finder-measure]").isVisible();
  if (!measureVisible) {
    failures.push(`chaya-sapphire: the measure step did not become visible after picking a table brand`);
  }
  await page.locator("[data-finder-mm]").fill("255");
  await page.locator("[data-finder-submit]").click();

  const resultText255 = ((await resultRegion.textContent()) ?? "").trim();
  // VACUITY TRAP 6: pin the FULL expected string, not "contains the model
  // name" -- chaya-sapphire mm=255 resolves to row {us:"8", uk:"6", mm:255}.
  if (!resultText255.includes("US SIZE") || !resultText255.includes("8") || !resultText255.includes("UK SIZE") || !resultText255.includes("6")) {
    failures.push(`result: chaya-sapphire mm=255 rendered "${resultText255}", expected it to contain US SIZE 8 and UK SIZE 6`);
  } else {
    details.push(`result region rendered a real chaya-sapphire result: "${resultText255.slice(0, 80)}..."`);
  }

  // TRAP 5: the rendered href, read from the real page after driving the
  // real flow -- NOT a hand-built string, and NOT asserted by calling
  // buildWhatsAppLink again (that would be trap 1 in another costume).
  // Assert against the DECODED "text=" QUERY PARAM ONLY, never the whole
  // href: the base "https://wa.me/27823706771" already contains an "8" (and
  // most other digits) from the phone number, so a bare `.includes("8")`
  // against the full href is vacuous -- it would still pass with the result
  // deleted from the message entirely. Demonstrated: negative control (c)
  // deleted the result from the composed message and this exact assertion,
  // written the naive way, kept passing; only checking the text= param
  // specifically, for the FULL "US SIZE 8"/"UK SIZE 6" substrings (not a
  // bare digit), catches it.
  const whatsappHref = await page.locator("[data-finder-whatsapp]").getAttribute("href");
  if (!whatsappHref || !whatsappHref.startsWith("https://wa.me/")) {
    failures.push(`whatsapp: href is "${whatsappHref}", expected it to start with "https://wa.me/"`);
  } else {
    const textParam = new URL(whatsappHref).searchParams.get("text") || "";
    if (!textParam.includes("255 mm")) {
      failures.push(`whatsapp: text= param does not contain the encoded measurement "255 mm" -- text: "${textParam}"`);
    }
    if (!textParam.includes("US SIZE 8") || !textParam.includes("UK SIZE 6")) {
      failures.push(`whatsapp: text= param does not contain the encoded result "US SIZE 8"/"UK SIZE 6" -- text: "${textParam}"`);
    }
    details.push(`whatsapp href text= param (decoded): "${textParam}"`);
  }

  // TRAP 6 (part 2): a DIFFERENT input must yield a DIFFERENT rendered
  // string -- reset via the discipline click (site's own resetDownstream)
  // and drive rio mm=220 instead.
  await page.locator('[data-finder-discipline="derby"]').click();
  await page.locator('[data-finder-brand="rio"]').click();
  await page.locator("[data-finder-mm]").fill("220");
  await page.locator("[data-finder-submit]").click();
  const resultText220 = ((await resultRegion.textContent()) ?? "").trim();
  if (resultText220 === resultText255) {
    failures.push(`result: rio mm=220 and chaya-sapphire mm=255 rendered the IDENTICAL string "${resultText220}" -- the mapping is not distinguishing inputs`);
  }
  if (!resultText220.includes("1") || !resultText220.includes("33")) {
    failures.push(`result: rio mm=220 rendered "${resultText220}", expected it to contain UK 1 and EU 33`);
  }

  // --- the Ice/Figure branch: drive Which Sky? to a real model, and the
  // no-table handoff for a picker brand that hands off. ---------------------
  await page.locator('[data-finder-discipline="ice"]').click();
  const skyVisible = await page.locator("[data-finder-sky]").isVisible();
  if (!skyVisible) {
    failures.push(`ice: the Which Sky? panel did not become visible after selecting "ice"`);
  }
  await page.locator("[data-finder-mm]").fill("250");
  await page.locator("[data-finder-sky-kg]").fill("50");
  await page.locator('[data-finder-jump="triples"]').click();
  await page.locator("[data-finder-submit]").click();
  const skyResultText = ((await resultRegion.textContent()) ?? "").trim();
  if (!skyResultText.includes("Sky 100")) {
    failures.push(`ice: mm=250/kg=50/triples rendered "${skyResultText}", expected it to contain "Sky 100"`);
  }

  // Ruling #606: a BLANK measurement box is not a measurement of zero.
  // Number("") is 0 and 0 is finite, so before #606 clicking submit with
  // nothing typed rendered a real out-of-range answer and composed a
  // WhatsApp message to Melony reading "my foot measures 0 mm". Asserted on
  // BOTH branches, and asserted on the composed href too -- a result region
  // that stays empty while the CTA quietly carries "0 mm" would still be
  // the defect.
  for (const [label, prep] of [
    ["derby", async () => {
      await page.locator('[data-finder-discipline="derby"]').click();
      await page.locator('[data-finder-brand="rio"]').click();
    }],
    ["ice", async () => {
      await page.locator('[data-finder-discipline="ice"]').click();
      await page.locator('[data-finder-jump="triples"]').click();
    }],
  ]) {
    await prep();
    await page.locator("[data-finder-mm]").fill("");
    await page.locator("[data-finder-submit]").click();
    const blankText = ((await resultRegion.textContent()) ?? "").trim();
    if (blankText !== "") {
      failures.push(`#606 ${label}: submitting a BLANK measurement rendered "${blankText}", expected the result region to stay empty`);
    }
    // whitespace must behave identically -- " " coerces to 0 the same way
    await page.locator("[data-finder-mm]").fill("   ");
    await page.locator("[data-finder-submit]").click();
    const spaceText = ((await resultRegion.textContent()) ?? "").trim();
    if (spaceText !== "") {
      failures.push(`#606 ${label}: submitting a WHITESPACE-ONLY measurement rendered "${spaceText}", expected the result region to stay empty`);
    }
    // and a real value still answers, so the guard has not simply killed the button
    await page.locator("[data-finder-mm]").fill("255");
    if (label === "ice") await page.locator("[data-finder-sky-kg]").fill("50");
    await page.locator("[data-finder-submit]").click();
    const realText = ((await resultRegion.textContent()) ?? "").trim();
    if (realText === "") {
      failures.push(`#606 ${label}: a REAL measurement of 255 mm rendered nothing -- the blank guard is swallowing valid input`);
    }
    const blankHref = await page.locator("[data-finder-whatsapp]").getAttribute("href");
    if (blankHref && (new URL(blankHref).searchParams.get("text") || "").includes("0 mm")) {
      failures.push(`#606 ${label}: the WhatsApp text= param still carries "0 mm" -- ${new URL(blankHref).searchParams.get("text")}`);
    }
  }
  details.push(`#606 blank + whitespace-only submits render nothing on both branches, a real value still answers`);

  await page.locator('[data-finder-discipline="artistic"]').click();
  const notableVisible = await page.locator("[data-finder-notable]").isVisible();
  if (!notableVisible) {
    failures.push(`artistic: the no-table handoff panel did not become visible (Roll-Line has no table, #506)`);
  }

  // T16 ADJUDICATION FIX: Kids & adjustable collects no measurement, so its
  // handoff panel must not claim one is already in the WhatsApp message.
  await page.locator('[data-finder-discipline="kids"]').click();
  const kidsFallbackVisible = await page.locator("[data-finder-fallback]").isVisible();
  if (!kidsFallbackVisible) {
    failures.push(`kids: the fallback handoff panel did not become visible after selecting "kids"`);
  }
  const kidsFallbackText = ((await page.locator("[data-finder-fallback]").textContent()) ?? "").trim();
  if (kidsFallbackText.includes("already has your measurement")) {
    failures.push(`kids: fallback panel falsely claims a measurement is already in the message: "${kidsFallbackText}"`);
  }
  const kidsHref = await page.locator("[data-finder-fallback-cta]").getAttribute("href");
  if (!kidsHref || !kidsHref.startsWith("https://wa.me/")) {
    failures.push(`kids: fallback CTA href is "${kidsHref}", expected it to start with "https://wa.me/"`);
  } else {
    const kidsText = new URL(kidsHref).searchParams.get("text") || "";
    if (/\d+\s*mm/.test(kidsText)) {
      failures.push(`kids: fallback CTA href text= falsely encodes a measurement that was never taken: "${kidsText}"`);
    }
  }

  // T16 ADJUDICATION FIX: a row with no value for a given scale (Atom's
  // usUnisexWider is null on most rows) must never render the literal word
  // "null" -- on screen or in the WhatsApp message -- and the row must
  // simply be absent, not present-but-empty (VACUITY TRAP 9: assert the
  // COUNT of rendered rows, not just that "null" is missing, since a
  // scale rendered as an empty string would also dodge a bare /null/
  // check while still under-counting).
  await page.locator('[data-finder-discipline="derby"]').click();
  await page.locator('[data-finder-brand="atom"]').click();
  await page.locator("[data-finder-mm]").fill("217");
  await page.locator("[data-finder-submit]").click();
  const atomResultText = ((await resultRegion.textContent()) ?? "").trim();
  if (/\bnull\b/i.test(atomResultText)) {
    failures.push(`atom: mm=217 rendered "${atomResultText}", contains the literal word "null" (row.usUnisexWider is null and must be dropped, not stringified, #540/#603(3))`);
  }
  if (!atomResultText.includes("36.5") || !atomResultText.includes("8.5")) {
    failures.push(`atom: mm=217 rendered "${atomResultText}", expected it to contain the EU 36.5 and 8.5" scales it DOES carry`);
  }
  const atomRowCount = await resultRegion.locator("table tbody tr").count();
  if (atomRowCount !== 4) {
    failures.push(`atom: mm=217 result table has ${atomRowCount} row(s), expected 4 (usWomens, inches, mm, eu -- usUnisexWider is null on this row and must be dropped)`);
  }
  const atomHref = await page.locator("[data-finder-whatsapp]").getAttribute("href");
  if (atomHref) {
    const atomTextParam = new URL(atomHref).searchParams.get("text") || "";
    if (/\bnull\b/i.test(atomTextParam)) {
      failures.push(`atom: whatsapp text= param contains the literal word "null": "${atomTextParam}"`);
    }
  }

  // T16 ADJUDICATION FIX: a reverse lookup (shoe size / owned skate) is not
  // a foot measurement -- the WhatsApp sentence must not say "my foot
  // measures UK SIZE 7" for one.
  await page.locator('[data-finder-discipline="derby"]').click();
  await page.locator('[data-finder-brand="chaya-emerald"]').click();
  await page.locator('[data-finder-altmode="shoe"]').click();
  await page.locator("[data-finder-scale]").selectOption("uk");
  await page.locator("[data-finder-scale-value]").fill("7");
  await page.locator("[data-finder-submit]").click();
  const reverseHref = await page.locator("[data-finder-whatsapp]").getAttribute("href");
  if (reverseHref) {
    const reverseText = new URL(reverseHref).searchParams.get("text") || "";
    if (reverseText.includes("my foot measures UK")) {
      failures.push(`reverse lookup: whatsapp text= falsely says "my foot measures" a shoe size: "${reverseText}"`);
    }
    if (!reverseText.includes("I gave the Size Finder UK")) {
      failures.push(`reverse lookup: whatsapp text= does not use the reverse-lookup stem: "${reverseText}"`);
    }
  }

  details.push(
    `#602 lower-band-wins boundary confirmed | 2 no-table reasons (roll-line/riedell/sure-grip) + out-of-range + unknown-brand all discriminated | static HTML baked honestly, discloses the Brannock gap, and Kids fallback carries no false measurement claim | live region empty on load | 3 distinct real results driven (chaya-sapphire, rio, atom with a null scale dropped) | reverse-lookup WhatsApp text does not misdescribe a shoe size as a foot measurement | WhatsApp href carries the real measurement and result | Ice/Which-Sky?, Artistic no-table and Kids fallback branches all driven`
  );
}

// --- registry ------------------------------------------------------------
// number -> { title, task, run(page) | null for "not yet implemented" }
// Ownership map (spec §7 group -> owning task):
// 1->T1, 2->T10+T17, 3->T11, 4->T8, 5->T16, 6->T15, 7->T13, 8->T10, 9->T10, 10->T10, 11->T11
const GROUPS = {
  1: {
    title: "Deck + all six demo clean URLs return 200 (rewrites work); .html twins also 200",
    task: "T1",
    run: groupCleanUrlsAndTwins,
  },
  2: {
    title:
      "Zero console errors/warnings, zero uncaught exceptions, zero failed/>=400 requests on every page; AC2: no form/action/method=post/fetch/XHR/sendBeacon/WebSocket/EventSource in any built page or assets/ file (static scan), and zero new requests fire on the page after clicking book-a-fitting's submit CTA (click-and-watch, listener armed post-navigation); composeBookingMessage() driven in plain Node against 14 hand-typed literal-expectation cases plus 4 structural checks (18 assertions, floor 17), backed by static-HTML checks on book-a-fitting.html and 4 browser assertions proving the real rendered CTA href matches the pure function's output",
    task: "T10+T17",
    run: groupZeroConsoleErrors,
  },
  3: {
    title:
      "Every href on every demo page resolves: internal 200 not-followed-redirect, external host allow-listed + present in manifest.links[] at status 200/manual-ok with a checkedAt date, banned hosts (maps/waze) rejected outright, mailto:/tel:/wa.me checked against contact.json, fragment targets resolved in the DOM, six per-page count floors, permanent 404 canary",
    task: "T11",
    run: groupLinkCrawl,
  },
  4: {
    title: "<!-- shared:header --> and <!-- shared:contact --> blocks are byte-identical across the five pages",
    task: "T8",
    run: groupSharedBlocksByteIdentical,
  },
  5: {
    title: "findSize()/whichSky() fixtures, including the out-of-range WhatsApp fallback",
    task: "T16",
    run: groupSizeFinder,
  },
  6: {
    title: "PDP: size selection, service checkbox total, instalments(), static price vs products.json",
    task: "T15",
    run: groupPdpInteractive,
  },
  7: {
    title:
      "Derby hub: 'In stock only' + the five decision cards narrow the grid (clicked, not just read); the result-count region updates and stays empty until the first interaction",
    task: "T13",
    run: groupDerbyFilters,
  },
  8: {
    title: "Mobile 390x844: no horizontal scroll; primary CTA tap targets >= 44px",
    task: "T10",
    run: groupMobileLayout,
  },
  9: {
    title:
      "Every <img> has non-empty alt matching img-alt.json, is not rendered wider than manifest.images[].width, and carries width/height matching its decoded natural size; TOTAL 34 across the five demo pages with exactly 6 eager (5x logo.webp + PDP aura-boot.webp) and 28 loading=\"lazy\" (asserted by name, including the four hidden roller-derby cards); exactly one <h1>; noindex meta on all six pages",
    task: "T10",
    run: groupImageAndDocHygiene,
  },
  10: {
    title: "Payload: each demo page <= 1.5MB transferred on a cold first load, printed for all six pages",
    task: "T10",
    run: groupPagePayload,
  },
  11: {
    title:
      "Chips <-> manifest, four assertions: A) manifest illustrative set == FROZEN_NINE (fixture pin, no DOM) B) every observed data-illustrative id is a manifest member, DOM -> manifest only (CHIPS_COMPLETE=1 tightens to full set-equality) C) a runtime render probe proves a chip would be visible at 390px D) every real observed chip is non-hidden with a non-zero box D2) every NON-INLINE chip host is measurably grown by its own pill, in width or in height",
    task: "T11",
    run: groupChipsManifest,
  },
};

function printTable(rows) {
  const grpW = 3;
  const taskW = 5;
  const statusW = 8;
  console.log("");
  console.log(`${"GRP".padEnd(grpW)} ${"TASK".padEnd(taskW)} ${"STATUS".padEnd(statusW)} TITLE`);
  console.log("-".repeat(100));
  for (const r of rows) {
    console.log(`${String(r.n).padEnd(grpW)} ${r.task.padEnd(taskW)} ${r.status.padEnd(statusW)} ${r.title}`);
    if (r.detail) {
      console.log(`    ${r.detail}`);
    }
  }
  console.log("");
}

// Some hosts (e.g. a Linux distro newer than Playwright's supported-OS list)
// refuse `playwright install`'s download step even though a close-enough
// chromium/headless-shell build is already cached locally from another
// project's Playwright version. Fall back to that rather than failing
// outright — normal hosts never reach this path.
function findFallbackChromiumExecutable() {
  const cacheDir = join(process.env.HOME ?? "", ".cache", "ms-playwright");
  if (!existsSync(cacheDir)) return null;
  const candidates = readdirSync(cacheDir)
    .filter((name) => name.startsWith("chromium_headless_shell-") || name.startsWith("chromium-"))
    // revision numbers, so 1243 beats 999 — a lexicographic sort gets this backwards
    .sort((a, b) => Number(b.match(/\d+/)?.[0] ?? 0) - Number(a.match(/\d+/)?.[0] ?? 0));
  for (const name of candidates) {
    const shell = join(cacheDir, name, "chrome-headless-shell-linux64", "chrome-headless-shell");
    if (existsSync(shell)) return shell;
    const full = join(cacheDir, name, "chrome-linux64", "chrome");
    if (existsSync(full)) return full;
  }
  return null;
}

async function launchChromium() {
  try {
    return await chromium.launch();
  } catch (err) {
    const fallback = findFallbackChromiumExecutable();
    if (!fallback) throw err;
    console.log(`note: pinned Playwright chromium build unavailable, falling back to ${fallback}`);
    return await chromium.launch({ executablePath: fallback });
  }
}

async function main() {
  if (only !== null) {
    const target = GROUPS[only];
    if (!target) {
      console.error(`--only=${only} is not a group; groups are 1-${Object.keys(GROUPS).length}`);
      process.exit(1);
    }
    if (!target.run) {
      console.error(`--only=${only} is owned by ${target.task} and is not implemented yet — nothing to run`);
      process.exit(1);
    }
  }

  const browser = await launchChromium();
  const page = await browser.newPage();

  const rows = [];
  let anyFail = false;

  const numbers = Object.keys(GROUPS)
    .map(Number)
    .sort((a, b) => a - b);

  for (const n of numbers) {
    const group = GROUPS[n];

    if (!group.run) {
      rows.push({
        n,
        task: group.task,
        title: group.title,
        status: "SKIPPED",
        detail: `owned by ${group.task}, not yet implemented`,
      });
      continue;
    }

    if (only !== null && n !== only) {
      rows.push({
        n,
        task: group.task,
        title: group.title,
        status: "SKIPPED",
        detail: `not selected (--only=${only})`,
      });
      continue;
    }

    try {
      const result = await group.run(page, browser);
      if (result.pass) {
        rows.push({ n, task: group.task, title: group.title, status: "PASS", detail: result.detail });
      } else {
        rows.push({ n, task: group.task, title: group.title, status: "FAIL", detail: result.detail });
        anyFail = true;
      }
    } catch (err) {
      rows.push({
        n,
        task: group.task,
        title: group.title,
        status: "FAIL",
        detail: `threw: ${err.message || err}`,
      });
      anyFail = true;
    }
  }

  await browser.close();

  printTable(rows);

  for (const r of rows) {
    if (r.status === "PASS") console.log(`GROUP ${r.n} PASS`);
    if (r.status === "FAIL") console.log(`GROUP ${r.n} FAIL: ${r.detail}`);
  }

  process.exit(anyFail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
