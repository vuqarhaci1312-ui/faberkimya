import { chromium } from "playwright";
const exe = "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser = await chromium.launch({ headless: true, executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/us", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const rows = [];
  for (const el of [document.documentElement, document.body, ...document.querySelectorAll("body > div, header")]) {
    const s = getComputedStyle(el);
    rows.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), img: s.backgroundImage.slice(0, 80), color: s.backgroundColor });
  }
  return rows;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
