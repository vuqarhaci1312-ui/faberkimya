import fs from "fs";
const r = await fetch("https://www.vikan.com/us", { headers: { "User-Agent": "Mozilla/5.0" } });
const t = await r.text();
const i = t.indexOf("<video");
console.log(t.slice(i, i + 1500));
const j = t.toLowerCase().indexOf("mp4");
console.log("mp4 idx", j, j > 0 ? t.slice(j - 80, j + 80) : "");
fs.writeFileSync("research/vikan/fidelity/us.html", t);
