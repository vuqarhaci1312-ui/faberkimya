import fs from "fs";
import path from "path";

const root = process.cwd();
const dir = path.join(root, "public", "media", "vikan");
fs.mkdirSync(path.join(dir, "sections"), { recursive: true });
fs.mkdirSync(path.join(dir, "icons"), { recursive: true });
fs.mkdirSync(path.join(dir, "about"), { recursive: true });

async function save(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(res.status + " " + url);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("saved", path.basename(dest), fs.statSync(dest).size);
}

await save(
  "https://perfion.vikan.com/perfion/file.aspx?id=8f62778e-b8e6-4ce8-b83b-83a50940a9f5",
  path.join(dir, "hero.mp4"),
);

const sections = [
  "https://perfion.vikan.com/perfion/image.aspx?id=0e645b21-8052-4819-93e4-18daf229d46f&quality=85&format=webp&size=640x686",
  "https://perfion.vikan.com/perfion/image.aspx?id=3a808b7c-a7f8-47ea-99be-e548dceee6c4&quality=85&format=webp&size=640x427",
  "https://perfion.vikan.com/perfion/image.aspx?id=f635342d-4d58-431c-aabf-b092edaeefe4&quality=85&format=webp&size=640x686",
  "https://perfion.vikan.com/perfion/image.aspx?id=f32f2d27-ab7b-4e6b-8b0e-0789c45ad4d3&quality=85&format=webp&size=640x706",
];
for (let i = 0; i < sections.length; i++) await save(sections[i], path.join(dir, "sections", i + ".webp"));

const about = JSON.parse(fs.readFileSync("research/vikan/fidelity/about-imgs.json", "utf8"));
for (let i = 0; i < about.length; i++) await save(about[i].src, path.join(dir, "about", i + ".webp"));

const icons = JSON.parse(fs.readFileSync("research/vikan/fidelity/cat-icons.json", "utf8"));
const iconFiles = [];
for (let i = 0; i < icons.length; i++) {
  if (!icons[i].img) continue;
  const file = `icons/${i}.webp`;
  await save(icons[i].img, path.join(dir, "icons", i + ".webp"));
  iconFiles.push({ name: icons[i].name, file: "/media/vikan/" + file });
}
fs.writeFileSync(path.join(root, "src", "data", "vikan-icons.json"), JSON.stringify(iconFiles, null, 2));
console.log("done", iconFiles.length);
