// Throwaway verification: hero Arrive scene (GSAP ScrollTrigger).
// Desktop: hero must be pinned (pin-spacer), headline words scatter/fade and
// watermark surfaces mid-scrub. Mobile: no pin, content drifts and fades.
// Usage: node scripts/verify-hero-scene.mjs  (dev server must be running)
import { chromium } from "playwright";

const fail = (msg) => {
  console.error("FAIL:", msg);
  process.exitCode = 1;
};

const run = async () => {
  const browser = await chromium.launch();

  // ---- desktop ----
  {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto("http://localhost:3000/?splash=off", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2500); // let the entrance finish

    const result = await page.evaluate(async () => {
      const section = document.querySelector("#home");
      if (!section) return { error: "no #home section" };
      const spacer = section.closest(".pin-spacer");
      if (!spacer)
        return { error: "hero not pinned (no .pin-spacer ancestor)" };

      const word = section.querySelector(".hero-word");
      const watermark = section.querySelector("[data-hero-watermark]");
      const before = {
        wordOpacity: +getComputedStyle(word).opacity,
        sectionTop: Math.round(section.getBoundingClientRect().top),
      };

      // scrub to ~55% of the pinned region (120% of viewport beyond start)
      window.scrollTo(0, Math.round(window.innerHeight * 1.2 * 0.55));
      await new Promise((r) => setTimeout(r, 400));

      const mid = {
        wordOpacity: +getComputedStyle(word).opacity,
        watermarkOpacity: +getComputedStyle(watermark).opacity,
        sectionTop: Math.round(section.getBoundingClientRect().top),
      };
      return { before, mid };
    });

    console.log("desktop:", JSON.stringify(result, null, 2));
    if (result.error) fail(result.error);
    else {
      if (result.mid.sectionTop !== 0)
        fail(`pinned section top ${result.mid.sectionTop}, want 0`);
      if (!(result.mid.wordOpacity < result.before.wordOpacity))
        fail("headline words did not fade during scrub");
      if (!(result.mid.watermarkOpacity > 0.05))
        fail("watermark did not surface");
    }
    await page.close();
  }

  // ---- mobile ----
  {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto("http://localhost:3000/?splash=off", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2500);

    const result = await page.evaluate(async () => {
      const section = document.querySelector("#home");
      if (!section) return { error: "no #home section" };
      if (section.closest(".pin-spacer"))
        return { error: "hero pinned on mobile (must not be)" };

      const content = section.querySelector("[data-hero-content]");
      const before = +getComputedStyle(content).opacity;
      window.scrollTo(0, Math.round(window.innerHeight * 0.6));
      await new Promise((r) => setTimeout(r, 400));
      const after = +getComputedStyle(content).opacity;
      const transform = getComputedStyle(content).transform;
      return { before, after, transform };
    });

    console.log("mobile:", JSON.stringify(result, null, 2));
    if (result.error) fail(result.error);
    else if (!(result.after < result.before))
      fail("mobile content did not fade on scroll");
    await page.close();
  }

  await browser.close();
  if (process.exitCode !== 1) console.log("PASS");
};

run();
