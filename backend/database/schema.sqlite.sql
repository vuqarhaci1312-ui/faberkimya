CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS translation_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tkey TEXT NOT NULL UNIQUE,
  tgroup TEXT NOT NULL DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_id INTEGER NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  UNIQUE (key_id, lang)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (category_id, lang)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  article TEXT,
  vendor TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_translations (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  PRIMARY KEY (product_id, lang)
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  banner_path TEXT,
  banner_width INTEGER,
  banner_height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS news_translations (
  news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  seo_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  body_json TEXT,
  PRIMARY KEY (news_id, lang)
);

CREATE TABLE IF NOT EXISTS catalogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  cover_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalog_translations (
  catalog_id INTEGER NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  file_path TEXT,
  language_label TEXT,
  PRIMARY KEY (catalog_id, lang)
);

CREATE TABLE IF NOT EXISTS company_settings (
  setting_key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_key TEXT NOT NULL,
  page TEXT,
  lang TEXT,
  payload_json TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_runs (
  run_key TEXT PRIMARY KEY,
  ran_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS url_redirects (
  from_path TEXT PRIMARY KEY,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301
);
