import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProduct, fetchProducts } from "../api/client";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { categoryName as siteCategoryName, getProduct, relatedProducts } from "../data/catalog";
import type { Product } from "../data/types";
import { useI18n } from "../i18n/I18nProvider";
import { useLang, useLangPath } from "../i18n/langPath";
import styles from "./Product.module.css";

export function ProductPage() {
  const { slug } = useParams();
  const lang = useLang();
  const path = useLangPath();
  const { t, categoryName } = useI18n();
  const fallback = slug ? getProduct(slug) : undefined;
  const [product, setProduct] = useState(fallback);
  const [relatedRemote, setRelatedRemote] = useState<Product[] | null>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!slug) return;
    fetchProduct(lang, slug)
      .then((data) => setProduct(data.item as Product))
      .catch(() => setProduct(fallback));
  }, [lang, slug]);
  useEffect(() => {
    const category = product?.categorySlugs[0];
    if (!category || !product) return;
    fetchProducts(lang, { category })
      .then((data) => setRelatedRemote((data.items as Product[]).filter((item) => item.slug !== product.slug).slice(0, 4)))
      .catch(() => setRelatedRemote(null));
  }, [lang, product]);
  if (!product) {
    return (
      <div className="wrap" style={{ paddingTop: "calc(var(--header-h) + 24px)" }}>
        <h1 className="h1">{t("product.missing", "Məhsul tapılmadı")}</h1>
        <Link to={path("/mehsullar")}>{t("nav.products", "Məhsullar")}</Link>
      </div>
    );
  }
  const related = relatedRemote ?? relatedProducts(product);
  const image = product.images[active] ?? product.images[0];
  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[
        { label: t("nav.home", "Ana səhifə"), to: path("/") },
        { label: t("nav.products", "Məhsullar"), to: path("/mehsullar") },
        ...(product.categorySlugs[0] ? [{ label: categoryName(product.categorySlugs[0], "") || siteCategoryName(product.categorySlugs[0]), to: path(`/mehsullar/${product.categorySlugs[0]}`) }] : []),
        { label: product.name },
      ]} />
      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.thumbs}>
            {(product.images.length ? product.images : [""]).map((src, index) => (
              <button key={`${src}-${index}`} type="button" aria-label={`Şəkil ${index + 1}`} className={index === active ? styles.thumbOn : ""} onClick={() => setActive(index)}>
                {src ? <img src={src} alt="" /> : null}
              </button>
            ))}
          </div>
          <div className={styles.stage}>
            {image ? <img src={image} alt={product.name} /> : null}
          </div>
        </div>
        <div className={styles.info}>
          {product.article ? <p className={styles.code}>{product.article}</p> : null}
          <h1>{product.name}</h1>
          {product.description ? <p className={styles.desc}>{product.description}</p> : null}
        </div>
      </div>
      {related.length > 0 ? (
        <section className={styles.related}>
          <h2>{t("product.related", "Eyni kateqoriya")}</h2>
          <div className={styles.grid}>
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
