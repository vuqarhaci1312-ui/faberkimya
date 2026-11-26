import { NavLink, useLocation } from "react-router-dom";
import styles from "./MobileTabBar.module.css";

const tabs = [
  { to: "/", label: "Ana səhifə", end: true, match: (path: string) => path === "/", icon: HomeIcon },
  { to: "/mehsullar", label: "Məhsullar", end: false, match: (path: string) => path.startsWith("/mehsullar") || path.startsWith("/mehsul"), icon: ProductsIcon },
  { to: "/sirket", label: "Şirkət haqqında", end: false, match: (path: string) => path.startsWith("/sirket"), icon: CompanyIcon },
  { to: "/kataloqlar", label: "Kataloqlar", end: false, match: (path: string) => path.startsWith("/kataloqlar"), icon: CatalogsIcon },
];

export function MobileTabBar() {
  const { pathname } = useLocation();
  const found = tabs.findIndex((tab) => tab.match(pathname));
  const active = found < 0 ? 0 : found;

  return (
    <nav className={styles.bar} aria-label="Mobil menyu">
      <span className={styles.floater} style={{ transform: `translateX(${active * 100}%)` }} aria-hidden="true" />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const on = tab.match(pathname);
        return (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={`${styles.tab} ${on ? styles.tabOn : ""}`}>
            <span className={styles.icon}>
              <Icon />
            </span>
            <span className={styles.label}>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-5.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5 12 3.5l8 4v9l-8 4-8-4v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 12.2 20 7.6M12 12.2 4 7.6M12 12.2V21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20.5V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V20.5M14 9.5h4.5A1.5 1.5 0 0 1 20 11v9.5M4 20.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 8h3M7 12h3M7 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CatalogsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 0 6 22V4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 4.5A2.5 2.5 0 0 0 3.5 7v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 8.5H14M9.5 12H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
