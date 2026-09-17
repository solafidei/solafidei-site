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
async function groupZeroConsoleErrors(page, browser) {
  const failures = [];

  await forEachSixPages(browser, null, async (p, { label, url }) => {
    const pageFailures = [];

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

  if (failures.length > 0) {
    return { pass: false, detail: failures.join("; ") };
  }
  return {
    pass: true,
    detail: `zero console errors/warnings, zero uncaught exceptions, zero failed/>=400 requests across ${SIX_PAGES.length} pages`,
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
function basenameFromSrc(src) {
  return src.split(/[?#]/)[0].split("/").pop();
}

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

  await forEachSixPages(browser, { width: 390, height: 844 }, async (p, { label, url }) => {
    try {
      await p.goto(url, { waitUntil: "load" });

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
// As of T13 that paragraph is stale in its premise and still correct in its
// conclusion. #570 repairs the premise rather than deleting the history:
// SIX data-illustrative elements now ship -- Home's 5 from T12 plus the derby
// hub's 1 section-level chip from T13 -- carrying TWO distinct ids
// (fit-guarantee, pjn-instalments) out of the manifest's nine. Full
// set-equality therefore STILL cannot pass until the remaining chips land in
// T14-T17, which is exactly what CHIPS_COMPLETE=1 below turns on. Both
// numbers are printed by this group's own detail line on every run (assertion
// B's id list, assertion D's element count), so they cannot go stale again
// without the output disagreeing with this comment in the same terminal.
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
    `D: ${visibleChipElementCount} real chip element(s) observed across ${DEMO_PAGES.length} pages, all visible`;
  return { pass: true, detail };
}

// --- registry ------------------------------------------------------------
// number -> { title, task, run(page) | null for "not yet implemented" }
// Ownership map (spec §7 group -> owning task):
// 1->T1, 2->T10, 3->T11, 4->T8, 5->T16, 6->T15, 7->T13, 8->T10, 9->T10, 10->T10, 11->T11
const GROUPS = {
  1: {
    title: "Deck + all six demo clean URLs return 200 (rewrites work); .html twins also 200",
    task: "T1",
    run: groupCleanUrlsAndTwins,
  },
  2: {
    title: "Zero console errors/warnings, zero uncaught exceptions, zero failed/>=400 requests on every page",
    task: "T10",
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
    run: null,
  },
  6: {
    title: "PDP: size selection, service checkbox total, instalments(), static price vs products.json",
    task: "T15",
    run: null,
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
    title: "Every <img> has non-empty alt matching img-alt.json and is not rendered wider than manifest.images[].width; exactly one <h1>; noindex meta on all six pages",
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
      "Chips <-> manifest, four assertions: A) manifest illustrative set == FROZEN_NINE (fixture pin, no DOM) B) every observed data-illustrative id is a manifest member, DOM -> manifest only (CHIPS_COMPLETE=1 tightens to full set-equality) C) a runtime render probe proves a chip would be visible at 390px D) every real observed chip is non-hidden with a non-zero box",
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
