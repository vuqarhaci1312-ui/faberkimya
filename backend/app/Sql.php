<?php
declare(strict_types=1);

namespace Faber;

use PDO;

final class Sql
{
    public static function driver(PDO $pdo): string
    {
        return (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    }

    public static function isPgsql(PDO $pdo): bool
    {
        return self::driver($pdo) === 'pgsql';
    }

    public static function upsertKey(PDO $pdo, string $key, string $group): int
    {
        if (self::isPgsql($pdo)) {
            $pdo->prepare(
                'INSERT INTO translation_keys (tkey, tgroup) VALUES (?, ?)
                 ON CONFLICT (tkey) DO UPDATE SET tgroup = EXCLUDED.tgroup',
            )->execute([$key, $group]);
        } else {
            $pdo->prepare('INSERT INTO translation_keys (tkey, tgroup) VALUES (?, ?) ON CONFLICT(tkey) DO UPDATE SET tgroup = excluded.tgroup')->execute([$key, $group]);
        }
        $stmt = $pdo->prepare('SELECT id FROM translation_keys WHERE tkey = ?');
        $stmt->execute([$key]);
        return (int) $stmt->fetchColumn();
    }

    public static function upsertTranslation(PDO $pdo, string $key, string $group, string $lang, string $value): void
    {
        $id = self::upsertKey($pdo, $key, $group);
        if (self::isPgsql($pdo)) {
            $pdo->prepare(
                'INSERT INTO translations (key_id, lang, value) VALUES (?, ?, ?)
                 ON CONFLICT (key_id, lang) DO UPDATE SET value = EXCLUDED.value',
            )->execute([$id, $lang, $value]);
            return;
        }
        $pdo->prepare(
            'INSERT INTO translations (key_id, lang, value) VALUES (?, ?, ?)
             ON CONFLICT(key_id, lang) DO UPDATE SET value = excluded.value',
        )->execute([$id, $lang, $value]);
    }
}
