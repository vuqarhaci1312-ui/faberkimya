<?php
declare(strict_types=1);

namespace Faber;

final class Upload
{
    public static function image(array $file, array $config, string $folder): ?string
    {
        return self::store($file, $config, $folder, $config['upload']['allowed_images'], ['jpg', 'jpeg', 'png', 'webp', 'gif']);
    }

    public static function pdf(array $file, array $config, string $folder): ?string
    {
        return self::store($file, $config, $folder, $config['upload']['allowed_docs'], ['pdf']);
    }

    private static function store(array $file, array $config, string $folder, array $mimes, array $exts): ?string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }
        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Fayl yüklənmədi.');
        }
        $max = (int) ($config['upload']['max_bytes'] ?? 0);
        if ($max > 0 && (int) $file['size'] > $max) {
            throw new \RuntimeException('Fayl çox böyükdür.');
        }
        $ext = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $exts, true)) {
            throw new \RuntimeException('Bu fayl növü qəbul edilmir.');
        }
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file((string) $file['tmp_name']) ?: '';
        if (!in_array($mime, $mimes, true)) {
            throw new \RuntimeException('Fayl məzmunu uyğun deyil.');
        }
        $public = rtrim((string) $config['paths']['public_media'], '/\\') . '/uploads/' . $folder;
        if (!is_dir($public)) {
            mkdir($public, 0755, true);
        }
        $name = bin2hex(random_bytes(8)) . '.' . $ext;
        $dest = $public . '/' . $name;
        if (!move_uploaded_file((string) $file['tmp_name'], $dest)) {
            throw new \RuntimeException('Fayl saxlanılmadı.');
        }
        return '/media/uploads/' . $folder . '/' . $name;
    }
}
