import { Link } from "react-router-dom";
import styles from "./TextPage.module.css";

export function NotFoundPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <h1 className="h1">Səhifə tapılmadı</h1>
      <p><Link to="/">Ana səhifə</Link></p>
    </div>
  );
}
