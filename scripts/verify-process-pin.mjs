// Throwaway verification: does the Process section's sticky viewport pin?
// Scrolls through the pinned region and samples the sticky element's
// bounding-rect top. If pinning works, top stays at ~0 across the region
// and the active step advances. Usage: node scripts/verify-process-pin.mjs
import { chromium } from "playwright";

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewportSize: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  // let the splash screen finish
  await page.waitForTimeout(1800);

  const result = await page.evaluate(async () => {
    const section = document.querySelector("#about");
    if (!section) return { error: "no #about section" };
    const sticky = section.querySelector(".sticky");
    if (!sticky) return { error: "no .sticky inside #about (mobile variant rendered?)" };

    const pinContainer = sticky.parentElement; // the 400vh wrapper
    const rect = pinContainer.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + pinContainer.offsetHeight - window.innerHeight;

    const samples = [];
    for (let i = 0; i <= 8; i++) {
      const y = start + ((end - start) * i) / 8;
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
      samples.push({
        progress: +(i / 8).toFixed(2),
        stickyTop: Math.round(sticky.getBoundingClientRect().top),
      });
    }
    return { containerHeight: pinContainer.offsetHeight, samples };
  });

  console.log(JSON.stringify(result, null, 2));

  if (result.samples) {
    const pinned = result.samples.filter((s) => Math.abs(s.stickyTop) <= 2).length;
    console.log(
      pinned >= 7
        ? `PASS: sticky pinned at top for ${pinned}/9 samples`
        : `FAIL: sticky only pinned for ${pinned}/9 samples — it is scrolling away instead of pinning`
    );
  }
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
