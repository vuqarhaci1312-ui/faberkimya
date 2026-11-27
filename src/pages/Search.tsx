import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api/client";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { searchProducts } from "../data/catalog";
import type { Product } from "../data/types";
import { useI18n } from "../i18n/I18nProvider";
import { useLang, useLangPath } from "../i18n/langPath";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const lang = useLang();
  const path = useLangPath();
  const { t } = useI18n();
  const local = useMemo(() => searchProducts(q), [q]);
  const [list, setList] = useState<Product[]>(local);
  useEffect(() => {
    if (!q) {
      setList([]);
      return;
    }
    fetchProducts(lang, { q })
      .then((data) => setList(data.items as Product[]))
      .catch(() => setList(local));
  }, [lang, q, local]);
  return (
    <div className="wrap" style={{ paddingTop: "calc(var(--header-h) + 8px)" }}>
      <Breadcrumb items={[{ label: t("nav.home", "Ana səhifə"), to: path("/") }, { label: t("search.title", "Axtarış") }]} />
      <h1 className="h1">{t("search.title", "Axtarış")} {q ? `“${q}”` : ""}</h1>
      <p style={{ margin: "16px 0 24px" }}>{q ? `${list.length} ${t("search.results", "nəticə")}` : t("search.no_query", "Axtarış sözü daxil edin.")}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {list.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
    </div>
  );
}
