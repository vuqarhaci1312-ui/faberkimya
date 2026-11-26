import { Link } from "react-router-dom";

export type Crumb = { label: string; to?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Yol">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 ? <span aria-hidden="true"> &gt; </span> : null}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
