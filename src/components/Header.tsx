import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { company } from "../data/catalog";
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
  const [menu, setMenu] = useState<"mobile" | null>(null);
  const [productsOpen, setProductsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileScreen, setMobileScreen] = useState<"main" | "groups" | "items">("main");
  const [mobileGroup, setMobileGroup] = useState<(typeof groups)[number] | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchId = useId();

  useEffect(() => {
    setMenu(null);
    setProductsOpen(false);
    setActiveGroup(null);
    setSearchOpen(false);
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

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/axtaris?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className={`${styles.header} ${styles.solid}`}>
      <Link className={styles.logo} to="/" aria-label="Faberkimya ana səhifə">
        {company.logo ? <img src={company.logo} alt="Faberkimya" /> : <span>Faberkimya</span>}
      </Link>
      <nav className={styles.nav} aria-label="Əsas">
        <ul>
          <li>
            <button type="button" aria-expanded={productsOpen} onClick={() => { setProductsOpen((open) => !open); setActiveGroup(null); }}>
              Məhsullar
            </button>
          </li>
          <li><NavLink to="/sirket">Şirkət haqqında</NavLink></li>
          <li><NavLink to="/kataloqlar">Kataloqlar</NavLink></li>
          <li><NavLink to="/elaqe">Bizimlə əlaqə</NavLink></li>
        </ul>
      </nav>
      <div className={styles.tools}>
        <button type="button" className={styles.tool} aria-label="Search" onClick={() => setSearchOpen(true)}>
          <SearchIcon /> Search
        </button>
        <button type="button" className={styles.icon} aria-label="Dil">
          <GlobeIcon />
        </button>
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
                  <span>{group.label}</span>
                  <Arrow />
                </button>
              ))}
            </div>
            {activeGroup ? (
              <div className={styles.sub}>
                {groups.find((group) => group.label === activeGroup)?.items.map((category) => (
                  <Link key={category.slug} to={`/mehsullar/${category.slug}`}><img src={iconForSlug(category.slug)} alt="" />{category.name}</Link>
                ))}
                <Link to="/mehsullar">Bütün məhsullar</Link>
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
                Geri
              </button>
            )}
            <p className={styles.mobileBarTitle}>
              {mobileScreen === "items" && mobileGroup
                ? mobileGroup.label
                : mobileScreen === "groups"
                  ? "Məhsullar"
                  : "Menyu"}
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
                      <span>Məhsullar</span>
                      <Arrow />
                    </button>
                  </li>
                  <li>
                    <Link className={styles.mobileRow} to="/sirket" onClick={closeMobileMenu}>
                      <span>Şirkət haqqında</span>
                      <Arrow />
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.mobileRow} to="/kataloqlar" onClick={closeMobileMenu}>
                      <span>Kataloqlar</span>
                      <Arrow />
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.mobileRow} to="/elaqe" onClick={closeMobileMenu}>
                      <span>Bizimlə əlaqə</span>
                      <Arrow />
                    </Link>
                  </li>
                </ul>
              </nav>
              <nav className={styles.mobilePane} aria-label="Məhsul qrupları">
                <ul className={styles.mobileMenu}>
                  <li>
                    <Link className={styles.mobileRow} to="/mehsullar" onClick={closeMobileMenu}>
                      <span>Bütün məhsullar</span>
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
                        <span>{group.label}</span>
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
                      <Link className={styles.mobileRow} to={`/mehsullar/${mobileGroup.slug}`} onClick={closeMobileMenu}>
                        <span>Bu qrupun hamısı</span>
                        <Arrow />
                      </Link>
                    </li>
                  ) : null}
                  {mobileGroup?.items.map((category) => (
                    <li key={category.slug}>
                      <Link
                        className={`${styles.mobileRow} ${styles.mobileRowIcon}`}
                        to={`/mehsullar/${category.slug}`}
                        onClick={closeMobileMenu}
                      >
                        <span className={styles.mobileRowLabel}>
                          <img src={iconForSlug(category.slug)} alt="" />
                          {category.name}
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
          <label htmlFor={searchId}>Məhsullar üzrə axtarış</label>
          <input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} autoFocus />
          <button className="pill" type="submit">Axtar</button>
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
