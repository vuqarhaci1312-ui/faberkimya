import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { company } from "../data/catalog";
import { SUPPORTED_LANGS, type Lang } from "../i18n/I18nProvider";
import { useI18n } from "../i18n/I18nProvider";
import { categoryTitleKey } from "../i18n/categoryKeys";
import { stripLangPrefix, useLang, useLangPath } from "../i18n/langPath";
import { categoryTree } from "../data/categoryTree";
import iconFiles from "../data/vikan-icons.json";
import { menuIconBySlug } from "../data/menuIcons";
import styles from "./Header.module.css";

const groups = categoryTree.map((group) => ({
  label: group.parent!.name,
  slug: group.parent!.slug,
  items: group.children,
}));

const fileByName = new Map(iconFiles.map((icon) => [icon.name, icon.file]));
const fallbackIcon = iconFiles[0]?.file;

function iconForSlug(slug: string) {
  const name = menuIconBySlug[slug];
  return (name && fileByName.get(name)) || fallbackIcon;
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = useLangPath();
  const lang = useLang();
  const { t, categoryName } = useI18n();
  const [menu, setMenu] = useState<"mobile" | null>(null);
  const [productsOpen, setProductsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileScreen, setMobileScreen] = useState<"main" | "groups" | "items">("main");
  const [mobileGroup, setMobileGroup] = useState<(typeof groups)[number] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langsOpen, setLangsOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const searchId = useId();

  useEffect(() => {
    setMenu(null);
    setProductsOpen(false);
    setActiveGroup(null);
    setSearchOpen(false);
    setLangsOpen(false);
    setMobileScreen("main");
    setMobileGroup(null);
  }, [location.pathname, location.search]);

  function openMobileMenu() {
    setMobileScreen("main");
    setMobileGroup(null);
    setMenu("mobile");
  }

  function closeMobileMenu() {
    setMenu(null);
    setMobileScreen("main");
    setMobileGroup(null);
  }

  function goMobileBack() {
    if (mobileScreen === "items") {
      setMobileScreen("groups");
      setMobileGroup(null);
      return;
    }
    setMobileScreen("main");
  }

  useEffect(() => {
    if (menu !== "mobile") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menu]);

  useEffect(() => {
    if (!langsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) setLangsOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [langsOpen]);

  function chooseLang(next: Lang) {
    const rest = stripLangPrefix(location.pathname);
    navigate(`/${next}${rest === "/" ? "" : rest}${location.search}${location.hash}`);
    setLangsOpen(false);
  }

  function labelFor(slug: string, name: string) {
    const fromApi = categoryName(slug, "");
    if (fromApi) return fromApi;
    const key = categoryTitleKey[slug];
    return (key ? t(key) : "") || name;
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`${path("/axtaris")}?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className={`${styles.header} ${styles.solid}`}>
      <Link className={styles.logo} to={path("/")} aria-label="Faberkimya ana səhifə">
        {company.logo ? <img src={company.logo} alt="Faberkimya" /> : <span>Faberkimya</span>}
      </Link>
      <nav className={styles.nav} aria-label="Əsas">
        <ul>
          <li>
            <button type="button" aria-expanded={productsOpen} onClick={() => { setProductsOpen((open) => !open); setActiveGroup(null); }}>
              {t("nav.products", "Məhsullar")}
            </button>
          </li>
          <li><NavLink to={path("/sirket")}>{t("nav.about", "Şirkət haqqında")}</NavLink></li>
          <li><NavLink to={path("/kataloqlar")}>{t("nav.catalogs", "Kataloqlar")}</NavLink></li>
          <li><NavLink to={path("/elaqe")}>{t("nav.contact_us", "Bizimlə əlaqə")}</NavLink></li>
        </ul>
      </nav>
      <div className={styles.tools}>
        <button type="button" className={styles.tool} aria-label={t("nav.search")} onClick={() => setSearchOpen(true)}>
          <SearchIcon /> {t("nav.search")}
        </button>
        <div className={styles.langMenu} ref={langMenuRef}>
          <button
            type="button"
            className={styles.icon}
            aria-label={t("lang.switcher_label")}
            aria-expanded={langsOpen}
            aria-haspopup="listbox"
            onClick={() => setLangsOpen((open) => !open)}
          >
            <GlobeIcon />
          </button>
          {langsOpen ? (
            <ul className={styles.langList} role="listbox" aria-label={t("lang.switcher_label")}>
              {SUPPORTED_LANGS.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={code === lang}
                    className={code === lang ? styles.langOptionOn : styles.langOption}
                    onClick={() => chooseLang(code)}
                  >
                    <Flag code={code} />
                    <span>{code.toUpperCase()}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <a className={styles.icon} href={company.phoneHrefs[0]} aria-label={company.phones[0]}>
          <PhoneIcon />
        </a>
        <button type="button" className={styles.burger} aria-label="Menyunu aç" onClick={openMobileMenu}>
          <span /><span /><span />
        </button>
      </div>
      {productsOpen ? (
        <>
          <button type="button" className={styles.scrim} aria-label="Menyunu bağla" onClick={() => { setProductsOpen(false); setActiveGroup(null); }} />
          <div className={`${styles.shell} ${activeGroup ? styles.shellWide : ""}`} role="dialog" aria-label="Məhsullar">
            <div className={styles.leftCol}>
              <button type="button" className={styles.close} aria-label="Bağla" onClick={() => { setProductsOpen(false); setActiveGroup(null); }}>×</button>
              {groups.map((group) => (
                <button
                  key={group.label}
                  type="button"
                  className={`${styles.row} ${activeGroup === group.label ? styles.rowOn : ""}`}
                  aria-expanded={activeGroup === group.label}
                  onClick={() => setActiveGroup(group.label)}
                >
                  <span>{labelFor(group.slug, group.label)}</span>
                  <Arrow />
                </button>
              ))}
            </div>
            {activeGroup ? (
              <div className={styles.sub}>
                {groups.find((group) => group.label === activeGroup)?.items.map((category) => (
                  <Link key={category.slug} to={path(`/mehsullar/${category.slug}`)}><img src={iconForSlug(category.slug)} alt="" />{labelFor(category.slug, category.name)}</Link>
                ))}
                <Link to={path("/mehsullar")}>{t("nav.all_products", "Bütün məhsullar")}</Link>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
      {menu === "mobile" ? (
        <div className={styles.mobile} role="dialog" aria-modal="true" aria-label="Mobil menyu">
          <div className={styles.mobileBar}>
            {mobileScreen === "main" ? (
              <span className={styles.mobileBarSide} />
            ) : (
              <button type="button" className={styles.mobileBack} onClick={goMobileBack}>
                ←
              </button>
            )}
            <p className={styles.mobileBarTitle}>
              {mobileScreen === "items" && mobileGroup
                ? labelFor(mobileGroup.slug, mobileGroup.label)
                : mobileScreen === "groups"
                  ? t("nav.products")
                  : t("brand.name")}
            </p>
            <button type="button" className={styles.mobileClose} aria-label="Bağla" onClick={closeMobileMenu}>
              ×
            </button>
          </div>
          <div className={styles.mobileViewport}>
            <div className={styles.mobileTrack} data-screen={mobileScreen}>
              <nav className={styles.mobilePane} aria-label="Əsas menyu">
                <ul className={styles.mobileMenu}>
                  <li>
                    <button type="button" className={styles.mobileRow} onClick={() => setMobileScreen("groups")}>
                      <span>{t("nav.products")}</span>
                      <Arrow />
                    </button>
                  </li>
                  <li>
                    <Link className={styles.mobileRow} to={path("/sirket")} onClick={closeMobileMenu}>
                      <span>{t("nav.about")}</span>
                      <Arrow />
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.mobileRow} to={path("/kataloqlar")} onClick={closeMobileMenu}>
                      <span>{t("nav.catalogs")}</span>
                      <Arrow />
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.mobileRow} to={path("/elaqe")} onClick={closeMobileMenu}>
                      <span>{t("nav.contact_us")}</span>
                      <Arrow />
                    </Link>
                  </li>
                </ul>
              </nav>
              <nav className={styles.mobilePane} aria-label="Məhsul qrupları">
                <ul className={styles.mobileMenu}>
                  <li>
                    <Link className={styles.mobileRow} to={path("/mehsullar")} onClick={closeMobileMenu}>
                      <span>{t("nav.all_products")}</span>
                      <Arrow />
                    </Link>
                  </li>
                  {groups.map((group) => (
                    <li key={group.slug}>
                      <button
                        type="button"
                        className={styles.mobileRow}
                        onClick={() => {
                          setMobileGroup(group);
                          setMobileScreen("items");
                        }}
                      >
                        <span>{labelFor(group.slug, group.label)}</span>
                        <Arrow />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className={styles.mobilePane} aria-label={mobileGroup?.label ?? "Alt kateqoriyalar"}>
                <ul className={styles.mobileMenu}>
                  {mobileGroup ? (
                    <li>
                      <Link className={styles.mobileRow} to={path(`/mehsullar/${mobileGroup.slug}`)} onClick={closeMobileMenu}>
                        <span>{t("nav.all_products")}</span>
                        <Arrow />
                      </Link>
                    </li>
                  ) : null}
                  {mobileGroup?.items.map((category) => (
                    <li key={category.slug}>
                      <Link
                        className={`${styles.mobileRow} ${styles.mobileRowIcon}`}
                        to={path(`/mehsullar/${category.slug}`)}
                        onClick={closeMobileMenu}
                      >
                        <span className={styles.mobileRowLabel}>
                          <img src={iconForSlug(category.slug)} alt="" />
                          {labelFor(category.slug, category.name)}
                        </span>
                        <Arrow />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      ) : null}
      {searchOpen ? (
        <form className={styles.search} onSubmit={submitSearch} role="search">
          <label htmlFor={searchId}>{t("nav.search")}</label>
          <input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} autoFocus />
          <button className="pill" type="submit">{t("nav.search")}</button>
          <button type="button" className={styles.close} aria-label="Bağla" onClick={() => setSearchOpen(false)}>×</button>
        </form>
      ) : null}
    </header>
  );
}

function Arrow() {
  return <span className={styles.mobileArrow} aria-hidden="true">→</span>;
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 13.0002L19 19.0002M8 15.0002C4.13401 15.0002 1 11.8662 1 8.00024C1 4.13425 4.13401 1.00024 8 1.00024C11.866 1.00024 15 4.13425 15 8.00024C15 11.8662 11.866 15.0002 8 15.0002Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Flag({ code }: { code: Lang }) {
  if (code === "az") {
    return (
      <svg className={styles.flag} viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="4.67" fill="#00b5e2" />
        <rect y="4.67" width="20" height="4.66" fill="#ef3340" />
        <rect y="9.33" width="20" height="4.67" fill="#509e2f" />
      </svg>
    );
  }
  if (code === "ru") {
    return (
      <svg className={styles.flag} viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="4.67" fill="#ffffff" />
        <rect y="4.67" width="20" height="4.66" fill="#0039a6" />
        <rect y="9.33" width="20" height="4.67" fill="#d52b1e" />
      </svg>
    );
  }
  if (code === "tr") {
    return (
      <svg className={styles.flag} viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" fill="#e30a17" />
        <circle cx="8" cy="7" r="3.2" fill="#ffffff" />
        <circle cx="9" cy="7" r="2.5" fill="#e30a17" />
      </svg>
    );
  }
  return (
    <svg className={styles.flag} viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#ffffff" strokeWidth="2.4" />
      <path d="M0 0l20 14M20 0L0 14" stroke="#c8102e" strokeWidth="1.2" />
      <path d="M10 0v14M0 7h20" stroke="#ffffff" strokeWidth="3.6" />
      <path d="M10 0v14M0 7h20" stroke="#c8102e" strokeWidth="2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" aria-hidden="true">
      <path d="M1.28589 8.49944H5.5716M1.28589 8.49944C1.28589 12.7599 4.73969 16.2137 9.00018 16.2137M1.28589 8.49944C1.28589 4.23896 4.73969 0.785156 9.00018 0.785156M5.5716 8.49944H12.4287M5.5716 8.49944C5.5716 12.7599 7.10663 16.2137 9.00018 16.2137M5.5716 8.49944C5.5716 4.23896 7.10663 0.785156 9.00018 0.785156M12.4287 8.49944H16.7145M12.4287 8.49944C12.4287 4.23896 10.8937 0.785156 9.00018 0.785156M12.4287 8.49944C12.4287 12.7599 10.8937 16.2137 9.00018 16.2137M16.7145 8.49944C16.7145 4.23896 13.2607 0.785156 9.00018 0.785156M16.7145 8.49944C16.7145 12.7599 13.2607 16.2137 9.00018 16.2137" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.50246 2.25746C7.19873 1.49815 6.46332 1.00024 5.64551 1.00024H2.89474C1.8483 1.00024 1 1.84834 1 2.89478C1 11.7895 8.21078 19.0002 17.1055 19.0002C18.1519 19.0002 19 18.1519 19 17.1054L19.0005 14.3542C19.0005 13.5364 18.5027 12.8011 17.7434 12.4974L15.1069 11.4432C14.4249 11.1704 13.6483 11.2931 13.0839 11.7634L12.4035 12.3309C11.6089 12.9931 10.4396 12.9405 9.7082 12.209L7.79222 10.2913C7.06079 9.55986 7.00673 8.39158 7.66895 7.59693L8.23633 6.91654C8.70661 6.3522 8.83049 5.5754 8.55766 4.89334L7.50246 2.25746Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
