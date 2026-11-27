import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { LangLayout } from "../i18n/LangLayout";
import { AboutPage } from "../pages/About";
import { CatalogPage } from "../pages/Catalog";
import { CatalogsPage } from "../pages/Catalogs";
import { ContactPage } from "../pages/Contact";
import { FeedbackPage } from "../pages/Feedback";
import { HomePage } from "../pages/Home";
import { NewsDetailPage } from "../pages/NewsDetail";
import { NotFoundPage } from "../pages/NotFound";
import { ProductPage } from "../pages/Product";
import { SearchPage } from "../pages/Search";

function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`/az${pathname}${search}${hash}`} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/az" replace />} />
      <Route path="/:lang" element={<LangLayout />}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mehsullar" element={<CatalogPage />} />
          <Route path="mehsullar/:categorySlug" element={<CatalogPage />} />
          <Route path="mehsul/:slug" element={<ProductPage />} />
          <Route path="axtaris" element={<SearchPage />} />
          <Route path="sirket" element={<AboutPage />} />
          <Route path="elaqe" element={<ContactPage />} />
          <Route path="kataloqlar" element={<CatalogsPage />} />
          <Route path="ekse-elaqe" element={<FeedbackPage />} />
          <Route path="blog/:slug" element={<NewsDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="mehsullar/*" element={<LegacyRedirect />} />
      <Route path="mehsul/*" element={<LegacyRedirect />} />
      <Route path="blog/*" element={<LegacyRedirect />} />
      <Route path="kataloqlar/*" element={<LegacyRedirect />} />
      <Route path="sirket/*" element={<LegacyRedirect />} />
      <Route path="elaqe/*" element={<LegacyRedirect />} />
      <Route path="axtaris/*" element={<LegacyRedirect />} />
      <Route path="ekse-elaqe/*" element={<LegacyRedirect />} />
    </Routes>
  );
}