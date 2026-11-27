<?php
declare(strict_types=1);

namespace Faber;

use PDO;

final class Auth
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly array $config,
    ) {}

    public function attempt(string $username, string $password): bool
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if (!$user) {
            return false;
        }
        if (!empty($user['locked_until']) && strtotime((string) $user['locked_until']) > time()) {
            return false;
        }
        if (!password_verify($password, (string) $user['password_hash'])) {
            $attempts = (int) $user['login_attempts'] + 1;
            $lockUntil = null;
            $max = (int) ($this->config['security']['login_max_attempts'] ?? 8);
            if ($attempts >= $max) {
                $minutes = (int) ($this->config['security']['login_lock_minutes'] ?? 15);
                $lockUntil = date('Y-m-d H:i:s', time() + $minutes * 60);
                $attempts = 0;
            }
            $this->pdo->prepare('UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?')
                ->execute([$attempts, $lockUntil, $user['id']]);
            return false;
        }
        $this->pdo->prepare('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?')->execute([$user['id']]);
        $_SESSION['admin_user_id'] = (int) $user['id'];
        $_SESSION['admin_role'] = (string) $user['role'];
        $_SESSION['admin_username'] = (string) $user['username'];
        return true;
    }

    public function logout(): void
    {
        unset($_SESSION['admin_user_id'], $_SESSION['admin_role'], $_SESSION['admin_username']);
    }

    public function user(): ?array
    {
        if (empty($_SESSION['admin_user_id'])) {
            return null;
        }
        return [
            'id' => (int) $_SESSION['admin_user_id'],
            'username' => (string) ($_SESSION['admin_username'] ?? ''),
            'role' => (string) ($_SESSION['admin_role'] ?? ''),
        ];
    }

    public function requireRole(array $roles): ?array
    {
        $user = $this->user();
        if (!$user || !in_array($user['role'], $roles, true)) {
            return null;
        }
        return $user;
    }

    public function isAdministrator(): bool
    {
        return ($this->user()['role'] ?? '') === 'administrator';
    }
}