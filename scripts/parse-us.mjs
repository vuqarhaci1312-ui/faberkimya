import fs from "fs";
const t = fs.readFileSync("research/vikan/fidelity/us.html", "utf8");
const i = t.indexOf("The Original");
console.log(t.slice(i, i + 1800).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 900));
