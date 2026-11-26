import fs from "fs";
import path from "path";
const ids = [
  "3e40e63d-ea4d-4179-9fa2-ac6194f2cf64",
  "aaa48e6f-eb08-4162-aba9-d410f3e2c0e2",
  "3f48d29b-9611-4ae4-89c6-17c98579c5c6",
  "db979cab-f0b6-4a0d-8fcd-63226e7af742",
  "d2b55ce0-64fa-46d9-8b70-349a180b1f2c",
  "d9b04635-65c7-419f-9ffb-c52a96f1eab2",
];
const dir = path.resolve("public/media/vikan/insights");
fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < ids.length; i++) {
  const dest = path.join(dir, i + ".webp");
  const url = `https://perfion.vikan.com/perfion/image.aspx?id=${ids[i]}&quality=85&format=webp&size=800x600`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(String(res.status));
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(i, fs.statSync(dest).size);
}
