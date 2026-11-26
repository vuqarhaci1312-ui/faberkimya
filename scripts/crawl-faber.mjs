import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ORIGIN = "http://faberkimya.az";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchDir = path.join(root, "research", "faberkimya");
const mediaDir = path.join(root, "public", "media");
const checkpointPath = path.join(researchDir, "checkpoint.json");

fs.mkdirSync(researchDir, { recursive: true });
fs.mkdirSync(path.join(mediaDir, "products"), { recursive: true });
fs.mkdirSync(path.join(mediaDir, "catalogs"), { recursive: true });
fs.mkdirSync(path.join(mediaDir, "brand"), { recursive: true });

const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, "utf8"));
checkpoint.startedAt = checkpoint.startedAt || new Date().toISOString();
checkpoint.visited = checkpoint.visited || [];
checkpoint.productUrls = checkpoint.productUrls || [];
checkpoint.errors = checkpoint.errors || [];
const visited = new Set(checkpoint.visited);

function saveCheckpoint() {
  checkpoint.visited = [...visited];
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "FaberkimyaContentMigration/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  visited.add(url);
  const buf = Buffer.from(await res.arrayBuffer());
  return new TextDecoder("utf-8").decode(buf);
}

function abs(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return "http:" + href;
  if (href.startsWith("/")) return ORIGIN + href;
  return ORIGIN + "/" + href;
}

function slugFromProduct(href) {
  const u = new URL(abs(href));
  const parts = decodeURIComponent(u.pathname).split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function originalImage(src) {
  if (!src) return null;
  const full = abs(src.split("?")[0]);
  try {
    const u = new URL(full);
    const idx = u.pathname.indexOf("/d/");
    if (idx >= 0) return ORIGIN + u.pathname.slice(idx);
  } catch {
    return null;
  }
  return null;
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest;
  const res = await fetch(url, { headers: { "User-Agent": "FaberkimyaContentMigration/1.0" }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return dest;
}

function textOf(el) {
  return el.text().replace(/\s+/g, " ").trim();
}

async function mapPool(items, limit, fn) {
  const ret = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return ret;
}

const homeHtml = await fetchText(ORIGIN + "/");
const $home = cheerio.load(homeHtml);

const folderHrefs = new Set();
$home("a[href]").each((_, a) => {
  const href = $home(a).attr("href") || "";
  if (href.includes("/magazin/folder/")) {
    const u = new URL(abs(href));
    u.search = "";
    u.hash = "";
    folderHrefs.add(decodeURIComponent(u.pathname));
  }
});

const staticPaths = ["/shrkt-haqnda", "/elaqeler", "/kataloqlar", "/bize-yazin"];
const pages = [];
for (const p of staticPaths) {
  try {
    const html = await fetchText(ORIGIN + p);
    const $ = cheerio.load(html);
    const title = $("title").first().text().trim();
    const h1 = textOf($("h1").first());
    $("script, style, noscript, header, footer, nav").remove();
    const bodyText = textOf($("body"));
    pages.push({ path: p, title, h1, text: bodyText });
    console.log("page", p, h1);
  } catch (err) {
    checkpoint.errors.push({ url: p, error: String(err.message || err) });
    console.log("FAIL page", p, err.message);
  }
}

const emails = new Set();
const phones = new Set();
for (const page of pages) {
  for (const m of page.text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) emails.add(m[0]);
  for (const m of page.text.matchAll(/(?:\+994|0)\s*\d[\d\s()-]{6,}/g)) phones.add(m[0].replace(/\s+/g, " ").trim());
}
const homeText = textOf($home("body"));
for (const m of homeText.matchAll(/(?:\+994|0)\s*\d[\d\s()-]{6,}/g)) phones.add(m[0].replace(/\s+/g, " ").trim());
for (const m of homeHtml.matchAll(/href="(mailto:[^"]+)"/gi)) emails.add(m[1].replace(/^mailto:/i, ""));
for (const m of homeHtml.matchAll(/href="(tel:[^"]+)"/gi)) phones.add(decodeURIComponent(m[1].replace(/^tel:/i, "")));

const socials = [];
$home("a[href]").each((_, a) => {
  const href = $home(a).attr("href") || "";
  if (/facebook|instagram|linkedin|youtube|twitter|t\.me/i.test(href)) socials.push(href);
});

const pdfHrefs = new Set();
for (const page of pages) {
  if (page.path !== "/kataloqlar" && page.path !== "/shrkt-haqnda") continue;
}
const catalogsHtml = await fetchText(ORIGIN + "/kataloqlar").catch(() => null);
if (catalogsHtml) {
  const $ = cheerio.load(catalogsHtml);
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (/\.pdf($|\?)/i.test(href)) pdfHrefs.add(abs(href));
  });
}

const documents = [];
for (const pdf of pdfHrefs) {
  const name = decodeURIComponent(pdf.split("/").pop().split("?")[0]);
  const dest = path.join(mediaDir, "catalogs", name);
  try {
    await download(pdf, dest);
    documents.push({ sourceUrl: pdf, file: "media/catalogs/" + name, title: name });
    console.log("pdf", name);
  } catch (err) {
    checkpoint.errors.push({ url: pdf, error: String(err.message || err) });
    documents.push({ sourceUrl: pdf, file: null, title: name, missing: true, error: String(err.message || err) });
  }
}

let logoFile = null;
const logoSrc = $home("img").toArray().map((img) => $home(img).attr("src") || "").find((s) => /logo/i.test(s));
if (logoSrc) {
  const orig = originalImage(logoSrc) || abs(logoSrc);
  const ext = path.extname(new URL(orig).pathname) || ".png";
  try {
    await download(orig, path.join(mediaDir, "brand", "logo" + ext));
    logoFile = "media/brand/logo" + ext;
  } catch (err) {
    checkpoint.errors.push({ url: orig, error: String(err.message || err) });
  }
}

const categoryPaths = [...folderHrefs];
const categories = [];
const productUrlSet = new Set(checkpoint.productUrls);

for (const folderPath of categoryPaths) {
  const url = ORIGIN + folderPath;
  try {
    const html = await fetchText(url);
    if (!html) continue;
    const $ = cheerio.load(html);
    const name = textOf($("h1").first()) || folderPath.split("/").pop();
    const productsHere = new Set();
    $("a[href]").each((_, a) => {
      const href = $(a).attr("href") || "";
      if (href.includes("/magazin/product/")) {
        const u = new URL(abs(href));
        productUrlSet.add(decodeURIComponent(u.pathname));
        productsHere.add(decodeURIComponent(u.pathname));
      }
    });
    const crumbs = $(".shop2-breadcrumbs a, .breadcrumbs a, .breadcrumb a")
      .toArray()
      .map((a) => ({ href: $(a).attr("href"), text: textOf($(a)) }));
    categories.push({
      path: folderPath,
      slug: decodeURIComponent(folderPath.split("/").filter(Boolean).pop()),
      name,
      productPaths: [...productsHere],
      breadcrumbs: crumbs,
    });
    console.log("folder", name, productsHere.size);
  } catch (err) {
    checkpoint.errors.push({ url, error: String(err.message || err) });
    console.log("FAIL folder", folderPath, err.message);
  }
  if (categories.length % 5 === 0) {
    checkpoint.productUrls = [...productUrlSet];
    checkpoint.cursor = folderPath;
    saveCheckpoint();
  }
}

checkpoint.productUrls = [...productUrlSet];
saveCheckpoint();

const products = [];
const missing = [];

await mapPool([...productUrlSet], 4, async (productPath) => {
  const url = ORIGIN + productPath;
  try {
    const html = await fetchText(url);
    if (!html) return;
    const $ = cheerio.load(html);
    const name = textOf($("h1").first());
    const article = textOf($(".shop2-product-article").first());
    const priceText = textOf($(".product-price, .shop2-product-price").first());
    const priceMatch = priceText.match(/(\d[\d\s.,]*)/);
    const price = priceMatch && /\d/.test(priceText) && !/^0([.,]0+)?$/.test(priceMatch[1].replace(/\s/g, ""))
      ? priceText
      : null;
    const description = textOf($(".shop2-product-desc").first());
    const options = textOf($(".shop2-product-options").first());
    const vendor = textOf($(".shop2-product-vendor, .product-vendor").first());
    const folders = $(".shop2-product-folders a")
      .toArray()
      .map((a) => ({ href: $(a).attr("href"), name: textOf($(a)) }));
    const images = [];
    const seenImg = new Set();
    $("img").each((_, img) => {
      const src = $(img).attr("src") || $(img).attr("data-src") || "";
      if (!/\/d\//.test(src) || /logo|soc__|favicon|icon/i.test(src)) return;
      const orig = originalImage(src);
      if (!orig || seenImg.has(orig)) return;
      seenImg.add(orig);
      images.push(orig);
    });
    const slug = slugFromProduct(productPath);
    const localImages = [];
    for (let n = 0; n < images.length; n++) {
      const ext = path.extname(new URL(images[n]).pathname) || ".jpg";
      const rel = `media/products/${slug}/${n}${ext}`;
      try {
        await download(images[n], path.join(root, "public", rel));
        localImages.push({ sourceUrl: images[n], file: rel });
      } catch (err) {
        missing.push({ url: images[n], product: productPath, error: String(err.message || err) });
      }
    }
    products.push({
      slug,
      path: productPath,
      name,
      article: article || null,
      price,
      priceText: priceText || null,
      vendor: vendor || null,
      description: description || null,
      usage: options || null,
      folders,
      images: localImages,
    });
    console.log("product", slug, localImages.length);
  } catch (err) {
    checkpoint.errors.push({ url, error: String(err.message || err) });
    missing.push({ url, error: String(err.message || err) });
    console.log("FAIL product", productPath, err.message);
  }
});

const about = pages.find((p) => p.path === "/shrkt-haqnda");
const contact = pages.find((p) => p.path === "/elaqeler");
const feedback = pages.find((p) => p.path === "/bize-yazin");

const inventory = {
  source: ORIGIN,
  capturedAt: new Date().toISOString(),
  languages: {
    htmlLang: "ru",
    visibleLanguage: "az",
    switcher: [
      { label: "Az", href: "http://az.faberkimya.az" },
      { label: "Ru", href: "http://az.faberkimya.az" },
    ],
    separateRuCorpusFound: false,
  },
  company: {
    name: "Faberkimya",
    aboutTitle: about?.h1 || null,
    aboutText: about?.text || null,
    phones: [...phones],
    emails: [...emails],
    socials: [...new Set(socials)],
    logo: logoFile,
    contactText: contact?.text || null,
    feedbackText: feedback?.text || null,
  },
  pages,
  categories: categories.map((c) => ({
    ...c,
    productSlugs: c.productPaths.map(slugFromProduct),
  })),
  products,
  documents,
  news: [],
  legalPages: [],
  counts: {
    products: products.length,
    categories: categories.length,
    images: products.reduce((n, p) => n + p.images.length, 0),
    documents: documents.filter((d) => d.file).length,
    pages: pages.length,
    news: 0,
  },
  missing,
  blockers: [
    "Shop2 cart, one-click buy, compare and Yandex captcha require the legacy backend. No fake success is implemented.",
    "Contact form has no reachable mail endpoint owned by this project.",
    "Knowledge, blog, webinars, training, awards, case stories, sustainability, industries, My Vikan, newsletter and book-a-meeting have no Faber corpus.",
  ],
};

const dedupedProducts = [];
const seenSlug = new Set();
for (const p of products) {
  if (seenSlug.has(p.slug)) continue;
  seenSlug.add(p.slug);
  dedupedProducts.push(p);
}
inventory.products = dedupedProducts;
inventory.counts.products = dedupedProducts.length;
inventory.counts.images = dedupedProducts.reduce((n, p) => n + p.images.length, 0);

const emptyFields = [];
for (const p of dedupedProducts) {
  for (const key of ["name", "description", "images", "article"]) {
    const v = p[key];
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) emptyFields.push({ slug: p.slug, field: key });
  }
}
inventory.emptyFields = emptyFields;

fs.writeFileSync(path.join(root, "CONTENT_INVENTORY.json"), JSON.stringify(inventory, null, 2));
checkpoint.finishedAt = new Date().toISOString();
checkpoint.cursor = "done";
saveCheckpoint();
console.log("DONE", inventory.counts);
