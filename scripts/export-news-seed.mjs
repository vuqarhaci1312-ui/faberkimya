import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const homeNews = readFileSync(join(root, "src/data/homeNews.ts"), "utf8");
const imports = [...homeNews.matchAll(/from "\.\/news\/([^"]+)"/g)].map((m) => m[1]);
const blocks = {};
for (const name of imports) {
  const src = readFileSync(join(root, `src/data/news/${name}.ts`), "utf8");
  const match = src.match(/export const \w+Blocks[^=]*=\s*(\[[\s\S]*\]);/);
  if (match) blocks[name] = JSON.parse(match[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
}
const itemsMatch = homeNews.match(/export const homeNewsItems[^=]*=\s*(\[[\s\S]*?\n\];)/);
if (!itemsMatch) throw new Error("homeNewsItems not found");
const itemsRaw = itemsMatch[1].replace(/;$/, "");
const idToFile = {
  "safe-cleaning": "safeCleaning",
  "professional-hygiene": "professionalHygiene",
  "ekoloji-temiz": "ekolojiTemiz",
  "public-hygiene": "publicHygiene",
};
const itemRe =
  /\{\s*id:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?subtitle:\s*"([^"]*)"[\s\S]*?seoTitle:\s*"([^"]+)"[\s\S]*?metaDescription:\s*"([^"]*)"[\s\S]*?keywords:\s*"([^"]*)"[\s\S]*?banner:\s*"([^"]+)"[\s\S]*?bannerWidth:\s*(\d+)[\s\S]*?bannerHeight:\s*(\d+)/g;
const items = [];
let m;
while ((m = itemRe.exec(homeNews))) {
  const fileKey = idToFile[m[1]];
  items.push({
    id: m[1],
    slug: m[2],
    title: m[3],
    subtitle: m[4],
    seoTitle: m[5],
    metaDescription: m[6],
    keywords: m[7],
    banner: m[8],
    bannerWidth: Number(m[9]),
    bannerHeight: Number(m[10]),
    blocks: blocks[fileKey] ?? [],
  });
}
writeFileSync(join(root, "backend/seed/news.json"), JSON.stringify(items, null, 2), "utf8");
console.log("Wrote", items.length, "news items to backend/seed/news.json");