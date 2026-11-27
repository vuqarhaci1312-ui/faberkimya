import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api/client";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import {
  getCategory,
  products,
  productsInCategory,
  sortProducts,
} from "../data/catalog";
import { filterParentGroups, filterSubcategories } from "../data/catalogFilters";
import { groupForSlug } from "../data/categoryTree";
import type { Category, Product } from "../data/types";
import { categoryTitleKey } from "../i18n/categoryKeys";
import { useI18n } from "../i18n/I18nProvider";
import { useLang, useLangPath } from "../i18n/langPath";
import styles from "./Catalog.module.css";

export function CatalogPage() {
  const { categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const sort = params.get("sort") === "name-desc" ? "name-desc" : "name-asc";
  const lang = useLang();
  const path = useLangPath();
  const { t, categoryName } = useI18n();
  const categoryText = (item: Category) => categoryName(item.slug, "") || (categoryTitleKey[item.slug] ? t(categoryTitleKey[item.slug]) : "") || item.name;
  const [remote, setRemote] = useState<Product[] | null>(null);
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  useEffect(() => {
    let cancelled = false;
    fetchProducts(lang, { category: categorySlug, sort })
      .then((data) => {
        if (!cancelled) setRemote(data.items as Product[]);
      })
      .catch(() => {
        if (!cancelled) setRemote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, categorySlug, sort]);
  const base = remote ?? (categorySlug ? productsInCategory(categorySlug) : products);
  const list = useMemo(() => sortProducts(base, sort), [base, sort]);
  const currentGroup = groupForSlug(categorySlug);
  const parentGroups = useMemo(() => filterParentGroups(), []);
  const parentSlug = currentGroup?.parent?.slug;
  const subcategories = useMemo(
    () => (parentSlug ? filterSubcategories(parentSlug) : []),
    [parentSlug],
  );
  const categoryLabel = currentGroup?.parent
    ? categoryText(currentGroup.parent)
    : category
      ? categoryText(category)
      : t("catalog.all");

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      const isWide = wide.matches;
      setNarrow(!isWide);
      setFiltersOpen(isWide);
      if (!isWide) setOpenFilter(null);
    };
    sync();
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (narrow) setFiltersOpen(false);
  }, [categorySlug, narrow]);

  useEffect(() => {
    if (!narrow || !filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [narrow, filtersOpen]);

  if (categorySlug && !category) {
    return (
      <div className="wrap" style={{ paddingTop: "calc(var(--header-h) + 24px)" }}>
        <h1 className="h1">{t("catalog.missing")}</h1>
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[
        { label: t("nav.home", "Ana səhifə"), to: path("/") },
        { label: t("nav.products", "Məhsullar"), to: path("/mehsullar") },
        ...(category ? [{ label: categoryText(category) }] : []),
      ]} />
      <div className={styles.head}>
        <h1 className="h1">{category ? categoryText(category) : t("nav.products")} <span>({list.length})</span></h1>
        <div className={styles.toolbar}>
          {narrow ? (
            <button type="button" className={styles.mobileFilterBtn} onClick={() => { setOpenFilter("category"); setFiltersOpen(true); }}>
              <PanelFilterIcon />
              {t("catalog.filter", "Filtr")}
              {categorySlug ? <span className={styles.mobileFilterDot} aria-hidden="true" /> : null}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.sort}
            onClick={() => setParams(sort === "name-asc" ? { sort: "name-desc" } : {})}
          >
            {t("catalog.sort", "Sırala")}
            <SortIcon />
          </button>
        </div>
      </div>
      {narrow && filtersOpen
        ? createPortal(
            <>
              <button type="button" className={styles.sheetBackdrop} aria-label={t("catalog.filters_title")} onClick={() => setFiltersOpen(false)} />
              <div className={styles.mobileSheet} role="dialog" aria-modal="true" aria-label={t("catalog.filters_title")}>
                <div className={styles.sheetBar}>
                  <button type="button" className={styles.filterToggle} onClick={() => { setFiltersOpen(false); setOpenFilter(null); }}>
                    <BackIcon />
                    {t("catalog.filters_title")}
                  </button>
                  {categorySlug ? (
                    <Link to={path("/mehsullar")} className={styles.clear} onClick={() => setFiltersOpen(false)}>{t("catalog.clear")}</Link>
                  ) : null}
                </div>
                <div className={styles.mobileSheetBody}>
                  <FilterAccordion
                    label={t("catalog.category")}
                    meta={categoryLabel}
                    open={openFilter === "category"}
                    onToggle={() => setOpenFilter(openFilter === "category" ? null : "category")}
                  >
                    <ul className={styles.filterList}>
                      <li>
                        <Link className={styles.filterOption} to={path("/mehsullar")} aria-current={!categorySlug ? "page" : undefined} onClick={() => setFiltersOpen(false)}>
                          {t("catalog.all")}
                        </Link>
                      </li>
                      {parentGroups.map((item: Category) => (
                        <li key={item.slug}>
                          <Link
                            className={styles.filterOption}
                            to={path(`/mehsullar/${item.slug}`)}
                            aria-current={item.slug === categorySlug || item.slug === parentSlug ? "page" : undefined}
                            onClick={() => setFiltersOpen(false)}
                          >
                            {categoryText(item)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </FilterAccordion>
                  {subcategories.length > 0 ? (
                    <FilterAccordion
                      label={t("catalog.subcategories")}
                      meta={String(subcategories.length)}
                      open={openFilter === "sub"}
                      onToggle={() => setOpenFilter(openFilter === "sub" ? null : "sub")}
                    >
                      <ul className={styles.filterList}>
                        {subcategories.map((item: Category) => (
                          <li key={item.slug}>
                            <Link
                              className={styles.filterOption}
                              to={path(`/mehsullar/${item.slug}`)}
                              aria-current={item.slug === categorySlug ? "page" : undefined}
                              onClick={() => setFiltersOpen(false)}
                            >
                              {categoryText(item)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </FilterAccordion>
                  ) : null}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
      <div
        className={`${styles.filterHeader} ${filtersOpen ? styles.filterHeaderOpen : styles.filterHeaderClosed} ${narrow ? styles.filterHeaderSheet : ""}`}
        aria-hidden={!filtersOpen}
      >
        <button type="button" className={styles.filterToggle} onClick={() => { setFiltersOpen(false); setOpenFilter(null); }}>
          <BackIcon />
          {t("catalog.filters_title")}
        </button>
        {categorySlug ? (
          <Link to={path("/mehsullar")} className={styles.clear}>× {t("catalog.clear")}</Link>
        ) : (
          <span className={styles.clearPlaceholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.layout}>
        <div className={`${styles.filterRail} ${filtersOpen ? styles.filterRailOpen : styles.filterRailClosed} ${narrow ? styles.filterRailSheet : ""}`}>
          {narrow ? (
            <div className={styles.sheetBar}>
              <button type="button" className={styles.filterToggle} onClick={() => { setFiltersOpen(false); setOpenFilter(null); }}>
                <BackIcon />
                {t("catalog.filters_title")}
              </button>
              {categorySlug ? (
                <Link to={path("/mehsullar")} className={styles.clear} onClick={() => setFiltersOpen(false)}>{t("catalog.clear")}</Link>
              ) : null}
            </div>
          ) : null}
          <div className={styles.filtersClip}>
            <div className={styles.filtersInner}>
              <aside className={styles.filters}>
              <FilterAccordion
                label={t("catalog.category")}
                meta={categoryLabel}
                open={openFilter === "category"}
                onToggle={() => setOpenFilter(openFilter === "category" ? null : "category")}
              >
                <ul className={styles.filterList}>
                  <li>
                    <Link className={styles.filterOption} to={path("/mehsullar")} aria-current={!categorySlug ? "page" : undefined} tabIndex={filtersOpen ? undefined : -1}>
                      {t("catalog.all")}
                    </Link>
                  </li>
                  {parentGroups.map((item: Category) => (
                    <li key={item.slug}>
                      <Link
                        className={styles.filterOption}
                        to={path(`/mehsullar/${item.slug}`)}
                        aria-current={item.slug === categorySlug || item.slug === parentSlug ? "page" : undefined}
                        tabIndex={filtersOpen ? undefined : -1}
                      >
                        {categoryText(item)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FilterAccordion>
              {subcategories.length > 0 ? (
                <FilterAccordion
                  label={t("catalog.subcategories")}
                  meta={String(subcategories.length)}
                  open={openFilter === "sub"}
                  onToggle={() => setOpenFilter(openFilter === "sub" ? null : "sub")}
                >
                  <ul className={styles.filterList}>
                    {subcategories.map((item: Category) => (
                      <li key={item.slug}>
                        <Link
                          className={styles.filterOption}
                          to={path(`/mehsullar/${item.slug}`)}
                          aria-current={item.slug === categorySlug ? "page" : undefined}
                          tabIndex={filtersOpen ? undefined : -1}
                        >
                          {categoryText(item)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </FilterAccordion>
              ) : null}
              </aside>
            </div>
          </div>
          <button
            type="button"
            className={styles.filterTab}
            aria-label={t("catalog.filter")}
            aria-hidden={filtersOpen}
            tabIndex={filtersOpen ? -1 : 0}
            onClick={() => setFiltersOpen(true)}
          >
            <PanelFilterIcon />
          </button>
        </div>
        <div className={styles.grid}>
          {list.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      </div>
    </div>
  );
}

function FilterAccordion({
  label,
  meta,
  open,
  onToggle,
  children,
}: {
  label: string;
  meta: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.filterBlock} ${open ? styles.filterBlockOpen : ""}`}>
      <button
        type="button"
        className={`${styles.filterRow} ${open ? styles.filterRowOpen : ""}`}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className={styles.filterLabel}>{label}</span>
        <span className={styles.filterMeta}>
          {open ? null : <span className={styles.filterValue}>{meta}</span>}
          <span className={`${styles.chev} ${open ? styles.chevOpen : ""}`} aria-hidden="true">▾</span>
        </span>
      </button>
      <div className={`${styles.filterPanel} ${open ? styles.filterPanelOpen : ""}`} aria-hidden={!open}>
        <div className={styles.filterPanelInner}>{children}</div>
      </div>
    </div>
  );
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 3v10M5 3 3 5M5 3l2 2M11 13V3M11 13l-2-2M11 13l2-2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
      <path d="M5 1 1 6l4 5M1 6h12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PanelFilterIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <path d="M1 1h18M4 8h12M7 15h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}