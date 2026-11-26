import { Link } from "react-router-dom";
import { company } from "../data/catalog";
import styles from "./About.module.css";

export function AboutPage() {
  const sentences = (company.aboutText || "").split(/(?<=\.)\s+/).filter(Boolean);
  const lead = sentences.slice(0, 2).join(" ");
  const rest = sentences.slice(2).join(" ");

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label="Yol">
        <Link to="/">Ana səhifə</Link>
        <span aria-hidden="true"> &gt; </span>
        <span>Şirkət</span>
      </nav>
      <h1>{company.aboutTitle}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      <img className={styles.hero} src="/media/about/faber-building.png" alt="Faber Kimya binası" />
      {rest ? <p className={styles.body}>{rest}</p> : null}
    </div>
  );
}
