import { chromium } from "playwright";
import fs from "fs";

const exe =
  "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser = await chromium.launch({ headless: true, ...(fs.existsSync(exe) ? { executablePath: exe } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int/products/accessories", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.evaluate(() => document.getElementById("CybotCookiebotDialog")?.remove());

async function probe() {
  return page.evaluate(() => {
    const root = document.querySelector(".XzlOkG_filter");
    const header = document.querySelector(".bvW4ma_filter_header");
    const wrapper = document.querySelector(".bvW4ma_filter_wrapper");
    const closeBtn = document.querySelector(".VZnKVW_close_button");
    const clearBtn = document.querySelector(".VZnKVW_clear_filter");
    const pick = (el) =>
      el
        ? {
            cls: el.className,
            rect: (() => {
              const r = el.getBoundingClientRect();
              return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
            })(),
            position: getComputedStyle(el).position,
            top: getComputedStyle(el).top,
            zIndex: getComputedStyle(el).zIndex,
            borderRadius: getComputedStyle(el).borderRadius,
            background: getComputedStyle(el).backgroundColor,
            transition: getComputedStyle(el).transition,
            transform: getComputedStyle(el).transform,
          }
        : null;
    const sectionOpen = document.querySelector('[class*="section_open"], [class*="isOpen"], [class*="expanded"]');
    const sections = [...document.querySelectorAll('[class*="filter_section"]')].slice(0, 3).map((el) => pick(el));
    const openContent = [...document.querySelectorAll('[class*="p5Dpua"], [class*="filter_section_content"]')].map((el) =>
      el.getBoundingClientRect().height > 30 ? pick(el) : null,
    ).filter(Boolean);
    const radios = document.querySelector('input[type="radio"], [class*="radio"]');
    const radioStyle = radios ? pick(radios.closest("label") || radios) : null;
    return { root: pick(root), header: pick(header), wrapper: pick(wrapper), closeBtn: pick(closeBtn), clearBtn: pick(clearBtn), sections, openContent: openContent.slice(0, 3), radioStyle, bodyClass: document.body.className };
  });
}

let open = await probe();
await page.locator("button", { hasText: /^Category$/ }).click();
await page.waitForTimeout(500);
let categoryExpanded = await probe();
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(400);
let afterScroll = await probe();

// close filters panel
const filterClose = page.locator('.VZnKVW_close_button, button[aria-label*="Close filter" i]').first();
await filterClose.click({ timeout: 5000 }).catch(async () => {
  await page.getByRole("button", { name: /Filters/i }).first().click();
});
await page.waitForTimeout(500);
const collapsed = await probe();
await page.evaluate(() => window.scrollBy(0, 400));
await page.waitForTimeout(300);
const collapsedScrolled = await probe();

const tab = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => (el.getAttribute("aria-label") || "").toLowerCase().includes("filter"));
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return {
    aria: b.getAttribute("aria-label"),
    text: b.innerText,
    cls: b.className,
    x: r.x,
    y: r.y,
    w: r.width,
    h: r.height,
    position: getComputedStyle(b).position,
    fixed: getComputedStyle(b).position === "fixed",
    br: getComputedStyle(b).borderRadius,
    bg: getComputedStyle(b).backgroundColor,
  };
});

fs.writeFileSync(
  "research/vikan/fidelity/catalog-filters.json",
  JSON.stringify({ open, categoryExpanded, afterScroll, collapsed, collapsedScrolled, tab }, null, 2),
);
console.log("tab", tab);
console.log("category open content", categoryExpanded.openContent);
await browser.close();