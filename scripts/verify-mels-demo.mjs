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
    title: "Every href on every demo page resolves (internal 200, external allow-listed + manifest.links[])",
    task: "T11",
    run: null,
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
    title: "Derby hub: 'In stock only' + filters narrow the grid; result-count region updates",
    task: "T13",
    run: null,
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
    title: "data-illustrative chip ids == manifest.facts[] ids with source: illustrative; chips visible at 390px",
    task: "T11",
    run: null,
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
