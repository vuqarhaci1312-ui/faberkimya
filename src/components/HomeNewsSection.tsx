import { useCallback, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { homeNewsItems } from "../data/homeNews";
import styles from "./HomeNewsSection.module.css";

export function HomeNewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>(`[data-news-slide]`);
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    el.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: "smooth" });
  }, []);

  return (
    <section id="xeberler" className={styles.section} aria-labelledby="home-news-heading">
      <div className={styles.region}>
        <header className={styles.container}>
          <div className={styles.toolbar}>
            <h2 id="home-news-heading" className={styles.heading}>
              Xəbərlər
            </h2>
            <div className={styles.nav}>
              <button type="button" className={styles.navBtn} aria-label="Əvvəlki xəbər" onClick={() => scroll(-1)}>
                <AbbArrow flip />
              </button>
              <button type="button" className={styles.navBtn} aria-label="Növbəti xəbər" onClick={() => scroll(1)}>
                <AbbArrow />
              </button>
            </div>
          </div>
        </header>
        <div className={`${styles.viewport} ${styles.container}`}>
          <div ref={trackRef} className={styles.track}>
            {homeNewsItems.map((item) => (
              <div key={item.id} data-news-slide className={styles.slide}>
                <Link to={item.to} className={styles.card}>
                  <div className={styles.copy}>
                    <h3 className={styles.title}>{item.title}</h3>
                    <p className={styles.subtitle}>{item.subtitle}</p>
                  </div>
                  <div
                    className={styles.visual}
                    style={
                      {
                        aspectRatio: `${item.bannerWidth ?? 740} / ${item.bannerHeight ?? 400}`,
                      } as CSSProperties
                    }
                  >
                    <img
                      src={item.banner}
                      alt=""
                      width={item.bannerWidth ?? 740}
                      height={item.bannerHeight ?? 400}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AbbArrow({ flip }: { flip?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={flip ? styles.arrowFlip : undefined}
    >
      <path
        d="M9.80474 3.52861C9.54439 3.26826 9.12228 3.26826 8.86193 3.52861C8.60158 3.78896 8.60158 4.21107 8.86193 4.47141L11.7239 7.33334H2.66667C2.29848 7.33334 2 7.63182 2 8.00001C2 8.3682 2.29848 8.66668 2.66667 8.66668H11.7239L8.86193 11.5286C8.60158 11.789 8.60158 12.2111 8.86193 12.4714C9.12228 12.7318 9.54439 12.7318 9.80474 12.4714L13.8047 8.47142C14.0651 8.21107 14.0651 7.78896 13.8047 7.52861L9.80474 3.52861Z"
        fill="currentColor"
      />
    </svg>
  );
}