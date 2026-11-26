import { Link } from "react-router-dom";
import { categories, company } from "../data/catalog";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Link to="/" className={styles.logo} aria-label="Faberkimya">
            {company.logo ? <img src={company.logo} alt="" /> : company.name}
          </Link>
        </div>
        <div>
          <h2>Məhsullar</h2>
          <ul>
            <li><Link to="/mehsullar">Bütün məhsullar</Link></li>
            {categories.slice(0, 8).map((category) => (
              <li key={category.slug}><Link to={`/mehsullar/${category.slug}`}>{category.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Şirkət</h2>
          <ul>
            <li><Link to="/sirket">Şirkət haqqında</Link></li>
            <li><Link to="/kataloqlar">Kataloqlar</Link></li>
            <li><Link to="/elaqe">Əlaqə</Link></li>
            <li><Link to="/ekse-elaqe">Əks əlaqə</Link></li>
          </ul>
        </div>
        <div>
          <h2>Əlaqə</h2>
          <ul>
            {company.phones.map((phone, index) => (
              <li key={phone}><a href={company.phoneHrefs[index]}>{phone}</a></li>
            ))}
            {company.email ? <li><a href={`mailto:${company.email}`}>{company.email}</a></li> : null}
            {company.socials.map((href) => (
              <li key={href}><a href={href}>Facebook</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
