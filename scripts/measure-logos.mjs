import { chromium } from "playwright";
import fs from "fs";

const exe =
  "C:\\Users\\anggr\\AppData\\Local\\Temp\\cursor-sandbox-cache\\2f9968a4dbc0b3143889eec09ba6d1ad\\playwright\\chromium_headless_shell-1255\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const launch = fs.existsSync(exe) ? { executablePath: exe } : {};
const browser = await chromium.launch({ headless: true, ...launch });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.vikan.com/us", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);
await page.evaluate(() => document.getElementById("CybotCookiebotDialog")?.remove());
await page.getByText("Trusted by professionals worldwide", { exact: true }).scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

function snapshot() {
  return page.evaluate(() => {
    const wrapper = document.querySelector('[class*="logos_mask_wrapper"]');
    if (!wrapper) return { error: "no wrapper" };
    const track = wrapper.querySelector('[class*="logos"]');
    const nodes = [...wrapper.querySelectorAll("*")].map((el) => ({
      tag: el.tagName,
      cls: String(el.className).slice(0, 100),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
      transform: getComputedStyle(el).transform,
      animation: getComputedStyle(el).animation,
      overflow: getComputedStyle(el).overflow,
      maskImage: getComputedStyle(el).maskImage?.slice(0, 80) || "",
      webkitMask: getComputedStyle(el).webkitMaskImage?.slice(0, 80) || "",
    }));
    return { nodes, imgCount: wrapper.querySelectorAll("img").length };
  });
}

const s0 = await snapshot();
await page.waitForTimeout(2500);
const s1 = await snapshot();
fs.writeFileSync("research/vikan/fidelity/logos-marquee.json", JSON.stringify({ s0, s1 }, null, 2));
console.log(JSON.stringify({ s0nodes: s0.nodes?.length, s1firstTransform: s1.nodes?.find((n) => n.transform !== "none") }, null, 2));
await browser.close();