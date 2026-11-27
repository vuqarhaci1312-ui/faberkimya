<?php
declare(strict_types=1);

$root = dirname(__DIR__);
$configFile = getenv('FABER_CONFIG') ?: '';
if ($configFile === '' || !is_file($configFile)) {
    $local = __DIR__ . '/config/config.local.php';
    $example = __DIR__ . '/config/config.example.php';
    $configFile = is_file($local) ? $local : $example;
}
if (!is_file($configFile)) {
    throw new RuntimeException('Config file missing. Copy backend/config/config.example.php to config.local.php');
}

/** @var array $config */
$config = require $configFile;
date_default_timezone_set($config['app']['timezone'] ?? 'Asia/Baku');

spl_autoload_register(static function (string $class): void {
    $prefix = 'Faber\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
    $file = __DIR__ . '/app/' . $relative . '.php';
    if (is_file($file)) {
        require $file;
    }
});

foreach (['storage', 'uploads', 'logs'] as $key) {
    $dir = $config['paths'][$key] ?? null;
    if (is_string($dir) && $dir !== '' && !is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

return $config;
