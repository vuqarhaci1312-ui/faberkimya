import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const ORIGIN = "http://faberkimya.az";
const root = process.cwd();
const inv = JSON.parse(fs.readFileSync(path.join(root, "CONTENT_INVENTORY.json"), "utf8"));

function abs(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  return ORIGIN + (href.startsWith("/") ? href : "/" + href);
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "FaberkimyaContentMigration/1.0" } });
  if (!res.ok) throw new Error(res.status + " " + url);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const extraPath = "/magazin/product/təmizlik-səbəti";
if (!inv.products.some((p) => p.path === extraPath)) {
  const html = await (await fetch(ORIGIN + encodeURI(extraPath))).text();
  const $ = cheerio.load(html);
  const name = $("h1").first().text().replace(/\s+/g, " ").trim();
  const description = $(".shop2-product-desc").first().text().replace(/\s+/g, " ").trim();
  const images = [];
  const seen = new Set();
  $("img").each((_, img) => {
    const src = $(img).attr("src") || "";
    const idx = src.indexOf("/d/");
    if (idx < 0 || /logo|soc__|favicon/i.test(src)) return;
    const orig = ORIGIN + src.slice(idx).split("?")[0];
    if (seen.has(orig)) return;
    seen.add(orig);
    images.push(orig);
  });
  const slug = "temizlik-sebeti";
  const local = [];
  for (let n = 0; n < images.length; n++) {
    const ext = path.extname(new URL(images[n]).pathname) || ".jpg";
    const rel = `media/products/${slug}/${n}${ext}`;
    await download(images[n], path.join(root, "public", rel));
    local.push({ sourceUrl: images[n], file: rel });
  }
  inv.products.push({
    slug,
    path: extraPath,
    name,
    article: null,
    price: null,
    priceText: null,
    vendor: "Faber",
    description,
    usage: null,
    folders: [{ href: "/magazin/folder/təmizlik-avadanligi", name: "Təmizlik avadanlığı" }],
    images: local,
  });
  console.log("added", name, local.length);
}

function cleanArticle(value) {
  if (!value) return null;
  const text = value.replace(/артикул\s*:/i, "").trim();
  if (!text || /нет|yoxdur|^no$/i.test(text)) return null;
  return text;
}

function categorySlug(href) {
  if (!href) return null;
  const parts = decodeURIComponent(href.split("?")[0]).split("/").filter(Boolean);
  return parts[parts.length - 1];
}

const categories = [];
const seenCat = new Set();
for (const cat of inv.categories) {
  const slug = categorySlug(cat.path) || cat.slug;
  if (seenCat.has(slug)) continue;
  seenCat.add(slug);
  categories.push({ slug, name: cat.name, path: cat.path });
}

const products = inv.products.map((p) => {
  const categorySlugs = [...new Set((p.folders || []).map((f) => categorySlug(f.href)).filter((s) => s && seenCat.has(s)))];
  return {
    slug: p.slug,
    name: p.name,
    article: cleanArticle(p.article),
    description: (p.description || "").replace(/\s+/g, " ").trim() || null,
    vendor: (p.vendor || (p.usage || "").includes("Faber")) ? "Faber" : p.vendor || null,
    images: (p.images || []).map((img) => "/" + img.file.replace(/\\/g, "/")),
    categorySlugs,
  };
});

const missingImages = [];
for (const p of products) {
  p.images = p.images.filter((src) => {
    const ok = fs.existsSync(path.join(root, "public", decodeURIComponent(src.replace(/^\//, ""))));
    if (!ok) missingImages.push({ slug: p.slug, src });
    return ok;
  });
}

function sliceContent(text, start) {
  if (!text) return null;
  const flat = text.replace(/\s+/g, " ").trim();
  const i = start ? flat.indexOf(start) : 0;
  let body = i >= 0 ? flat.slice(i) : flat;
  const endMarkers = ["Məhsullar üzrə axtarış", "Şirkət haqqında Məhsular"];
  for (const mark of endMarkers) {
    const j = body.indexOf(mark);
    if (j > 80) body = body.slice(0, j).trim();
  }
  return body;
}

const aboutText = sliceContent(inv.company.aboutText, inv.company.aboutTitle || "Faber");
const contactText = sliceContent(inv.company.contactText, "Əlaqələr");
const taglineMatch = (inv.company.contactText || "").match(/PEŞƏKAR[^.]{0,80}/);
const email = (inv.company.emails || []).find((e) => e.includes("@")) || null;

const site = {
  company: {
    name: "Faberkimya",
    aboutTitle: inv.company.aboutTitle,
    aboutText,
    contactText,
    phones: ["(012) 441-69-02", "(055) 266-60-10"],
    phoneHrefs: ["tel:0124416902", "tel:0552666010"],
    email,
    socials: [...new Set(inv.company.socials || [])],
    logo: inv.company.logo ? "/" + inv.company.logo : null,
    tagline: taglineMatch ? taglineMatch[0].trim() : null,
  },
  categories,
  products,
  documents: inv.documents,
  counts: {
    products: products.length,
    categories: categories.length,
    images: products.reduce((n, p) => n + p.images.length, 0),
    documentsOnDisk: (inv.documents || []).filter((d) => d.file).length,
    documentsMissing: (inv.documents || []).filter((d) => !d.file).length,
  },
  missingImages,
};

fs.mkdirSync(path.join(root, "src", "data"), { recursive: true });
fs.writeFileSync(path.join(root, "src", "data", "site.json"), JSON.stringify(site));
inv.counts.products = products.length;
inv.counts.images = site.counts.images;
inv.company.phones = site.company.phones;
inv.company.emails = email ? [email] : [];
fs.writeFileSync(path.join(root, "CONTENT_INVENTORY.json"), JSON.stringify(inv));
console.log(site.counts);
console.log("tagline", site.company.tagline);
console.log("about", (aboutText || "").slice(0, 280));
console.log("missingImages", missingImages.length);
