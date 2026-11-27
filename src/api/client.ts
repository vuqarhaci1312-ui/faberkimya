const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

export type BootstrapResponse = {
  lang: string;
  languages: string[];
  defaultLang: string;
  translations: Record<string, string>;
  categories?: Array<{ slug: string; name: string }>;
  company: Record<string, unknown>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchBootstrap(lang: string) {
  return request<BootstrapResponse>(`/bootstrap?lang=${encodeURIComponent(lang)}`);
}

export function fetchProducts(lang: string, params: { category?: string; q?: string; sort?: string } = {}) {
  const query = new URLSearchParams({ lang, ...Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)) });
  return request<{ items: unknown[] }>(`/products?${query}`);
}

export function fetchProduct(lang: string, slug: string) {
  return request<{ item: unknown }>(`/products/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`);
}

export function fetchNews(lang: string) {
  return request<{ items: unknown[] }>(`/news?lang=${encodeURIComponent(lang)}`);
}

export function fetchNewsItem(lang: string, slug: string) {
  return request<{ item: unknown }>(`/news/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`);
}

export function fetchCatalogs(lang: string) {
  return request<{ items: unknown[] }>(`/catalogs?lang=${encodeURIComponent(lang)}`);
}

export async function submitForm(formKey: string, lang: string, payload: Record<string, unknown>) {
  const idempotency = crypto.randomUUID();
  return request<{ ok: boolean }>(`/forms/${encodeURIComponent(formKey)}?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Idempotency-Key": idempotency },
    body: JSON.stringify({ ...payload, idempotency_key: idempotency, page: window.location.pathname, lang }),
  });
}