import fs from "fs";
import path from "path";
const html = fs.readFileSync("research/vikan/fidelity/us.html", "utf8");
const ids = [...html.matchAll(/image\.aspx\?id=([a-f0-9-]+)/g)].map((m) => m[1]);
const unique = [...new Set(ids)];
console.log("count", unique.length);
fs.writeFileSync("research/vikan/match/image-ids.json", JSON.stringify(unique, null, 2));

const logos = [
  "2feb653d-1d34-4800-8091-4c097c0b88d1",
  "d628f5ad-3433-47ca-ad73-adae04b6474d",
  "08866758-762e-495c-9a1b-08e565d21743",
  "aa8f4b01-5e7c-4ccb-be4c-fdd04314f37e",
  "0d8a2b08-1147-469a-908b-7de05af9a86a",
  "6a0f1f15-b71d-4c65-8479-68af0b49412f",
  "b54f8e34-05c9-4d05-a50f-99ebacd9e6d4",
  "3a99a21f-78a2-4ef2-93c9-58c0fbe3997e",
  "5782053d-3ef6-4710-ab97-67b5a4ddaab2",
  "ec5d84cb-df1a-42ce-9cc7-84a74190811f",
  "839edde5-3e29-4131-bc5c-210114406cff",
  "86b3d65d-5c44-4a60-af46-03ee0ef92643",
];
const dir = path.resolve("public/media/vikan/logos");
fs.mkdirSync(dir, { recursive: true });
async function save(id, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 200) return;
  const url = `https://perfion.vikan.com/perfion/image.aspx?id=${id}&quality=85&format=webp&size=640x640`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(res.status + " " + id);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}
for (let i = 0; i < logos.length; i++) await save(logos[i], path.join(dir, i + ".webp"));
console.log("logos", logos.length);
