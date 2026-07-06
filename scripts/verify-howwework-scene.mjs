// Throwaway verification: "How we work" act — benefits cards + team rows
// scrub-reveal, and the Process pinned set piece still pins on desktop.
// Usage: node scripts/verify-howwework-scene.mjs  (dev server running)
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

  const result = await page.evaluate(async (isDesktop) => {
    const card = document.querySelector(".hww-card");
    const row = document.querySelector(".hww-row");
    if (!card || !row) return { error: "missing .hww-card / .hww-row" };

    const place = async (el, frac) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top - window.innerHeight * frac));
      await new Promise((r) => setTimeout(r, 900));
    };

    const out = {};
    for (const [k, el] of [
      ["card", card],
      ["row", row],
    ]) {
      await place(el, 0.99);
      const hidden = +getComputedStyle(el).opacity;
      await place(el, 0.4);
      const shown = +getComputedStyle(el).opacity;
      out[k] = { hidden, shown };
    }

    if (isDesktop) {
      // process set piece still pins (CSS sticky inside #about)
      const sticky = document.querySelector("#about .sticky");
      if (!sticky) return { ...out, error: "no .sticky in #about" };
      const wrapper = sticky.parentElement;
      const top = wrapper.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top + window.innerHeight * 1.5));
      await new Promise((r) => setTimeout(r, 900));
      out.stickyTop = Math.round(sticky.getBoundingClientRect().top);
    }
    return out;
  }, viewport.width >= 768);

  console.log(label + ":", JSON.stringify(result));
  if (result.error) fail(`${label}: ${result.error}`);
  else {
    for (const k of ["card", "row"]) {
      if (!(result[k].hidden < 0.35))
        fail(`${label}: ${k} not hidden below fold (${result[k].hidden})`);
      if (!(result[k].shown > 0.95))
        fail(`${label}: ${k} not assembled in view (${result[k].shown})`);
    }
    if (viewport.width >= 768 && Math.abs(result.stickyTop) > 2)
      fail(`${label}: process not pinned (sticky top ${result.stickyTop})`);
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
