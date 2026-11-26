import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
});
await page.getByRole("button", { name: /^Products$/ }).click();
await page.waitForTimeout(400);
await page.getByText("Products by Category", { exact: true }).click();
await page.waitForTimeout(500);
const box = await page.evaluate(() => {
  const el = document.querySelector("._0E_Ima_left_side_wrapper") || [...document.querySelectorAll("div")].find((n) => getComputedStyle(n).backgroundColor === "rgb(240, 247, 254)");
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const scrim = [...document.querySelectorAll("div")].filter((n) => {
    const c = getComputedStyle(n);
    return c.position === "fixed" && n.getBoundingClientRect().width > 1000 && c.backgroundColor !== "rgba(0, 0, 0, 0)";
  }).slice(0, 3).map((n) => ({ bg: getComputedStyle(n).backgroundColor, op: getComputedStyle(n).opacity }));
  return { x: r.x, y: r.y, w: r.width, h: r.height, radius: cs.borderRadius, bg: cs.backgroundColor, scrim };
});
console.log(JSON.stringify(box));
await browser.close();
