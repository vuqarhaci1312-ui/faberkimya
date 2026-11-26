import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { categoryExplorerItems } from "../data/categoryExplorer";
import styles from "./CategoryExplorer.module.css";

const ROW_SPLIT = Math.ceil(categoryExplorerItems.length / 2);

export function CategoryExplorer() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <section className={styles.section} aria-label="Məhsul kateqoriyaları">
      <div className={styles.shell}>
        <div className={styles.viewport}>
          <div
            className={styles.grid}
            style={{ "--explorer-cols": ROW_SPLIT } as CSSProperties}
          >
            {categoryExplorerItems.map((item, index) => {
              const row = index < ROW_SPLIT ? 1 : 2;
              const col = (index % ROW_SPLIT) + 1;
              const on = activeSlug === item.slug;
              return (
                <Link
                  key={item.slug}
                  to={`/mehsullar/${item.slug}`}
                  className={`${styles.cell}${on ? ` ${styles.cellOn}` : ""}`}
                  style={{ gridRow: row, gridColumn: col }}
                  onMouseEnter={() => setActiveSlug(item.slug)}
                  onMouseLeave={() => setActiveSlug(null)}
                  onFocus={() => setActiveSlug(item.slug)}
                  onBlur={() => setActiveSlug(null)}
                >
                  <span className={styles.figure}>
                    <img
                      className={styles.photo}
                      src={item.image}
                      alt=""
                      width={item.imageWidth}
                      height={item.imageHeight}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                  <span className={styles.label}>{item.title}</span>
                </Link>
              );
            })}
            <span className={styles.rowRule} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}