// Throwaway verification: Talk act — FAQ rows / CTA / contact columns
// scrub-reveal, the FAQ accordion still toggles, and the contact funnel is
// intact (fields present, submit gated on captcha).
// Usage: node scripts/verify-talk-scene.mjs  (dev server running)
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
      faq: document.querySelector(".talk-faq"),
      cta: document.querySelector("[data-talk-cta]"),
      col: document.querySelector("[data-talk-col]"),
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
      await place(el, 0.99);
      const hidden = +getComputedStyle(el).opacity;
      await place(el, 0.45);
      const shown = +getComputedStyle(el).opacity;
      out[k] = { hidden, shown };
    }

    // funnel sanity
    const form = document.querySelector("#contact form");
    out.funnel = {
      fields: form
        ? [
            "input[type=text]",
            "input[type=email]",
            "textarea",
            "button[type=submit]",
          ].every((s) => form.querySelector(s))
        : false,
      submitDisabled:
        form?.querySelector("button[type=submit]")?.disabled ?? false,
    };

    return out;
  });

  // FAQ accordion toggle (second item opens on click)
  await page.locator(".talk-faq button").nth(1).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.locator(".talk-faq button").nth(1).click();
  await page.waitForTimeout(500);
  const expanded = await page
    .locator(".talk-faq button")
    .nth(1)
    .getAttribute("aria-expanded");

  console.log(label + ":", JSON.stringify({ ...result, accordion: expanded }));
  if (result.error) fail(`${label}: ${result.error}`);
  else {
    for (const k of ["faq", "cta", "col"]) {
      if (!(result[k].hidden < 0.35))
        fail(`${label}: ${k} not hidden below fold (${result[k].hidden})`);
      if (!(result[k].shown > 0.95))
        fail(`${label}: ${k} not assembled in view (${result[k].shown})`);
    }
    if (!result.funnel.fields) fail(`${label}: contact form fields missing`);
    if (!result.funnel.submitDisabled)
      fail(`${label}: submit not gated (should be disabled pre-captcha)`);
    if (expanded !== "true") fail(`${label}: FAQ accordion did not open`);
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
