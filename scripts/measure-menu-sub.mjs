import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
});
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
  [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Products")?.click();
});
await page.waitForTimeout(400);
await page.evaluate(() => {
  const row = [...document.querySelectorAll("button, a, div")].find((el) => el.innerText.trim() === "Products by Category");
  row?.click();
});
await page.waitForTimeout(400);
const data = await page.evaluate(() => {
  const hit = [...document.querySelectorAll("a, button")].find((el) => (el.innerText || "").trim() === "Brushes");
  let el = hit;
  const chain = [];
  while (el && chain.length < 6) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    chain.push({ cls: String(el.className).slice(0, 80), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, duration: cs.transitionDuration, radius: cs.borderRadius });
    el = el.parentElement;
  }
  return chain;
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
