import { chromium } from "playwright";
const exe = "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser = await chromium.launch({ headless: true, executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/us", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  document.getElementById("CybotCookiebotDialog")?.remove();
  document.getElementById("CybotCookiebotDialogBodyUnderlay")?.remove();
  document.querySelectorAll(".Dm2lyq_overlay").forEach((el) => el.remove());
});
await page.mouse.click(187, 215);
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const h1 = document.querySelector("h1")?.innerText;
  const buttons = [...document.querySelectorAll("main a, main button")].slice(0, 6).map((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 30), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, w: Math.round(r.width), h: Math.round(r.height) };
  });
  const layers = [...document.querySelectorAll("main *")].filter((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return r.width > 900 && r.height > 300 && (s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.backgroundImage !== "none");
  }).slice(0, 5).map((el) => {
    const s = getComputedStyle(el);
    return { bg: s.backgroundColor, img: s.backgroundImage.slice(0, 120), cls: String(el.className).slice(0, 40) };
  });
  return { h1, buttons, layers };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
