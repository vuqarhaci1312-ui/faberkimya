import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const allow = page.locator("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, button:has-text('Allow all')").first();
if (await allow.count()) {
  try { await allow.click({ timeout: 3000 }); } catch { /* overlay */ }
}
await page.evaluate(() => document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove());
await page.waitForTimeout(400);
const btn = page.getByRole("button", { name: /^Products$/ }).first();
await btn.click();
await page.waitForTimeout(800);
const panel = await page.evaluate(() => {
  const row = [...document.querySelectorAll("button, a, div")].find((el) => (el.innerText || "").trim() === "Products by Category");
  if (!row) return { error: "row missing" };
  let el = row;
  const chain = [];
  while (el && el !== document.body) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      cls: String(el.className).slice(0, 100),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      bg: cs.backgroundColor, duration: cs.transitionDuration, ease: cs.transitionTimingFunction,
      delay: cs.transitionDelay, transform: cs.transform, opacity: cs.opacity,
      anims: (el.getAnimations?.() || []).map((a) => a.effect?.getTiming?.()),
    });
    el = el.parentElement;
  }
  const rows = [...document.querySelectorAll("button, a")].map((el) => (el.innerText || "").trim()).filter((t) => /Products by|About the|Featured/.test(t));
  return { chain, rows };
});
fs.writeFileSync("research/vikan/fidelity/menu-panel.json", JSON.stringify(panel, null, 2));
console.log(JSON.stringify({ rows: panel.rows, chain: (panel.chain || []).slice(0, 8) }, null, 2));

const row = page.getByText("Products by Category", { exact: true }).first();
await row.click();
await page.waitForTimeout(800);
await page.screenshot({ path: "research/vikan/fidelity/menu-category-1440.png" });
const sub = await page.evaluate(() => {
  const texts = [...document.querySelectorAll("a, button")].map((el) => (el.innerText || "").replace(/\s+/g, " ").trim()).filter((t) => t && t.length < 60);
  return texts.slice(0, 40);
});
fs.writeFileSync("research/vikan/fidelity/menu-sub.json", JSON.stringify(sub, null, 2));
console.log("SUB", sub.slice(0, 25));
await browser.close();
