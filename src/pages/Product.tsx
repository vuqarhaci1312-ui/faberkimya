import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { categoryName, getProduct, relatedProducts } from "../data/catalog";
import { useState } from "react";
import styles from "./Product.module.css";

export function ProductPage() {
  const { slug } = useParams();
  const product = slug ? getProduct(slug) : undefined;
  const [active, setActive] = useState(0);
  if (!product) {
    return (
      <div className="wrap" style={{ paddingTop: "calc(var(--header-h) + 24px)" }}>
        <h1 className="h1">Məhsul tapılmadı</h1>
        <Link to="/mehsullar">Məhsullar</Link>
      </div>
    );
  }
  const related = relatedProducts(product);
  const image = product.images[active] ?? product.images[0];
  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[
        { label: "Ana səhifə", to: "/" },
        { label: "Məhsullar", to: "/mehsullar" },
        ...(product.categorySlugs[0] ? [{ label: categoryName(product.categorySlugs[0]), to: `/mehsullar/${product.categorySlugs[0]}` }] : []),
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
          <h2>Eyni kateqoriya</h2>
          <div className={styles.grid}>
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
