// Throwaway verification for external UX feedback:
// 1. CTA section overflow/clipping on mobile (fixed h-96 + overflow-hidden)
// 2. Nav anchor click scroll behavior (smooth vs instant) on mobile + desktop
// 3. Any lucide icons / images that fail to render at mobile viewport
// Usage: node scripts/verify-feedback.mjs  (dev server must be running)
import { chromium } from "playwright";

const BASE = "http://localhost:3000/?splash=off";

const run = async () => {
  const browser = await chromium.launch();

  // ---------- MOBILE ----------
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  await mobile.goto(BASE, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(1000);

  // CTA clipping check
  const cta = await mobile.evaluate(() => {
    const heading = [...document.querySelectorAll("h2")].find((h) =>
      h.textContent.includes("outlasts the hype"),
    );
    if (!heading) return { error: "CTA heading not found" };
    const beamBox =
      heading.closest("section").querySelector(".overflow-hidden") ??
      heading.closest("section");
    const inner = heading.parentElement; // the motion.div content block
    return {
      containerHeight: Math.round(beamBox.getBoundingClientRect().height),
      contentHeight: Math.round(inner.getBoundingClientRect().height),
      contentScrollHeight: inner.scrollHeight,
      clipped:
        inner.getBoundingClientRect().height >
        beamBox.getBoundingClientRect().height,
    };
  });
  console.log("CTA mobile:", JSON.stringify(cta));

  // screenshot the CTA section
  const ctaEl = await mobile
    .locator("section", {
      hasText: "outlasts the hype",
    })
    .last();
  await ctaEl.scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(800);
  await mobile.screenshot({ path: "scripts/out-cta-mobile.png" });

  // anchor click behavior on mobile: does it jump instantly?
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.waitForTimeout(300);
  await mobile.evaluate(() => {
    const a = document.createElement("a");
    a.href = "#contact";
    document.body.appendChild(a);
    a.click();
  });
  await mobile.waitForTimeout(50);
  const yAfter50ms = await mobile.evaluate(() => window.scrollY);
  await mobile.waitForTimeout(1000);
  const yAfter1s = await mobile.evaluate(() => window.scrollY);
  console.log(
    `Mobile anchor: scrollY after 50ms=${yAfter50ms}, after 1s=${yAfter1s} → ` +
      (yAfter50ms >= yAfter1s - 5 && yAfter50ms > 0
        ? "INSTANT JUMP"
        : "smooth"),
  );

  // broken images / zero-size svgs at mobile width
  const missing = await mobile.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.getAttribute("src"));
    const svgs = [...document.querySelectorAll("svg")].filter((s) => {
      const r = s.getBoundingClientRect();
      return r.width === 0 || r.height === 0;
    }).length;
    return {
      brokenImages: imgs,
      zeroSizeSvgs: svgs,
      totalSvgs: document.querySelectorAll("svg").length,
    };
  });
  console.log("Mobile assets:", JSON.stringify(missing));
  await mobile.close();

  // ---------- DESKTOP ----------
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await desktop.goto(BASE, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(1500);
  await desktop.evaluate(() => {
    const a = document.createElement("a");
    a.href = "#contact";
    document.body.appendChild(a);
    a.click();
  });
  await desktop.waitForTimeout(50);
  const dy50 = await desktop.evaluate(() => window.scrollY);
  await desktop.waitForTimeout(1500);
  const dy1500 = await desktop.evaluate(() => window.scrollY);
  console.log(
    `Desktop anchor (Lenis active): scrollY after 50ms=${dy50}, after 1.5s=${dy1500} → ` +
      (dy50 >= dy1500 - 5 && dy50 > 0 ? "INSTANT JUMP" : "smooth"),
  );
  await desktop.close();

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
