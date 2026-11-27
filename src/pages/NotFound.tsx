import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { useLangPath } from "../i18n/langPath";
import styles from "./TextPage.module.css";

export function NotFoundPage() {
  const { t } = useI18n();
  const path = useLangPath();
  return (
    <div className={`wrap ${styles.page}`}>
      <h1 className="h1">{t("notfound.title", "Səhifə tapılmadı")}</h1>
      <p><Link to={path("/")}>{t("notfound.back", "Ana səhifəyə qayıt")}</Link></p>
    </div>
  );
}
