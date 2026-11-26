import fs from "fs";

const css = fs.readFileSync("research/abb-0ssi-~mkg~jxc.css", "utf8");

const names = [
  "typography-title-heading-large",
  "typography-title-subhead-large",
  "typography-title-subhead-medium",
  "typography-body-compact-regular",
  "bg-surface-secondary",
  "rounded-3xl",
  "rounded-2xl",
  "gap-600",
  "px-600",
  "pt-600",
  "pb-300",
  "lg\\:px-1000",
  "lg\\:pt-1000",
  "lg\\:pb-400",
  "space-y-300",
  "lg\\:space-y-400",
  "space-y-600",
  "xl\\:space-y-1000",
  "size-xl",
  "space-x-300",
  "space-y-300",
  "space-y-400",
  "space-y-600",
  "space-y-1000",
  "xl\\:space-y-1000",
  "gap-600",
  "-ml-3",
  "xl\\:-ml-4",
  "pl-3",
  "xl\\:pl-4",
  "xl\\:basis-1\\/3",
  ".container",
  "text-content-primary",
  "text-content-secondary",
  "py-800",
  "xl\\:pt-2000",
  "xl\\:pb-1600",
  "rounded-t-5xl",
  "lg\\:rounded-3xl",
  "max-h-\\[230px\\]",
  "lg\\:max-h-\\[230px\\]",
];

for (const name of names) {
  const needle = name.startsWith(".") ? name.slice(1) : name;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\.${escaped}\\{[^}]+\\}`);
  const m = css.match(re);
  console.log(m ? `${name}: ${m[0]}` : `${name}: NOT FOUND`);
}