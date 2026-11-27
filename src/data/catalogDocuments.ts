export type CatalogDocument = {
  slug: string;
  brand: string;
  title: string;
  subtitle: string;
  file: string;
  language: string;
};

export const catalogDocuments: CatalogDocument[] = [
  {
    slug: "rindo-2026",
    brand: "RINDO",
    title: "RINDO məhsul kataloqu 2026",
    subtitle: "RINDO xətti üzrə tam məhsul siyahısı (ingilis).",
    file: "/media/catalogs/rindo-urun-katalogu-2026-eng.pdf",
    language: "ENG",
  },
  {
    slug: "rulopak-2026",
    brand: "RULOPAK",
    title: "RULOPAK kataloqu 2026",
    subtitle: "RULOPAK kağız və gigiyena məhsulları kataloqu.",
    file: "/media/catalogs/rulopak-catalogue-2026.pdf",
    language: "ENG",
  },
  {
    slug: "utp-2026",
    brand: "UTP",
    title: "UTP məhsul kataloqu 2026",
    subtitle: "UTP brendi üzrə məhsul kataloqu (ingilis).",
    file: "/media/catalogs/utp-urun-katalogu-2026-eng.pdf",
    language: "ENG",
  },
];

export function getCatalogDocument(slug: string | undefined) {
  if (!slug) return undefined;
  return catalogDocuments.find((item) => item.slug === slug);
}