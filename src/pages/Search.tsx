import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { searchProducts } from "../data/catalog";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const list = useMemo(() => searchProducts(q), [q]);
  return (
    <div className="wrap" style={{ paddingTop: "calc(var(--header-h) + 8px)" }}>
      <Breadcrumb items={[{ label: "Ana səhifə", to: "/" }, { label: "Axtarış" }]} />
      <h1 className="h1">Axtarış {q ? `“${q}”` : ""}</h1>
      <p style={{ margin: "16px 0 24px" }}>{q ? `${list.length} nəticə` : "Axtarış sözü daxil edin."}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {list.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
    </div>
  );
}
