<?php
declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '/';
if (str_starts_with($uri, '/media/')) {
    $file = dirname(__DIR__, 2) . '/public' . $uri;
    if (is_file($file)) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $types = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif', 'svg' => 'image/svg+xml', 'pdf' => 'application/pdf'];
        header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
        readfile($file);
        return true;
    }
}
if (str_starts_with($uri, '/api')) {
    $_SERVER['PATH_INFO'] = preg_replace('#^/api(?:/v1)?#', '', $uri) ?: '/';
    require __DIR__ . '/api/index.php';
    return true;
}
$asset = __DIR__ . $uri;
if (str_starts_with($uri, '/secad/assets/') && is_file($asset)) {
    return false;
}
if (str_starts_with($uri, '/secad')) {
    require __DIR__ . '/secad/index.php';
    return true;
}
return false;