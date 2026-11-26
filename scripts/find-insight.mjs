import fs from "fs";
const t = fs.readFileSync("research/vikan/fidelity/us.html", "utf8");
for (const title of ["Training Resources", "Technical Collaboration", "Case Stories"]) {
  const i = t.indexOf(title);
  const slice = t.slice(Math.max(0, i - 700), i);
  const id = [...slice.matchAll(/id=([a-f0-9-]{36})/g)].at(-1);
  console.log(title, i, id ? id[1] : "none");
}
