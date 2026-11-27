<?php
/**
 * Copy to config.local.php outside the public web root on Hestia.
 * Do not commit real passwords.
 */
return [
    'app' => [
        'name' => 'Faberkimya',
        'base_url' => 'https://example.com',
        'default_lang' => 'az',
        'supported_langs' => ['az', 'ru', 'tr', 'en'],
        'timezone' => 'Asia/Baku',
        'debug' => false,
    ],
    'db' => [
        'driver' => 'pgsql',
        'host' => '127.0.0.1',
        'port' => 5432,
        'name' => 'faberkimya',
        'user' => 'faberkimya',
        'pass' => 'change-me',
        'sqlite_path' => __DIR__ . '/../storage/database.sqlite',
    ],
    'paths' => [
        'project_root' => dirname(__DIR__, 2),
        'storage' => dirname(__DIR__) . '/storage',
        'uploads' => dirname(__DIR__) . '/storage/uploads',
        'logs' => dirname(__DIR__) . '/storage/logs',
        'public_media' => dirname(__DIR__, 2) . '/public/media',
    ],
    'security' => [
        'session_name' => 'faber_admin',
        'csrf_token_key' => '_csrf',
        'login_max_attempts' => 8,
        'login_lock_minutes' => 15,
    ],
    'upload' => [
        'max_bytes' => 50 * 1024 * 1024,
        'allowed_images' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        'allowed_docs' => ['application/pdf'],
    ],
];
