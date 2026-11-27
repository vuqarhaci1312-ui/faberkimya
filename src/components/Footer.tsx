import { Link } from "react-router-dom";
import { categories, company } from "../data/catalog";
import { useI18n } from "../i18n/I18nProvider";
import { categoryTitleKey } from "../i18n/categoryKeys";
import { useLangPath } from "../i18n/langPath";
import styles from "./Footer.module.css";

export function Footer() {
  const path = useLangPath();
  const { t, categoryName } = useI18n();
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Link to={path("/")} className={styles.logo} aria-label="Faberkimya">
            <img src="/media/brand/faber-chemicals-logo-light.png" alt="" />
          </Link>
        </div>
        <div>
          <h2>{t("nav.products", "Məhsullar")}</h2>
          <ul>
            <li><Link to={path("/mehsullar")}>{t("nav.all_products", "Bütün məhsullar")}</Link></li>
            {categories.slice(0, 8).map((category) => {
              const key = categoryTitleKey[category.slug];
              const name = categoryName(category.slug, "") || (key ? t(key) : "") || category.name;
              return (
                <li key={category.slug}><Link to={path(`/mehsullar/${category.slug}`)}>{name}</Link></li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2>{t("nav.company", "Şirkət")}</h2>
          <ul>
            <li><Link to={path("/sirket")}>{t("nav.about", "Şirkət haqqında")}</Link></li>
            <li><Link to={path("/kataloqlar")}>{t("nav.catalogs", "Kataloqlar")}</Link></li>
            <li><Link to={path("/elaqe")}>{t("nav.contact", "Əlaqə")}</Link></li>
            <li><Link to={path("/ekse-elaqe")}>{t("nav.feedback", "Əks əlaqə")}</Link></li>
          </ul>
        </div>
        <div>
          <h2>{t("nav.contact")}</h2>
          <ul>
            {company.phones.map((phone, index) => (
              <li key={phone}><a href={company.phoneHrefs[index]}>{phone}</a></li>
            ))}
            {company.email ? <li><a href={`mailto:${company.email}`}>{company.email}</a></li> : null}
            {company.socials.map((href) => (
              <li key={href}><a href={href}>{t("contact.facebook")}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
