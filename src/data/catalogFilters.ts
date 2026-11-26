import { categoryTree } from "./categoryTree";
import { productCountInCategory } from "./catalog";
import type { Category } from "./types";

/** Parent menu groups that have at least one product in the parent or any child slug. */
export function filterParentGroups(): Category[] {
  return categoryTree
    .filter((group) => {
      if (!group.parent) return false;
      const inParent = productCountInCategory(group.parent.slug);
      const inChildren = group.children.reduce((n, child) => n + productCountInCategory(child.slug), 0);
      return inParent > 0 || inChildren > 0;
    })
    .map((group) => group.parent!);
}

export function filterSubcategories(parentSlug: string) {
  const group = categoryTree.find((item) => item.parent?.slug === parentSlug);
  if (!group) return [];
  return group.children.filter((child) => productCountInCategory(child.slug) > 0);
}