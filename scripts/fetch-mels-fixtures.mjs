// scripts/fetch-mels-fixtures.mjs — Mel's Skate Shop fixture puller.
//
// One-shot, read-only pull of the WooCommerce Store API + `/size-chart/`
// from melsskateshop.co.za into a gitignored raw cache, then a deterministic
// public/decks/mels-skate-shop/demo/data/products.json + manifest.json
// scaffold. Spec: docs/specs/mels-skate-shop-pitch.md §9 is the hard
// boundary this file exists to satisfy — read it before editing this file.
//
// Tasks 3 (images) and 4 (outbound links) extend THIS file in place; they
// must run without re-pulling this task's JSON, which is why every raw
// response lands in the cache below before anything is derived from it.
//
// Politeness core (enforced here, in code — not by convention):
//   - This script's only network target is https://melsskateshop.co.za —
//     every URL fetched is built from ORIGIN below, from constants, never
//     from external input. There is no code path to any other host
//     (spec §9: never touch facebook.com — allow-list comment only).
//     politeRequest() follows redirects but asserts the final response URL's
//     host still equals ORIGIN's host before returning — a 3xx to any other
//     host (facebook.com included) is a hard failure, not silently followed.
//   - GET/HEAD only — politeRequest() refuses any other method before it
//     ever calls fetch(). Nothing here sends an Authorization header, and
//     nothing here reads or sets a cookie: fetch() below is called with no
//     credentials and no Cookie header, so there is no session and no jar.
//   - <= 2 requests/second: politeRequest() is the single choke point every
//     network call (including any future retry) must pass through, and it
//     awaits the throttle before every call — so the budget cannot be
//     bypassed by a caller that forgets to gate itself.
//   - Hard budgets (images, outbound link checks) are counted and enforced
//     BEFORE the request that would consume them is issued, threaded
//     through the same choke point: pass `kind: "image"` / `kind: "link"`
//     to politeRequest() (or fetchJsonCached()/fetchHtmlCached(), which
//     pass it through) and the matching reserve*Budget() runs first — a
//     caller cannot reach fetch() for an image/link without it.
//   - Raw response cache (gitignored, see .gitignore) so a --force re-run
//     still honours §9's "one pass": every request below is served from
//     cache when the cache file already exists.
//
// Usage:
//   node scripts/fetch-mels-fixtures.mjs --dry-run   # print the plan; 0 requests, 0 writes
//   node scripts/fetch-mels-fixtures.mjs             # no-op if products.json + manifest.json exist
//   node scripts/fetch-mels-fixtures.mjs --force     # (re-)run; served from cache wherever cached

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const ORIGIN = "https://melsskateshop.co.za";
const STORE_API = `${ORIGIN}/wp-json/wc/store/v1`;
const SIZE_CHART_URL = `${ORIGIN}/size-chart/`;

const USER_AGENT =
  "SolafideiColdPitchFixturePuller/1.0 (+https://solafidei.com; one-off read-only research pull for an unsolicited pitch demo; no login, no forms, GET/HEAD only, <=2 req/s)";

const ALLOWED_METHODS = new Set(["GET", "HEAD"]); // spec §9: read-only public GET and HEAD only

const MAX_REQUESTS_PER_SECOND = 2;
const MIN_REQUEST_INTERVAL_MS = 1000 / MAX_REQUESTS_PER_SECOND;

// Hard budgets. This task fetches neither images nor outbound links, but
// the counters belong in the core so Tasks 3/4 (extending this same file)
// inherit an enforced ceiling instead of adding their own.
const MAX_IMAGES = 40;
const MAX_OUTBOUND_LINK_CHECKS = 10;
let imageDownloadCount = 0;
let outboundLinkCheckCount = 0;

// Called from politeRequest() itself (via the `kind` option) — not by
// convention from Task 3/4 call sites — so the ceiling can't be skipped by
// a caller that forgets to reserve budget before fetching.
function reserveImageBudget(n = 1) {
  imageDownloadCount += n;
  if (imageDownloadCount > MAX_IMAGES) {
    throw new Error(`image budget exceeded: ${imageDownloadCount} > ${MAX_IMAGES} (spec §9)`);
  }
}

function reserveOutboundLinkCheckBudget(n = 1) {
  outboundLinkCheckCount += n;
  if (outboundLinkCheckCount > MAX_OUTBOUND_LINK_CHECKS) {
    throw new Error(
      `outbound-link-check budget exceeded: ${outboundLinkCheckCount} > ${MAX_OUTBOUND_LINK_CHECKS} (spec §9)`,
    );
  }
}

const DEMO_DATA_DIR = join(REPO_ROOT, "public/decks/mels-skate-shop/demo/data");
const PRODUCTS_JSON_PATH = join(DEMO_DATA_DIR, "products.json");
const MANIFEST_JSON_PATH = join(DEMO_DATA_DIR, "manifest.json");
const CACHE_DIR = join(REPO_ROOT, ".cache/mels-fixtures"); // gitignored — see .gitignore

// Category ids, verified live against melsskateshop.co.za on 2026-09-14
// while building this task (GET /products/categories). Three are also
// named directly in tasks/plan.md's Task 2 description (Roller Derby 120,
// Ice Blades 246) or docs/specs/mels-skate-shop-pitch.md §2.15 (Ice Skates
// 98); the rest are discovered here rather than guessed — see the
// DISCREPANCY note below the EXPECTED_CATEGORIES table.
const CATEGORY_IDS = {
  rollerDerby: 120,
  iceSkates: 98,
  iceBlades: 246,
  iceAccessories: 234,
  sets: 151,
  wheelsAndBearings: 96,
  toeStops: 202,
};

// §2.15 pins 13 live category counts. This is a STOP, not a fixup: if any
// differs, the script exits non-zero naming the drift and writes nothing.
// `name` is the Store API's actual `name` field (not spec's shorthand
// prose label) so the check is exact, not fuzzy.
//
// DISCREPANCY (reported in this task's output, not silently resolved):
// tasks/plan.md's Task 2 description writes "Sets (27), Wheels & Bearings
// (38), Toe Stops (17)" in the same "Name (N)" shape it uses for "category
// 120" — but live-checking confirms those three numbers are §2.15's
// COUNTS for those categories, not their ids. The real ids (discovered via
// GET /products/categories, not guessed) are Sets=151, Wheels and
// Bearings=96, Toe Stops/Jam plugs=202. Using 27/38/17 as ids would have
// silently pulled three unrelated categories (id 27, 38, 17 are not these
// categories at all).
const EXPECTED_CATEGORIES = [
  { id: 114, name: "Roller Skates", expectedCount: 98 },
  { id: 116, name: "Artistic Roller Skates", expectedCount: 48 },
  { id: 119, name: "Recreational Roller Skates", expectedCount: 71 },
  { id: 163, name: "Adjustable Roller Skates", expectedCount: 17 },
  { id: 117, name: "Available in smaller/kids sizes", expectedCount: 30 },
  { id: CATEGORY_IDS.rollerDerby, name: "Roller Derby", expectedCount: 8 },
  { id: CATEGORY_IDS.iceSkates, name: "Ice Skates", expectedCount: 35 },
  { id: CATEGORY_IDS.iceBlades, name: "Ice Blades", expectedCount: 2 },
  { id: CATEGORY_IDS.iceAccessories, name: "Ice Accessories", expectedCount: 10 },
  { id: 150, name: "Inline Skates", expectedCount: 28 },
  { id: CATEGORY_IDS.sets, name: "Sets", expectedCount: 27 },
  { id: CATEGORY_IDS.wheelsAndBearings, name: "Wheels and Bearings", expectedCount: 38 },
  { id: CATEGORY_IDS.toeStops, name: "Toe Stops/Jam plugs", expectedCount: 17 },
];

// id 11938 = "Aura Sky 100 Ice Skate Boot Black": a WooCommerce duplicate of
// 11919 (slug ends -white-copy; its only boot photo is the Sky 200's at
// 220px — spec §2.1). Filtered out of every product bucket below,
// regardless of which fetched category surfaces it, and recorded here so
// the exclusion is machine-readable in products.json's `excluded[]`.
const EXCLUDED_PRODUCTS = [
  {
    id: 11938,
    reason:
      "WooCommerce duplicate of 11919 — slug ends -white-copy, only boot photo is the Sky 200's at 220px",
    source: "docs/specs/mels-skate-shop-pitch.md §2.1",
  },
];
const EXCLUDED_PRODUCT_IDS = new Set(EXCLUDED_PRODUCTS.map((p) => p.id));

// Alphabetical — this is also the exact §5 field list (ten names; §5 and
// the field list are one and the same set here, see the DISCREPANCY note
// in main()). Sorted so every product object is key-sorted deterministically.
const PRODUCT_FIELDS = [
  "categories",
  "id",
  "images",
  "is_in_stock",
  "is_purchasable",
  "name",
  "permalink",
  "prices",
  "slug",
  "stock_availability",
];

function pickProductFields(raw) {
  const out = {};
  for (const key of PRODUCT_FIELDS) out[key] = raw[key];
  return out;
}

// --- politeness core ------------------------------------------------------

let requestCount = 0;
let lastRequestStartedAt = 0;
let lastLoggedAt = null;
let peakRatePerSecond = 0;
const requestLog = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Single choke point for every network call this script (or a future
// retry) makes. Nothing below calls fetch() directly.
//
// `kind: "image" | "link"` reserves the matching hard budget (spec §9)
// before the request is issued; omit it for the categories/product/
// size-chart calls this task itself makes, which aren't budgeted.
async function politeRequest(url, { method = "GET", accept, kind } = {}) {
  if (!ALLOWED_METHODS.has(method)) {
    throw new Error(`refused: only GET/HEAD are allowed (spec §9), got ${method}`);
  }
  if (kind === "image") reserveImageBudget();
  else if (kind === "link") reserveOutboundLinkCheckBudget();
  const now = Date.now();
  if (lastRequestStartedAt !== 0) {
    const elapsed = now - lastRequestStartedAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
    }
  }
  const startedAt = Date.now();
  lastRequestStartedAt = startedAt;

  const res = await fetch(url, {
    method,
    headers: {
      "User-Agent": USER_AGENT,
      ...(accept ? { Accept: accept } : {}),
    },
    redirect: "follow",
  });

  requestCount += 1;
  const intervalMs = lastLoggedAt === null ? null : startedAt - lastLoggedAt;
  lastLoggedAt = startedAt;
  const rate = intervalMs && intervalMs > 0 ? 1000 / intervalMs : null;
  if (rate !== null && rate > peakRatePerSecond) peakRatePerSecond = rate;

  const entry = { n: requestCount, method, url, status: res.status, intervalMs, rate };
  requestLog.push(entry);
  console.log(
    `[${entry.n}] ${method} ${url} -> ${res.status}` +
      (rate !== null ? ` (${intervalMs}ms since previous request, ${rate.toFixed(2)} req/s)` : ""),
  );

  // redirect: "follow" above means a 3xx from melsskateshop.co.za would
  // otherwise be silently followed wherever it points — assert the landed
  // response is still on ORIGIN's exact host (not a startsWith prefix
  // check, which "melsskateshop.co.za.evil.example" would pass) before
  // trusting anything about it. Never touch facebook.com (spec §9) is
  // enforced here, not by hoping the server behaves.
  const finalHost = new URL(res.url).host;
  const allowedHost = new URL(ORIGIN).host;
  if (finalHost !== allowedHost) {
    throw new Error(
      `refused: response left ${allowedHost} — landed on ${res.url} (spec §9: no code path to any other host)`,
    );
  }

  if (!res.ok) {
    throw new Error(`${method} ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res;
}

function cachePath(cacheFile) {
  return join(CACHE_DIR, cacheFile);
}

async function fetchJsonCached(url, cacheFile, label, kind) {
  const p = cachePath(cacheFile);
  if (existsSync(p)) {
    console.log(`[cache] ${label} <- .cache/mels-fixtures/${cacheFile}`);
    return JSON.parse(readFileSync(p, "utf8"));
  }
  const res = await politeRequest(url, { accept: "application/json", kind });
  const text = await res.text();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
  return JSON.parse(text);
}

async function fetchHtmlCached(url, cacheFile, label, kind) {
  const p = cachePath(cacheFile);
  if (existsSync(p)) {
    console.log(`[cache] ${label} <- .cache/mels-fixtures/${cacheFile}`);
    return readFileSync(p, "utf8");
  }
  const res = await politeRequest(url, { accept: "text/html", kind });
  const text = await res.text();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
  return text;
}

// --- request plan (shared by --dry-run and the real run) -----------------

const CATEGORY_PRODUCTS_PER_PAGE = 50; // > the largest target category (Wheels and Bearings, 38) — one request, not ten

function buildRequestPlan() {
  return [
    {
      url: `${STORE_API}/products/categories?per_page=100`,
      cacheFile: "categories.json",
      label: "product categories (§2.15 drift check + category ids)",
      kind: "json",
    },
    {
      url: `${STORE_API}/products/11919`,
      cacheFile: "product-11919.json",
      label: "Aura Sky 100 Ice Skate Boot White (the PDP)",
      kind: "json",
    },
    {
      url: `${STORE_API}/products/11941`,
      cacheFile: "product-11941.json",
      label: "Aura Sky 200 (carries the size-guide image, Task 3)",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.iceSkates}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-98-ice-skates.json",
      label: "Ice Skates category (Sky 50 discovery + 11938 exclusion check)",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.rollerDerby}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-120-roller-derby.json",
      label: "Roller Derby category (8 SKUs)",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.sets}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-151-sets.json",
      label: "Sets category",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.wheelsAndBearings}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-96-wheels-and-bearings.json",
      label: "Wheels and Bearings category",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.toeStops}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-202-toe-stops.json",
      label: "Toe Stops/Jam plugs category",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.iceBlades}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-246-ice-blades.json",
      label: "Ice Blades category (2 SKUs)",
      kind: "json",
    },
    {
      url: `${STORE_API}/products?category=${CATEGORY_IDS.iceAccessories}&per_page=${CATEGORY_PRODUCTS_PER_PAGE}`,
      cacheFile: "category-234-ice-accessories.json",
      label: "Ice Accessories category",
      kind: "json",
    },
    {
      url: SIZE_CHART_URL,
      cacheFile: "size-chart.html",
      label: "/size-chart/ raw HTML (cache only — not parsed this task, spec §2.4)",
      kind: "html",
    },
  ];
}

// --- §2.15 drift check -----------------------------------------------------

function checkCategoryDrift(categoriesResponse) {
  const byId = new Map(categoriesResponse.map((c) => [c.id, c]));
  const rows = EXPECTED_CATEGORIES.map((exp) => {
    const actual = byId.get(exp.id);
    const actualName = actual ? actual.name : null;
    const actualCount = actual ? actual.count : null;
    return {
      id: exp.id,
      expectedName: exp.name,
      expectedCount: exp.expectedCount,
      actualName,
      actualCount,
      ok: actual !== undefined && actualName === exp.name && actualCount === exp.expectedCount,
    };
  });
  return { rows, drifted: rows.filter((r) => !r.ok) };
}

function printDriftTable(rows) {
  console.log("\n§2.15 category-count check (live vs spec):");
  console.log("id".padEnd(5) + "expected".padEnd(38) + "actual".padEnd(38) + "status");
  for (const r of rows) {
    const expected = `${r.expectedName} (${r.expectedCount})`;
    const actual = r.actualName === null ? "MISSING" : `${r.actualName} (${r.actualCount})`;
    console.log(String(r.id).padEnd(5) + expected.padEnd(38) + actual.padEnd(38) + (r.ok ? "OK" : "DRIFT"));
  }
}

// --- Sky 50 discovery (do not guess the id — spec) --------------------------

function pickSky50(iceSkatesProducts) {
  const candidates = iceSkatesProducts.filter((p) => /sky\s*50/i.test(p.name));
  const nonBlack = candidates.filter((p) => !/black/i.test(p.name) && !/black/i.test(p.slug));
  if (nonBlack.length !== 1) {
    throw new Error(
      `Sky 50 discovery ambiguous in Ice Skates (${CATEGORY_IDS.iceSkates}): ` +
        `${candidates.length} "Sky 50" match(es), ${nonBlack.length} non-black. Expected exactly one. ` +
        `Candidates: ${JSON.stringify(candidates.map((p) => ({ id: p.id, name: p.name, slug: p.slug })))}`,
    );
  }
  return nonBlack[0];
}

// --- output shaping ---------------------------------------------------------

function sortProducts(products) {
  const byId = new Map();
  for (const p of products) {
    if (EXCLUDED_PRODUCT_IDS.has(p.id)) continue; // 11938 leaks nowhere, regardless of source bucket
    byId.set(p.id, p); // de-dupe products cross-listed in more than one fetched category
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

// --- main --------------------------------------------------------------------

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForce = args.includes("--force");

async function main() {
  const plan = buildRequestPlan();

  if (isDryRun) {
    console.log("Mel's Skate Shop fixture fetch — DRY RUN (no network requests, no filesystem writes)\n");
    console.log(`Ordered request plan (${plan.length} requests):`);
    plan.forEach((r, i) => {
      console.log(`  ${i + 1}. GET ${r.url}`);
      console.log(`     -> ${r.label}`);
    });
    console.log(`\nRate limit in force: <= ${MAX_REQUESTS_PER_SECOND} req/s.`);
    console.log(
      `Hard budgets in force (unused by this task): <= ${MAX_IMAGES} images, <= ${MAX_OUTBOUND_LINK_CHECKS} outbound link checks.`,
    );
    console.log(`\nrequests issued: 0`);
    return;
  }

  if (!isForce && existsSync(PRODUCTS_JSON_PATH) && existsSync(MANIFEST_JSON_PATH)) {
    console.log(
      `${PRODUCTS_JSON_PATH}\nand\n${MANIFEST_JSON_PATH}\nalready exist — no-op (pass --force to re-run; ` +
        `spec §9 allows one pass, so a --force re-run still serves from the raw cache wherever it is valid).`,
    );
    console.log(`requests issued: 0`);
    return;
  }

  mkdirSync(CACHE_DIR, { recursive: true });

  const [categoriesPlan, p11919Plan, p11941Plan, iceSkatesPlan, derbyPlan, setsPlan, wheelsPlan, toeStopsPlan, iceBladesPlan, iceAccessoriesPlan, sizeChartPlan] =
    plan;

  const categoriesRaw = await fetchJsonCached(categoriesPlan.url, categoriesPlan.cacheFile, categoriesPlan.label);
  const { rows, drifted } = checkCategoryDrift(categoriesRaw);
  printDriftTable(rows);

  if (drifted.length > 0) {
    console.error(
      `\nCATEGORY COUNT DRIFT — ${drifted.length}/${rows.length} of spec §2.15's pinned categories no longer ` +
        `match the live site. Writing nothing. This is a STOP, not a fixup — do not edit the spec's numbers.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(`\nAll ${rows.length} §2.15 category counts verified live. Continuing.\n`);

  const p11919 = pickProductFields(await fetchJsonCached(p11919Plan.url, p11919Plan.cacheFile, p11919Plan.label));
  const p11941 = pickProductFields(await fetchJsonCached(p11941Plan.url, p11941Plan.cacheFile, p11941Plan.label));

  const iceSkatesProducts = await fetchJsonCached(iceSkatesPlan.url, iceSkatesPlan.cacheFile, iceSkatesPlan.label);
  const pSky50 = pickProductFields(pickSky50(iceSkatesProducts));

  const derby120 = (await fetchJsonCached(derbyPlan.url, derbyPlan.cacheFile, derbyPlan.label)).map(pickProductFields);
  const sets = (await fetchJsonCached(setsPlan.url, setsPlan.cacheFile, setsPlan.label)).map(pickProductFields);
  const wheels = (await fetchJsonCached(wheelsPlan.url, wheelsPlan.cacheFile, wheelsPlan.label)).map(pickProductFields);
  const toeStops = (await fetchJsonCached(toeStopsPlan.url, toeStopsPlan.cacheFile, toeStopsPlan.label)).map(
    pickProductFields,
  );
  const iceBlades = (await fetchJsonCached(iceBladesPlan.url, iceBladesPlan.cacheFile, iceBladesPlan.label)).map(
    pickProductFields,
  );
  const iceAccessories = (
    await fetchJsonCached(iceAccessoriesPlan.url, iceAccessoriesPlan.cacheFile, iceAccessoriesPlan.label)
  ).map(pickProductFields);

  await fetchHtmlCached(sizeChartPlan.url, sizeChartPlan.cacheFile, sizeChartPlan.label); // cache only, not parsed this task

  const products = sortProducts([
    p11919,
    p11941,
    pSky50,
    ...derby120,
    ...sets,
    ...wheels,
    ...toeStops,
    ...iceBlades,
    ...iceAccessories,
  ]);

  mkdirSync(DEMO_DATA_DIR, { recursive: true });
  writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify({ products, excluded: EXCLUDED_PRODUCTS }, null, 2) + "\n");
  writeFileSync(MANIFEST_JSON_PATH, JSON.stringify({ facts: [], images: [], links: [] }, null, 2) + "\n");

  console.log(`\nWrote ${PRODUCTS_JSON_PATH.replace(REPO_ROOT + "/", "")} (${products.length} products).`);
  console.log(`Wrote ${MANIFEST_JSON_PATH.replace(REPO_ROOT + "/", "")} (scaffold).`);
  console.log(`\nrequests issued: ${requestCount}`);
  console.log(`peak observed rate: ${peakRatePerSecond.toFixed(2)} req/s (limit ${MAX_REQUESTS_PER_SECOND.toFixed(2)} req/s)`);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exitCode = 1;
});
