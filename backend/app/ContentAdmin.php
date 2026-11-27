<?php
declare(strict_types=1);

namespace Faber;

use PDO;

final class ContentAdmin
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly array $config,
        private readonly array $user,
    ) {}

    public function dispatch(string $route, string $csrf): ?string
    {
        $langs = $this->config['app']['supported_langs'];
        if (str_starts_with($route, 'products')) {
            return $this->products($route, $csrf, $langs);
        }
        if (str_starts_with($route, 'categories')) {
            return $this->categories($route, $csrf, $langs);
        }
        if (str_starts_with($route, 'news')) {
            return $this->news($route, $csrf, $langs);
        }
        if (str_starts_with($route, 'catalogs')) {
            return $this->catalogs($route, $csrf, $langs);
        }
        return null;
    }

    private function langs(): array
    {
        return $this->config['app']['supported_langs'];
    }

    private function products(string $route, string $csrf, array $langs): string
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
            $this->guardCsrf();
            $action = (string) ($_POST['action'] ?? 'save');
            if ($action === 'delete') {
                $id = (int) ($_POST['id'] ?? 0);
                $this->pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
                Response::redirect('/secad/products?saved=1');
            }
            if ($action === 'image-delete') {
                $this->pdo->prepare('DELETE FROM product_images WHERE id = ? AND product_id = ?')->execute([(int) $_POST['image_id'], (int) $_POST['id']]);
                Response::redirect('/secad/products/edit?id=' . (int) $_POST['id']);
            }
            if ($action === 'image-primary') {
                $pid = (int) $_POST['id'];
                $this->pdo->prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?')->execute([$pid]);
                $this->pdo->prepare('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?')->execute([(int) $_POST['image_id'], $pid]);
                Response::redirect('/secad/products/edit?id=' . $pid);
            }
            $id = (int) ($_POST['id'] ?? 0);
            $slug = trim((string) ($_POST['slug'] ?? ''));
            $azName = trim((string) ($_POST['name']['az'] ?? ''));
            if ($azName === '') {
                Response::redirect('/secad/products/' . ($id ? 'edit?id=' . $id . '&' : 'new?') . 'err=name');
            }
            if ($id > 0 && $slug === '') {
                $keep = $this->pdo->prepare('SELECT slug FROM products WHERE id = ?');
                $keep->execute([$id]);
                $slug = (string) $keep->fetchColumn();
            }
            if ($slug === '') {
                $slug = $this->slugify($azName);
            }
            $dup = $this->pdo->prepare('SELECT id FROM products WHERE slug = ? AND id <> ?');
            $dup->execute([$slug, $id]);
            if ($dup->fetchColumn()) {
                Response::redirect('/secad/products/' . ($id ? 'edit?id=' . $id . '&' : 'new?') . 'err=slug');
            }
            if ($id === 0) {
                $this->pdo->prepare('INSERT INTO products (slug, article, vendor, sort_order) VALUES (?, ?, ?, 0)')->execute([
                    $slug,
                    trim((string) ($_POST['article'] ?? '')) ?: null,
                    trim((string) ($_POST['vendor'] ?? '')) ?: null,
                ]);
                $id = (int) $this->pdo->lastInsertId();
            } else {
                $this->pdo->prepare('UPDATE products SET slug = ?, article = ?, vendor = ? WHERE id = ?')->execute([
                    $slug,
                    trim((string) ($_POST['article'] ?? '')) ?: null,
                    trim((string) ($_POST['vendor'] ?? '')) ?: null,
                    $id,
                ]);
            }
            foreach ($langs as $lang) {
                $name = trim((string) ($_POST['name'][$lang] ?? ''));
                $desc = trim((string) ($_POST['description'][$lang] ?? ''));
                if (Sql::isPgsql($this->pdo)) {
                    $this->pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT (product_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description')
                        ->execute([$id, $lang, $name, $desc]);
                } else {
                    $this->pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, lang) DO UPDATE SET name = excluded.name, description = excluded.description')
                        ->execute([$id, $lang, $name, $desc]);
                }
            }
            if (isset($_POST['categories_present'])) {
                $this->pdo->prepare('DELETE FROM product_categories WHERE product_id = ?')->execute([$id]);
                $cats = $_POST['categories'] ?? [];
                if (is_array($cats)) {
                    foreach ($cats as $cid) {
                        if ((int) $cid > 0) {
                            $this->pdo->prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)')->execute([$id, (int) $cid]);
                        }
                    }
                }
            }
            if (!empty($_FILES['images']['name']) && is_array($_FILES['images']['name'])) {
                $count = count($_FILES['images']['name']);
                $maxOrder = (int) $this->pdo->query('SELECT COALESCE(MAX(sort_order), -1) FROM product_images WHERE product_id = ' . $id)->fetchColumn();
                $hasPrimary = (int) $this->pdo->query('SELECT COUNT(*) FROM product_images WHERE product_id = ' . $id . ' AND is_primary = 1')->fetchColumn();
                for ($i = 0; $i < $count; $i++) {
                    $file = [
                        'name' => $_FILES['images']['name'][$i],
                        'type' => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error' => $_FILES['images']['error'][$i],
                        'size' => $_FILES['images']['size'][$i],
                    ];
                    $path = Upload::image($file, $this->config, 'products/' . $id);
                    if (!$path) {
                        continue;
                    }
                    $maxOrder++;
                    $primary = $hasPrimary === 0 && $maxOrder === 0 ? 1 : 0;
                    if ($hasPrimary === 0 && $i === 0) {
                        $primary = 1;
                        $hasPrimary = 1;
                    }
                    $this->pdo->prepare('INSERT INTO product_images (product_id, path, sort_order, is_primary) VALUES (?, ?, ?, ?)')->execute([$id, $path, $maxOrder, $primary]);
                }
            }
            Response::redirect('/secad/products/edit?id=' . $id . '&saved=1');
        }

        if ($route === 'products/edit' || $route === 'products/new') {
            $id = (int) ($_GET['id'] ?? 0);
            $product = ['slug' => '', 'article' => '', 'vendor' => ''];
            $names = [];
            $descs = [];
            $selected = [];
            $images = [];
            if ($id) {
                $stmt = $this->pdo->prepare('SELECT * FROM products WHERE id = ?');
                $stmt->execute([$id]);
                $product = $stmt->fetch() ?: $product;
                $tr = $this->pdo->prepare('SELECT lang, name, description FROM product_translations WHERE product_id = ?');
                $tr->execute([$id]);
                foreach ($tr->fetchAll() as $row) {
                    $names[$row['lang']] = $row['name'];
                    $descs[$row['lang']] = $row['description'];
                }
                $sel = $this->pdo->prepare('SELECT category_id FROM product_categories WHERE product_id = ?');
                $sel->execute([$id]);
                $selected = array_map('intval', array_column($sel->fetchAll(), 'category_id'));
                $imgs = $this->pdo->prepare('SELECT id, path, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
                $imgs->execute([$id]);
                $images = $imgs->fetchAll();
            }
            $cats = $this->pdo->query('SELECT c.id, ct.name FROM categories c LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.lang = \'az\' ORDER BY c.sort_order')->fetchAll();
            $back = '/secad/products' . (isset($_GET['back']) ? '?' . $_GET['back'] : '');
            $html = '<div class="page-head"><h1>' . ($id ? 'Məhsulu redaktə et' : 'Yeni məhsul') . '</h1><a class="btn ghost" href="' . $this->e($back) . '">Ləğv et</a></div>';
            if (isset($_GET['saved'])) {
                $html .= '<p class="ok">Saxlanıldı.</p>';
            }
            if (($_GET['err'] ?? '') === 'name') {
                $html .= '<p class="err">Məhsulun adı (AZ) mütləqdir.</p>';
            }
            if (($_GET['err'] ?? '') === 'slug') {
                $html .= '<p class="err">Bu ünvan artıq mövcuddur.</p>';
            }
            $maxMb = (int) (($this->config['upload']['max_bytes'] ?? 0) / 1048576);
            $html .= '<form method="post" enctype="multipart/form-data" class="product-form dirty" data-dirty="0" id="product-form">';
            $html .= '<input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="action" value="save"><input type="hidden" name="categories_present" value="1"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '">';
            $html .= '<div class="product-grid"><div class="product-main">';
            $html .= '<div class="tabs">';
            foreach ($langs as $i => $lang) {
                $filled = trim((string) ($names[$lang] ?? '')) !== '' ? ' dolu' : ' empty';
                $html .= '<button type="button" class="tab' . ($i === 0 ? ' on' : '') . $filled . '" data-tab="' . $this->e($lang) . '">' . $this->e(strtoupper($lang)) . '</button>';
            }
            $html .= '</div>';
            foreach ($langs as $i => $lang) {
                $html .= '<div class="pane' . ($i === 0 ? ' on' : '') . '" data-pane="' . $this->e($lang) . '">';
                $req = $lang === 'az' ? ' required data-required="1"' : '';
                $html .= '<label>Məhsulun adı (' . $this->e(strtoupper($lang)) . ')' . ($lang === 'az' ? ' *' : '') . '<input class="product-name" data-lang="' . $this->e($lang) . '" name="name[' . $this->e($lang) . ']" value="' . $this->e((string) ($names[$lang] ?? '')) . '"' . $req . '></label>';
                $html .= '<label>Ətraflı məlumat<textarea name="description[' . $this->e($lang) . ']" rows="6">' . $this->e((string) ($descs[$lang] ?? '')) . '</textarea></label></div>';
            }
            $html .= '<label>Məhsul kodu (artikul)<input name="article" value="' . $this->e((string) ($product['article'] ?? '')) . '"></label>';
            $html .= '<label>İstehsalçı<input name="vendor" value="' . $this->e((string) ($product['vendor'] ?? '')) . '"></label>';
            $html .= '<details class="url-box"' . ($id ? '' : ' open') . '><summary>Saytdakı ünvan</summary>';
            $html .= '<label>Slug<input name="slug" id="product-slug" value="' . $this->e((string) ($product['slug'] ?? '')) . '" data-locked="' . ($id ? '1' : '0') . '"></label>';
            $html .= '<p class="hint">Önizləmə: /az/mehsul/<span id="slug-preview">' . $this->e((string) ($product['slug'] ?? '')) . '</span></p></details>';
            $html .= '</div><aside class="product-side">';
            $html .= '<section class="card"><h2>Məhsul şəkilləri</h2><p class="hint">JPEG, PNG, WEBP və ya GIF. Ən çox ' . $maxMb . ' MB.</p>';
            $html .= '<label class="upload">Şəkil yüklə<input type="file" name="images[]" accept="image/jpeg,image/png,image/webp,image/gif" multiple></label>';
            if ($images) {
                $html .= '<div class="thumbs">';
                foreach ($images as $img) {
                    $html .= '<figure><img src="' . $this->e((string) $img['path']) . '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.hidden=false">';
                    $html .= '<p class="err" hidden>Şəkil faylı açılmır</p><label>Əvəz et<input type="file" name="replace_' . (int) $img['id'] . '" accept="image/jpeg,image/png,image/webp,image/gif"></label>';
                    $html .= '<figcaption>';
                    if (!(int) $img['is_primary']) {
                        $html .= '<button type="submit" form="img-primary-' . (int) $img['id'] . '">Əsas şəkil et</button> ';
                    } else {
                        $html .= '<span>Əsas şəkil</span> ';
                    }
                    $html .= '<button type="submit" class="danger" form="img-del-' . (int) $img['id'] . '">Şəkli sil</button></figcaption></figure>';
                }
                $html .= '</div>';
            } else {
                $html .= '<p class="hint">Şəkil yoxdur</p>';
            }
            $html .= '</section><section class="card"><h2>Kateqoriyalar</h2>';
            $html .= '<input type="search" class="cat-filter" placeholder="Kateqoriya axtar" oninput="document.querySelectorAll(\'.cat-option\').forEach(function(el){el.hidden=el.dataset.name.indexOf(this.value.toLowerCase())===-1}.bind(this))">';
            $html .= '<div class="chips">';
            foreach ($cats as $cat) {
                if (!in_array((int) $cat['id'], $selected, true)) {
                    continue;
                }
                $html .= '<span class="chip">' . $this->e((string) $cat['name']) . '</span>';
            }
            $html .= '</div><div class="cat-list">';
            foreach ($cats as $cat) {
                $checked = in_array((int) $cat['id'], $selected, true) ? ' checked' : '';
                $name = (string) ($cat['name'] ?: $cat['id']);
                $html .= '<label class="check cat-option" data-name="' . $this->e(mb_strtolower($name)) . '"><input type="checkbox" name="categories[]" value="' . (int) $cat['id'] . '"' . $checked . '> ' . $this->e($name) . '</label>';
            }
            $html .= '</div></section></aside></div>';
            $html .= '<div class="savebar"><button type="submit">' . ($id ? 'Dəyişiklikləri saxla' : 'Məhsulu yarat') . '</button></div></form>';
            foreach ($images as $img) {
                $html .= '<form id="img-primary-' . (int) $img['id'] . '" method="post"><input type="hidden" name="action" value="image-primary"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="image_id" value="' . (int) $img['id'] . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"></form>';
                $html .= '<form id="img-del-' . (int) $img['id'] . '" method="post" onsubmit="return confirm(\'Şəkil silinsin?\')"><input type="hidden" name="action" value="image-delete"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="image_id" value="' . (int) $img['id'] . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"></form>';
            }
            if ($id) {
                $html .= '<form method="post" onsubmit="return confirm(\'Məhsul silinsin?\')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"><button type="submit" class="danger">Məhsulu sil</button></form>';
            }
            $html .= $this->dirtyScript();
            return $html;
        }

        $q = trim((string) ($_GET['q'] ?? ''));
        $category = (int) ($_GET['category'] ?? 0);
        $image = (string) ($_GET['image'] ?? '');
        $missing = (string) ($_GET['missing_lang'] ?? '');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $per = 25;
        $where = ['1=1'];
        $params = [];
        if ($q !== '') {
            $where[] = '(pt.name LIKE ? OR p.article LIKE ?)';
            $params[] = '%' . $q . '%';
            $params[] = '%' . $q . '%';
        }
        if ($category > 0) {
            $where[] = 'EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = ?)';
            $params[] = $category;
        }
        if ($image === 'yes') {
            $where[] = 'EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)';
        } elseif ($image === 'no') {
            $where[] = 'NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)';
        }
        if ($missing !== '' && in_array($missing, $langs, true)) {
            $where[] = 'NOT EXISTS (SELECT 1 FROM product_translations miss WHERE miss.product_id = p.id AND miss.lang = ? AND miss.name <> \'\')';
            $params[] = $missing;
        }
        $whereSql = implode(' AND ', $where);
        $count = $this->pdo->prepare('SELECT COUNT(*) FROM products p LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.lang = \'az\' WHERE ' . $whereSql);
        $count->execute($params);
        $total = (int) $count->fetchColumn();
        $pages = max(1, (int) ceil($total / $per));
        if ($page > $pages) {
            $page = $pages;
        }
        $sql = 'SELECT p.id, p.article, pt.name,
            (SELECT pi.path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order, pi.id LIMIT 1) AS image,
            (SELECT GROUP_CONCAT(ct.name, \'||\') FROM product_categories pc JOIN category_translations ct ON ct.category_id = pc.category_id AND ct.lang = \'az\' WHERE pc.product_id = p.id) AS cats,
            (SELECT GROUP_CONCAT(tr.lang) FROM product_translations tr WHERE tr.product_id = p.id AND tr.name <> \'\') AS langs
            FROM products p LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.lang = \'az\'
            WHERE ' . $whereSql . ' ORDER BY pt.name LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per);
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $cats = $this->pdo->query('SELECT c.id, ct.name FROM categories c LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.lang = \'az\' ORDER BY ct.name')->fetchAll();
        $qs = $_GET;
        unset($qs['page']);
        $base = '/secad/products?' . http_build_query($qs);
        $html = '<div class="page-head"><h1>Məhsullar</h1><a class="btn" href="/secad/products/new">Yeni məhsul</a></div>';
        $html .= '<p class="count">' . $total . ' nəticə</p>';
        $html .= '<form class="toolbar" method="get"><input name="q" value="' . $this->e($q) . '" placeholder="Ad və ya məhsul kodu">';
        $html .= '<select name="category"><option value="">Bütün kateqoriyalar</option>';
        foreach ($cats as $cat) {
            $html .= '<option value="' . (int) $cat['id'] . '"' . ($category === (int) $cat['id'] ? ' selected' : '') . '>' . $this->e((string) $cat['name']) . '</option>';
        }
        $html .= '</select><select name="image"><option value="">Şəkil</option><option value="yes"' . ($image === 'yes' ? ' selected' : '') . '>Şəkli olan</option><option value="no"' . ($image === 'no' ? ' selected' : '') . '>Şəkli olmayan</option></select>';
        $html .= '<select name="missing_lang"><option value="">Dil çatışmır</option>';
        foreach ($langs as $lang) {
            $html .= '<option value="' . $this->e($lang) . '"' . ($missing === $lang ? ' selected' : '') . '>' . $this->e(strtoupper($lang)) . '</option>';
        }
        $html .= '</select><button>Axtar</button></form>';
        if ($q !== '' || $category || $image !== '' || $missing !== '') {
            $html .= '<p class="chips"><a href="/secad/products">Filtrləri təmizlə</a></p>';
        }
        if ($total === 0) {
            $html .= '<p class="empty">' . (($q !== '' || $category || $image !== '' || $missing !== '') ? 'Bu filtrlərə uyğun nəticə tapılmadı.' : 'Hələ qeyd yoxdur.') . '</p>';
            return $html;
        }
        $html .= '<table class="table products"><thead><tr><th>Məhsul</th><th>Kateqoriyalar</th><th>Dillər</th><th>Əməliyyatlar</th></tr></thead><tbody>';
        $back = http_build_query($_GET);
        foreach ($rows as $row) {
            $edit = '/secad/products/edit?id=' . (int) $row['id'] . ($back !== '' ? '&back=' . urlencode($back) : '');
            $html .= '<tr><td><a class="product-cell" href="' . $this->e($edit) . '">';
            if (!empty($row['image'])) {
                $html .= '<img class="thumb" src="' . $this->e((string) $row['image']) . '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'thumb missing\',textContent:\'Şəkil faylı açılmır\'}))">';
            } else {
                $html .= '<span class="thumb missing">Şəkil yoxdur</span>';
            }
            $html .= '<span><strong>' . $this->e((string) ($row['name'] ?: '—')) . '</strong>';
            if (!empty($row['article'])) {
                $html .= '<small>Məhsul kodu: ' . $this->e((string) $row['article']) . '</small>';
            }
            $html .= '</span></a></td><td>' . $this->catPreview((string) ($row['cats'] ?? '')) . '</td><td>' . $this->langDots((string) ($row['langs'] ?? ''), $langs) . '</td>';
            $html .= '<td><a href="' . $this->e($edit) . '">Redaktə et</a></td></tr>';
        }
        $from = ($page - 1) * $per + 1;
        $to = min($total, $page * $per);
        $html .= '</tbody></table><p class="pager">' . $from . '–' . $to . ' / ' . $total;
        if ($page > 1) {
            $html .= ' <a href="' . $this->e($base . '&page=' . ($page - 1)) . '">Əvvəlki</a>';
        }
        if ($page < $pages) {
            $html .= ' <a href="' . $this->e($base . '&page=' . ($page + 1)) . '">Növbəti</a>';
        }
        return $html . '</p>';
    }

    private function categories(string $route, string $csrf, array $langs): string
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
            $this->guardCsrf();
            $action = (string) ($_POST['action'] ?? 'save');
            $id = (int) ($_POST['id'] ?? 0);
            if ($action === 'delete') {
                $count = $this->pdo->prepare('SELECT COUNT(*) FROM product_categories WHERE category_id = ?');
                $count->execute([$id]);
                if ((int) $count->fetchColumn() > 0) {
                    Response::redirect('/secad/categories/edit?id=' . $id . '&err=products');
                }
                $this->pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
                Response::redirect('/secad/categories?saved=1');
            }
            if ($action === 'move') {
                $target = (int) ($_POST['target'] ?? 0);
                if ($target && $target !== $id) {
                    $this->pdo->prepare('UPDATE product_categories SET category_id = ? WHERE category_id = ?')->execute([$target, $id]);
                    $this->pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
                }
                Response::redirect('/secad/categories?saved=1');
            }
            $slug = trim((string) ($_POST['slug'] ?? ''));
            if ($slug === '') {
                $slug = 'kat-' . bin2hex(random_bytes(3));
            }
            if ($id === 0) {
                $this->pdo->prepare('INSERT INTO categories (slug, path, sort_order) VALUES (?, ?, 0)')->execute([$slug, $slug]);
                $id = (int) $this->pdo->lastInsertId();
            } else {
                $this->pdo->prepare('UPDATE categories SET slug = ? WHERE id = ?')->execute([$slug, $id]);
            }
            foreach ($langs as $lang) {
                $name = trim((string) ($_POST['name'][$lang] ?? ''));
                if (Sql::isPgsql($this->pdo)) {
                    $this->pdo->prepare('INSERT INTO category_translations (category_id, lang, name) VALUES (?, ?, ?) ON CONFLICT (category_id, lang) DO UPDATE SET name = EXCLUDED.name')->execute([$id, $lang, $name]);
                } else {
                    $this->pdo->prepare('INSERT INTO category_translations (category_id, lang, name) VALUES (?, ?, ?) ON CONFLICT(category_id, lang) DO UPDATE SET name = excluded.name')->execute([$id, $lang, $name]);
                }
            }
            Response::redirect('/secad/categories/edit?id=' . $id . '&saved=1');
        }

        if ($route === 'categories/edit' || $route === 'categories/new') {
            $id = (int) ($_GET['id'] ?? 0);
            $slug = '';
            $names = [];
            $productCount = 0;
            if ($id) {
                $stmt = $this->pdo->prepare('SELECT slug FROM categories WHERE id = ?');
                $stmt->execute([$id]);
                $slug = (string) $stmt->fetchColumn();
                $tr = $this->pdo->prepare('SELECT lang, name FROM category_translations WHERE category_id = ?');
                $tr->execute([$id]);
                foreach ($tr->fetchAll() as $row) {
                    $names[$row['lang']] = $row['name'];
                }
                $c = $this->pdo->prepare('SELECT COUNT(*) FROM product_categories WHERE category_id = ?');
                $c->execute([$id]);
                $productCount = (int) $c->fetchColumn();
            }
            $html = '<h1>' . ($id ? 'Kateqoriya' : 'Yeni kateqoriya') . '</h1>';
            if (isset($_GET['err']) && $_GET['err'] === 'products') {
                $html .= '<p class="err">Bu kateqoriyada ' . $productCount . ' məhsul var. Əvvəlcə onları başqa kateqoriyaya keçirin.</p>';
            }
            $html .= '<form method="post" class="card dirty">';
            $html .= '<input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"><input type="hidden" name="action" value="save">';
            $html .= '<label>Slug<input name="slug" value="' . $this->e($slug) . '"></label>';
            foreach ($langs as $lang) {
                $html .= '<label>Ad (' . $this->e($lang) . ')<input name="name[' . $this->e($lang) . ']" value="' . $this->e((string) ($names[$lang] ?? '')) . '"></label>';
            }
            $html .= '<button type="submit">Yadda saxla</button></form>';
            if ($id && $productCount > 0) {
                $others = $this->pdo->prepare('SELECT c.id, ct.name FROM categories c LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.lang = \'az\' WHERE c.id <> ?');
                $others->execute([$id]);
                $html .= '<form method="post" class="card" onsubmit="return confirm(\'Məhsullar köçürülüb kateqoriya silinsin?\')"><h2>Məhsulları köçür və sil</h2>';
                $html .= '<input type="hidden" name="action" value="move"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '">';
                $html .= '<label>Hədəf kateqoriya<select name="target">';
                foreach ($others->fetchAll() as $row) {
                    $html .= '<option value="' . (int) $row['id'] . '">' . $this->e((string) $row['name']) . '</option>';
                }
                $html .= '</select></label><button type="submit" class="danger">Köçür və sil</button></form>';
            } elseif ($id) {
                $html .= '<form method="post" onsubmit="return confirm(\'Kateqoriya silinsin?\')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"><button class="danger" type="submit">Sil</button></form>';
            }
            $html .= $this->dirtyScript();
            return $html;
        }

        $q = trim((string) ($_GET['q'] ?? ''));
        $stock = (string) ($_GET['stock'] ?? '');
        $where = ['1=1'];
        $params = [];
        if ($q !== '') {
            $where[] = 'ct.name LIKE ?';
            $params[] = '%' . $q . '%';
        }
        if ($stock === 'yes') {
            $where[] = 'EXISTS (SELECT 1 FROM product_categories pc WHERE pc.category_id = c.id)';
        } elseif ($stock === 'no') {
            $where[] = 'NOT EXISTS (SELECT 1 FROM product_categories pc WHERE pc.category_id = c.id)';
        }
        $sql = 'SELECT c.id, c.slug, ct.name, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) AS products FROM categories c LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.lang = \'az\' WHERE ' . implode(' AND ', $where) . ' ORDER BY c.sort_order';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $html = '<div class="page-head"><h1>Kateqoriyalar</h1><a class="btn" href="/secad/categories/new">Yeni kateqoriya</a></div>';
        $html .= '<p class="count">' . count($rows) . ' nəticə</p><form class="toolbar" method="get"><input name="q" value="' . $this->e($q) . '" placeholder="Kateqoriya adı"><select name="stock"><option value="">Məhsul</option><option value="yes"' . ($stock === 'yes' ? ' selected' : '') . '>Məhsulu olan</option><option value="no"' . ($stock === 'no' ? ' selected' : '') . '>Məhsulu olmayan</option></select><button>Axtar</button></form>';
        if (!$rows) {
            return $html . '<p class="empty">' . ($q !== '' || $stock !== '' ? 'Bu filtrlərə uyğun nəticə tapılmadı. <a href="/secad/categories">Filtrləri təmizlə</a>' : 'Hələ qeyd yoxdur.') . '</p>';
        }
        $html .= '<table class="table"><thead><tr><th>Ad</th><th>Məhsul</th><th>Əməliyyatlar</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $html .= '<tr><td>' . $this->e((string) ($row['name'] ?: $row['slug'])) . '</td><td><a href="/secad/products?category=' . (int) $row['id'] . '">' . (int) $row['products'] . '</a></td><td><a href="/secad/categories/edit?id=' . (int) $row['id'] . '">Redaktə et</a></td></tr>';
        }
        return $html . '</tbody></table>';
    }

    private function news(string $route, string $csrf, array $langs): string
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
            $this->guardCsrf();
            if (($_POST['action'] ?? '') === 'delete') {
                $this->pdo->prepare('DELETE FROM news WHERE id = ?')->execute([(int) $_POST['id']]);
                Response::redirect('/secad/news?saved=1');
            }
            $id = (int) ($_POST['id'] ?? 0);
            $slug = trim((string) ($_POST['slug'] ?? '')) ?: ('xeber-' . bin2hex(random_bytes(3)));
            $banner = null;
            if (!empty($_FILES['banner']['name'])) {
                $banner = Upload::image($_FILES['banner'], $this->config, 'news');
            }
            if ($id === 0) {
                $this->pdo->prepare('INSERT INTO news (slug, banner_path, sort_order) VALUES (?, ?, 0)')->execute([$slug, $banner]);
                $id = (int) $this->pdo->lastInsertId();
            } else {
                if ($banner) {
                    $this->pdo->prepare('UPDATE news SET slug = ?, banner_path = ? WHERE id = ?')->execute([$slug, $banner, $id]);
                } else {
                    $this->pdo->prepare('UPDATE news SET slug = ? WHERE id = ?')->execute([$slug, $id]);
                }
            }
            foreach ($langs as $lang) {
                $title = trim((string) ($_POST['title'][$lang] ?? ''));
                $subtitle = trim((string) ($_POST['subtitle'][$lang] ?? ''));
                $body = trim((string) ($_POST['body'][$lang] ?? ''));
                $blocks = $this->bodyToBlocks($body);
                $seo = trim((string) ($_POST['seo'][$lang] ?? $title));
                $meta = trim((string) ($_POST['meta'][$lang] ?? $subtitle));
                $json = json_encode($blocks, JSON_UNESCAPED_UNICODE);
                if (Sql::isPgsql($this->pdo)) {
                    $this->pdo->prepare('INSERT INTO news_translations (news_id, lang, title, subtitle, seo_title, meta_description, keywords, body_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (news_id, lang) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, seo_title = EXCLUDED.seo_title, meta_description = EXCLUDED.meta_description, body_json = EXCLUDED.body_json')
                        ->execute([$id, $lang, $title, $subtitle, $seo, $meta, '', $json]);
                } else {
                    $this->pdo->prepare('INSERT INTO news_translations (news_id, lang, title, subtitle, seo_title, meta_description, keywords, body_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(news_id, lang) DO UPDATE SET title = excluded.title, subtitle = excluded.subtitle, seo_title = excluded.seo_title, meta_description = excluded.meta_description, body_json = excluded.body_json')
                        ->execute([$id, $lang, $title, $subtitle, $seo, $meta, '', $json]);
                }
            }
            Response::redirect('/secad/news/edit?id=' . $id . '&saved=1');
        }

        if ($route === 'news/edit' || $route === 'news/new') {
            $id = (int) ($_GET['id'] ?? 0);
            $slug = '';
            $banner = '';
            $tr = [];
            if ($id) {
                $stmt = $this->pdo->prepare('SELECT slug, banner_path FROM news WHERE id = ?');
                $stmt->execute([$id]);
                $row = $stmt->fetch();
                $slug = (string) ($row['slug'] ?? '');
                $banner = (string) ($row['banner_path'] ?? '');
                $rows = $this->pdo->prepare('SELECT * FROM news_translations WHERE news_id = ?');
                $rows->execute([$id]);
                foreach ($rows->fetchAll() as $item) {
                    $tr[$item['lang']] = $item;
                }
            }
            $html = '<h1>' . ($id ? 'Xəbər' : 'Yeni xəbər') . '</h1><form method="post" enctype="multipart/form-data" class="card dirty">';
            $html .= '<input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '">';
            $html .= '<label>Slug<input name="slug" value="' . $this->e($slug) . '"></label>';
            if ($banner) {
                $html .= '<img class="preview" src="' . $this->e($banner) . '" alt="">';
            }
            $html .= '<label>Üz şəkli<input type="file" name="banner" accept="image/*"></label><div class="tabs">';
            foreach ($langs as $i => $lang) {
                $html .= '<button type="button" class="tab' . ($i === 0 ? ' on' : '') . '" data-tab="' . $this->e($lang) . '">' . $this->e($lang) . '</button>';
            }
            $html .= '</div>';
            foreach ($langs as $i => $lang) {
                $item = $tr[$lang] ?? [];
                $body = $this->blocksToText(json_decode((string) ($item['body_json'] ?? '[]'), true) ?: []);
                $html .= '<div class="pane' . ($i === 0 ? ' on' : '') . '" data-pane="' . $this->e($lang) . '">';
                $html .= '<label>Başlıq<input name="title[' . $this->e($lang) . ']" value="' . $this->e((string) ($item['title'] ?? '')) . '"></label>';
                $html .= '<label>Qısa mətn<textarea name="subtitle[' . $this->e($lang) . ']" rows="2">' . $this->e((string) ($item['subtitle'] ?? '')) . '</textarea></label>';
                $html .= '<label>SEO başlıq<input name="seo[' . $this->e($lang) . ']" value="' . $this->e((string) ($item['seo_title'] ?? '')) . '"></label>';
                $html .= '<label>Meta<textarea name="meta[' . $this->e($lang) . ']" rows="2">' . $this->e((string) ($item['meta_description'] ?? '')) . '</textarea></label>';
                $html .= '<p class="hint">Mətn: boş sətir yeni abzas, ## altbaşlıq, sətir - ilə siyahı.</p>';
                $html .= '<label>Mətn<textarea name="body[' . $this->e($lang) . ']" rows="14">' . $this->e($body) . '</textarea></label></div>';
            }
            $html .= '<button type="submit">Yadda saxla</button></form>';
            if ($id) {
                $html .= '<form method="post" onsubmit="return confirm(\'Xəbər silinsin?\')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"><button class="danger" type="submit">Sil</button></form>';
            }
            return $html . $this->dirtyScript();
        }

        $q = trim((string) ($_GET['q'] ?? ''));
        $params = [];
        $where = '1=1';
        if ($q !== '') {
            $where = 'nt.title LIKE ?';
            $params[] = '%' . $q . '%';
        }
        $stmt = $this->pdo->prepare('SELECT n.id, n.slug, n.banner_path, n.sort_order, nt.title FROM news n LEFT JOIN news_translations nt ON nt.news_id = n.id AND nt.lang = \'az\' WHERE ' . $where . ' ORDER BY n.sort_order');
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $html = '<div class="page-head"><h1>Xəbərlər</h1><a class="btn" href="/secad/news/new">Yeni xəbər</a></div><p class="count">' . count($rows) . ' nəticə</p>';
        $html .= '<form class="toolbar" method="get"><input name="q" value="' . $this->e($q) . '" placeholder="Başlıq"><button>Axtar</button></form>';
        if (!$rows) {
            return $html . '<p class="empty">' . ($q !== '' ? 'Bu filtrlərə uyğun nəticə tapılmadı. <a href="/secad/news">Filtrləri təmizlə</a>' : 'Hələ qeyd yoxdur.') . '</p>';
        }
        $html .= '<table class="table"><thead><tr><th>Xəbər</th><th>Əməliyyatlar</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $title = (string) ($row['title'] ?: $row['slug']);
            $html .= '<tr><td><a class="product-cell" href="/secad/news/edit?id=' . (int) $row['id'] . '">';
            if (!empty($row['banner_path'])) {
                $html .= '<img class="thumb" src="' . $this->e((string) $row['banner_path']) . '" alt="">';
            }
            $html .= '<span><strong>' . $this->e($title) . '</strong></span></a></td><td><a href="/secad/news/edit?id=' . (int) $row['id'] . '">Redaktə et</a> <a href="/az/blog/' . $this->e((string) $row['slug']) . '" target="_blank" rel="noopener">Saytda bax</a></td></tr>';
        }
        return $html . '</tbody></table>';
    }

    private function catalogs(string $route, string $csrf, array $langs): string
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
            $this->guardCsrf();
            if (($_POST['action'] ?? '') === 'delete') {
                $this->pdo->prepare('DELETE FROM catalogs WHERE id = ?')->execute([(int) $_POST['id']]);
                Response::redirect('/secad/catalogs?saved=1');
            }
            $id = (int) ($_POST['id'] ?? 0);
            $slug = trim((string) ($_POST['slug'] ?? '')) ?: ('katalog-' . bin2hex(random_bytes(3)));
            if ($id === 0) {
                $this->pdo->prepare('INSERT INTO catalogs (slug, sort_order) VALUES (?, 0)')->execute([$slug]);
                $id = (int) $this->pdo->lastInsertId();
            } else {
                $this->pdo->prepare('UPDATE catalogs SET slug = ? WHERE id = ?')->execute([$slug, $id]);
            }
            foreach ($langs as $lang) {
                $file = null;
                $field = 'pdf_' . $lang;
                if (!empty($_FILES[$field]['name'])) {
                    $file = Upload::pdf($_FILES[$field], $this->config, 'catalogs');
                }
                $title = trim((string) ($_POST['title'][$lang] ?? ''));
                $subtitle = trim((string) ($_POST['subtitle'][$lang] ?? ''));
                $existing = $this->pdo->prepare('SELECT file_path FROM catalog_translations WHERE catalog_id = ? AND lang = ?');
                $existing->execute([$id, $lang]);
                $current = (string) ($existing->fetchColumn() ?: '');
                $path = $file ?: $current;
                if (Sql::isPgsql($this->pdo)) {
                    $this->pdo->prepare('INSERT INTO catalog_translations (catalog_id, lang, title, subtitle, file_path, language_label) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (catalog_id, lang) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, file_path = EXCLUDED.file_path')
                        ->execute([$id, $lang, $title, $subtitle, $path, 'PDF']);
                } else {
                    $this->pdo->prepare('INSERT INTO catalog_translations (catalog_id, lang, title, subtitle, file_path, language_label) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(catalog_id, lang) DO UPDATE SET title = excluded.title, subtitle = excluded.subtitle, file_path = excluded.file_path')
                        ->execute([$id, $lang, $title, $subtitle, $path, 'PDF']);
                }
            }
            Response::redirect('/secad/catalogs/edit?id=' . $id . '&saved=1');
        }

        if ($route === 'catalogs/edit' || $route === 'catalogs/new') {
            $id = (int) ($_GET['id'] ?? 0);
            $slug = '';
            $tr = [];
            if ($id) {
                $stmt = $this->pdo->prepare('SELECT slug FROM catalogs WHERE id = ?');
                $stmt->execute([$id]);
                $slug = (string) $stmt->fetchColumn();
                $rows = $this->pdo->prepare('SELECT * FROM catalog_translations WHERE catalog_id = ?');
                $rows->execute([$id]);
                foreach ($rows->fetchAll() as $row) {
                    $tr[$row['lang']] = $row;
                }
            }
            $html = '<h1>' . ($id ? 'Kataloq' : 'Yeni kataloq') . '</h1><form method="post" enctype="multipart/form-data" class="card dirty">';
            $html .= '<input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '">';
            $html .= '<label>Slug<input name="slug" value="' . $this->e($slug) . '"></label>';
            foreach ($langs as $lang) {
                $item = $tr[$lang] ?? [];
                $html .= '<h2>' . $this->e($lang) . '</h2>';
                $html .= '<label>Başlıq<input name="title[' . $this->e($lang) . ']" value="' . $this->e((string) ($item['title'] ?? '')) . '"></label>';
                $html .= '<label>Açıqlama<textarea name="subtitle[' . $this->e($lang) . ']" rows="2">' . $this->e((string) ($item['subtitle'] ?? '')) . '</textarea></label>';
                if (!empty($item['file_path'])) {
                    $html .= '<p><a href="' . $this->e((string) $item['file_path']) . '" target="_blank" rel="noopener">Cari PDF</a></p>';
                }
                $html .= '<label>PDF (' . $this->e($lang) . ')<input type="file" name="pdf_' . $this->e($lang) . '" accept="application/pdf"></label>';
            }
            $html .= '<button type="submit">Yadda saxla</button></form>';
            if ($id) {
                $html .= '<form method="post" onsubmit="return confirm(\'Kataloq silinsin?\')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="' . $id . '"><input type="hidden" name="_csrf" value="' . $this->e($csrf) . '"><button class="danger" type="submit">Sil</button></form>';
            }
            return $html . $this->dirtyScript();
        }

        $q = trim((string) ($_GET['q'] ?? ''));
        $params = [];
        $where = '1=1';
        if ($q !== '') {
            $where = 'ct.title LIKE ?';
            $params[] = '%' . $q . '%';
        }
        $stmt = $this->pdo->prepare('SELECT c.id, c.slug, ct.title, ct.file_path FROM catalogs c LEFT JOIN catalog_translations ct ON ct.catalog_id = c.id AND ct.lang = \'az\' WHERE ' . $where . ' ORDER BY c.sort_order');
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $html = '<div class="page-head"><h1>Kataloqlar</h1><a class="btn" href="/secad/catalogs/new">Yeni kataloq</a></div><p class="count">' . count($rows) . ' nəticə</p>';
        $html .= '<form class="toolbar" method="get"><input name="q" value="' . $this->e($q) . '" placeholder="Kataloq adı"><button>Axtar</button></form>';
        if (!$rows) {
            return $html . '<p class="empty">' . ($q !== '' ? 'Bu filtrlərə uyğun nəticə tapılmadı. <a href="/secad/catalogs">Filtrləri təmizlə</a>' : 'Hələ qeyd yoxdur.') . '</p>';
        }
        $html .= '<table class="table"><thead><tr><th>Ad</th><th>Fayl</th><th>Əməliyyatlar</th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $html .= '<tr><td>' . $this->e((string) ($row['title'] ?: $row['slug'])) . '</td><td>';
            if (!empty($row['file_path'])) {
                $html .= '<a href="' . $this->e((string) $row['file_path']) . '" target="_blank" rel="noopener">PDF-i aç</a>';
            }
            $html .= '</td><td><a href="/secad/catalogs/edit?id=' . (int) $row['id'] . '">Redaktə et</a></td></tr>';
        }
        return $html . '</tbody></table>';
    }

    private function bodyToBlocks(string $text): array
    {
        $blocks = [];
        $chunks = preg_split("/\n\s*\n/", trim($text)) ?: [];
        foreach ($chunks as $chunk) {
            $lines = array_values(array_filter(array_map('trim', explode("\n", $chunk)), static fn ($l) => $l !== ''));
            if (!$lines) {
                continue;
            }
            if (str_starts_with($lines[0], '## ')) {
                $blocks[] = ['type' => 'h2', 'text' => substr($lines[0], 3)];
                continue;
            }
            $allList = true;
            foreach ($lines as $line) {
                if (!str_starts_with($line, '- ')) {
                    $allList = false;
                    break;
                }
            }
            if ($allList) {
                $blocks[] = ['type' => 'ul', 'items' => array_map(static fn ($l) => substr($l, 2), $lines)];
                continue;
            }
            $blocks[] = ['type' => 'p', 'text' => implode("\n", $lines)];
        }
        return $blocks;
    }

    private function blocksToText(array $blocks): string
    {
        $parts = [];
        foreach ($blocks as $block) {
            $type = $block['type'] ?? 'p';
            if ($type === 'h2') {
                $parts[] = '## ' . ($block['text'] ?? '');
            } elseif ($type === 'ul') {
                $parts[] = implode("\n", array_map(static fn ($item) => '- ' . $item, $block['items'] ?? []));
            } else {
                $parts[] = (string) ($block['text'] ?? '');
            }
        }
        return implode("\n\n", $parts);
    }

    private function guardCsrf(): void
    {
        if (!Csrf::verify($this->config, $_POST['_csrf'] ?? null)) {
            Response::redirect('/secad/dashboard?err=csrf');
        }
    }

    private function slugify(string $name): string
    {
        $name = strtr(mb_strtolower($name), ['ə' => 'e', 'ı' => 'i', 'ö' => 'o', 'ü' => 'u', 'ş' => 's', 'ç' => 'c', 'ğ' => 'g']);
        $name = preg_replace('/[^a-z0-9]+/', '-', $name) ?? '';
        return trim($name, '-') ?: 'mehsul';
    }

    private function mediaExists(string $path): bool
    {
        if ($path === '' || !str_starts_with($path, '/media/')) {
            return false;
        }
        $file = dirname(__DIR__, 2) . '/public' . $path;
        return is_file($file);
    }

    private function catPreview(string $joined): string
    {
        $items = array_values(array_filter(explode('||', $joined)));
        if (!$items) {
            return '—';
        }
        $shown = array_slice($items, 0, 2);
        $html = $this->e(implode(', ', $shown));
        $extra = count($items) - count($shown);
        if ($extra > 0) {
            $html .= ' <span class="more" title="' . $this->e(implode(', ', $items)) . '">+' . $extra . '</span>';
        }
        return $html;
    }

    private function langDots(string $present, array $langs): string
    {
        $have = array_filter(explode(',', $present));
        $html = '';
        foreach ($langs as $lang) {
            $on = in_array($lang, $have, true) ? ' on' : '';
            $html .= '<span class="dot' . $on . '" title="' . $this->e(strtoupper($lang)) . '">' . $this->e(strtoupper($lang)) . '</span>';
        }
        return $html;
    }

    private function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private function dirtyScript(): string
    {
        return '<script>document.querySelectorAll("form.dirty").forEach(function(form){form.addEventListener("input",function(){form.dataset.dirty="1";});form.addEventListener("submit",function(){form.dataset.dirty="0";});});window.addEventListener("beforeunload",function(e){if(document.querySelector("form.dirty[data-dirty=\\"1\\"]")){e.preventDefault();e.returnValue="";}});document.querySelectorAll(".tab").forEach(function(btn){btn.addEventListener("click",function(){var lang=btn.dataset.tab;document.querySelectorAll(".tab").forEach(function(el){el.classList.toggle("on",el===btn);});document.querySelectorAll(".pane").forEach(function(el){el.classList.toggle("on",el.dataset.pane===lang);});});});</script>';
    }
}
