// Throwaway verification: Proof act (GSAP scrubbed reveals).
// Second-study columns, stats blocks, and quotes must be hidden below the
// fold and fully assembled once past their scrub windows. Desktop + mobile.
// Usage: node scripts/verify-proof-scene.mjs  (dev server running)
import { chromium } from "playwright";

const fail = (msg) => {
  console.error("FAIL:", msg);
  process.exitCode = 1;
};

const checkViewport = async (browser, viewport, label) => {
  const page = await browser.newPage({ viewport });
  await page.goto("http://localhost:3000/?splash=off", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async () => {
    const targets = {
      col: document.querySelector("[data-prf-col]"),
      stat: document.querySelector(".prf-stat"),
      quote: document.querySelector(".prf-quote"),
    };
    for (const [k, el] of Object.entries(targets))
      if (!el) return { error: `missing ${k}` };

    const place = async (el, frac) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top - window.innerHeight * frac));
      await new Promise((r) => setTimeout(r, 900));
    };

    const out = {};
    for (const [k, el] of Object.entries(targets)) {
      await place(el, 0.98);
      const hidden = +getComputedStyle(el).opacity;
      await place(el, 0.35);
      const shown = +getComputedStyle(el).opacity;
      out[k] = { hidden, shown };
    }
    return out;
  });

  console.log(label + ":", JSON.stringify(result));
  if (result.error) fail(`${label}: ${result.error}`);
  else {
    for (const [k, v] of Object.entries(result)) {
      if (!(v.hidden < 0.35))
        fail(`${label}: ${k} not hidden below fold (${v.hidden})`);
      if (!(v.shown > 0.95))
        fail(`${label}: ${k} not assembled in view (${v.shown})`);
    }
  }
  await page.close();
};

const run = async () => {
  const browser = await chromium.launch();
  await checkViewport(browser, { width: 1440, height: 900 }, "desktop");
  await checkViewport(browser, { width: 390, height: 844 }, "mobile");
  await browser.close();
  if (process.exitCode !== 1) console.log("PASS");
};

run();
