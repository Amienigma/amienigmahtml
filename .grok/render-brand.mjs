import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto("file:///workspace/.grok/og-card.html", { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const tag = document.querySelector(".tag");
    const lock = document.querySelector(".lockup");
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        font: getComputedStyle(el).fontFamily,
      };
    };
    return { h1: box(h1), tag: box(tag), lock: box(lock) };
  });
  console.log(JSON.stringify(metrics));
  await page.screenshot({ path: "/workspace/.grok/og-raw.png", type: "png" });

  const icon = await browser.newPage({
    viewport: { width: 64, height: 64 },
    deviceScaleFactor: 1,
  });
  await icon.goto("file:///workspace/.grok/favicon.svg", { waitUntil: "load" });
  await icon.screenshot({ path: "/workspace/.grok/favicon-64.png", type: "png" });

  const tiny = await browser.newPage({
    viewport: { width: 16, height: 16 },
    deviceScaleFactor: 4,
  });
  await tiny.goto("file:///workspace/.grok/favicon.svg", { waitUntil: "load" });
  await tiny.screenshot({ path: "/workspace/.grok/favicon-16.png", type: "png" });
} finally {
  await browser.close();
}
