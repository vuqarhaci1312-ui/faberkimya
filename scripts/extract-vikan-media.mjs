import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/int", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
});

const home = await page.evaluate(() => {
  const videos = [...document.querySelectorAll("video")].map((v) => ({
    src: v.currentSrc || v.getAttribute("src"),
    poster: v.getAttribute("poster"),
    sources: [...v.querySelectorAll("source")].map((s) => s.src),
  }));
  const heroText = document.querySelector("h1")?.innerText || "";
  const imgs = [...document.querySelectorAll("main img")].slice(0, 20).map((img) => ({
    alt: img.alt,
    src: img.currentSrc || img.src,
    w: Math.round(img.getBoundingClientRect().width),
    h: Math.round(img.getBoundingClientRect().height),
  }));
  const headerSvgs = [...document.querySelectorAll("header button svg, header a svg")].map((svg) => svg.outerHTML);
  return { videos, heroText, imgs, headerSvgs };
});
fs.writeFileSync("research/vikan/fidelity/media.json", JSON.stringify(home, null, 2));
console.log("videos", home.videos.length, "imgs", home.imgs.length, "svgs", home.headerSvgs.length);

await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Products")?.click());
await page.waitForTimeout(500);
await page.evaluate(() => [...document.querySelectorAll("button,a,div")].find((el) => el.childElementCount < 4 && el.innerText.trim() === "Products by Category")?.click());
await page.waitForTimeout(600);
const icons = await page.evaluate(() => {
  return [...document.querySelectorAll("a")].filter((a) => (a.innerText || "").trim().length > 0 && (a.innerText || "").trim().length < 40 && a.querySelector("svg")).slice(0, 30).map((a) => ({
    name: a.innerText.replace(/\s+/g, " ").trim(),
    svg: a.querySelector("svg")?.outerHTML || "",
  }));
});
fs.writeFileSync("research/vikan/fidelity/menu-icons.json", JSON.stringify(icons, null, 2));
console.log("icons", icons.map((i) => i.name).join(" | "));
await browser.close();
