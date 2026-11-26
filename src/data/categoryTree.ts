import { categories } from "./catalog";

const treeNames = [
  { name: "Mətbəx gigiyenası", children: ["Mətbəx", "Yuyucu", "Yuyucu və dezinfeksiya", "Dezinfeksiya", "Qida gigiyenası"] },
  { name: "Çamaşır gigiyenası", children: ["Əsas yuyucu vasitələr", "Yardımçı yuyucu vasitələr", "Ləkəaparan və ağardıcı vasitələr"] },
  { name: "Təmizlik", children: ["Şüşə və parlaq səthlərə qulluq", "Döşəmə üçün qulluq", "Xalça təmizləmə", "Xüsusi vasitələr", "Hamam təmizliyi və gigiyenası"] },
  { name: "Təmizlik avadanlığı", children: ["Təmizlik arabaları", "Tək istifadəlik məhsullar", "Kağız məhsulları", "Dispenserlər"] },
  { name: "Şəxsi gigiyena", children: ["Hovuza qulluq", "Vanna otağı"] },
];

function byName(name: string) {
  return categories.find((category) => category.name === name);
}

export const categoryTree = treeNames.map((group) => ({
  parent: byName(group.name),
  children: group.children.map(byName).filter((category) => category != null),
})).filter((group) => group.parent != null);

export function groupForSlug(slug?: string) {
  if (!slug) return undefined;
  return categoryTree.find((group) => group.parent?.slug === slug || group.children.some((child) => child.slug === slug));
}
