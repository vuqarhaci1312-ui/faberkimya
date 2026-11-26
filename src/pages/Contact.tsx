import { Breadcrumb } from "../components/Breadcrumb";
import { company } from "../data/catalog";
import styles from "./TextPage.module.css";

export function ContactPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[{ label: "Ana səhifə", to: "/" }, { label: "Əlaqə" }]} />
      <h1 className="h1">Əlaqə</h1>
      <div className={styles.list}>
        {company.phones.map((phone, index) => (
          <a key={phone} href={company.phoneHrefs[index]}>{phone}</a>
        ))}
        {company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : null}
        {company.socials.map((href) => <a key={href} href={href}>Facebook</a>)}
      </div>
    </div>
  );
}
