<?php
declare(strict_types=1);

use Faber\Sql;

$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);
$cachePath = dirname(__DIR__) . '/storage/mt-cache.json';
$cache = is_file($cachePath) ? (json_decode((string) file_get_contents($cachePath), true) ?: []) : [];
$quota = false;

function stillAzerbaijani(string $text, string $lang): bool
{
    if ($text === '') {
        return true;
    }
    return $lang === 'tr' ? (bool) preg_match('/ə/ui', $text) : (bool) preg_match('/[əğıöüşç]/ui', $text);
}

function saveCache(string $path, array $cache): void
{
    file_put_contents($path, json_encode($cache, JSON_UNESCAPED_UNICODE));
}

function translateRemote(string $text, string $lang, array &$cache, string $cachePath, bool &$quota): ?string
{
    $text = trim($text);
    if ($text === '' || $quota) {
        return $text === '' ? '' : null;
    }
    $key = $lang . ':' . md5($text);
    if (isset($cache[$key])) {
        return $cache[$key];
    }
    $parts = [];
    $rest = $text;
    while ($rest !== '') {
        if (mb_strlen($rest) <= 420) {
            $parts[] = $rest;
            break;
        }
        $slice = mb_substr($rest, 0, 420);
        $cut = mb_strrpos($slice, ' ');
        if ($cut === false || $cut < 180) {
            $cut = 420;
        }
        $parts[] = mb_substr($rest, 0, $cut);
        $rest = ltrim(mb_substr($rest, $cut));
    }
    $out = '';
    foreach ($parts as $part) {
        $url = 'https://api.mymemory.translated.net/get?langpair=' . rawurlencode('az|' . $lang) . '&q=' . rawurlencode($part);
        $ctx = stream_context_create(['http' => ['timeout' => 30, 'header' => "User-Agent: FaberKimya\r\n"]]);
        $body = @file_get_contents($url, false, $ctx);
        $json = $body ? json_decode($body, true) : null;
        $translated = (string) ($json['responseData']['translatedText'] ?? '');
        if ($translated === '' || str_contains($translated, 'MYMEMORY WARNING') || (int) ($json['responseStatus'] ?? 0) !== 200) {
            $quota = true;
            saveCache($cachePath, $cache);
            return null;
        }
        $out .= ($out === '' ? '' : ' ') . $translated;
        usleep(250000);
    }
    $cache[$key] = $out;
    saveCache($cachePath, $cache);
    return $out;
}

$products = $pdo->query("SELECT p.id, az.name AS name, az.description AS description FROM products p JOIN product_translations az ON az.product_id = p.id AND az.lang = 'az'")->fetchAll();
$written = 0;
foreach (['en', 'ru', 'tr'] as $lang) {
    foreach ($products as $product) {
        if ($quota) {
            break 2;
        }
        $cur = $pdo->prepare('SELECT name, description FROM product_translations WHERE product_id = ? AND lang = ?');
        $cur->execute([(int) $product['id'], $lang]);
        $row = $cur->fetch() ?: ['name' => '', 'description' => ''];
        $name = (string) ($row['name'] ?? '');
        $desc = (string) ($row['description'] ?? '');
        $nextName = $name;
        $nextDesc = $desc;
        if (stillAzerbaijani($name, $lang)) {
            $translated = translateRemote((string) $product['name'], $lang, $cache, $cachePath, $quota);
            if ($translated === null) {
                break 2;
            }
            $nextName = $translated;
        }
        if (stillAzerbaijani($desc, $lang)) {
            $translated = translateRemote((string) $product['description'], $lang, $cache, $cachePath, $quota);
            if ($translated === null) {
                break 2;
            }
            $nextDesc = $translated;
        }
        if ($nextName === $name && $nextDesc === $desc) {
            continue;
        }
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT (product_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description')
                ->execute([(int) $product['id'], $lang, $nextName, $nextDesc]);
        } else {
            $pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, lang) DO UPDATE SET name = excluded.name, description = excluded.description')
                ->execute([(int) $product['id'], $lang, $nextName, $nextDesc]);
        }
        $written++;
        if ($written % 20 === 0) {
            echo "written {$written}\n";
        }
    }
}
saveCache($cachePath, $cache);
echo $quota ? "Stopped: translation quota reached. Rows written: {$written}.\n" : "Machine translations written: {$written}.\n";
