import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SUPPORTED_LANGS } from "../i18n/I18nProvider";
import { stripLangPrefix, useLang } from "../i18n/langPath";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function LangSeo() {
  const lang = useLang();
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.lang = lang;
    const rest = stripLangPrefix(pathname);
    document.querySelectorAll('link[data-hreflang="1"]').forEach((node) => node.remove());
    for (const code of SUPPORTED_LANGS) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = code;
      link.href = `${window.location.origin}/${code}${rest === "/" ? "" : rest}`;
      link.dataset.hreflang = "1";
      document.head.appendChild(link);
    }
    const canonical = document.querySelector('link[rel="canonical"]') ?? document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/${lang}${rest === "/" ? "" : rest}`);
    if (!canonical.parentElement) document.head.appendChild(canonical);
  }, [lang, pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="page">
      <ScrollToTop />
      <LangSeo />
      <a className="skip" href="#main">Əsas məzmuna keç</a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
