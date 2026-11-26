import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
const home = await page.evaluate(() => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      cls: String(el.className).slice(0, 80),
      bg: cs.backgroundColor,
      color: cs.color,
      fs: cs.fontSize,
      fw: cs.fontWeight,
      br: cs.borderRadius,
      pad: cs.padding,
      h: Math.round(r.height),
      w: Math.round(r.width),
      shadow: cs.boxShadow,
      border: cs.border,
    };
  };
  const header = document.querySelector("header");
  const link = document.querySelector("header nav a, header nav button");
  const logo = document.querySelector("header img");
  const hero = document.querySelector("main section");
  const h1 = document.querySelector("h1");
  return {
    header: pick(header),
    link: pick(link),
    logo: pick(logo),
    hero: pick(hero),
    h1: pick(h1),
    body: pick(document.body),
  };
});
await page.goto("https://www.vikan.com/int/products", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
const products = await page.evaluate(() => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { bg: cs.backgroundColor, color: cs.color, fs: cs.fontSize, fw: cs.fontWeight, br: cs.borderRadius, pad: cs.padding, h: Math.round(r.height), w: Math.round(r.width), shadow: cs.boxShadow, lh: cs.lineHeight, ls: cs.letterSpacing };
  };
  const cards = [...document.querySelectorAll("a")].filter((a) => (a.innerText || "").includes("44073") || /brush/i.test(a.innerText || ""));
  const card = cards[0]?.closest("article, li, div");
  const h1 = document.querySelector("h1");
  const main = document.querySelector("main");
  return {
    body: pick(document.body),
    main: pick(main),
    h1: pick(h1),
    card: pick(card),
    cardText: (card?.innerText || "").slice(0, 120),
  };
});
await page.goto("https://www.vikan.com/int/contact-us", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const contact = await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  const h2 = document.querySelector("h2");
  const input = document.querySelector("input, textarea");
  const btn = [...document.querySelectorAll("button, a")].find((el) => /send|submit|find|dealer/i.test(el.innerText || ""));
  const cs = (el) => el ? { bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight, br: getComputedStyle(el).borderRadius, pad: getComputedStyle(el).padding, text: (el.innerText || "").slice(0, 80) } : null;
  return { h1: cs(h1), h2: cs(h2), input: cs(input), btn: cs(btn), headings: [...document.querySelectorAll("h1,h2,h3")].map((el) => el.innerText.trim()).slice(0, 8) };
});
const footer = await page.evaluate(() => {
  const f = document.querySelector("footer");
  const inner = f?.querySelector("div");
  const walk = [];
  const all = f ? [...f.querySelectorAll("div")].slice(0, 12) : [];
  for (const el of all) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg !== "rgba(0, 0, 0, 0)") walk.push({ bg, h: Math.round(el.getBoundingClientRect().height), cls: String(el.className).slice(0, 40) });
  }
  return { footerBg: f ? getComputedStyle(f).backgroundColor : null, colored: walk.slice(0, 6) };
});
fs.writeFileSync("research/vikan/details.json", JSON.stringify({ home, products, contact, footer }, null, 2));
console.log(JSON.stringify({ home, products, contact, footer }, null, 2).slice(0, 3500));
await browser.close();
