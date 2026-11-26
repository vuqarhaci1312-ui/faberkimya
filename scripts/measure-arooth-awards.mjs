import { chromium } from "playwright";
import fs from "fs";

const exe =
  "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser = await chromium.launch({ headless: true, ...(fs.existsSync(exe) ? { executablePath: exe } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://arooth.webflow.io/", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.getByRole("heading", { name: "Site Of The Day" }).scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const pick = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      cls: String(el.className).slice(0, 100),
      w: Math.round(r.width),
      h: Math.round(r.height),
      br: s.borderRadius,
      bg: s.backgroundColor,
      color: s.color,
      pad: s.padding,
      gap: s.gap,
      display: s.display,
      gridTemplate: s.gridTemplateColumns,
      fs: s.fontSize,
      fw: s.fontWeight,
      lh: s.lineHeight,
      ls: s.letterSpacing,
      tt: s.textTransform,
      boxShadow: s.boxShadow,
      border: s.border,
    };
  };
  const title = document.querySelector(".award-name");
  const card =
    title?.closest(".award-card") ||
    title?.closest(".single-award") ||
    title?.parentElement?.parentElement;
  const grid = card?.parentElement;
  const section = document.querySelector("section.awards");
  const info = card?.querySelector(".award-info");
  const logo = card?.querySelector("img, svg, .award-logo");
  const allCards = grid ? [...grid.children].map(pick) : [];
  return {
    section: pick(section),
    grid: pick(grid),
    card: pick(card),
    title: pick(title),
    info: pick(info),
    logo: pick(logo),
    logoSrc: logo instanceof HTMLImageElement ? logo.src : null,
    allCards,
  };
});

fs.writeFileSync("research/arooth-awards.json", JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 2));
await browser.close();