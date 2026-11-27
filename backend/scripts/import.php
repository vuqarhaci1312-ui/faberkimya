<?php
declare(strict_types=1);

use Faber\Sql;

$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);
$root = $config['paths']['project_root'];
$langs = $config['app']['supported_langs'];

function ran(PDO $pdo, string $key): bool
{
    $stmt = $pdo->prepare('SELECT 1 FROM import_runs WHERE run_key = ?');
    $stmt->execute([$key]);
    return (bool) $stmt->fetchColumn();
}

function mark(PDO $pdo, string $key): void
{
    if (Faber\Sql::isPgsql($pdo)) {
        $pdo->prepare('INSERT INTO import_runs (run_key) VALUES (?) ON CONFLICT (run_key) DO UPDATE SET ran_at = CURRENT_TIMESTAMP')->execute([$key]);
        return;
    }
    $pdo->prepare('INSERT INTO import_runs (run_key) VALUES (?) ON CONFLICT(run_key) DO UPDATE SET ran_at = CURRENT_TIMESTAMP')->execute([$key]);
}

function idBy(PDO $pdo, string $table, string $column, string $value): int
{
    $stmt = $pdo->prepare("SELECT id FROM $table WHERE $column = ?");
    $stmt->execute([$value]);
    return (int) $stmt->fetchColumn();
}

$languages = [
    ['az', 'Azərbaycan', 1, 0],
    ['ru', 'Rus', 0, 1],
    ['tr', 'Türk', 0, 2],
    ['en', 'English', 0, 3],
];
foreach ($languages as [$code, $name, $def, $sort]) {
    if (Sql::isPgsql($pdo)) {
        $pdo->prepare('INSERT INTO languages (code, name, is_default, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name')->execute([$code, $name, $def, $sort]);
    } else {
        $pdo->prepare('INSERT INTO languages (code, name, is_default, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT(code) DO UPDATE SET name = excluded.name')->execute([$code, $name, $def, $sort]);
    }
}

$csvRows = [];
$csvPath = $root . '/xebersekilleri/kataloglar/tercumeler/faber-i18n.csv';
if (is_file($csvPath)) {
    $fh = fopen($csvPath, 'rb');
    fgetcsv($fh);
    while (($row = fgetcsv($fh)) !== false) {
        if (count($row) < 5) {
            continue;
        }
        $csvRows[trim($row[4])] = [
            'az' => trim($row[0] ?? ''),
            'ru' => trim($row[1] ?? ''),
            'tr' => trim($row[2] ?? ''),
            'en' => trim($row[3] ?? ''),
        ];
    }
    fclose($fh);
}

if (!ran($pdo, 'csv_translations') && $csvRows) {
    foreach ($csvRows as $key => $byLang) {
        $group = explode('.', $key)[0] ?: 'general';
        foreach ($byLang as $code => $value) {
            Sql::upsertTranslation($pdo, $key, $group, $code, $value);
        }
    }
    mark($pdo, 'csv_translations');
    echo "Imported CSV translations (" . count($csvRows) . ").\n";
}

if (!ran($pdo, 'ui_gaps_missing_only')) {
    $gaps = require dirname(__DIR__) . '/config/ui-gaps.php';
    $check = $pdo->prepare('SELECT 1 FROM translation_keys WHERE tkey = ?');
    foreach ($gaps as $key => $byLang) {
        $check->execute([$key]);
        if ($check->fetchColumn()) {
            continue;
        }
        $group = explode('.', $key)[0] ?: 'general';
        foreach ($langs as $code) {
            $value = $byLang[$code] ?? ($byLang['az'] ?? '');
            if ($value === '') {
                continue;
            }
            Sql::upsertTranslation($pdo, $key, $group, $code, $value);
        }
    }
    mark($pdo, 'ui_gaps_missing_only');
    echo "Inserted missing UI keys.\n";
}

if (!ran($pdo, 'ui_gaps')) {
    $gaps = require dirname(__DIR__) . '/config/ui-gaps.php';
    foreach ($gaps as $key => $byLang) {
        $group = explode('.', $key)[0] ?: 'general';
        foreach ($langs as $code) {
            $value = $byLang[$code] ?? ($byLang['az'] ?? '');
            if ($value === '') {
                continue;
            }
            Sql::upsertTranslation($pdo, $key, $group, $code, $value);
        }
    }
    mark($pdo, 'ui_gaps');
    echo "Imported UI gap keys.\n";
}

$catKeyBySlug = [
    'mtbx-gigiyenas' => 'cat.kitchen',
    'camashir-gigiynasi' => 'cat.laundry',
    'tmizlik' => 'cat.cleaning',
    'təmizlik-avadanligi' => 'cat.equipment',
    'xsi-gigiyena' => 'cat.personal',
    'qida-s-nayesi-mu-ssis-l-rind-gigiyena-qaydalar' => 'cat.food',
    'hamam-otann-gigiyenas' => 'cat.bath',
    'hovuza-qulluq' => 'cat.pool',
    'dispenserlər' => 'cat.dispensers',
    'kagiz-məhsullari' => 'cat.paper',
];

$sitePath = $root . '/src/data/site.json';
$site = is_file($sitePath) ? json_decode((string) file_get_contents($sitePath), true) : null;
if ($site && !ran($pdo, 'site_core')) {
    $companyJson = json_encode($site['company'], JSON_UNESCAPED_UNICODE);
    if (Sql::isPgsql($pdo)) {
        $pdo->prepare('INSERT INTO company_settings (setting_key, value_json) VALUES (?, ?) ON CONFLICT (setting_key) DO UPDATE SET value_json = EXCLUDED.value_json')->execute(['company', $companyJson]);
    } else {
        $pdo->prepare('INSERT INTO company_settings (setting_key, value_json) VALUES (?, ?) ON CONFLICT(setting_key) DO UPDATE SET value_json = excluded.value_json')->execute(['company', $companyJson]);
    }

    foreach ($site['categories'] as $i => $cat) {
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO categories (slug, path, sort_order) VALUES (?, ?, ?) ON CONFLICT (slug) DO NOTHING')->execute([$cat['slug'], $cat['path'], $i]);
        } else {
            $pdo->prepare('INSERT INTO categories (slug, path, sort_order) VALUES (?, ?, ?) ON CONFLICT(slug) DO NOTHING')->execute([$cat['slug'], $cat['path'], $i]);
        }
        $cid = idBy($pdo, 'categories', 'slug', $cat['slug']);
        foreach ($langs as $lang) {
            $name = $cat['name'];
            $mapKey = $catKeyBySlug[$cat['slug']] ?? null;
            if ($mapKey && isset($csvRows[$mapKey][$lang]) && $csvRows[$mapKey][$lang] !== '') {
                $name = $csvRows[$mapKey][$lang];
            }
            if (Sql::isPgsql($pdo)) {
                $pdo->prepare('INSERT INTO category_translations (category_id, lang, name) VALUES (?, ?, ?) ON CONFLICT (category_id, lang) DO NOTHING')->execute([$cid, $lang, $name]);
            } else {
                $pdo->prepare('INSERT INTO category_translations (category_id, lang, name) VALUES (?, ?, ?) ON CONFLICT(category_id, lang) DO NOTHING')->execute([$cid, $lang, $name]);
            }
        }
    }

    foreach ($site['products'] as $i => $prod) {
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO products (slug, article, vendor, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT (slug) DO NOTHING')->execute([$prod['slug'], $prod['article'], $prod['vendor'], $i]);
        } else {
            $pdo->prepare('INSERT INTO products (slug, article, vendor, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO NOTHING')->execute([$prod['slug'], $prod['article'], $prod['vendor'], $i]);
        }
        $pid = idBy($pdo, 'products', 'slug', $prod['slug']);
        foreach ($langs as $lang) {
            $name = $lang === 'az' ? (string) $prod['name'] : '';
            $desc = $lang === 'az' ? (string) ($prod['description'] ?? '') : '';
            if (Sql::isPgsql($pdo)) {
                $pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT (product_id, lang) DO NOTHING')->execute([$pid, $lang, $name, $desc]);
            } else {
                $pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, lang) DO NOTHING')->execute([$pid, $lang, $name, $desc]);
            }
        }
        $imgCount = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ?');
        $imgCount->execute([$pid]);
        if ((int) $imgCount->fetchColumn() === 0) {
            foreach ($prod['images'] as $j => $img) {
                $pdo->prepare('INSERT INTO product_images (product_id, path, sort_order, is_primary) VALUES (?, ?, ?, ?)')->execute([$pid, $img, $j, $j === 0 ? 1 : 0]);
            }
        }
        foreach ($prod['categorySlugs'] as $slug) {
            $cid = idBy($pdo, 'categories', 'slug', $slug);
            if ($cid) {
                if (Sql::isPgsql($pdo)) {
                    $pdo->prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?) ON CONFLICT DO NOTHING')->execute([$pid, $cid]);
                } else {
                    $pdo->prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?) ON CONFLICT DO NOTHING')->execute([$pid, $cid]);
                }
            }
        }
    }
    mark($pdo, 'site_core');
    echo "Imported company, categories, products.\n";
}

if (!ran($pdo, 'catalogs_seed')) {
    $catalogs = [
        ['rindo-2026', 'rindo', '/media/catalogs/rindo-urun-katalogu-2026-eng.pdf'],
        ['rulopak-2026', 'rulopak', '/media/catalogs/rulopak-catalogue-2026.pdf'],
        ['utp-2026', 'utp', '/media/catalogs/utp-urun-katalogu-2026-eng.pdf'],
    ];
    foreach ($catalogs as $i => [$slug, $prefix, $file]) {
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO catalogs (slug, sort_order) VALUES (?, ?) ON CONFLICT (slug) DO NOTHING')->execute([$slug, $i]);
        } else {
            $pdo->prepare('INSERT INTO catalogs (slug, sort_order) VALUES (?, ?) ON CONFLICT(slug) DO NOTHING')->execute([$slug, $i]);
        }
        $cid = idBy($pdo, 'catalogs', 'slug', $slug);
        foreach ($langs as $lang) {
            $title = $csvRows[$prefix . '.title'][$lang] ?? ($prefix . ' 2026');
            $subtitle = $csvRows[$prefix . '.desc'][$lang] ?? '';
            if (Sql::isPgsql($pdo)) {
                $pdo->prepare('INSERT INTO catalog_translations (catalog_id, lang, title, subtitle, file_path, language_label) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (catalog_id, lang) DO NOTHING')->execute([$cid, $lang, $title, $subtitle, $file, 'ENG']);
            } else {
                $pdo->prepare('INSERT INTO catalog_translations (catalog_id, lang, title, subtitle, file_path, language_label) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(catalog_id, lang) DO NOTHING')->execute([$cid, $lang, $title, $subtitle, $file, 'ENG']);
            }
        }
    }
    mark($pdo, 'catalogs_seed');
    echo "Imported catalogs.\n";
}

if (!ran($pdo, 'news_seed') && $csvRows) {
    $articles = require dirname(__DIR__) . '/config/news-articles.php';
    $ordered = array_keys($csvRows);
    foreach ($articles as $i => $article) {
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO news (slug, banner_path, banner_width, banner_height, sort_order) VALUES (?, ?, ?, ?, ?) ON CONFLICT (slug) DO NOTHING')
                ->execute([$article['slug'], $article['banner'], $article['width'], $article['height'], $i]);
        } else {
            $pdo->prepare('INSERT INTO news (slug, banner_path, banner_width, banner_height, sort_order) VALUES (?, ?, ?, ?, ?) ON CONFLICT(slug) DO NOTHING')
                ->execute([$article['slug'], $article['banner'], $article['width'], $article['height'], $i]);
        }
        $nid = idBy($pdo, 'news', 'slug', $article['slug']);
        $prefix = $article['prefix'] . '.';
        $keys = array_values(array_filter($ordered, static fn (string $k) => str_starts_with($k, $prefix) && !str_ends_with($k, '.title') && !str_ends_with($k, '.summary')));
        $listItems = [];
        foreach ($article['lists'] as $items) {
            foreach ($items as $itemKey) {
                $listItems[$itemKey] = true;
            }
        }
        $headings = array_fill_keys($article['headings'], true);
        foreach ($langs as $lang) {
            $blocks = [];
            foreach ($keys as $key) {
                if (isset($listItems[$key])) {
                    continue;
                }
                $text = $csvRows[$key][$lang] ?? '';
                if ($text === '') {
                    continue;
                }
                if (isset($article['lists'][$key])) {
                    $blocks[] = ['type' => 'p', 'text' => $text];
                    $items = [];
                    foreach ($article['lists'][$key] as $itemKey) {
                        $item = $csvRows[$itemKey][$lang] ?? '';
                        if ($item !== '') {
                            $items[] = $item;
                        }
                    }
                    if ($items) {
                        $blocks[] = ['type' => 'ul', 'items' => $items];
                    }
                    continue;
                }
                $isHeading = isset($headings[$key]) || str_ends_with($key, '_title');
                $blocks[] = $isHeading ? ['type' => 'h2', 'text' => $text] : ['type' => 'p', 'text' => $text];
            }
            $title = $csvRows[$article['prefix'] . '.title'][$lang] ?? '';
            $subtitle = $csvRows[$article['prefix'] . '.summary'][$lang] ?? '';
            if (Sql::isPgsql($pdo)) {
                $pdo->prepare('INSERT INTO news_translations (news_id, lang, title, subtitle, seo_title, meta_description, keywords, body_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (news_id, lang) DO NOTHING')
                    ->execute([$nid, $lang, $title, $subtitle, $title, $subtitle, '', json_encode($blocks, JSON_UNESCAPED_UNICODE)]);
            } else {
                $pdo->prepare('INSERT INTO news_translations (news_id, lang, title, subtitle, seo_title, meta_description, keywords, body_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(news_id, lang) DO NOTHING')
                    ->execute([$nid, $lang, $title, $subtitle, $title, $subtitle, '', json_encode($blocks, JSON_UNESCAPED_UNICODE)]);
            }
        }
    }
    mark($pdo, 'news_seed');
    echo "Imported news.\n";
}

if (!ran($pdo, 'news_health_fill') && $csvRows) {
    $article = null;
    foreach (require dirname(__DIR__) . '/config/news-articles.php' as $item) {
        if ($item['prefix'] === 'health') {
            $article = $item;
            break;
        }
    }
    if ($article) {
        $nid = idBy($pdo, 'news', 'slug', $article['slug']);
        $ordered = array_keys($csvRows);
        $prefix = 'health.';
        $keys = array_values(array_filter($ordered, static fn (string $k) => str_starts_with($k, $prefix) && !str_ends_with($k, '.title') && !str_ends_with($k, '.summary')));
        $listItems = [];
        foreach ($article['lists'] as $items) {
            foreach ($items as $itemKey) {
                $listItems[$itemKey] = true;
            }
        }
        $headings = array_fill_keys($article['headings'], true);
        if ($nid) {
            foreach ($langs as $lang) {
                $current = $pdo->prepare('SELECT title, body_json FROM news_translations WHERE news_id = ? AND lang = ?');
                $current->execute([$nid, $lang]);
                $row = $current->fetch() ?: ['title' => '', 'body_json' => ''];
                $titleEmpty = trim((string) ($row['title'] ?? '')) === '';
                $bodyEmpty = trim((string) ($row['body_json'] ?? '')) === '' || trim((string) $row['body_json']) === '[]';
                if (!$titleEmpty && !$bodyEmpty) {
                    continue;
                }
                $blocks = [];
                foreach ($keys as $key) {
                    if (isset($listItems[$key])) {
                        continue;
                    }
                    $text = $csvRows[$key][$lang] ?? '';
                    if ($text === '') {
                        continue;
                    }
                    if (isset($article['lists'][$key])) {
                        $blocks[] = ['type' => 'p', 'text' => $text];
                        $items = [];
                        foreach ($article['lists'][$key] as $itemKey) {
                            $item = $csvRows[$itemKey][$lang] ?? '';
                            if ($item !== '') {
                                $items[] = $item;
                            }
                        }
                        if ($items) {
                            $blocks[] = ['type' => 'ul', 'items' => $items];
                        }
                        continue;
                    }
                    $isHeading = isset($headings[$key]) || str_ends_with($key, '_title');
                    $blocks[] = $isHeading ? ['type' => 'h2', 'text' => $text] : ['type' => 'p', 'text' => $text];
                }
                $title = $csvRows['health.title'][$lang] ?? '';
                $subtitle = $csvRows['health.summary'][$lang] ?? '';
                if ($titleEmpty && $bodyEmpty) {
                    $pdo->prepare('UPDATE news_translations SET title = ?, subtitle = ?, seo_title = ?, meta_description = ?, body_json = ? WHERE news_id = ? AND lang = ?')
                        ->execute([$title, $subtitle, $title, $subtitle, json_encode($blocks, JSON_UNESCAPED_UNICODE), $nid, $lang]);
                } elseif ($titleEmpty) {
                    $pdo->prepare('UPDATE news_translations SET title = ?, subtitle = ?, seo_title = ?, meta_description = ? WHERE news_id = ? AND lang = ?')
                        ->execute([$title, $subtitle, $title, $subtitle, $nid, $lang]);
                } else {
                    $pdo->prepare('UPDATE news_translations SET body_json = ? WHERE news_id = ? AND lang = ?')
                        ->execute([json_encode($blocks, JSON_UNESCAPED_UNICODE), $nid, $lang]);
                }
            }
        }
    }
    mark($pdo, 'news_health_fill');
    echo "Filled empty health news translations.\n";
}

$redirects = [
    ['/mehsullar', '/az/mehsullar'],
    ['/sirket', '/az/sirket'],
    ['/elaqe', '/az/elaqe'],
    ['/kataloqlar', '/az/kataloqlar'],
    ['/axtaris', '/az/axtaris'],
    ['/ekse-elaqe', '/az/ekse-elaqe'],
];
foreach ($redirects as [$from, $to]) {
    if (Sql::isPgsql($pdo)) {
        $pdo->prepare('INSERT INTO url_redirects (from_path, to_path, status_code) VALUES (?, ?, 301) ON CONFLICT (from_path) DO NOTHING')->execute([$from, $to]);
    } else {
        $pdo->prepare('INSERT INTO url_redirects (from_path, to_path, status_code) VALUES (?, ?, 301) ON CONFLICT(from_path) DO NOTHING')->execute([$from, $to]);
    }
}

echo "Import complete.\n";
