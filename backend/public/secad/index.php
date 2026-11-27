<?php
declare(strict_types=1);

$config = require dirname(__DIR__, 2) . '/bootstrap.php';
session_name($config['security']['session_name'] ?? 'faber_admin');
session_start();

use Faber\Auth;
use Faber\Csrf;
use Faber\Database;
use Faber\Response;
use Faber\Services\TranslationService;

$pdo = Database::connection($config);
$auth = new Auth($pdo, $config);
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
$route = 'dashboard';
if (preg_match('#/secad/?(.*)$#', $uri, $m)) {
    $route = trim($m[1], '/') ?: 'dashboard';
}
if (str_starts_with($route, 'api/')) {
    Response::json(['error' => 'not_found'], 404);
    exit;
}

function h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function layout(string $title, string $body, array $config, ?array $user, string $active): void
{
    echo '<!doctype html><html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<title>' . h($title) . ' · Faber Admin</title>';
    echo '<link rel="stylesheet" href="/secad/assets/admin.css"></head>';
    if (!$user) {
        echo '<body class="login-body">' . $body . '</body></html>';
        return;
    }
    $section = explode('/', $active)[0] ?: 'dashboard';
    echo '<body><div class="shell">';
    echo '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="admin-nav">Menyu</button>';
    echo '<aside class="side" id="admin-nav"><div class="brand">Faber Admin</div><button type="button" class="collapse" id="nav-collapse" aria-label="Menyunu yığ">‹</button><nav>';
    $menu = [
        'dashboard' => 'İdarə paneli',
        'translations' => 'Tərcümələr',
        'products' => 'Məhsullar',
        'categories' => 'Kateqoriyalar',
        'news' => 'Xəbərlər',
        'catalogs' => 'Kataloqlar',
        'forms' => 'Form müraciətləri',
        'users' => 'İstifadəçilər',
    ];
    foreach ($menu as $key => $label) {
        if ($key === 'users' && ($user['role'] ?? '') !== 'administrator') {
            continue;
        }
        if ($key === 'forms' && ($user['role'] ?? '') !== 'administrator') {
            continue;
        }
        $cls = $section === $key ? ' on' : '';
        echo '<a class="nav' . $cls . '" href="/secad/' . h($key) . '" title="' . h($label) . '" aria-label="' . h($label) . '"><span>' . h($label) . '</span></a>';
    }
    echo '</nav><div class="side-foot"><div class="user">' . h($user['username']) . '</div><div class="role">' . h($user['role']) . '</div>';
    echo '<a class="logout" href="/secad/logout">Çıxış</a></div></aside>';
    echo '<main class="main">' . $body . '</main></div>';
    echo '<script>var b=document.querySelector(".menu-toggle"),n=document.getElementById("admin-nav"),c=document.getElementById("nav-collapse");if(localStorage.getItem("faber-admin-nav")==="collapsed"){document.body.classList.add("nav-collapsed");}if(c){c.addEventListener("click",function(){var on=document.body.classList.toggle("nav-collapsed");localStorage.setItem("faber-admin-nav",on?"collapsed":"open");});}if(b&&n){b.addEventListener("click",function(){var open=document.body.classList.toggle("nav-open");b.setAttribute("aria-expanded",open?"true":"false");});document.addEventListener("keydown",function(e){if(e.key==="Escape"){document.body.classList.remove("nav-open");b.setAttribute("aria-expanded","false");}});document.addEventListener("click",function(e){if(window.innerWidth>800)return;if(!n.contains(e.target)&&e.target!==b){document.body.classList.remove("nav-open");b.setAttribute("aria-expanded","false");}});n.addEventListener("click",function(e){if(e.target.closest("a")){document.body.classList.remove("nav-open");b.setAttribute("aria-expanded","false");}});}</script>';
    echo '</body></html>';
}

if ($route === 'logout') {
    $auth->logout();
    Response::redirect('/secad/login');
}

if ($route === 'login') {
    if ($auth->user()) {
        Response::redirect('/secad/dashboard');
    }
    $error = '';
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
        if (!Csrf::verify($config, $_POST['_csrf'] ?? null)) {
            $error = 'CSRF yoxlaması uğursuz oldu.';
        } elseif ($auth->attempt(trim((string) ($_POST['username'] ?? '')), (string) ($_POST['password'] ?? ''))) {
            Response::redirect('/secad/dashboard');
        } else {
            $error = 'İstifadəçi adı və ya şifrə yanlışdır.';
        }
    }
    $csrf = Csrf::token($config);
    $body = '<div class="login"><h1>Admin girişi</h1><form method="post" class="card">';
    if ($error) {
        $body .= '<p class="err">' . h($error) . '</p>';
    }
    $body .= '<label>İstifadəçi adı<input name="username" required autocomplete="username"></label>';
    $body .= '<label>Şifrə<input type="password" name="password" required autocomplete="current-password"></label>';
    $body .= '<input type="hidden" name="_csrf" value="' . h($csrf) . '"><button type="submit">Daxil ol</button></form></div>';
    layout('Giriş', $body, $config, null, 'login');
    exit;
}

$user = $auth->user();
if (!$user) {
    Response::redirect('/secad/login');
}

$editorAllowed = ['administrator', 'editor'];
if (!in_array($user['role'], $editorAllowed, true)) {
    Response::redirect('/secad/login');
}

if ($route === 'forms' && $user['role'] !== 'administrator') {
    Response::redirect('/secad/dashboard');
}

if ($route === 'users' && $user['role'] !== 'administrator') {
    Response::redirect('/secad/dashboard');
}

if ($route === 'translations' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!Csrf::verify($config, $_POST['_csrf'] ?? null)) {
        Response::redirect('/secad/translations?err=csrf');
    }
    $svc = new TranslationService($pdo);
    $key = trim((string) ($_POST['tkey'] ?? ''));
    $group = trim((string) ($_POST['tgroup'] ?? 'general'));
    foreach ($config['app']['supported_langs'] as $lang) {
        $value = (string) ($_POST['lang'][$lang] ?? '');
        if ($value !== '') {
            $svc->upsert($key, $group, $lang, $value);
        }
    }
    Response::redirect('/secad/translations?saved=1&q=' . urlencode($key));
}

if ($route === 'users' && $user['role'] === 'administrator' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!Csrf::verify($config, $_POST['_csrf'] ?? null)) {
        Response::redirect('/secad/users?err=csrf');
    }
    $action = $_POST['action'] ?? '';
    if ($action === 'create') {
        $username = trim((string) ($_POST['username'] ?? ''));
        $role = $_POST['role'] === 'administrator' ? 'administrator' : 'editor';
        $pass = (string) ($_POST['password'] ?? '');
        if ($username && strlen($pass) >= 8) {
            $pdo->prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
                ->execute([$username, password_hash($pass, PASSWORD_DEFAULT), $role]);
        }
    }
    if ($action === 'password') {
        $uid = (int) ($_POST['user_id'] ?? 0);
        $pass = (string) ($_POST['password'] ?? '');
        if ($uid && strlen($pass) >= 8) {
            $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($pass, PASSWORD_DEFAULT), $uid]);
        }
    }
    if ($action === 'role') {
        $uid = (int) ($_POST['user_id'] ?? 0);
        $role = $_POST['role'] === 'administrator' ? 'administrator' : 'editor';
        $admins = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'administrator'")->fetchColumn();
        $target = $pdo->prepare('SELECT role FROM users WHERE id = ?');
        $target->execute([$uid]);
        $current = (string) $target->fetchColumn();
        if (!($current === 'administrator' && $role !== 'administrator' && $admins <= 1)) {
            $pdo->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $uid]);
        }
    }
    if ($action === 'delete') {
        $uid = (int) ($_POST['user_id'] ?? 0);
        $admins = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'administrator'")->fetchColumn();
        $target = $pdo->prepare('SELECT role FROM users WHERE id = ?');
        $target->execute([$uid]);
        $role = $target->fetchColumn();
        if ($uid !== $user['id'] && !($role === 'administrator' && $admins <= 1)) {
            $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$uid]);
        }
    }
    Response::redirect('/secad/users');
}

$csrf = Csrf::token($config);
$body = '';
$contentAdmin = new \Faber\ContentAdmin($pdo, $config, $user);
$managed = $contentAdmin->dispatch($route, $csrf);
if (is_string($managed)) {
    $body = $managed;
}

if ($route === 'dashboard') {
    $counts = [
        'products' => (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn(),
        'news' => (int) $pdo->query('SELECT COUNT(*) FROM news')->fetchColumn(),
        'forms' => (int) $pdo->query('SELECT COUNT(*) FROM form_submissions WHERE is_read = 0')->fetchColumn(),
    ];
    $body = '<h1>İdarə paneli</h1><div class="stats">';
    $body .= '<div class="stat"><span>Məhsul</span><strong>' . $counts['products'] . '</strong></div>';
    $body .= '<div class="stat"><span>Xəbər</span><strong>' . $counts['news'] . '</strong></div>';
    if ($user['role'] === 'administrator') {
        $body .= '<div class="stat"><span>Oxunmamış müraciət</span><strong>' . $counts['forms'] . '</strong></div>';
    }
    $body .= '</div>';
}

if ($route === 'translations') {
    $q = trim((string) ($_GET['q'] ?? ''));
    $groupFilter = trim((string) ($_GET['group'] ?? ''));
    $missingLang = trim((string) ($_GET['missing_lang'] ?? ''));
    $editKey = trim((string) ($_GET['edit'] ?? ''));
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $per = 25;
    $where = ['1=1'];
    $params = [];
    if ($q !== '') {
        $where[] = '(tk.tkey LIKE ? OR t.value LIKE ? OR taz.value LIKE ?)';
        $params[] = '%' . $q . '%';
        $params[] = '%' . $q . '%';
        $params[] = '%' . $q . '%';
    }
    if ($groupFilter !== '') {
        $where[] = 'tk.tgroup = ?';
        $params[] = $groupFilter;
    }
    if ($missingLang !== '' && in_array($missingLang, $config['app']['supported_langs'], true)) {
        $where[] = 'NOT EXISTS (SELECT 1 FROM translations miss WHERE miss.key_id = tk.id AND miss.lang = ? AND miss.value <> \'\')';
        $params[] = $missingLang;
    }
    $whereSql = implode(' AND ', $where);
    $countSql = 'SELECT COUNT(DISTINCT tk.id) FROM translation_keys tk LEFT JOIN translations t ON t.key_id = tk.id LEFT JOIN translations taz ON taz.key_id = tk.id AND taz.lang = \'az\' WHERE ' . $whereSql;
    $count = $pdo->prepare($countSql);
    $count->execute($params);
    $total = (int) $count->fetchColumn();
    $pages = max(1, (int) ceil($total / $per));
    $list = $pdo->prepare('SELECT tk.id, tk.tkey, tk.tgroup, taz.value AS az FROM translation_keys tk LEFT JOIN translations t ON t.key_id = tk.id LEFT JOIN translations taz ON taz.key_id = tk.id AND taz.lang = \'az\' WHERE ' . $whereSql . ' GROUP BY tk.id ORDER BY taz.value LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per));
    $list->execute($params);
    $rows = $list->fetchAll();
    $usage = translationUsage($config['paths']['project_root'] . '/src');
    $places = [
        'Home.tsx' => ['Ana səhifə', '/az/'],
        'About.tsx' => ['Haqqımızda', '/az/sirket'],
        'Catalog.tsx' => ['Məhsullar', '/az/mehsullar'],
        'Product.tsx' => ['Məhsul detalları', '/az/mehsullar'],
        'Contact.tsx' => ['Əlaqə', '/az/elaqe'],
        'Catalogs.tsx' => ['Kataloqlar', '/az/kataloqlar'],
        'NewsDetail.tsx' => ['Xəbər', '/az/'],
        'Header.tsx' => ['Bütün səhifələr → Başlıq', '/az/'],
        'Footer.tsx' => ['Bütün səhifələr → Alt menyu', '/az/'],
        'CategoryExplorer.tsx' => ['Ana səhifə → Kateqoriyalar', '/az/'],
        'MobileTabBar.tsx' => ['Mobil menyu', '/az/'],
        'Feedback.tsx' => ['Əks əlaqə', '/az/ekse-elaqe'],
        'Search.tsx' => ['Axtarış', '/az/axtaris'],
    ];
    $body = '<div class="page-head"><h1>Tərcümələr</h1></div><p class="count">' . $total . ' nəticə</p>';
    $body .= '<form class="toolbar" method="get"><input name="q" value="' . h($q) . '" placeholder="Cümlə və ya açar">';
    $body .= '<input name="group" value="' . h($groupFilter) . '" placeholder="Bölmə">';
    $body .= '<select name="missing_lang"><option value="">Dil çatışmır</option>';
    foreach ($config['app']['supported_langs'] as $lang) {
        $body .= '<option value="' . h($lang) . '"' . ($missingLang === $lang ? ' selected' : '') . '>' . h(strtoupper($lang)) . '</option>';
    }
    $body .= '</select><button>Axtar</button></form>';
    if ($q !== '' || $groupFilter !== '' || $missingLang !== '') {
        $body .= '<p class="chips"><a href="/secad/translations">Filtrləri təmizlə</a></p>';
    }
    if ($editKey) {
        $stmt = $pdo->prepare('SELECT tk.tkey, tk.tgroup, t.lang, t.value FROM translation_keys tk LEFT JOIN translations t ON t.key_id = tk.id WHERE tk.tkey = ?');
        $stmt->execute([$editKey]);
        $byLang = [];
        $group = 'general';
        foreach ($stmt->fetchAll() as $row) {
            $group = $row['tgroup'];
            if ($row['lang']) {
                $byLang[$row['lang']] = $row['value'];
            }
        }
        $whereUsed = usageLabel($usage[$editKey] ?? [], $places);
        $body .= '<form method="post" class="card edit"><p class="hint">' . $whereUsed . '</p><p class="keyline">' . h($editKey) . '</p>';
        $body .= '<input type="hidden" name="tkey" value="' . h($editKey) . '"><input type="hidden" name="tgroup" value="' . h($group) . '">';
        $body .= '<div class="lang-grid">';
        foreach ($config['app']['supported_langs'] as $lang) {
            $body .= '<label>' . h(strtoupper($lang)) . '<textarea name="lang[' . h($lang) . ']" rows="6">' . h($byLang[$lang] ?? '') . '</textarea></label>';
        }
        $body .= '</div><input type="hidden" name="_csrf" value="' . h($csrf) . '"><button type="submit">Dəyişiklikləri saxla</button></form>';
    }
    if (!$rows) {
        $body .= '<p class="empty">' . ($q !== '' || $groupFilter !== '' || $missingLang !== '' ? 'Bu filtrlərə uyğun nəticə tapılmadı.' : 'Hələ qeyd yoxdur.') . '</p>';
    } else {
        $body .= '<table class="table"><thead><tr><th>Mətn</th><th>Yer</th><th>Dillər</th><th></th></tr></thead><tbody>';
        foreach ($rows as $row) {
            $langsStmt = $pdo->prepare('SELECT lang, value FROM translations WHERE key_id = ?');
            $langsStmt->execute([(int) $row['id']]);
            $filled = [];
            foreach ($langsStmt->fetchAll() as $item) {
                if (trim((string) $item['value']) !== '') {
                    $filled[] = $item['lang'];
                }
            }
            $az = trim((string) ($row['az'] ?? ''));
            $preview = $az !== '' ? $az : 'AZ mətni boşdur';
            $used = usageLabel($usage[$row['tkey']] ?? [], $places);
            $keep = $_GET;
            unset($keep['edit']);
            $editHref = '/secad/translations?' . http_build_query($keep + ['edit' => $row['tkey']]);
            $body .= '<tr><td><strong>' . h(mb_strimwidth($preview, 0, 140, '…')) . '</strong><small class="keyline">' . h($row['tkey']) . '</small></td>';
            $body .= '<td>' . $used . '</td><td>' . h(implode(' ', array_map('strtoupper', $filled))) . '</td>';
            $body .= '<td><a href="' . h($editHref) . '">Redaktə et</a></td></tr>';
        }
        $from = ($page - 1) * $per + 1;
        $to = min($total, $page * $per);
        $qs = $_GET;
        unset($qs['page'], $qs['edit']);
        $base = '/secad/translations?' . http_build_query($qs);
        $body .= '</tbody></table><p class="pager">' . $from . '–' . $to . ' / ' . $total;
        if ($page > 1) {
            $body .= ' <a href="' . h($base . '&page=' . ($page - 1)) . '">Əvvəlki</a>';
        }
        if ($page < $pages) {
            $body .= ' <a href="' . h($base . '&page=' . ($page + 1)) . '">Növbəti</a>';
        }
        $body .= '</p>';
    }
}

if ($body === '' && $route === 'products') {
    $q = trim((string) ($_GET['q'] ?? ''));
    $sql = 'SELECT p.id, p.slug, p.article, pt.name FROM products p LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.lang = "az"';
    $params = [];
    if ($q) {
        $sql .= ' WHERE p.slug LIKE ? OR pt.name LIKE ?';
        $params = ['%' . $q . '%', '%' . $q . '%'];
    }
    $sql .= ' ORDER BY pt.name LIMIT 100';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $body = '<h1>Məhsullar</h1><form class="toolbar" method="get"><input name="q" value="' . h($q) . '" placeholder="Slug və ya ad"><button>Axtar</button></form>';
    $body .= '<table class="table"><thead><tr><th>Ad</th><th>Slug</th><th>Artikul</th></tr></thead><tbody>';
    foreach ($stmt->fetchAll() as $row) {
        $body .= '<tr><td>' . h($row['name'] ?? '') . '</td><td>' . h($row['slug']) . '</td><td>' . h((string) $row['article']) . '</td></tr>';
    }
    $body .= '</tbody></table><p class="hint">Tam CRUD UI — API və fayl yükləmə endpointləri növbəti iterasiyada genişləndirilə bilər; hazırda import və DB əsaslı idarəetmə aktivdir.</p>';
}

if ($body === '' && $route === 'categories') {
    $stmt = $pdo->query('SELECT c.slug, ct.name FROM categories c LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.lang = "az" ORDER BY c.sort_order');
    $body = '<h1>Kateqoriyalar</h1><table class="table"><thead><tr><th>Ad</th><th>Slug</th></tr></thead><tbody>';
    foreach ($stmt->fetchAll() as $row) {
        $body .= '<tr><td>' . h($row['name'] ?? $row['slug']) . '</td><td>' . h($row['slug']) . '</td></tr>';
    }
    $body .= '</tbody></table>';
}

if ($body === '' && $route === 'news') {
    $stmt = $pdo->query('SELECT n.slug, nt.title FROM news n LEFT JOIN news_translations nt ON nt.news_id = n.id AND nt.lang = "az" ORDER BY n.sort_order');
    $body = '<h1>Xəbərlər</h1><table class="table"><thead><tr><th>Başlıq</th><th>Slug</th></tr></thead><tbody>';
    foreach ($stmt->fetchAll() as $row) {
        $body .= '<tr><td>' . h($row['title'] ?? '') . '</td><td>' . h($row['slug']) . '</td></tr>';
    }
    $body .= '</tbody></table>';
}

if ($body === '' && $route === 'catalogs') {
    $stmt = $pdo->query('SELECT c.slug, ct.title, ct.file_path FROM catalogs c LEFT JOIN catalog_translations ct ON ct.catalog_id = c.id AND ct.lang = "az" ORDER BY c.sort_order');
    $body = '<h1>Kataloqlar</h1><table class="table"><thead><tr><th>Başlıq</th><th>PDF</th></tr></thead><tbody>';
    foreach ($stmt->fetchAll() as $row) {
        $body .= '<tr><td>' . h($row['title'] ?? $row['slug']) . '</td><td><a href="' . h($row['file_path']) . '" target="_blank" rel="noopener">' . h($row['file_path']) . '</a></td></tr>';
    }
    $body .= '</tbody></table>';
}

if ($route === 'forms' && $user['role'] === 'administrator') {
    if (isset($_GET['read'])) {
        $pdo->prepare('UPDATE form_submissions SET is_read = 1 WHERE id = ?')->execute([(int) $_GET['read']]);
        Response::redirect('/secad/forms');
    }
    $fq = trim((string) ($_GET['q'] ?? ''));
    $read = (string) ($_GET['status'] ?? '');
    $where = ['1=1'];
    $params = [];
    if ($fq !== '') {
        $where[] = '(form_key LIKE ? OR payload_json LIKE ?)';
        $params[] = '%' . $fq . '%';
        $params[] = '%' . $fq . '%';
    }
    if ($read === 'new') {
        $where[] = 'is_read = 0';
    } elseif ($read === 'read') {
        $where[] = 'is_read = 1';
    }
    $stmt = $pdo->prepare('SELECT id, form_key, lang, page, payload_json, is_read, created_at FROM form_submissions WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $body = '<div class="page-head"><h1>Form müraciətləri</h1></div><p class="count">' . count($rows) . ' nəticə</p>';
    $body .= '<form class="toolbar" method="get"><input name="q" value="' . h($fq) . '" placeholder="Forma və ya mətn"><select name="status"><option value="">Hamısı</option><option value="new"' . ($read === 'new' ? ' selected' : '') . '>Oxunmamış</option><option value="read"' . ($read === 'read' ? ' selected' : '') . '>Oxunmuş</option></select><button>Axtar</button></form>';
    $body .= '<table class="table"><thead><tr><th>Forma</th><th>Tarix</th><th>Vəziyyət</th><th>Mətn</th></tr></thead><tbody>';
    foreach ($rows as $row) {
        $payload = json_decode((string) $row['payload_json'], true) ?: [];
        $snippet = (string) ($payload['message'] ?? $payload['name'] ?? '');
        $body .= '<tr><td>' . h($row['form_key']) . '<br>' . h((string) ($payload['name'] ?? '')) . ' ' . h((string) ($payload['email'] ?? $payload['phone'] ?? '')) . '</td>';
        $body .= '<td>' . h($row['created_at']) . '</td><td>' . ($row['is_read'] ? 'Oxunub' : '<a href="/secad/forms?read=' . (int) $row['id'] . '">Oxunmamış</a>') . '</td>';
        $body .= '<td><details><summary>' . h(mb_strimwidth($snippet, 0, 80, '…')) . '</summary><dl>';
        foreach ($payload as $key => $value) {
            if (is_scalar($value)) {
                $body .= '<dt>' . h((string) $key) . '</dt><dd>' . h((string) $value) . '</dd>';
            }
        }
        $body .= '</dl></details></td></tr>';
    }
    $body .= '</tbody></table>';
}

if ($route === 'users' && $user['role'] === 'administrator') {
    $uq = trim((string) ($_GET['q'] ?? ''));
    $urole = trim((string) ($_GET['role'] ?? ''));
    $where = ['1=1'];
    $params = [];
    if ($uq !== '') {
        $where[] = 'username LIKE ?';
        $params[] = '%' . $uq . '%';
    }
    if ($urole === 'administrator' || $urole === 'editor') {
        $where[] = 'role = ?';
        $params[] = $urole;
    }
    $stmt = $pdo->prepare('SELECT id, username, role FROM users WHERE ' . implode(' AND ', $where) . ' ORDER BY username');
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    $body = '<div class="page-head"><h1>İstifadəçilər</h1><a class="btn" href="/secad/users?new=1">Yeni istifadəçi</a></div>';
    $body .= '<p class="count">' . count($users) . ' nəticə</p><form class="toolbar" method="get"><input name="q" value="' . h($uq) . '" placeholder="İstifadəçi adı"><select name="role"><option value="">Rol</option><option value="administrator"' . ($urole === 'administrator' ? ' selected' : '') . '>Administrator</option><option value="editor"' . ($urole === 'editor' ? ' selected' : '') . '>Redaktor</option></select><button>Axtar</button></form>';
    if (isset($_GET['new'])) {
        $body .= '<form method="post" class="card"><h2>Yeni istifadəçi</h2>';
        $body .= '<label>İstifadəçi adı<input name="username" required></label>';
        $body .= '<label>Şifrə<input type="password" name="password" required minlength="8"></label>';
        $body .= '<label>Rol<select name="role"><option value="editor">Redaktor</option><option value="administrator">Administrator</option></select></label>';
        $body .= '<input type="hidden" name="action" value="create"><input type="hidden" name="_csrf" value="' . h($csrf) . '"><button type="submit">İstifadəçini yarat</button></form>';
    }
    if (!$users) {
        $body .= '<p class="empty">Bu filtrlərə uyğun nəticə tapılmadı.</p>';
    } else {
        $body .= '<table class="table"><thead><tr><th>İstifadəçi</th><th>Rol</th><th>Əməliyyatlar</th></tr></thead><tbody>';
        foreach ($users as $u) {
            $body .= '<tr><td>' . h($u['username']) . '</td><td>' . h($u['role']) . '</td><td class="ops">';
            $body .= '<details><summary>Rolu dəyiş</summary><form method="post" class="inline"><input type="hidden" name="action" value="role"><input type="hidden" name="user_id" value="' . (int) $u['id'] . '">';
            $body .= '<select name="role"><option value="editor"' . ($u['role'] === 'editor' ? ' selected' : '') . '>Redaktor</option><option value="administrator"' . ($u['role'] === 'administrator' ? ' selected' : '') . '>Administrator</option></select>';
            $body .= '<input type="hidden" name="_csrf" value="' . h($csrf) . '"><button type="submit">Rolu saxla</button></form></details>';
            $body .= '<details><summary>Şifrəni dəyiş</summary><form method="post" class="inline"><input type="hidden" name="action" value="password"><input type="hidden" name="user_id" value="' . (int) $u['id'] . '">';
            $body .= '<input type="password" name="password" placeholder="Yeni şifrə" minlength="8" required><input type="hidden" name="_csrf" value="' . h($csrf) . '"><button type="submit">Şifrəni saxla</button></form></details>';
            if ((int) $u['id'] !== $user['id']) {
                $body .= '<form method="post" onsubmit="return confirm(\'İstifadəçi silinsin: ' . h($u['username']) . '?\')"><input type="hidden" name="action" value="delete"><input type="hidden" name="user_id" value="' . (int) $u['id'] . '"><input type="hidden" name="_csrf" value="' . h($csrf) . '"><button class="danger" type="submit">İstifadəçini sil</button></form>';
            }
            $body .= '</td></tr>';
        }
        $body .= '</tbody></table>';
    }
}

function translationUsage(string $src): array
{
    $map = [];
    if (!is_dir($src)) {
        return $map;
    }
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($src));
    foreach ($it as $file) {
        if (!$file->isFile() || !preg_match('/\.(tsx|ts)$/', $file->getFilename())) {
            continue;
        }
        $text = file_get_contents($file->getPathname());
        if (!is_string($text) || !preg_match_all('/(?:"|\')((?:about|hero|form|cat|feature|nav|catalog|catalogs|news|product|contact|search|notfound|feedback|brand|common)\.[a-z0-9_]+)(?:"|\')/', $text, $matches)) {
            continue;
        }
        foreach ($matches[1] as $key) {
            $map[$key][] = $file->getFilename();
        }
    }
    return $map;
}

function usageLabel(array $files, array $places): string
{
    if (!$files) {
        return 'İstifadə yeri tapılmadı';
    }
    $labels = [];
    $link = '';
    foreach (array_unique($files) as $file) {
        if (isset($places[$file])) {
            $labels[] = $places[$file][0];
            $link = $places[$file][1];
        } else {
            $labels[] = $file;
        }
    }
    $html = htmlspecialchars(implode('; ', $labels), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    if ($link !== '') {
        $html .= ' <a href="' . htmlspecialchars($link, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '" target="_blank" rel="noopener">Saytda aç</a>';
    }
    return $html;
}

if ($body === '') {
    $body = '<h1>Səhifə tapılmadı</h1>';
}

layout('Admin', $body, $config, $user, $route);