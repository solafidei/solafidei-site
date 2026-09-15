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
// Task 3 (this extension) adds the image layer: resolve source URLs from
// the ALREADY-CACHED Store API product records (spec §2.5 widest-srcset
// rule) and from the ALREADY-CACHED /size-chart/ HTML (the header logo —
// never a new page request for it), download each once through the same
// politeRequest() choke point under the <= 40-image budget, re-encode to
// WebP <= 150 KB with `sharp` (resolved transitively via createRequire from
// next's dependency tree — see resolveEncoder() below; ffmpeg on PATH is
// the documented fallback), and merge the results into manifest.json's
// images[] — the manifest is assembled by MERGE, never overwrite, so
// facts[] (task 6) and links[] (task 4) survive a --force re-run of this
// file.
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
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

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
const IMG_DIR = join(REPO_ROOT, "public/decks/mels-skate-shop/img"); // committed — spec §9 "commit the fetched fixtures"
const MAX_IMAGE_BYTES = 150 * 1024; // spec §2.5 / tasks/plan.md Task 3: every WebP <= 150 KB

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

// --- Task 3: image layer ----------------------------------------------------
//
// Spec §2.5 URL rule: take the widest srcset candidate; if there is no
// srcset, strip any "-WxH" / "_WxH@2x" uploads-path suffix to reach the
// original. Applied below against data already sitting in memory/cache —
// no second Store API or /size-chart/ request for any of it.

function stripSizeSuffix(url) {
  return url.replace(/[-_]\d+x\d+(?:@2x)?(\.[a-zA-Z0-9]+)$/, "$1");
}

function widestImageUrl(image) {
  const srcset = (image.srcset || "").trim();
  if (!srcset) return stripSizeSuffix(image.src);
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim())
    .map((entry) => {
      const m = entry.match(/^(\S+)\s+(\d+)w$/);
      return m ? { url: m[1], w: Number(m[2]) } : null;
    })
    .filter(Boolean);
  if (candidates.length === 0) return stripSizeSuffix(image.src);
  candidates.sort((a, b) => b.w - a.w);
  return candidates[0].url;
}

// The site logo is not in the Store API — it's in the header markup of the
// already-cached /size-chart/ page (task instructions: extract it from
// there, never issue a new page request for it). Verified live in this
// cache: `<img ... class="default-logo" src="…mels-skate-shop-2.png" …
// srcset="…mels-skate-shop-2.png 586w, …-300x184.png 300w">`.
function extractLogoImage(html) {
  const tagMatch = html.match(/<img[^>]*class="default-logo"[^>]*>/);
  if (!tagMatch) {
    throw new Error(
      'logo <img class="default-logo"> not found in cached size-chart.html — refusing to guess a logo URL (never invent a fact)',
    );
  }
  const tag = tagMatch[0];
  const srcMatch = tag.match(/\ssrc="([^"]+)"/);
  const srcsetMatch = tag.match(/\ssrcset="([^"]*)"/);
  if (!srcMatch) throw new Error("logo <img> found in size-chart.html but has no src attribute");
  return { src: srcMatch[1], srcset: srcsetMatch ? srcsetMatch[1] : "" };
}

// Binary counterpart to fetchJsonCached/fetchHtmlCached above — images need
// arrayBuffer(), not text(). Same cache-first, same politeRequest() choke
// point, same `kind: "image"` budget reservation.
async function fetchBinaryCached(url, cacheFile, label, kind) {
  const p = cachePath(cacheFile);
  if (existsSync(p)) {
    console.log(`[cache] ${label} <- .cache/mels-fixtures/${cacheFile}`);
    return readFileSync(p);
  }
  const res = await politeRequest(url, { kind });
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, buf);
  return buf;
}

// --- WebP re-encode: sharp (resolved transitively via createRequire from
// next's dependency tree — never added to package.json) with ffmpeg on
// PATH as the documented fallback. Loud failure if neither resolves —
// spec §9: never silently ship an un-re-encoded image.

let encoderChoice; // memoized: { kind: "sharp", sharp } | { kind: "ffmpeg" } | null

function resolveEncoder() {
  if (encoderChoice !== undefined) return encoderChoice;
  try {
    const req = createRequire(import.meta.url);
    const nextPkgPath = req.resolve("next/package.json");
    const nextRequire = createRequire(nextPkgPath);
    const sharp = nextRequire("sharp");
    encoderChoice = { kind: "sharp", sharp };
    return encoderChoice;
  } catch {
    // fall through to the ffmpeg fallback
  }
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    encoderChoice = { kind: "ffmpeg" };
  } catch {
    encoderChoice = null;
  }
  return encoderChoice;
}

async function encodeToWebpSharp(sharp, buffer, maxBytes) {
  const meta = await sharp(buffer).metadata();
  const width = meta.width; // the TRUE source pixel width — recorded regardless of any resize below
  let quality = 82;
  let out = await sharp(buffer).webp({ quality }).toBuffer();
  while (out.length > maxBytes && quality > 20) {
    quality -= 10;
    out = await sharp(buffer).webp({ quality }).toBuffer();
  }
  let resizeWidth = width;
  while (out.length > maxBytes && resizeWidth > 200) {
    resizeWidth = Math.round(resizeWidth * 0.85);
    out = await sharp(buffer).resize({ width: resizeWidth }).webp({ quality: 40 }).toBuffer();
  }
  return { buffer: out, width };
}

function ffmpegProbeWidth(inputPath) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width", "-of", "csv=p=0", inputPath,
  ]);
  return Number(out.toString().trim());
}

function encodeToWebpFfmpeg(buffer, maxBytes) {
  const tmpIn = join(tmpdir(), `mels-fixture-${randomUUID()}.img`);
  writeFileSync(tmpIn, buffer);
  const width = ffmpegProbeWidth(tmpIn); // TRUE source pixel width, recorded regardless of any resize below
  let quality = 5; // ffmpeg libwebp -q:v-equivalent scale used here via -quality (0 best .. 100 worst is NOT this API;
  // ffmpeg's webp encoder takes -qscale:v with lower = better/larger, so start low and increase to shrink)
  const tmpOut = join(tmpdir(), `mels-fixture-${randomUUID()}.webp`);
  function run(q, w) {
    const args = ["-y", "-i", tmpIn];
    if (w) args.push("-vf", `scale=${w}:-1`);
    args.push("-qscale:v", String(q), tmpOut);
    execFileSync("ffmpeg", args, { stdio: "ignore" });
    return readFileSync(tmpOut);
  }
  let out = run(quality);
  while (out.length > maxBytes && quality < 50) {
    quality += 5;
    out = run(quality);
  }
  let resizeWidth = width;
  while (out.length > maxBytes && resizeWidth > 200) {
    resizeWidth = Math.round(resizeWidth * 0.85);
    out = run(50, resizeWidth);
  }
  return { buffer: out, width };
}

async function encodeToWebp(buffer, maxBytes) {
  const encoder = resolveEncoder();
  if (!encoder) {
    throw new Error(
      "no WebP encoder available: sharp did not resolve via createRequire from next's dependency tree, " +
        "and ffmpeg is not on PATH (spec §9: never silently ship an un-re-encoded image)",
    );
  }
  if (encoder.kind === "sharp") {
    const { buffer: webp, width } = await encodeToWebpSharp(encoder.sharp, buffer, maxBytes);
    return { buffer: webp, width, encoder: "sharp" };
  }
  const { buffer: webp, width } = encodeToWebpFfmpeg(buffer, maxBytes);
  return { buffer: webp, width, encoder: "ffmpeg" };
}

// The explicit written spend against the <= 40 image budget (tasks/plan.md
// Task 3) — a declared constant, not an emergent side effect of a loop
// over every product image on the site:
//   - logo.webp (ruled #492)
//   - the Aura PDP gallery (spec §6.3.2): product 11919's own two images
//     (boot photo + model-selection chart) + the size guide, which lives on
//     the Sky 200 record (11941) per this task's explicit instruction
//   - Home's four in-stock derby heroes (§6.1.5: is_purchasable &&
//     is_in_stock, never is_in_stock alone — §2.3's trap; all 7 real
//     category-120 SKUs happen to be both, so 4 of the 7 are picked here)
//   - the derby grid's ~15 cards (§6.2.3): the 7 real category-120 SKUs
//     (4 already listed above as Home heroes, reused not re-downloaded)
//     + 8 derby-relevant Sets/Wheels & Bearings/Toe Stops SKUs
//   - the PDP's one image rail: Rail A (2 Ice Blades + 4 blade
//     guards/soakers from Ice Accessories). Rail B (the Sky 50/100/200
//     price ladder, spec §6.3.11) is text-only per spec — three prices,
//     no `store:<id>` image cited — and spec §6.3.2's gallery paragraph
//     for this same page states "No Sky 200 boot photo is used anywhere
//     on this page." An earlier revision of this file spent a budget slot
//     on product-11941.webp (Sky 200's own boot photo) for Rail B; that
//     was wrong — it contradicted the "no Sky 200 boot photo" sentence on
//     the very same PDP — and has been removed (Task 3 review
//     remediation, GitHub issue #20). Sky 50 and Sky 100 share Mel's own
//     "Aura.jpg" photo byte-for-byte per the Store API, so Rail B needs
//     no image fetch at all.
//   - whatever /size-chart/ exposes: verified live against this task's own
//     cache (grep, captured in this task's output) to expose the header
//     logo and nothing else Aura-related — see reported discrepancies
//
// DISCREPANCY (site content, not a script bug — reported in this task's
// output): aura-selection-chart.webp (product 11919 images[1],
// Aura-selection-pdf.jpg) and aura-size-guide.webp (product 11941
// images[1], Aura-Size-Guide-2026-kg-pdf.jpg) are two different WordPress
// attachment URLs on melsskateshop.co.za that resolve to byte-identical
// images. Both manifest.images[] entries below carry a `duplicate_of`
// flag pointing at the other so a later page-build task (the Aura PDP,
// spec §6.3.2's 3-image gallery) doesn't silently render the same picture
// twice under two different captions without knowing it.
const IMAGE_JOBS = [
  { file: "logo.webp", kind: "logo", from: "melsskateshop.co.za" },

  // Aura PDP gallery — 3 images
  { file: "aura-boot.webp", kind: "product", productId: 11919, imageIndex: 0, from: "store:11919" }, // boot photo, shared with Sky 50 (11905)
  { file: "aura-selection-chart.webp", kind: "product", productId: 11919, imageIndex: 1, from: "store:11919", extraFlags: ["duplicate_of:aura-size-guide.webp"] }, // model-selection chart — byte-identical to aura-size-guide.webp on Mel's own site, see DISCREPANCY above
  { file: "aura-size-guide.webp", kind: "product", productId: 11941, imageIndex: 1, from: "store:11941", extraFlags: ["duplicate_of:aura-selection-chart.webp"] }, // size guide — ruled: from 11941, not 11919; byte-identical to aura-selection-chart.webp, see DISCREPANCY above

  // Home in-stock heroes — 4 of the 7 category-120 SKUs
  { file: "product-2925.webp", kind: "product", productId: 2925, imageIndex: 0, from: "store:2925" }, // Chaya Ruby Hard Skates
  { file: "product-3726.webp", kind: "product", productId: 3726, imageIndex: 0, from: "store:3726" }, // Riedell R3 Derby
  { file: "product-5194.webp", kind: "product", productId: 5194, imageIndex: 0, from: "store:5194" }, // Sure-Grip Rebel Derby
  { file: "product-10351.webp", kind: "product", productId: 10351, imageIndex: 0, from: "store:10351" }, // Riedell R3 Black Roller Skate Set

  // Derby grid — remaining 3 of the 7 category-120 SKUs
  { file: "product-5030.webp", kind: "product", productId: 5030, imageIndex: 0, from: "store:5030" }, // Sure-Grip Phoenix Quad boot
  { file: "product-7696.webp", kind: "product", productId: 7696, imageIndex: 0, from: "store:7696" }, // Chaya Ruby Roller Derby Skate
  { file: "product-7827.webp", kind: "product", productId: 7827, imageIndex: 0, from: "store:7827" }, // Sure-Grip Avanti Plate

  // Derby grid — 8 derby-relevant Sets / Wheels & Bearings / Toe Stops SKUs
  { file: "product-2923.webp", kind: "product", productId: 2923, imageIndex: 0, from: "store:2923" }, // REKD Heavy Duty Triple pad set (Sets)
  { file: "product-7111.webp", kind: "product", productId: 7111, imageIndex: 0, from: "store:7111" }, // 187 Lizzie Armanto Pad Six Pack (Sets)
  { file: "product-11847.webp", kind: "product", productId: 11847, imageIndex: 0, from: "store:11847" }, // Wintersweet Protection Set (Sets)
  { file: "product-4368.webp", kind: "product", productId: 4368, imageIndex: 0, from: "store:4368" }, // Radar Presto 91a (Wheels — rink)
  { file: "product-8159.webp", kind: "product", productId: 8159, imageIndex: 0, from: "store:8159" }, // Radar Energy 78a (Wheels — tarmac)
  { file: "product-9565.webp", kind: "product", productId: 9565, imageIndex: 0, from: "store:9565" }, // Riedell Sonar Riva Wheels
  { file: "product-9571.webp", kind: "product", productId: 9571, imageIndex: 0, from: "store:9571" }, // Riedell Superball Toestop (Toe Stops)
  { file: "product-9656.webp", kind: "product", productId: 9656, imageIndex: 0, from: "store:9656" }, // Rio Roller Black Stoppers (Toe Stops)

  // PDP Rail A — compatible parts: 2 Ice Blades + 4 blade guards/soakers
  { file: "product-6395.webp", kind: "product", productId: 6395, imageIndex: 0, from: "store:6395" }, // John Wilson Ice Skate Blades
  { file: "product-6403.webp", kind: "product", productId: 6403, imageIndex: 0, from: "store:6403" }, // MK Ice Blades
  { file: "product-4901.webp", kind: "product", productId: 4901, imageIndex: 0, from: "store:4901" }, // SFR Two-piece Blade Guards
  { file: "product-7941.webp", kind: "product", productId: 7941, imageIndex: 0, from: "store:7941" }, // SFR Hockey Skate Guards
  { file: "product-9665.webp", kind: "product", productId: 9665, imageIndex: 0, from: "store:9665" }, // SFR Figure Blade Guards
  { file: "product-12043.webp", kind: "product", productId: 12043, imageIndex: 0, from: "store:12043" }, // SFR Blade Soaker

  // PDP Rail B — price ladder: text-only per spec (§6.3.11: three prices,
  // no store:<id> image), and spec §6.3.2 forbids a Sky 200 boot photo
  // anywhere on this page — see DISCREPANCY above. No image job here.
];

// Reserved, never fetched — spec §9's no-forms boundary means the live
// Roll-Line dealer-locator result (which shows nothing without a query)
// cannot be reached by this read-only script. Captured by the owner at
// CP1; this entry is the one manifest.images[] row with no file on disk.
const ROLL_LINE_RESERVED_ENTRY = {
  file: "roll-line-listing.webp",
  from: "roll-line.it",
  width: null,
  flags: ["pending-owner-capture"],
};

async function processImagePlan(products, sizeChartHtml) {
  mkdirSync(IMG_DIR, { recursive: true });
  const productById = new Map(products.map((p) => [p.id, p]));
  const logoImage = extractLogoImage(sizeChartHtml);

  const manifestImages = [];
  let encoderUsed = null;
  let downloadedCount = 0;
  let largestBytes = 0;

  for (const job of IMAGE_JOBS) {
    let sourceUrl;
    if (job.kind === "logo") {
      sourceUrl = widestImageUrl(logoImage);
    } else {
      const product = productById.get(job.productId);
      if (!product) {
        throw new Error(`image job "${job.file}": product ${job.productId} not found in products.json (never invent a fact)`);
      }
      const image = product.images && product.images[job.imageIndex];
      if (!image) {
        throw new Error(`image job "${job.file}": product ${job.productId} has no images[${job.imageIndex}]`);
      }
      sourceUrl = widestImageUrl(image);
    }

    // sourceUrl above is resolved from Store-API/srcset JSON content, not a
    // hardcoded literal — unlike the categories/product/size-chart calls,
    // where every URL is built from the ORIGIN constant. Assert the host
    // BEFORE issuing any request for it (politeRequest()'s own host check
    // only fires after fetch() already landed a response), so a future/
    // different API response naming an off-host URL is refused without
    // ever reaching the network (spec §9: no code path to any other host).
    const sourceUrlObj = new URL(sourceUrl);
    const sourceHost = sourceUrlObj.host;
    const allowedHost = new URL(ORIGIN).host;
    if (sourceHost !== allowedHost) {
      throw new Error(
        `image job "${job.file}": resolved source URL ${sourceUrl} is not on ${allowedHost} — refusing to fetch off-host (spec §9)`,
      );
    }

    const rawExt = (sourceUrlObj.pathname.match(/\.[a-zA-Z0-9]+$/) || [".bin"])[0];
    const rawCacheFile = `img-raw-${job.file.replace(/\.webp$/, "")}${rawExt}`;
    const beforeCount = requestCount;
    const raw = await fetchBinaryCached(sourceUrl, rawCacheFile, `image ${job.file} <- ${job.from}`, "image");
    if (requestCount > beforeCount) downloadedCount += 1;

    const { buffer: webp, width, encoder } = await encodeToWebp(raw, MAX_IMAGE_BYTES);
    encoderUsed = encoder;
    writeFileSync(join(IMG_DIR, job.file), webp);
    if (webp.length > largestBytes) largestBytes = webp.length;

    const flags = [];
    if (width < 800) flags.push("below_hero_floor");
    if (job.extraFlags) flags.push(...job.extraFlags);
    manifestImages.push({ file: job.file, from: job.from, width, flags });
  }

  manifestImages.push(ROLL_LINE_RESERVED_ENTRY);

  return { manifestImages, encoderUsed, downloadedCount, largestBytes, planned: IMAGE_JOBS.length };
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

  // Task 3 reads the HTML text (the header logo lives in it) — Task 2 only
  // cached the file and discarded the text.
  const sizeChartHtml = await fetchHtmlCached(sizeChartPlan.url, sizeChartPlan.cacheFile, sizeChartPlan.label);

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

  console.log(`\n--- Task 3: image layer (${IMAGE_JOBS.length} planned, <= ${MAX_IMAGES} budget) ---`);
  const { manifestImages, encoderUsed, downloadedCount, largestBytes, planned } = await processImagePlan(
    products,
    sizeChartHtml,
  );

  // Manifest is assembled by MERGE, never overwrite — facts[] (task 6) and
  // links[] (task 4) survive a --force re-run of this file; only images[]
  // is ours to replace.
  const existingManifest = existsSync(MANIFEST_JSON_PATH)
    ? JSON.parse(readFileSync(MANIFEST_JSON_PATH, "utf8"))
    : { facts: [], images: [], links: [] };
  const manifest = {
    facts: existingManifest.facts ?? [],
    images: manifestImages,
    links: existingManifest.links ?? [],
  };
  writeFileSync(MANIFEST_JSON_PATH, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`\nWrote ${PRODUCTS_JSON_PATH.replace(REPO_ROOT + "/", "")} (${products.length} products).`);
  console.log(
    `Wrote ${MANIFEST_JSON_PATH.replace(REPO_ROOT + "/", "")} ` +
      `(merged: facts=${manifest.facts.length}, images=${manifest.images.length}, links=${manifest.links.length}).`,
  );
  console.log(
    `Images: ${planned} planned, ${downloadedCount} newly downloaded this run, encoder=${encoderUsed ?? "n/a"}, ` +
      `largest webp=${largestBytes} bytes (cap ${MAX_IMAGE_BYTES} bytes).`,
  );
  console.log(`\nrequests issued: ${requestCount}`);
  console.log(`peak observed rate: ${peakRatePerSecond.toFixed(2)} req/s (limit ${MAX_REQUESTS_PER_SECOND.toFixed(2)} req/s)`);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exitCode = 1;
});
