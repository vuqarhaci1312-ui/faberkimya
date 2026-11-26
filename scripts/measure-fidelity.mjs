import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const out = path.resolve("research/vikan/fidelity");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
});
page.setDefaultTimeout(45000);

async function accept(p) {
  const btn = p.getByRole("button", { name: /accept|allow all|agree/i }).first();
  if (await btn.count()) {
    try { await btn.click({ timeout: 1500 }); } catch { /* already gone */ }
  }
}

const props = ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "backgroundColor", "padding", "margin", "gap", "borderRadius", "width", "height", "display", "gridTemplateColumns", "objectFit", "transitionDuration", "transitionTimingFunction", "transitionDelay", "transform", "opacity", "boxShadow"];

await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
await accept(page);

const home = await page.evaluate((props) => {
  const read = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const style = {};
    for (const p of props) style[p] = cs[p];
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 180),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      style,
    };
  };
  return {
    sections: [...document.querySelectorAll("main section")].map(read),
    h1: read(document.querySelector("h1")),
    images: [...document.querySelectorAll("main img")].slice(0, 16).map((img) => {
      const r = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      return { alt: img.alt, w: Math.round(r.width), h: Math.round(r.height), fit: cs.objectFit, radius: cs.borderRadius };
    }),
  };
}, props);
fs.writeFileSync(path.join(out, "home.json"), JSON.stringify(home, null, 2));
await page.screenshot({ path: path.join(out, "home-1440.png"), fullPage: true });

const menu = { steps: [] };
const products = page.getByRole("button", { name: /^Products$/i }).first();
await products.hover();
await page.waitForTimeout(400);
menu.steps.push({ event: "hover", snapshot: await panelSnapshot(page) });
await products.click();
const samples = [];
const start = Date.now();
while (Date.now() - start < 900) {
  samples.push(await panelSnapshot(page));
  await page.waitForTimeout(50);
}
menu.openSamples = samples;
await page.screenshot({ path: path.join(out, "menu-open-1440.png") });
const firstRow = page.locator("header").getByText(/Products by Category/i).first();
if (await firstRow.count()) {
  await firstRow.click();
  await page.waitForTimeout(700);
  menu.afterCategory = await panelSnapshot(page);
  await page.screenshot({ path: path.join(out, "menu-category-1440.png") });
}
await page.mouse.move(1200, 500);
await page.waitForTimeout(500);
menu.afterLeave = await panelSnapshot(page);
fs.writeFileSync(path.join(out, "menu.json"), JSON.stringify(menu, null, 2));

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
await accept(page);
const burger = page.getByRole("button", { name: /open menu/i }).first();
if (await burger.count()) {
  await burger.click();
  await page.waitForTimeout(600);
  menu.mobile = await panelSnapshot(page);
  await page.screenshot({ path: path.join(out, "menu-390.png") });
  fs.writeFileSync(path.join(out, "menu.json"), JSON.stringify(menu, null, 2));
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("https://www.vikan.com/int/about-vikan", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
await accept(page);
const about = await page.evaluate((props) => {
  const read = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const style = {};
    for (const p of props) style[p] = cs[p];
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 160),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      style,
    };
  };
  return {
    h1: document.querySelector("h1") ? read(document.querySelector("h1")) : null,
    h2: [...document.querySelectorAll("h2")].map((el) => el.innerText.replace(/\s+/g, " ").trim()),
    sections: [...document.querySelectorAll("main section")].map(read),
  };
}, props);
fs.writeFileSync(path.join(out, "about.json"), JSON.stringify(about, null, 2));
await page.screenshot({ path: path.join(out, "about-1440.png"), fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: path.join(out, "about-390.png"), fullPage: false });

await browser.close();
console.log("sections", home.sections.length, "about", about.sections.length, "menuSamples", samples.length);

async function panelSnapshot(p) {
  return p.evaluate(() => {
    const nodes = [...document.querySelectorAll("body *")].filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 240 && r.height > 300 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0;
    }).slice(0, 8).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        cls: String(el.className).slice(0, 80),
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        bg: cs.backgroundColor, opacity: cs.opacity, transform: cs.transform,
        duration: cs.transitionDuration, ease: cs.transitionTimingFunction, delay: cs.transitionDelay,
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 220),
      };
    });
    return nodes;
  });
}
