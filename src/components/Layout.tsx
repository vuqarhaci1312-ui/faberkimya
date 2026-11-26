import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
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

export function Layout() {
  return (
    <div className="page">
      <ScrollToTop />
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
