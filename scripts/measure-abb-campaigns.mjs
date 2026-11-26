import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://abb-bank.az/ferdi", { waitUntil: "networkidle", timeout: 120000 });

const kampaniyaHeading = page.getByRole("heading", { name: "Kampaniyalar", exact: true });
await kampaniyaHeading.scrollIntoViewIfNeeded({ timeout: 60000 });
await page.waitForTimeout(1500);

const metrics = await page.evaluate(() => {
  const h2 = [...document.querySelectorAll("h2")].find((el) => el.textContent?.trim() === "Kampaniyalar");
  if (!h2) return { error: "heading not found" };

  const headerRow = h2.closest("div");
  const section =
    h2.closest('[class*="container"]')?.parentElement?.parentElement ??
    h2.closest("section") ??
    h2.parentElement?.parentElement?.parentElement;

  const cards = [];
  const links = section?.querySelectorAll("a[href]") ?? [];
  for (const a of links) {
    const img = a.querySelector("img");
    const title = a.querySelector("h3, h4, [class*='title']");
    if (img && title) {
      const r = a.getBoundingClientRect();
      if (r.width > 200 && r.height > 300) {
        cards.push({
          w: Math.round(r.width),
          h: Math.round(r.height),
          className: a.className,
          inner: a.innerHTML.slice(0, 200),
        });
      }
    }
  }

  const style = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      className: el.className?.slice?.(0, 120) ?? "",
      w: Math.round(r.width),
      h: Math.round(r.height),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      padding: cs.padding,
      margin: cs.margin,
      gap: cs.gap,
      borderRadius: cs.borderRadius,
      backgroundColor: cs.backgroundColor,
    };
  };

  const navBtns = [...(headerRow?.querySelectorAll("button") ?? [])].map((b) => style(b));

  return {
    heading: style(h2),
    headerRow: style(headerRow),
    section: style(section),
    panel: style(h2.closest('[class*="rounded"]') ?? section),
    cards: cards.slice(0, 4),
    navBtns,
    track: style(cards[0]?.className ? null : section?.querySelector('[class*="swiper"], [class*="carousel"], [class*="overflow"]')),
  };
});

console.log(JSON.stringify(metrics, null, 2));
await browser.close();