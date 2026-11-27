import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { useLangPath } from "../i18n/langPath";
import styles from "./About.module.css";

const aboutParagraphs = [
  "about.history",
  "about.materials",
  "about.certs",
  "about.markets",
  "about.dosing",
  "about.value",
  "about.training",
  "about.wish",
] as const;

const aboutPolicy = [
  "about.motto",
  "about.system",
  "about.values",
  "about.improve",
  "about.innovate",
  "about.advice",
  "about.outcomes",
] as const;

export function AboutPage() {
  const { t } = useI18n();
  const path = useLangPath();

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label={t("nav.company")}>
        <Link to={path("/")}>{t("nav.home")}</Link>
        <span aria-hidden="true"> &gt; </span>
        <span>{t("nav.company")}</span>
      </nav>
      <h1>{t("about.title")}</h1>
      {aboutParagraphs.map((key) => (
        <p key={key} className={key === "about.history" ? styles.lead : styles.body}>{t(key)}</p>
      ))}
      <img className={styles.hero} src="/media/about/faber-building.png" alt={t("about.photo")} />
      <h2>{t("about.policy")}</h2>
      {aboutPolicy.map((key) => (
        <p key={key} className={styles.body}>{t(key)}</p>
      ))}
    </div>
  );
}
