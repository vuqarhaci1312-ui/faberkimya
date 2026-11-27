CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(8) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  is_default SMALLINT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS translation_keys (
  id SERIAL PRIMARY KEY,
  tkey VARCHAR(191) NOT NULL UNIQUE,
  tgroup VARCHAR(64) NOT NULL DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  key_id INT NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  lang VARCHAR(8) NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  UNIQUE (key_id, lang)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  path VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  lang VARCHAR(8) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  PRIMARY KEY (category_id, lang)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  article VARCHAR(128),
  vendor VARCHAR(128),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_translations (
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lang VARCHAR(8) NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  PRIMARY KEY (product_id, lang)
);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  path VARCHAR(512) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  banner_path VARCHAR(512),
  banner_width INT,
  banner_height INT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS news_translations (
  news_id INT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  lang VARCHAR(8) NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  seo_title TEXT,
  meta_description TEXT,
  keywords TEXT,
  body_json TEXT,
  PRIMARY KEY (news_id, lang)
);

CREATE TABLE IF NOT EXISTS catalogs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  cover_path VARCHAR(512),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalog_translations (
  catalog_id INT NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  lang VARCHAR(8) NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  file_path VARCHAR(512),
  language_label VARCHAR(32),
  PRIMARY KEY (catalog_id, lang)
);

CREATE TABLE IF NOT EXISTS company_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  form_key VARCHAR(64) NOT NULL,
  page VARCHAR(512),
  lang VARCHAR(8),
  payload_json TEXT NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE,
  is_read SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_runs (
  run_key VARCHAR(64) PRIMARY KEY,
  ran_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS url_redirects (
  from_path VARCHAR(255) PRIMARY KEY,
  to_path VARCHAR(255) NOT NULL,
  status_code INT NOT NULL DEFAULT 301
);
