import { chromium } from "playwright";
import fs from "fs";

const exe = "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser = await chromium.launch({ headless: true, executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/us", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
  [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Products")?.click();
});
await page.waitForTimeout(400);
await page.evaluate(() => {
  const row = [...document.querySelectorAll("button, a, div")].find((el) => el.innerText.trim() === "Products by Category" && el.getBoundingClientRect().height < 80);
  row?.click();
});
await page.waitForTimeout(800);
const icons = await page.evaluate(() => {
  const sub = document.querySelector("._0E_Ima_submenu");
  const root = sub || document.body;
  return [...root.querySelectorAll("a")].map((a) => {
    const name = (a.innerText || "").replace(/\s+/g, " ").trim();
    const svg = a.querySelector("svg");
    const img = a.querySelector("img");
    return { name, svg: svg ? svg.outerHTML : "", img: img ? img.src : "" };
  }).filter((item) => item.name);
});
const unique = [];
const seen = new Set();
for (const item of icons) {
  if (seen.has(item.name)) continue;
  seen.add(item.name);
  unique.push(item);
}
fs.writeFileSync("research/vikan/fidelity/cat-icons.json", JSON.stringify(unique, null, 2));
console.log(unique.map((i) => i.name).join(" | "));

await page.goto("https://www.vikan.com/int/about-vikan", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const aboutImgs = await page.evaluate(() => [...document.querySelectorAll("main img")].slice(0, 12).map((img) => ({
  alt: img.alt,
  src: img.currentSrc || img.src,
  w: Math.round(img.getBoundingClientRect().width),
  h: Math.round(img.getBoundingClientRect().height),
})));
fs.writeFileSync("research/vikan/fidelity/about-imgs.json", JSON.stringify(aboutImgs, null, 2));
console.log("about", aboutImgs.map((i) => i.w + "x" + i.h).join(", "));
await browser.close();
