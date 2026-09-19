#!/usr/bin/env node
// scripts/shoot-mels-demo.mjs — task 20 (issue #39), PR evidence screenshots.
//
// Throwaway Playwright script, same convention as scripts/verify-mels-demo.mjs:
// ESM, ad-hoc, never invoked at runtime, chromium-fallback shape copied
// verbatim from that file's findFallbackChromiumExecutable()/launchChromium()
// (this host has no pinned Playwright chromium build, only a cached one from
// another project's Playwright version).
//
// Captures SIX full-page screenshots at viewport 390x844 covering the deck
// placeholder and the five demo screens:
//   01-home.png          -> /decks/mels-skate-shop/demo
//   02-roller-derby.png  -> /decks/mels-skate-shop/demo/roller-derby
//   03-aura-sky-100.png  -> /decks/mels-skate-shop/demo/aura-sky-100 (AFTER a size is picked)
//   04-size-finder.png   -> /decks/mels-skate-shop/demo/size-finder (AFTER a real result is computed)
//   05-book-a-fitting.png-> /decks/mels-skate-shop/demo/book-a-fitting
//   06-deck.png          -> /decks/mels-skate-shop
//
// Every shot waits for BOTH `networkidle` and `document.fonts.ready` so type
// is never caught mid-swap. The PDP and Size Finder shots drive the real
// interactive modules (pdp.js / finder.js) and ASSERT the resulting DOM
// state (a non-empty availability line / a populated result region) before
// the shutter — a screenshot of an empty state that silently passes is
// exactly the failure mode this script exists to prevent. Every assertion
// throws on failure.
//
// Usage:
//   node scripts/shoot-mels-demo.mjs
//   node scripts/shoot-mels-demo.mjs --out public/decks/mels-skate-shop/.shots
//   BASE_URL=http://localhost:4031 node scripts/shoot-mels-demo.mjs
import { chromium } from "playwright";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, isAbsolute, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DECK = `${BASE}/decks/mels-skate-shop`;

const outArg = process.argv.find((a) => a.startsWith("--out="));
const outIdx = process.argv.indexOf("--out");
const OUT_DIR = outArg
  ? outArg.slice("--out=".length)
  : outIdx !== -1 && process.argv[outIdx + 1]
    ? process.argv[outIdx + 1]
    : "public/decks/mels-skate-shop/.shots";
const OUT_ABS = isAbsolute(OUT_DIR) ? OUT_DIR : join(REPO_ROOT, OUT_DIR);

// --- chromium fallback, copied verbatim from scripts/verify-mels-demo.mjs --
// (hard rule 8 of the T20 brief: copy this exact shape, do not invent one).
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

// Exact pixel dimensions from the PNG's own IHDR chunk (bytes 16-23), rather
// than trusting the page's CSS scrollWidth/scrollHeight, which can round
// differently from what Playwright actually rasterized.
function pngDimensions(path) {
  const buf = readFileSync(path);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function waitForStableFonts(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

// PDP interaction (issue #33's pdp.js): click the first [data-pdp-size]
// button, which sets [data-pdp-availability]'s text to
// STATES.leadTime(mm) — never blank. Assert it is non-empty before shooting.
async function driveAuraPdp(page) {
  const firstSize = page.locator("[data-pdp-size]").first();
  await firstSize.waitFor({ state: "visible" });
  await firstSize.click();
  const availability = page.locator("[data-pdp-availability]");
  const text = (await availability.textContent())?.trim() ?? "";
  if (!text) {
    throw new Error("PDP: [data-pdp-availability] is still empty after clicking a size — no availability line to show");
  }
  console.log(`  pdp availability: "${text}"`);
}

// Size Finder interaction (issue #33's finder.js, ice/Aura branch): pick
// discipline "ice" (auto-selects brand aura + reveals the sky panel), fill
// [data-finder-mm]=230 (210-240mm band) and [data-finder-sky-kg]=50
// (45-54kg band), pick jump level "singles", click submit. That combination
// is a real matrix row (finder.js selectionMatrix) so whichSky()/findSize()
// resolve ok:true and [data-finder-result] is populated — never a call with
// a blank field, which the module deliberately no-ops on (ruling #606).
async function driveSizeFinder(page) {
  await page.locator('[data-finder-discipline="ice"]').click();
  await page.locator("[data-finder-mm]").fill("230");
  await page.locator("[data-finder-sky-kg]").fill("50");
  await page.locator('[data-finder-jump="singles"]').click();
  await page.locator("[data-finder-submit]").click();
  const result = page.locator("[data-finder-result]");
  const text = (await result.textContent())?.trim() ?? "";
  if (!text) {
    throw new Error("Size Finder: [data-finder-result] is still empty after submitting a valid ice/Aura input");
  }
  console.log(`  finder result: "${text.replace(/\s+/g, " ").slice(0, 80)}"`);
}

// A fullPage screenshot never scrolls, so `loading="lazy"` images never enter
// the viewport and never load — they rasterize as sized-but-empty boxes. Flip
// them to eager and wait for every image to actually decode before the shutter.
async function forceLazyImages(page) {
  const forced = await page.evaluate(() => {
    const lazy = [...document.querySelectorAll('img[loading="lazy"]')];
    for (const img of lazy) img.loading = "eager";
    return lazy.length;
  });
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((i) => (i.complete && i.naturalWidth > 0 ? null : i.decode().catch(() => null))),
    ),
  );
  await page.waitForLoadState("networkidle");
  return forced;
}

const SHOTS = [
  { file: "01-home.png", url: `${DECK}/demo` },
  { file: "02-roller-derby.png", url: `${DECK}/demo/roller-derby` },
  { file: "03-aura-sky-100.png", url: `${DECK}/demo/aura-sky-100`, drive: driveAuraPdp },
  { file: "04-size-finder.png", url: `${DECK}/demo/size-finder`, drive: driveSizeFinder },
  { file: "05-book-a-fitting.png", url: `${DECK}/demo/book-a-fitting` },
  { file: "06-deck.png", url: `${DECK}` },
];

async function main() {
  mkdirSync(OUT_ABS, { recursive: true });

  const browser = await launchChromium();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

  try {
    for (const shot of SHOTS) {
      const page = await context.newPage();
      try {
        console.log(`shooting ${shot.file} <- ${shot.url}`);
        await page.goto(shot.url, { waitUntil: "networkidle" });
        await waitForStableFonts(page);
        if (shot.drive) {
          await shot.drive(page);
          // the interaction mutates the DOM (text, aria-pressed, hidden
          // toggles) — settle once more before the shutter.
          await waitForStableFonts(page);
        }
        // TWO capture-time overrides, both disclosed in the evidence note.
        //
        // (1) A fullPage raster never scrolls, so all but six of the images
        // T19 gave `loading="lazy"` (28 of the 34) never enter the viewport
        // and never load — the six that do are two on `02` and four on `03`.
        // Of the 22 that do not, four are roller-derby cards hidden in the
        // markup, which rasterize nothing at all; the other 18 rasterize as
        // the reserved-but-empty box their width/height attributes create,
        // so 9 of that page's 12 rasterizable product cards are grey
        // rectangles with a price under them. These PNGs become
        // prospect-facing deck slides in T22, so force the lazy images in and
        // WAIT for them to decode.
        // (2) A fullPage raster also cannot honestly place a `position: fixed`
        // overlay: Chromium bakes the mobile WhatsApp FAB
        // (demo/assets/site.css:898-917, `position: fixed` on :899, spec 6.6)
        // wherever it happens to sit — at the first viewport's foot on most
        // pages, and mid-document on the PDP, where the size click has
        // scrolled first. Either way it lands on top of body copy.
        // Re-anchoring is no better: `position:absolute;bottom:16px` resolves
        // against BODY and lands it at y=784 of a 10,620px document, still
        // over content. So it is hidden for the shutter only.
        // ponytail: capture-time overrides, not site changes — site.css ships unchanged.
        await page.addStyleTag({ content: ".whatsapp-fab{display:none!important}" });
        const unloaded = await forceLazyImages(page);
        const stillBlank = await page.evaluate(
          () => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
        );
        if (stillBlank.length) {
          throw new Error(
            `${shot.file}: ${stillBlank.length} image(s) would rasterize blank — ${stillBlank.join(", ")}`,
          );
        }
        console.log(`  forced ${unloaded} lazy image(s) in; 0 would rasterize blank`);
        const outPath = join(OUT_ABS, shot.file);
        await page.screenshot({ path: outPath, fullPage: true });
        const { size } = statSync(outPath);
        const { width, height } = pngDimensions(outPath);
        console.log(`  wrote ${outPath} (${size} bytes, ${width}x${height}px)`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\ndone: ${SHOTS.length} screenshots in ${OUT_ABS}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
