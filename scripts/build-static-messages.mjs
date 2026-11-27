import fs from "node:fs";

const text = fs.readFileSync("xebersekilleri/kataloglar/tercumeler/faber-i18n.csv", "utf8");
const rows = [];
let row = [];
let cur = "";
let quoted = false;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  if (quoted) {
    if (c === '"') {
      if (text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        quoted = false;
      }
    } else {
      cur += c;
    }
  } else if (c === '"') {
    quoted = true;
  } else if (c === ",") {
    row.push(cur);
    cur = "";
  } else if (c === "\n") {
    row.push(cur);
    rows.push(row);
    row = [];
    cur = "";
  } else if (c !== "\r") {
    cur += c;
  }
}
if (cur || row.length) {
  row.push(cur);
  rows.push(row);
}

const messages = { az: {}, ru: {}, tr: {}, en: {} };
for (const record of rows.slice(1)) {
  if (record.length < 5) continue;
  const [az, ru, tr, en, key] = record;
  if (!key) continue;
  messages.az[key] = az;
  messages.ru[key] = ru || az;
  messages.tr[key] = tr || az;
  messages.en[key] = en || az;
}

const php = fs.readFileSync("backend/config/ui-gaps.php", "utf8");
const re = /'([^']+)'\s*=>\s*\[\s*'az'\s*=>\s*'((?:\\'|[^'])*)'\s*,\s*'ru'\s*=>\s*'((?:\\'|[^'])*)'\s*,\s*'tr'\s*=>\s*'((?:\\'|[^'])*)'\s*,\s*'en'\s*=>\s*'((?:\\'|[^'])*)'/g;
const unescape = (value) => value.replace(/\\'/g, "'").replace(/\\n/g, "\n");
let match;
while ((match = re.exec(php))) {
  const key = match[1];
  messages.az[key] = unescape(match[2]);
  messages.ru[key] = unescape(match[3]) || messages.az[key];
  messages.tr[key] = unescape(match[4]) || messages.az[key];
  messages.en[key] = unescape(match[5]) || messages.az[key];
}

const body = `export const staticMessages: Record<"az" | "ru" | "tr" | "en", Record<string, string>> = ${JSON.stringify(messages, null, 2)};\n`;
fs.writeFileSync("src/i18n/messages.ts", body);
console.log(`keys ${Object.keys(messages.az).length}`);
console.log(messages.az["hero.title"]);
