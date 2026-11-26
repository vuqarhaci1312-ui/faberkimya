import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { NewsBlock } from "../data/homeNews";
import { Breadcrumb } from "../components/Breadcrumb";
import { getHomeNewsItemBySlug, homeNewsItems } from "../data/homeNews";
import styles from "./NewsDetail.module.css";

function applyPageMeta(seoTitle: string, metaDescription: string, keywords: string) {
  const site = "Faberkimya";
  document.title = `${seoTitle} | ${site}`;

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMeta("description", metaDescription);
  setMeta("keywords", keywords);
}

function NewsBlocks({ blocks }: { blocks: NewsBlock[] }) {
  return blocks.map((block, index) => {
    if (block.type === "h2") {
      return (
        <h2 key={index} className={styles.h2}>
          {block.text}
        </h2>
      );
    }
    if (block.type === "ul") {
      return (
        <ul key={index} className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={index} className={styles.paragraph}>
        {block.text}
      </p>
    );
  });
}

export function NewsDetailPage() {
  const { slug } = useParams();
  const article = slug ? getHomeNewsItemBySlug(slug) : undefined;

  useEffect(() => {
    if (!article) return;
    applyPageMeta(article.seoTitle, article.metaDescription, article.keywords);
  }, [article]);

  if (!article) {
    return (
      <div className={styles.page}>
        <Breadcrumb items={[{ label: "Ana səhifə", to: "/" }, { label: "Xəbər tapılmadı" }]} />
        <h1>Xəbər tapılmadı</h1>
        <p>
          <Link to="/">Ana səhifəyə qayıt</Link>
        </p>
      </div>
    );
  }

  const related = homeNewsItems.filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <article className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Ana səhifə", to: "/" },
          { label: "Xəbərlər", to: "/#xeberler" },
          { label: article.title },
        ]}
      />
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.lead}>{article.subtitle}</p>
      </header>
      <div className={styles.heroWrap}>
        <img
          className={styles.hero}
          src={article.banner}
          alt=""
          width={article.bannerWidth ?? 740}
          height={article.bannerHeight ?? 400}
          loading="eager"
          decoding="async"
        />
      </div>
      <div className={styles.body}>
        <NewsBlocks blocks={article.blocks} />
      </div>
      {related.length > 0 ? (
        <section className={styles.related} aria-labelledby="related-news-heading">
          <h2 id="related-news-heading" className={styles.relatedTitle}>
            Digər xəbərlər
          </h2>
          <ul className={styles.relatedList}>
            {related.map((item) => (
              <li key={item.id}>
                <Link to={item.to} className={styles.relatedCard}>
                  <span className={styles.relatedVisual}>
                    <img src={item.banner} alt="" width={item.bannerWidth ?? 740} height={item.bannerHeight ?? 400} loading="lazy" decoding="async" />
                  </span>
                  <span className={styles.relatedLabel}>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}