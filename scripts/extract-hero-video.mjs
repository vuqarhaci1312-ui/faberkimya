import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/us", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
await page.waitForTimeout(2000);
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
});
const hero = await page.evaluate(() => {
  const html = document.documentElement.innerHTML;
  const media = [...html.matchAll(/https?:[^"'\\\s>]+\.(mp4|webm|m3u8)/gi)].map((m) => m[0]).slice(0, 20);
  const videos = [...document.querySelectorAll("video, source")].map((el) => el.outerHTML.slice(0, 400));
  return {
    h1: document.querySelector("h1")?.innerText || "",
    media,
    videos,
  };
});
console.log(JSON.stringify(hero, null, 2).slice(0, 2500));
fs.writeFileSync("research/vikan/fidelity/hero-us.json", JSON.stringify(hero, null, 2));
await browser.close();
