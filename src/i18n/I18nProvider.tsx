import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchBootstrap, type BootstrapResponse } from "../api/client";
import { company as staticCompany } from "../data/catalog";

export const SUPPORTED_LANGS = ["az", "ru", "tr", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
  categoryName: (slug: string, fallback: string) => string;
  company: BootstrapResponse["company"];
  ready: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const staticCache: Record<string, string> = {};

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [translations, setTranslations] = useState<Record<string, string>>(staticCache);
  const [companyData, setCompanyData] = useState<BootstrapResponse["company"]>(staticCompany as BootstrapResponse["company"]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    fetchBootstrap(lang)
      .then((data) => {
        if (cancelled) return;
        setTranslations(data.translations);
        Object.assign(staticCache, data.translations);
        setCompanyData(data.company?.name ? data.company : (staticCompany as BootstrapResponse["company"]));
        const names: Record<string, string> = {};
        for (const item of data.categories ?? []) {
          if (item.slug && item.name) names[item.slug] = item.name;
        }
        setCategoryNames(names);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const value = translations[key];
      if (value) return value;
      if (fallback) return fallback;
      return "";
    },
    [translations],
  );

  const categoryName = useCallback(
    (slug: string, fallback: string) => categoryNames[slug] || fallback,
    [categoryNames],
  );

  const setLang = useCallback((_next: Lang) => {}, []);

  const value = useMemo(
    () => ({ lang, setLang, t, categoryName, company: companyData, ready }),
    [lang, setLang, t, categoryName, companyData, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n requires I18nProvider");
  return ctx;
}