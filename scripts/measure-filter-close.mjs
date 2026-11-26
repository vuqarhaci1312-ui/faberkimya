import { chromium } from "playwright";
import fs from "fs";

const exe =
  "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser = await chromium.launch({ headless: true, ...(fs.existsSync(exe) ? { executablePath: exe } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int/products/accessories", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.evaluate(() => document.getElementById("CybotCookiebotDialog")?.remove());

async function readFilter() {
  return page.evaluate(() => {
    const root = document.querySelector(".XzlOkG_filter");
    const wrapper = document.querySelector(".bvW4ma_filter_wrapper");
    const header = document.querySelector(".bvW4ma_filter_header");
    const close = document.querySelector(".VZnKVW_close_button");
    const pick = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        cls: String(el.className).slice(0, 80),
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.x),
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
        transition: getComputedStyle(el).transition,
        visibility: getComputedStyle(el).visibility,
        maxWidth: getComputedStyle(el).maxWidth,
        marginLeft: getComputedStyle(el).marginLeft,
      };
    };
    return { root: pick(root), wrapper: pick(wrapper), header: pick(header), close: pick(close) };
  });
}

const open = await readFilter();
const closeBtn = page.locator(".VZnKVW_close_button").first();
const frames = [];
for (let i = 0; i <= 12; i++) {
  if (i === 0) await closeBtn.click();
  await page.waitForTimeout(i === 0 ? 0 : 50);
  frames.push({ t: i * 50, ...(await readFilter()) });
}

const tab = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => /open filter|filters/i.test(el.getAttribute("aria-label") || ""));
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return {
    aria: b.getAttribute("aria-label"),
    w: Math.round(r.width),
    h: Math.round(r.height),
    x: Math.round(r.x),
    transition: getComputedStyle(b).transition,
    transform: getComputedStyle(b).transform,
    opacity: getComputedStyle(b).opacity,
  };
});

fs.writeFileSync("research/vikan/fidelity/filter-close.json", JSON.stringify({ open, frames, tab }, null, 2));
console.log(JSON.stringify({ open, frames: frames.map((f) => ({ t: f.t, w: f.root?.w, opacity: f.root?.opacity, transform: f.root?.transform })), tab }, null, 2));
await browser.close();