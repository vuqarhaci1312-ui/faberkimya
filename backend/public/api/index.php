<?php
declare(strict_types=1);

$config = require dirname(__DIR__, 2) . '/bootstrap.php';

use Faber\Database;
use Faber\Response;
use Faber\Services\PublicContentService;
use Faber\Services\TranslationService;

header('X-Content-Type-Options: nosniff');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = $_SERVER['PATH_INFO'] ?? '';
if ($path === '' || $path === '/') {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    $path = preg_replace('#^.*/api(?:/v1)?#', '', $uri) ?: '/';
}

$pdo = Database::connection($config);
$translations = new TranslationService($pdo);
$content = new PublicContentService($pdo);
$supported = $config['app']['supported_langs'] ?? ['az', 'ru', 'tr', 'en'];
$defaultLang = $config['app']['default_lang'] ?? 'az';

$lang = $_GET['lang'] ?? $defaultLang;
if (!in_array($lang, $supported, true)) {
    $lang = $defaultLang;
}

try {
    if ($method === 'GET' && $path === '/bootstrap') {
        Response::json([
            'lang' => $lang,
            'languages' => $supported,
            'defaultLang' => $defaultLang,
            'translations' => $translations->allForLang($lang),
            'categories' => $content->categories($lang),
            'company' => $content->company(),
            'csrf' => null,
        ]);
        exit;
    }

    if ($method === 'GET' && $path === '/translations') {
        Response::json(['lang' => $lang, 'items' => $translations->allForLang($lang)]);
        exit;
    }

    if ($method === 'GET' && $path === '/categories') {
        Response::json(['lang' => $lang, 'items' => $content->categories($lang)]);
        exit;
    }

    if ($method === 'GET' && $path === '/products') {
        $category = $_GET['category'] ?? null;
        $q = $_GET['q'] ?? null;
        $sort = ($_GET['sort'] ?? 'name-asc') === 'name-desc' ? 'name-desc' : 'name-asc';
        Response::json([
            'lang' => $lang,
            'items' => $content->products($lang, $category, $q, $sort),
        ]);
        exit;
    }

    if ($method === 'GET' && preg_match('#^/products/([^/]+)$#', $path, $m)) {
        $item = $content->product(urldecode($m[1]), $lang);
        if (!$item) {
            Response::json(['error' => 'not_found'], 404);
            exit;
        }
        Response::json(['lang' => $lang, 'item' => $item]);
        exit;
    }

    if ($method === 'GET' && $path === '/news') {
        Response::json(['lang' => $lang, 'items' => $content->newsList($lang)]);
        exit;
    }

    if ($method === 'GET' && preg_match('#^/news/([^/]+)$#', $path, $m)) {
        $item = $content->news(urldecode($m[1]), $lang);
        if (!$item) {
            Response::json(['error' => 'not_found'], 404);
            exit;
        }
        Response::json(['lang' => $lang, 'item' => $item]);
        exit;
    }

    if ($method === 'GET' && $path === '/catalogs') {
        Response::json(['lang' => $lang, 'items' => $content->catalogs($lang)]);
        exit;
    }

    if ($method === 'POST' && preg_match('#^/forms/([a-z0-9_-]+)$#', $path, $m)) {
        $formKey = $m[1];
        $raw = file_get_contents('php://input') ?: '';
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            $data = $_POST;
        }
        $idempotency = $data['idempotency_key'] ?? ($_SERVER['HTTP_X_IDEMPOTENCY_KEY'] ?? null);
        if ($idempotency) {
            $exists = $pdo->prepare('SELECT id FROM form_submissions WHERE idempotency_key = ? LIMIT 1');
            $exists->execute([$idempotency]);
            if ($exists->fetch()) {
                Response::json(['ok' => true, 'duplicate' => true]);
                exit;
            }
        }
        $page = isset($data['page']) ? (string) $data['page'] : null;
        unset($data['idempotency_key'], $data['page']);
        $stmt = $pdo->prepare(
            'INSERT INTO form_submissions (form_key, page, lang, payload_json, idempotency_key) VALUES (?, ?, ?, ?, ?)',
        );
        $stmt->execute([$formKey, $page, $lang, json_encode($data, JSON_UNESCAPED_UNICODE), $idempotency]);
        Response::json(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);
        exit;
    }

    Response::json(['error' => 'not_found'], 404);
} catch (Throwable $e) {
    Response::json(['error' => 'server_error', 'message' => $config['app']['debug'] ?? false ? $e->getMessage() : 'Xəta'], 500);
}