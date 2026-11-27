<?php
declare(strict_types=1);

namespace Faber;

final class Csrf
{
    public static function token(array $config): string
    {
        $key = $config['security']['csrf_token_key'] ?? '_csrf';
        if (empty($_SESSION[$key])) {
            $_SESSION[$key] = bin2hex(random_bytes(32));
        }
        return $_SESSION[$key];
    }

    public static function verify(array $config, ?string $token): bool
    {
        $key = $config['security']['csrf_token_key'] ?? '_csrf';
        $session = $_SESSION[$key] ?? '';
        return is_string($token) && $token !== '' && hash_equals((string) $session, $token);
    }
}