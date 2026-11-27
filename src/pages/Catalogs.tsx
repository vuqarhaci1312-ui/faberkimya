import { useEffect, useState } from "react";
import { fetchCatalogs } from "../api/client";
import { Breadcrumb } from "../components/Breadcrumb";
import { catalogDocuments, type CatalogDocument } from "../data/catalogDocuments";
import { useI18n } from "../i18n/I18nProvider";
import { useLang, useLangPath } from "../i18n/langPath";
import styles from "./Catalogs.module.css";

function PdfIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" aria-hidden="true">
      <path
        d="M6 1h11l7 7v23H6V1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M17 1v7h7M9 18h10M9 22h10M9 14h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CatalogsPage() {
  const lang = useLang();
  const path = useLangPath();
  const { t } = useI18n();
  const [items, setItems] = useState(catalogDocuments);
  const [fromApi, setFromApi] = useState(false);
  useEffect(() => {
    fetchCatalogs(lang)
      .then((data) => {
        const remote = data.items as Array<{ slug: string; title: string; subtitle: string; file: string; languageLabel?: string }>;
        if (!remote.length) return;
        setFromApi(true);
        setItems(remote.map((item) => {
          const prefix = item.slug.split("-")[0];
          return {
            slug: item.slug,
            brand: t(`${prefix}.brand`) || prefix.toUpperCase(),
            title: item.title || t(`${prefix}.title`),
            subtitle: item.subtitle || t(`${prefix}.desc`),
            file: item.file,
            language: item.languageLabel || "PDF",
          } satisfies CatalogDocument;
        }));
      })
      .catch(() => undefined);
  }, [lang]);
  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[{ label: t("nav.home", "Ana səhifə"), to: path("/") }, { label: t("catalogs.title", "Kataloqlar") }]} />
      <h1 className="h1">{t("catalogs.title", "Kataloqlar")}</h1>
      <div className={styles.intro}>
        <p>{t("catalog.intro")}</p>
      </div>
      <ul className={styles.grid}>
        {items.map((item) => {
          const prefix = item.slug.split("-")[0];
          const brand = t(`${prefix}.brand`) || item.brand;
          const title = fromApi ? (item.title || t(`${prefix}.title`)) : (t(`${prefix}.title`) || item.title);
          const subtitle = fromApi ? (item.subtitle || t(`${prefix}.desc`)) : (t(`${prefix}.desc`) || item.subtitle);
          return (
          <li key={item.slug}>
            <a
              className={styles.card}
              href={item.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.cover}>
                <span className={styles.brand}>{brand}</span>
                <span className={styles.docIcon}>
                  <PdfIcon />
                </span>
                <span className={styles.lang}>{item.language}</span>
              </div>
              <div className={styles.body}>
                <h2 className={styles.cardTitle}>{title}</h2>
                <p className={styles.cardLead}>{subtitle}</p>
                <span className={styles.cta}>{t("catalog.view", "Kataloqa bax →")}</span>
              </div>
            </a>
          </li>
        );
        })}
      </ul>
    </div>
  );
}