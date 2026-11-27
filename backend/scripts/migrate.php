<?php
declare(strict_types=1);

$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);
$driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
$file = $driver === 'sqlite'
    ? dirname(__DIR__) . '/database/schema.sqlite.sql'
    : dirname(__DIR__) . '/database/schema.pgsql.sql';
if (!is_file($file)) {
    fwrite(STDERR, "Schema not found: $file\n");
    exit(1);
}
$pdo->exec((string) file_get_contents($file));
echo "Migration complete ($driver).\n";
