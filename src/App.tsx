import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AboutPage } from "./pages/About";
import { CatalogPage } from "./pages/Catalog";
import { CatalogsPage } from "./pages/Catalogs";
import { ContactPage } from "./pages/Contact";
import { FeedbackPage } from "./pages/Feedback";
import { HomePage } from "./pages/Home";
import { NewsDetailPage } from "./pages/NewsDetail";
import { NotFoundPage } from "./pages/NotFound";
import { ProductPage } from "./pages/Product";
import { SearchPage } from "./pages/Search";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}
