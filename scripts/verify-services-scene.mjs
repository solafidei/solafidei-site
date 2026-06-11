// Throwaway verification: "What we build" scene (GSAP scrubbed reveals).
// Cards must be hidden while below the fold and fully assembled once they
// pass the scrub window; heading words rise with scroll. Desktop + mobile.
// Usage: node scripts/verify-services-scene.mjs  (dev server running)
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
    const card = document.querySelector(".svc-card");
    const word = document.querySelector(".svc-word");
    if (!card || !word) return { error: "missing .svc-card / .svc-word" };

    const place = async (el, viewportFrac) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top - window.innerHeight * viewportFrac));
      await new Promise((r) => setTimeout(r, 900));
    };

    // card below the fold → should still be in its from-state (hidden)
    await place(card, 0.97);
    const cardHidden = +getComputedStyle(card).opacity;

    // card well past the scrub window → fully assembled
    await place(card, 0.35);
    const cardShown = +getComputedStyle(card).opacity;
    const wordShown = +getComputedStyle(word).opacity;

    return { cardHidden, cardShown, wordShown };
  });

  console.log(label + ":", JSON.stringify(result));
  if (result.error) fail(`${label}: ${result.error}`);
  else {
    if (!(result.cardHidden < 0.35))
      fail(`${label}: card not hidden below fold (${result.cardHidden})`);
    if (!(result.cardShown > 0.95))
      fail(`${label}: card not assembled in view (${result.cardShown})`);
    if (!(result.wordShown > 0.95))
      fail(`${label}: heading word not revealed (${result.wordShown})`);
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
