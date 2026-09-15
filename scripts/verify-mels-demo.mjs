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

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? Number(onlyArg.slice("--only=".length)) : null;

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
    title: "Zero console errors or warnings on every page",
    task: "T10",
    run: null,
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
    run: null,
  },
  9: {
    title: "Every <img> has non-empty alt matching img-alt.json; exactly one <h1>; noindex meta",
    task: "T10",
    run: null,
  },
  10: {
    title: "Payload: each demo page <= 1.5MB transferred on first load",
    task: "T10",
    run: null,
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
      const result = await group.run(page);
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
