<?php
declare(strict_types=1);

namespace Faber;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(array $config): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }
        $db = $config['db'];
        try {
            $driver = $db['driver'] ?? 'pgsql';
            if ($driver === 'sqlite') {
                $path = $db['sqlite_path'];
                $dir = dirname($path);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                self::$pdo = new PDO('sqlite:' . $path);
                self::$pdo->exec('PRAGMA foreign_keys = ON');
            } elseif ($driver === 'pgsql') {
                $dsn = sprintf(
                    'pgsql:host=%s;port=%d;dbname=%s',
                    $db['host'],
                    (int) ($db['port'] ?? 5432),
                    $db['name'],
                );
                self::$pdo = new PDO($dsn, $db['user'], $db['pass']);
            } else {
                $dsn = sprintf(
                    'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                    $db['host'],
                    (int) ($db['port'] ?? 3306),
                    $db['name'],
                );
                self::$pdo = new PDO($dsn, $db['user'], $db['pass']);
            }
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return self::$pdo;
        } catch (PDOException $e) {
            throw new PDOException('Database connection failed: ' . $e->getMessage(), (int) $e->getCode());
        }
    }
}