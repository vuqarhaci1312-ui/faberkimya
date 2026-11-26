import { expect, test } from "@playwright/test";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const site = JSON.parse(
  fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/data/site.json"), "utf8"),
) as { products: unknown[] };

const widths = [1920, 1440, 1280, 1024, 768, 430, 390, 375];

test("home shows the original hero video and header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toContainText("info@faberkimya.az");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everyone Deserves");
  await expect(page.locator("video")).toHaveAttribute("src", "/media/vikan/hero-brushes.mp4");
  const header = page.locator("header");
  const box = await header.boundingBox();
  expect(box?.height).toBe(100);
  await page.screenshot({ path: "research/app/home-1440.png", fullPage: true });
});

test("catalog lists every migrated product", async ({ page }) => {
  await page.goto("/mehsullar");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(String(site.products.length));
  await expect(page.locator("article")).toHaveCount(site.products.length);
  await page.screenshot({ path: "research/app/catalog-1440.png", fullPage: false });
});

test("category, product, search and form do not fake success", async ({ page }) => {
  await page.goto("/mehsullar");
  await page.locator("article a").first().click();
  await expect(page).toHaveURL(/\/mehsul\//);
  await expect(page.locator("h1")).toBeVisible();
  await page.goto("/axtaris?q=ecoline");
  await expect(page.locator("article").first()).toBeVisible();
  await page.goto("/ekse-elaqe");
  await page.getByRole("button", { name: "Yoxla" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Ad", exact: true }).fill("Test");
  await page.getByRole("combobox", { name: "Kateqoriya" }).selectOption({ index: 1 });
  await page.getByRole("textbox", { name: "Mətn" }).fill("Bu müraciət yoxlama üçündür.");
  await page.getByRole("button", { name: "Yoxla" }).click();
  await expect(page.getByRole("status")).toContainText("poçt serveri yoxdur");
});

test("missing route and mobile menu", async ({ page }) => {
  await page.goto("/yoxdur");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Səhifə tapılmadı");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const header = page.locator("header");
  const box = await header.boundingBox();
  expect(box?.height).toBe(80);
  await page.getByRole("button", { name: "Menyunu aç" }).click();
  await expect(page.getByRole("dialog", { name: "Mobil menyu" })).toBeVisible();
  await page.screenshot({ path: "research/app/menu-390.png" });
});

test("products menu opens to the measured panel and about keeps the section structure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Məhsullar" }).click();
  const dialog = page.getByRole("dialog", { name: "Məhsullar" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box?.width).toBeGreaterThan(480);
  expect(box?.width).toBeLessThan(520);
  await page.getByRole("button", { name: /Mətbəx gigiyenası/ }).click();
  await page.waitForTimeout(400);
  const wide = await dialog.boundingBox();
  expect(wide?.width).toBeGreaterThan(1100);
  await page.goto("/sirket");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main a")).toHaveCount(12);
});

test("required widths keep the catalog heading", async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/mehsullar");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
