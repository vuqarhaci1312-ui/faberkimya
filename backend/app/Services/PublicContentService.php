<?php
declare(strict_types=1);

namespace Faber\Services;

use PDO;

final class PublicContentService
{
    public function __construct(private readonly PDO $pdo) {}

    public function company(): array
    {
        $row = $this->pdo->query('SELECT value_json FROM company_settings WHERE setting_key = "company" LIMIT 1')->fetch();
        if (!$row) {
            return [];
        }
        return json_decode((string) $row['value_json'], true) ?: [];
    }

    public function categories(string $lang): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.slug, c.path, COALESCE(ct.name, c.slug) AS name
             FROM categories c
             LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.lang = ?
             ORDER BY c.sort_order, c.slug',
        );
        $stmt->execute([$lang]);
        return $stmt->fetchAll();
    }

    public function products(string $lang, ?string $categorySlug = null, ?string $q = null, string $sort = 'name-asc'): array
    {
        $params = [$lang];
        $where = ['1=1'];
        if ($categorySlug) {
            $where[] = 'EXISTS (
              SELECT 1 FROM product_categories pc
              INNER JOIN categories c ON c.id = pc.category_id
              WHERE pc.product_id = p.id AND c.slug = ?
            )';
            $params[] = $categorySlug;
        }
        if ($q) {
            $where[] = '(pt.name LIKE ? OR p.article LIKE ? OR p.slug LIKE ?)';
            $like = '%' . $q . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }
        $order = $sort === 'name-desc' ? 'pt.name DESC' : 'pt.name ASC';
        $sql = 'SELECT p.slug, p.article, p.vendor,
                       COALESCE(NULLIF(pt.name, \'\'), ptaz.name, \'\') AS name,
                       COALESCE(NULLIF(pt.description, \'\'), ptaz.description, \'\') AS description
                FROM products p
                LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.lang = ?
                LEFT JOIN product_translations ptaz ON ptaz.product_id = p.id AND ptaz.lang = \'az\'
                WHERE ' . implode(' AND ', $where) . "
                ORDER BY $order";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        foreach ($products as &$product) {
            $product['images'] = $this->productImages((int) $this->productIdBySlug($product['slug']));
            $product['categorySlugs'] = $this->productCategorySlugs($product['slug']);
        }
        return $products;
    }

    public function product(string $slug, string $lang): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT p.slug, p.article, p.vendor,
                    COALESCE(NULLIF(pt.name, \'\'), ptaz.name, \'\') AS name,
                    COALESCE(NULLIF(pt.description, \'\'), ptaz.description, \'\') AS description
             FROM products p
             LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.lang = ?
             LEFT JOIN product_translations ptaz ON ptaz.product_id = p.id AND ptaz.lang = \'az\'
             WHERE p.slug = ? LIMIT 1',
        );
        $stmt->execute([$lang, $slug]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $id = $this->productIdBySlug($slug);
        $row['images'] = $this->productImages($id);
        $row['categorySlugs'] = $this->productCategorySlugs($slug);
        return $row;
    }

    private function productIdBySlug(string $slug): int
    {
        $stmt = $this->pdo->prepare('SELECT id FROM products WHERE slug = ?');
        $stmt->execute([$slug]);
        return (int) $stmt->fetchColumn();
    }

    private function productImages(int $productId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT path FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC',
        );
        $stmt->execute([$productId]);
        return array_column($stmt->fetchAll(), 'path');
    }

    private function productCategorySlugs(string $slug): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.slug FROM product_categories pc
             INNER JOIN products p ON p.id = pc.product_id
             INNER JOIN categories c ON c.id = pc.category_id
             WHERE p.slug = ?',
        );
        $stmt->execute([$slug]);
        return array_column($stmt->fetchAll(), 'slug');
    }

    public function newsList(string $lang): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT n.slug, n.banner_path AS banner, n.banner_width, n.banner_height,
                    COALESCE(NULLIF(nt.title, \'\'), ntaz.title, \'\') AS title,
                    COALESCE(NULLIF(nt.subtitle, \'\'), ntaz.subtitle, \'\') AS subtitle,
                    COALESCE(NULLIF(nt.seo_title, \'\'), ntaz.seo_title, \'\') AS seoTitle,
                    COALESCE(NULLIF(nt.meta_description, \'\'), ntaz.meta_description, \'\') AS metaDescription,
                    COALESCE(NULLIF(nt.keywords, \'\'), ntaz.keywords, \'\') AS keywords
             FROM news n
             LEFT JOIN news_translations nt ON nt.news_id = n.id AND nt.lang = ?
             LEFT JOIN news_translations ntaz ON ntaz.news_id = n.id AND ntaz.lang = \'az\'
             ORDER BY n.sort_order, n.id DESC',
        );
        $stmt->execute([$lang]);
        return array_map(static function (array $row) use ($lang) {
            $row['to'] = '/' . $lang . '/blog/' . $row['slug'];
            return $row;
        }, $stmt->fetchAll());
    }

    public function news(string $slug, string $lang): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT n.slug, n.banner_path AS banner, n.banner_width, n.banner_height,
                    COALESCE(NULLIF(nt.title, \'\'), ntaz.title, \'\') AS title,
                    COALESCE(NULLIF(nt.subtitle, \'\'), ntaz.subtitle, \'\') AS subtitle,
                    COALESCE(NULLIF(nt.seo_title, \'\'), ntaz.seo_title, \'\') AS seoTitle,
                    COALESCE(NULLIF(nt.meta_description, \'\'), ntaz.meta_description, \'\') AS metaDescription,
                    COALESCE(NULLIF(nt.keywords, \'\'), ntaz.keywords, \'\') AS keywords,
                    COALESCE(NULLIF(nt.body_json, \'\'), NULLIF(nt.body_json, \'[]\'), ntaz.body_json, \'[]\') AS body_json
             FROM news n
             LEFT JOIN news_translations nt ON nt.news_id = n.id AND nt.lang = ?
             LEFT JOIN news_translations ntaz ON ntaz.news_id = n.id AND ntaz.lang = \'az\'
             WHERE n.slug = ? LIMIT 1',
        );
        $stmt->execute([$lang, $slug]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $row['blocks'] = json_decode((string) $row['body_json'], true) ?: [];
        unset($row['body_json']);
        return $row;
    }

    public function catalogs(string $lang): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.slug, c.cover_path AS cover,
                    ct.title, ct.subtitle, ct.file_path AS file, ct.language_label AS languageLabel
             FROM catalogs c
             LEFT JOIN catalog_translations ct ON ct.catalog_id = c.id AND ct.lang = ?
             ORDER BY c.sort_order',
        );
        $stmt->execute([$lang]);
        return $stmt->fetchAll();
    }

    public function localizedSlug(string $entity, string $slug, string $fromLang, string $toLang): ?string
    {
        if ($fromLang === $toLang) {
            return $slug;
        }
        $table = match ($entity) {
            'product' => 'products',
            'news' => 'news',
            'catalog' => 'catalogs',
            default => null,
        };
        if (!$table) {
            return $slug;
        }
        $stmt = $this->pdo->prepare("SELECT slug FROM $table WHERE slug = ? LIMIT 1");
        $stmt->execute([$slug]);
        $found = $stmt->fetchColumn();
        return $found ? (string) $found : null;
    }
}