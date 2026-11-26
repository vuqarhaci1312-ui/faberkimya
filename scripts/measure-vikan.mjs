import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "research", "vikan");
const shotDir = path.join(outDir, "screenshots");
fs.mkdirSync(shotDir, { recursive: true });

const WIDTHS = [1920, 1440, 1280, 1024, 768, 430, 390, 375, 640, 840, 1366, 1400, 1500, 1792, 2440, 2560];
const REQUIRED = [1920, 1440, 1280, 1024, 768, 430, 390, 375];
const CSS_PROPS = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color",
  "backgroundColor", "width", "height", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "gap", "rowGap", "columnGap",
  "borderRadius", "borderTopWidth", "borderTopColor", "boxShadow", "display", "position",
  "textTransform", "maxWidth", "aspectRatio", "objectFit", "transitionDuration", "transitionTimingFunction",
  "transform", "opacity",
];

const checkpointPath = path.join(outDir, "checkpoint.json");
const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, "utf8"));
checkpoint.startedAt = new Date().toISOString();
checkpoint.visited = [];
checkpoint.errors = checkpoint.errors || [];

function save() {
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
}

async function acceptCookies(page) {
  const labels = [/accept/i, /allow all/i, /agree/i, /ok/i, /got it/i];
  for (const label of labels) {
    const btn = page.getByRole("button", { name: label }).first();
    if (await btn.count()) {
      try { await btn.click({ timeout: 1500 }); return; } catch { /* overlay may already be gone */ }
    }
  }
}

async function styleOf(page, selector, limit = 8) {
  return page.evaluate(({ selector, props, limit }) => {
    const nodes = [...document.querySelectorAll(selector)].slice(0, limit);
    return nodes.map((el) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const style = {};
      for (const p of props) style[p] = cs[p];
      const anims = el.getAnimations?.() || [];
      return {
        tag: el.tagName.toLowerCase(),
        className: String(el.className).slice(0, 180),
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 140),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        style,
        animations: anims.map((a) => ({
          duration: a.effect?.getTiming?.().duration ?? null,
          easing: a.effect?.getTiming?.().easing ?? null,
          direction: a.effect?.getTiming?.().direction ?? null,
        })),
      };
    });
  }, { selector, props: CSS_PROPS, limit });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  locale: "en-US",
});
const page = await context.newPage();
page.setDefaultTimeout(45000);

const homeUrl = "https://www.vikan.com/int";
await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await acceptCookies(page);
checkpoint.visited.push(homeUrl);

const homeMeta = await page.evaluate(() => {
  const sections = [...document.querySelectorAll("main section, main > div")].slice(0, 30).map((el) => ({
    tag: el.tagName.toLowerCase(),
    className: String(el.className).slice(0, 120),
    heading: (el.querySelector("h1,h2,h3")?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 120),
    childCount: el.children.length,
  }));
  return {
    title: document.title,
    h1: document.querySelector("h1")?.innerText?.trim() || null,
    sectionCount: document.querySelectorAll("section").length,
    sections,
    nav: [...document.querySelectorAll("header nav button, header nav a")].map((el) => (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim()).filter(Boolean),
  };
});

const layoutByWidth = {};
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(400);
  layoutByWidth[width] = await page.evaluate(() => {
    const header = document.querySelector("header");
    const h1 = document.querySelector("h1");
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const hs = header ? getComputedStyle(header) : null;
    const h1s = h1 ? getComputedStyle(h1) : null;
    const container = document.querySelector("header div");
    return {
      header: header && {
        h: Math.round(header.getBoundingClientRect().height),
        bg: hs.backgroundColor,
        position: hs.position,
        fontSize: hs.fontSize,
        fontFamily: hs.fontFamily,
      },
      h1: h1 && {
        size: h1s.fontSize,
        weight: h1s.fontWeight,
        lineHeight: h1s.lineHeight,
        letterSpacing: h1s.letterSpacing,
        color: h1s.color,
        fontFamily: h1s.fontFamily,
      },
      mainW: main ? Math.round(main.getBoundingClientRect().width) : null,
      footerH: footer ? Math.round(footer.getBoundingClientRect().height) : null,
      containerW: container ? Math.round(container.getBoundingClientRect().width) : null,
    };
  });
  if (REQUIRED.includes(width)) {
    const file = path.join(shotDir, `home-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
  }
}

await page.setViewportSize({ width: 1440, height: 900 });
const desktop = {
  header: await styleOf(page, "header"),
  navButtons: await styleOf(page, "header nav button, header nav a", 20),
  h1: await styleOf(page, "h1", 2),
  h2: await styleOf(page, "h2", 20),
  sections: await styleOf(page, "main section", 20),
  footer: await styleOf(page, "footer", 2),
  footerLinks: await styleOf(page, "footer a", 12),
};

let mega = null;
try {
  const productsBtn = page.getByRole("button", { name: /^Products$/i }).first();
  await productsBtn.hover();
  await page.waitForTimeout(600);
  await productsBtn.click();
  await page.waitForTimeout(700);
  mega = await page.evaluate(() => {
    const open = [...document.querySelectorAll("header *")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 180 && r.width > 400 && getComputedStyle(el).display !== "none";
    }).slice(0, 6).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        className: String(el.className).slice(0, 140),
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        padding: cs.padding,
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 400),
      };
    });
    return open;
  });
  await page.screenshot({ path: path.join(shotDir, "mega-1440.png") });
} catch (err) {
  checkpoint.errors.push({ step: "mega", error: String(err.message || err) });
}

await page.keyboard.press("Escape");
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
const mobile = {
  header: await styleOf(page, "header", 1),
  h1: await styleOf(page, "h1", 1),
  sections: await styleOf(page, "main section", 16),
};
try {
  const menuBtn = page.getByRole("button", { name: /open menu/i }).first();
  await menuBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(shotDir, "mobile-menu-390.png") });
  mobile.menuText = await page.evaluate(() => (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 800));
} catch (err) {
  checkpoint.errors.push({ step: "mobile-menu", error: String(err.message || err) });
}

async function capturePage(name, url) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const res = await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await acceptCookies(page);
  checkpoint.visited.push(url);
  const info = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.innerText?.replace(/\s+/g, " ").trim() || null,
    h2: [...document.querySelectorAll("h2")].slice(0, 12).map((el) => el.innerText.replace(/\s+/g, " ").trim()),
  }));
  const styles = {
    h1: await styleOf(page, "h1", 1),
    h2: await styleOf(page, "h2", 8),
    buttons: await styleOf(page, "button, a", 6),
  };
  await page.screenshot({ path: path.join(shotDir, `${name}-1440.png`), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shotDir, `${name}-390.png`), fullPage: false });
  for (const width of REQUIRED) {
    if (width === 1440 || width === 390) continue;
    await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shotDir, `${name}-${width}.png`), fullPage: false });
  }
  return { url, status: res?.status() ?? null, info, styles };
}

const productLink = await (async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("https://www.vikan.com/int/products", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  checkpoint.visited.push("https://www.vikan.com/int/products");
  return page.evaluate(() => {
    const hrefs = [...document.querySelectorAll("a")].map((a) => a.getAttribute("href") || "");
    const category = hrefs.find((h) => /\/products\/[a-z0-9-]+\/?$/.test(h) && !h.endsWith("/products") && !h.endsWith("/products/"));
    const product = hrefs.find((h) => /\/products\/.+\/.+/.test(h));
    return { category, product, hrefSample: hrefs.filter((h) => h.includes("/products/")).slice(0, 15) };
  });
})();

const pages = {};
pages.products = await capturePage("products", "https://www.vikan.com/int/products");
if (productLink.category) {
  const cat = productLink.category.startsWith("http") ? productLink.category : "https://www.vikan.com" + productLink.category;
  pages.category = await capturePage("category", cat);
}
if (productLink.product) {
  const prod = productLink.product.startsWith("http") ? productLink.product : "https://www.vikan.com" + productLink.product;
  pages.product = await capturePage("product", prod);
}
pages.contact = await capturePage("contact", "https://www.vikan.com/int/contact-us");
pages.about = await capturePage("about", "https://www.vikan.com/int/about-vikan");
pages.search = await capturePage("search", "https://www.vikan.com/int/search-result?query=brush");
pages.missing = await capturePage("not-found", "https://www.vikan.com/int/this-page-does-not-exist-faberkimya");

const tokens = {
  capturedAt: new Date().toISOString(),
  referenceUrl: homeUrl,
  fontFamily: desktop.h1[0]?.style.fontFamily || null,
  h1: desktop.h1[0]?.style || null,
  header: desktop.header[0]?.style || null,
  nav: desktop.navButtons.map((n) => ({ text: n.text, style: n.style, rect: n.rect })),
  h2: desktop.h2.map((n) => ({ text: n.text, style: n.style })),
  sections: desktop.sections.map((n) => ({ text: n.text, rect: n.rect, style: { backgroundColor: n.style.backgroundColor, color: n.style.color, paddingTop: n.style.paddingTop, paddingBottom: n.style.paddingBottom, maxWidth: n.style.maxWidth } })),
  footer: desktop.footer[0]?.style || null,
  layoutByWidth,
  mobileHeader: mobile.header[0]?.style || null,
  colors: {},
};
const colorSet = new Set();
for (const node of [...desktop.header, ...desktop.navButtons, ...desktop.h1, ...desktop.h2, ...desktop.sections, ...desktop.footer]) {
  if (!node) continue;
  colorSet.add(node.style.color);
  colorSet.add(node.style.backgroundColor);
}
tokens.colors = [...colorSet];

fs.writeFileSync(path.join(outDir, "tokens.json"), JSON.stringify(tokens, null, 2));
fs.writeFileSync(path.join(outDir, "components.json"), JSON.stringify({ homeMeta, desktop, mobile, productLink, pages: Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, v ? { url: v.url, status: v.status, info: v.info, styles: v.styles } : null])) }, null, 2));
fs.writeFileSync(path.join(outDir, "interactions.json"), JSON.stringify({
  mega,
  mobileMenuOpened: Boolean(mobile.menuText),
  mobileMenuTextSample: mobile.menuText || null,
  hover: "Products button hover+click captured in mega-1440.png",
  scroll: "fullPage home screenshots stored per required width",
  notes: [
    "Animations recorded via Web Animations API when present on measured nodes.",
    "Vikan logo SVG, product photography and font files were not downloaded.",
  ],
}, null, 2));

checkpoint.finishedAt = new Date().toISOString();
save();
await browser.close();
console.log("MEASURED", homeMeta.h1, "sections", homeMeta.sectionCount, "errors", checkpoint.errors.length);
