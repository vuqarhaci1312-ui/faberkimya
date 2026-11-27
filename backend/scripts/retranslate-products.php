<?php
declare(strict_types=1);

use Faber\Sql;

$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);
$cachePath = dirname(__DIR__) . '/storage/mt-cache.json';
$cache = is_file($cachePath) ? (json_decode((string) file_get_contents($cachePath), true) ?: []) : [];
$stopped = false;

function saveCache(string $path, array $cache): void
{
    file_put_contents($path, json_encode($cache, JSON_UNESCAPED_UNICODE));
}

function needsRewrite(string $current, string $source, string $lang): bool
{
    if ($current === '' || $current === $source) {
        return $current === '' || (bool) preg_match('/[əğıöüşç]/ui', $source);
    }
    if (preg_match('/kbeyaz|whiteard|MəhWater|Водаlun|белыйard|kitchend|foamlən|əlaand|bıçwhite/ui', $current)) {
        return true;
    }
    if ($lang === 'tr') {
        return (bool) preg_match('/ə|\b(məhsul|təmizlə|edir|üçün|ilə|hissə|çökünt|ləkə|parlaql)/ui', $current);
    }
    return (bool) preg_match('/[əğıöüşçı]/ui', $current);
}

function translateFull(string $text, string $lang, array &$cache, string $cachePath, bool &$stopped): ?string
{
    $text = trim($text);
    if ($text === '') {
        return '';
    }
    $key = 'g:' . $lang . ':' . md5($text);
    if (isset($cache[$key]) && is_string($cache[$key]) && $cache[$key] !== '') {
        return $cache[$key];
    }
    $url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=az&tl=' . $lang . '&q=' . rawurlencode($text);
    $translated = null;
    for ($try = 0; $try < 5; $try++) {
        $ctx = stream_context_create(['http' => [
            'timeout' => 30,
            'header' => "User-Agent: Mozilla/5.0\r\n",
        ]]);
        $body = @file_get_contents($url, false, $ctx);
        $status = 0;
        foreach ($http_response_header ?? [] as $header) {
            if (preg_match('/HTTP\/\S+\s+(\d+)/', $header, $m)) {
                $status = (int) $m[1];
            }
        }
        if ($status === 429 || $body === false) {
            usleep(1500000 * ($try + 1));
            continue;
        }
        $json = json_decode((string) $body, true);
        if (is_string($json)) {
            $translated = $json;
        } elseif (is_array($json) && isset($json[0]) && is_string($json[0])) {
            $translated = $json[0];
        }
        if ($translated !== null && $translated !== '' && !str_contains($translated, 'Too Many Requests')) {
            break;
        }
        $translated = null;
        usleep(800000 * ($try + 1));
    }
    if ($translated === null) {
        $stopped = true;
        saveCache($cachePath, $cache);
        return null;
    }
    $cache[$key] = $translated;
    saveCache($cachePath, $cache);
    usleep(180000);
    return $translated;
}

$products = $pdo->query("SELECT p.id, az.name AS name, az.description AS description FROM products p JOIN product_translations az ON az.product_id = p.id AND az.lang = 'az'")->fetchAll();
$written = 0;
foreach (['en', 'ru', 'tr'] as $lang) {
    foreach ($products as $product) {
        if ($stopped) {
            break 2;
        }
        $cur = $pdo->prepare('SELECT name, description FROM product_translations WHERE product_id = ? AND lang = ?');
        $cur->execute([(int) $product['id'], $lang]);
        $row = $cur->fetch() ?: ['name' => '', 'description' => ''];
        $name = (string) ($row['name'] ?? '');
        $desc = (string) ($row['description'] ?? '');
        $nextName = $name;
        $nextDesc = $desc;
        if (needsRewrite($name, (string) $product['name'], $lang)) {
            $translated = translateFull((string) $product['name'], $lang, $cache, $cachePath, $stopped);
            if ($translated === null) {
                break 2;
            }
            $nextName = $translated;
        }
        if (needsRewrite($desc, (string) $product['description'], $lang)) {
            $translated = translateFull((string) $product['description'], $lang, $cache, $cachePath, $stopped);
            if ($translated === null) {
                break 2;
            }
            $nextDesc = $translated;
        }
        if ($nextName === $name && $nextDesc === $desc) {
            continue;
        }
        $sql = Sql::isPgsql($pdo)
            ? 'INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT (product_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description'
            : 'INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, lang) DO UPDATE SET name = excluded.name, description = excluded.description';
        $pdo->prepare($sql)->execute([(int) $product['id'], $lang, $nextName, $nextDesc]);
        $written++;
        if ($written % 25 === 0) {
            echo "written {$written}\n";
        }
    }
}
saveCache($cachePath, $cache);
echo $stopped ? "Stopped before the service accepted the next text. Rows written: {$written}.\n" : "Full translations written: {$written}.\n";
