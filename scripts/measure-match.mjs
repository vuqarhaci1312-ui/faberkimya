import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const exe = "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const out = path.resolve("research/vikan/match");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function clearCookies() {
  await page.evaluate(() => {
    document.getElementById("CybotCookiebotDialog")?.remove();
    document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
  });
}

await page.goto("https://www.vikan.com/us", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1800);
await clearCookies();
const home = await page.evaluate(() => {
  const cs = (el) => el ? getComputedStyle(el) : null;
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = cs(el);
    return {
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      bg: s.backgroundColor, color: s.color, fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight,
      ls: s.letterSpacing, radius: s.borderRadius, pad: s.padding, border: s.border,
    };
  };
  const h1 = document.querySelector("h1");
  const buttons = [...document.querySelectorAll("main a, main button")].slice(0, 8).map((el) => ({
    text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40),
    ...box(el),
  }));
  const overlays = [...document.querySelectorAll("main *")].filter((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return r.width > 800 && r.height > 400 && s.backgroundColor !== "rgba(0, 0, 0, 0)";
  }).slice(0, 6).map(box);
  return {
    body: box(document.body),
    header: box(document.querySelector("header")),
    h1: { text: h1?.innerText, ...box(h1) },
    buttons,
    overlays,
    nav: [...document.querySelectorAll("header nav button, header nav a")].map((el) => (el.innerText || "").replace(/\s+/g, " ").trim()).filter(Boolean),
  };
});
fs.writeFileSync(path.join(out, "home.json"), JSON.stringify(home, null, 2));
await page.screenshot({ path: path.join(out, "home-1440.png") });
console.log("HOME", home.h1.text, home.body.bg, home.h1.fs, home.h1.color);

await page.goto("https://www.vikan.com/us/products", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1800);
await clearCookies();
const list = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundColor, color: s.color, fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, radius: s.borderRadius, pad: s.padding };
  };
  const h1 = document.querySelector("h1");
  const card = [...document.querySelectorAll("a")].find((a) => /\d{4,}/.test(a.innerText || ""));
  return { body: box(document.body), main: box(document.querySelector("main")), h1: { text: h1?.innerText, ...box(h1) }, card: card ? { text: card.innerText.replace(/\s+/g, " ").trim().slice(0, 80), ...box(card.closest("article, li, div")) } : null };
});
fs.writeFileSync(path.join(out, "list.json"), JSON.stringify(list, null, 2));
await page.screenshot({ path: path.join(out, "list-1440.png") });
const productHref = await page.evaluate(() => [...document.querySelectorAll("a")].map((a) => a.getAttribute("href") || "").find((h) => /\/products\/.+\/.+/.test(h)));
console.log("LIST", list.h1.text, list.h1.fs, list.body.bg, "card", list.card && list.card.w, list.card && list.card.radius);

if (productHref) {
  const url = productHref.startsWith("http") ? productHref : "https://www.vikan.com" + productHref;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await clearCookies();
  const detail = await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundColor, color: s.color, fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, radius: s.borderRadius };
    };
    return {
      h1: { text: document.querySelector("h1")?.innerText, ...box(document.querySelector("h1")) },
      tabs: [...document.querySelectorAll("button, a")].map((el) => (el.innerText || "").trim()).filter((t) => /Description|Applications|Product Details|Downloads|Videos|Related/i.test(t)).slice(0, 8),
      body: box(document.body),
    };
  });
  fs.writeFileSync(path.join(out, "detail.json"), JSON.stringify(detail, null, 2));
  await page.screenshot({ path: path.join(out, "detail-1440.png") });
  console.log("DETAIL", detail.h1.text, detail.h1.fs, detail.tabs.join(","));
}
await browser.close();
