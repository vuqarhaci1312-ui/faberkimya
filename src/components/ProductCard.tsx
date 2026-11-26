import { Link } from "react-router-dom";
import type { Product } from "../data/types";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      <button type="button" className={styles.menu} aria-label="Card menu">+</button>
      <Link to={`/mehsul/${product.slug}`}>
        <div className={styles.media}>
          {product.images[0] ? <img src={product.images[0]} alt={product.name} /> : null}
        </div>
        <div className={styles.copy}>
          {product.article ? <p className={styles.code}>{product.article}</p> : null}
          <h2>{product.name}</h2>
        </div>
      </Link>
    </article>
  );
}
