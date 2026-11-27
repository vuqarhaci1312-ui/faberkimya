<?php
declare(strict_types=1);

if ($argc < 3) {
    fwrite(STDERR, "Usage: php create-admin.php <username> <password>\n");
    exit(1);
}
$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);
$username = $argv[1];
$password = $argv[2];
if (strlen($password) < 8) {
    fwrite(STDERR, "Password must be at least 8 characters.\n");
    exit(1);
}
$hash = password_hash($password, PASSWORD_DEFAULT);
$exists = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$exists->execute([$username]);
if ($exists->fetchColumn()) {
    $pdo->prepare('UPDATE users SET password_hash = ?, role = ? WHERE username = ?')->execute([$hash, 'administrator', $username]);
    echo "Administrator updated: {$username}\n";
    exit(0);
}
$pdo->prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')->execute([$username, $hash, 'administrator']);
echo "Administrator created: {$username}\n";