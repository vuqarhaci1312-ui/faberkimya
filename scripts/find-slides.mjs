import fs from "fs";
const t = fs.readFileSync("research/vikan/fidelity/us.html", "utf8");
const i = t.indexOf("Everyone Deserves");
const chunk = t.slice(Math.max(0, i - 2500), i + 1800);
fs.writeFileSync("research/vikan/match/slide-chunk.txt", chunk);
console.log(chunk.replace(/\\u003c/g, "<").replace(/\\u003e/g, ">").replace(/\\"/g, '"').slice(0, 2200));
