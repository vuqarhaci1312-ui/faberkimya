import * as cheerio from "cheerio";
import fs from "fs";

const urls = [
  "http://faberkimya.az/magazin/folder/təmizlik-avadanligi",
  "http://faberkimya.az/magazin/folder/tmizlik",
  "http://faberkimya.az/magazin/folder/dispenserlər",
];
for (const u of urls) {
  const html = await (await fetch(u)).text();
  const $ = cheerio.load(html);
  const hrefs = new Set();
  $("a[href]").each((_, el) => {
    const h = $(el).attr("href") || "";
    if (/\/p\/\d+|page=|pager/i.test(h)) hrefs.add(h);
  });
  const products = new Set();
  $("a[href]").each((_, el) => {
    const h = $(el).attr("href") || "";
    if (h.includes("/magazin/product/")) products.add(h);
  });
  console.log(u, "pager", [...hrefs].slice(0, 12), "products", products.size);
}

const inv = JSON.parse(fs.readFileSync("CONTENT_INVENTORY.json", "utf8"));
const sample = inv.products.find((p) => p.slug === "ecoline-g-303");
console.log(JSON.stringify({
  name: sample.name,
  article: sample.article,
  desc: (sample.description || "").slice(0, 220),
  usage: (sample.usage || "").slice(0, 220),
  img: sample.images,
  priceText: sample.priceText,
}, null, 2));
console.log("email about", inv.company.aboutText.includes("info@"));
console.log("email contact", (inv.company.contactText || "").includes("info@"));
