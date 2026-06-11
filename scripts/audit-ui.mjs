// Throwaway audit: console errors, horizontal overflow, heading order,
// img alt, focusable count, reduced-motion render. All viewports.
import { chromium } from "playwright";

const run = async () => {
  const browser = await chromium.launch();
  for (const width of [320, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 160)));
    await page.goto("http://localhost:3000/?splash=off", { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    // scroll through the page to trigger all scenes
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
    });
    await page.waitForTimeout(800);
    const checks = await page.evaluate(() => {
      const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
      let skip = false;
      for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skip = true;
      return {
        hOverflow: document.documentElement.scrollWidth - innerWidth,
        h1Count: document.querySelectorAll("h1").length,
        headingSkip: skip,
        imgsNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.alt).length,
        focusable: document.querySelectorAll("a[href],button,input,textarea,[tabindex]").length,
      };
    });
    console.log(width, JSON.stringify({ ...checks, consoleErrors: errors.slice(0, 5) }));
    await page.close();
  }
  // reduced-motion: content must be visible without any scroll
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto("http://localhost:3000/?splash=off", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const rm = await page.evaluate(() => {
    const sel = [".hero-word", ".svc-card", ".prf-quote", ".hww-card", ".talk-faq", "[data-talk-cta]"];
    return Object.fromEntries(
      sel.map((s) => [s, +getComputedStyle(document.querySelector(s)).opacity])
    );
  });
  console.log("reduced-motion:", JSON.stringify(rm));
  await browser.close();
};
run();
