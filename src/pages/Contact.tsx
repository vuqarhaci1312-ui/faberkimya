import { Breadcrumb } from "../components/Breadcrumb";
import { company } from "../data/catalog";
import { useI18n } from "../i18n/I18nProvider";
import { useLangPath } from "../i18n/langPath";
import styles from "./TextPage.module.css";

export function ContactPage() {
  const { t } = useI18n();
  const path = useLangPath();
  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[{ label: t("nav.home"), to: path("/") }, { label: t("nav.contact") }]} />
      <h1 className="h1">{t("nav.contact")}</h1>
      <div className={styles.list}>
        {company.phones.map((phone, index) => (
          <a key={phone} href={company.phoneHrefs[index]}>{phone}</a>
        ))}
        {company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : null}
        {company.socials.map((href) => <a key={href} href={href}>{t("contact.facebook")}</a>)}
      </div>
    </div>
  );
}
