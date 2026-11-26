import site from "./site.json";
import type { Category, Product, SiteData } from "./types";

const data = site as SiteData;

export const company = data.company;
export const categories: Category[] = data.categories;
export const products: Product[] = data.products;
export const documents = data.documents;

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

export function categoryName(slug: string) {
  return categoryBySlug.get(slug)?.name ?? slug;
}

export function getCategory(slug: string) {
  return categoryBySlug.get(slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productsInCategory(slug: string) {
  return products.filter((product) => product.categorySlugs.includes(slug));
}

export function productCountInCategory(slug: string) {
  return productsInCategory(slug).length;
}

export function relatedProducts(product: Product, limit = 4) {
  const slug = product.categorySlugs[0];
  if (!slug) return [];
  return productsInCategory(slug).filter((item) => item.slug !== product.slug).slice(0, limit);
}

export function searchProducts(query: string) {
  const q = query.trim().toLocaleLowerCase("az");
  if (!q) return [];
  return products.filter((product) => {
    const names = product.categorySlugs.map((slug) => categoryName(slug)).join(" ");
    const haystack = [product.name, product.article, product.description, product.vendor, names]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("az");
    return haystack.includes(q);
  });
}

export function sortProducts(list: Product[], sort: "name-asc" | "name-desc") {
  const copy = [...list];
  copy.sort((a, b) => a.name.localeCompare(b.name, "az", { sensitivity: "base" }));
  if (sort === "name-desc") copy.reverse();
  return copy;
}
