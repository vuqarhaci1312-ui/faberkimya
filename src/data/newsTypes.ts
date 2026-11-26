export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type HomeNewsItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  banner: string;
  bannerWidth?: number;
  bannerHeight?: number;
  to: string;
  blocks: NewsBlock[];
};