export type Category = {
  slug: string;
  name: string;
  path: string;
};

export type Product = {
  slug: string;
  name: string;
  article: string | null;
  description: string | null;
  vendor: string | null;
  images: string[];
  categorySlugs: string[];
};

export type DocumentItem = {
  sourceUrl: string;
  file: string | null;
  title: string;
  missing?: boolean;
  error?: string;
};

export type SiteData = {
  company: {
    name: string;
    aboutTitle: string | null;
    aboutText: string | null;
    contactText: string | null;
    phones: string[];
    phoneHrefs: string[];
    email: string | null;
    socials: string[];
    logo: string | null;
    tagline: string | null;
  };
  categories: Category[];
  products: Product[];
  documents: DocumentItem[];
};
