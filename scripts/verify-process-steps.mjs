// Throwaway verification: as the user scrolls through the pinned Process
// region, the detail panel should advance through all four steps, and the
// console should stay clean. Also captures a mid-scroll screenshot.
import { chromium } from "playwright";

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewportSize: { width: 1440, height: 900 } });
  const consoleIssues = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      consoleIssues.push(`${m.type()}: ${m.text()}`);
    }
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);

  const bounds = await page.evaluate(() => {
    const sticky = document.querySelector("#about .sticky");
    const pin = sticky.parentElement;
    const start = window.scrollY + pin.getBoundingClientRect().top;
    return { start, height: pin.offsetHeight, vh: window.innerHeight };
  });

  const headings = [];
  for (const frac of [0.1, 0.35, 0.6, 0.85]) {
    const y = bounds.start + (bounds.height - bounds.vh) * frac;
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(450); // let the crossfade settle
    const heading = await page.evaluate(() => {
      const panel = document.querySelector("#about .sticky h4");
      return panel ? panel.textContent : null;
    });
    headings.push({ frac, heading });
  }

  // screenshot mid-pin for visual check
  await page.evaluate(
    (y) => window.scrollTo(0, y),
    bounds.start + (bounds.height - bounds.vh) * 0.4
  );
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/process-pinned.png" });

  console.log(JSON.stringify({ headings, consoleIssues: consoleIssues.slice(0, 8) }, null, 2));
  const unique = new Set(headings.map((h) => h.heading));
  console.log(
    unique.size === 4
      ? "PASS: panel advanced through all 4 steps"
      : `FAIL: only ${unique.size} distinct steps seen`
  );
  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
