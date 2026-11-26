import { chromium } from "playwright";
import fs from "fs";

const exe =
  "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const launch = fs.existsSync(exe) ? { executablePath: exe } : {};
const browser = await chromium.launch({ headless: true, ...launch });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/us/products/brushes", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);
await page.evaluate(() => document.getElementById("CybotCookiebotDialog")?.remove());

const sampleRow = await page.evaluate(() => {
  const filter = document.querySelector(".XzlOkG_filter");
  if (!filter) return null;
  const rows = [...filter.querySelectorAll('[class*="accordion"], [class*="p5Dpua"], button')].slice(0, 8);
  return [...filter.querySelectorAll("button")].map((b) => ({
    text: (b.innerText || "").replace(/\s+/g, " ").trim().slice(0, 50),
    cls: b.className,
    h: b.getBoundingClientRect().height,
  }));
});

async function panelState() {
  return page.evaluate(() => {
    const panels = [...document.querySelectorAll('[class*="p5Dpua_content"], [class*="accordion_content"], [class*="collapse"]')];
    return panels.map((p) => ({
      cls: String(p.className).slice(0, 80),
      h: p.getBoundingClientRect().height,
      maxHeight: getComputedStyle(p).maxHeight,
      transition: getComputedStyle(p).transition,
      overflow: getComputedStyle(p).overflow,
      opacity: getComputedStyle(p).opacity,
    }));
  });
}

const closed = await panelState();
const subBtn = page.locator("button", { hasText: "Subcategor" }).first();
await subBtn.click();
await page.waitForTimeout(50);
const mid = await panelState();
await page.waitForTimeout(350);
const open = await panelState();

fs.writeFileSync(
  "research/vikan/fidelity/filters.json",
  JSON.stringify({ sampleRow, closed, mid, open }, null, 2),
);
console.log(JSON.stringify({ sampleRow, closed, open }, null, 2));
await browser.close();