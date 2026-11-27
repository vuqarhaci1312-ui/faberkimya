<?php
declare(strict_types=1);

namespace Faber\Services;

use PDO;

final class TranslationService
{
    public function __construct(private readonly PDO $pdo) {}

    public function allForLang(string $lang): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT tk.tkey, COALESCE(t.value, "") AS value
             FROM translation_keys tk
             LEFT JOIN translations t ON t.key_id = tk.id AND t.lang = ?
             ORDER BY tk.tkey',
        );
        $stmt->execute([$lang]);
        $map = [];
        foreach ($stmt->fetchAll() as $row) {
            $value = $row['value'] !== '' ? $row['value'] : $this->fallback($row['tkey'], $lang);
            $map[$row['tkey']] = $value === $row['tkey'] ? '' : $value;
        }
        return $map;
    }

    private function fallback(string $key, string $lang): string
    {
        $stmt = $this->pdo->prepare(
            'SELECT t.value FROM translations t
             INNER JOIN translation_keys tk ON tk.id = t.key_id
             WHERE tk.tkey = ? AND t.lang = ? LIMIT 1',
        );
        $stmt->execute([$key, 'az']);
        $row = $stmt->fetch();
        return $row['value'] ?? '';
    }

    public function upsert(string $key, string $group, string $lang, string $value): void
    {
        \Faber\Sql::upsertTranslation($this->pdo, $key, $group, $lang, $value);
    }

    public function search(?string $q, ?string $group, ?string $lang, int $limit = 100, int $offset = 0): array
    {
        $where = ['1=1'];
        $params = [];
        if ($q) {
            $where[] = '(tk.tkey LIKE ? OR t.value LIKE ?)';
            $params[] = '%' . $q . '%';
            $params[] = '%' . $q . '%';
        }
        if ($group) {
            $where[] = 'tk.tgroup = ?';
            $params[] = $group;
        }
        if ($lang) {
            $where[] = 't.lang = ?';
            $params[] = $lang;
        }
        $sql = 'SELECT tk.tkey, tk.tgroup, t.lang, t.value FROM translation_keys tk
                LEFT JOIN translations t ON t.key_id = tk.id
                WHERE ' . implode(' AND ', $where) . '
                ORDER BY tk.tkey LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}