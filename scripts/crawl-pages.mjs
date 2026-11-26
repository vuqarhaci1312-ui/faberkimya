import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const ORIGIN = "http://faberkimya.az";
const root = process.cwd();
const inv = JSON.parse(fs.readFileSync(path.join(root, "CONTENT_INVENTORY.json"), "utf8"));
const known = new Set(inv.products.map((p) => p.path));

function abs(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return ORIGIN + href;
  return ORIGIN + "/" + href;
}

async function getHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": "FaberkimyaContentMigration/1.0" } });
  if (!res.ok) throw new Error(res.status + " " + url);
  return new TextDecoder("utf-8").decode(Buffer.from(await res.arrayBuffer()));
}

const extra = new Set();
for (const cat of inv.categories) {
  let page = 1;
  while (page < 12) {
    const url = ORIGIN + cat.path + "/p/" + page;
    let html;
    try { html = await getHtml(url); } catch { break; }
    const $ = cheerio.load(html);
    const found = new Set();
    $("a[href]").each((_, el) => {
      const h = $(el).attr("href") || "";
      if (!h.includes("/magazin/product/")) return;
      const u = new URL(abs(h));
      found.add(decodeURIComponent(u.pathname));
    });
    let added = 0;
    for (const p of found) {
      if (!known.has(p)) { extra.add(p); known.add(p); added++; }
    }
    console.log("page", cat.slug, page, "links", found.size, "new", added);
    if (found.size === 0 || added === 0) break;
    page++;
  }
}

const sample = await getHtml(ORIGIN + "/magazin/product/ecoline-g-303");
const $s = cheerio.load(sample);
const gallery = new Set();
$s("a[href], img[src]").each((_, el) => {
  const h = $s(el).attr("href") || $s(el).attr("src") || "";
  if (h.includes("/d/") && /\.(jpe?g|png|webp)/i.test(h)) gallery.add(h);
});
console.log("gallery sample", [...gallery]);
console.log("EXTRA", extra.size);
fs.writeFileSync(path.join(root, "research", "faberkimya", "extra-products.json"), JSON.stringify([...extra], null, 2));
