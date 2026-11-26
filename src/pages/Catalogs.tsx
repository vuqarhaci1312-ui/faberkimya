import { Breadcrumb } from "../components/Breadcrumb";
import { documents } from "../data/catalog";
import styles from "./TextPage.module.css";

export function CatalogsPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumb items={[{ label: "Ana səhifə", to: "/" }, { label: "Kataloqlar" }]} />
      <h1 className="h1">Kataloqlar</h1>
      <ul className={styles.docs}>
        {documents.map((doc) => (
          <li key={doc.sourceUrl}>
            <strong>{doc.title}</strong>
            {doc.file ? <a href={`/${doc.file}`}>Yüklə</a> : <span>Fayl əlçatan deyil{doc.error ? `: ${doc.error}` : ""}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
