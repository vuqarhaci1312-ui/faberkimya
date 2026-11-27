# Faberkimya — Hestia + PHP + PostgreSQL

## Tələblər

- PHP 8.2+ (pdo_pgsql, sessions, fileinfo, mbstring)
- PostgreSQL 14+
- Node.js yalnız build üçün (`npm run build`). Serverdə daimi Node prosesi lazım deyil.

## Qovluqlar

```
/home/USER/web/DOMAIN/
  private/config.local.php     ← vebdən kənar
  backend/                     ← bu repodakı backend/
  public_html/                 ← npm run build nəticəsi + media + .htaccess
```

## Addımlar

1. `npm ci && npm run build`
2. `dist/*` və `public/media` məzmununu `public_html/`-ə kopyalayın (`public_html/media/uploads` yazıla bilən olsun).
3. `backend/` qovluğunu `public_html`-dən kənarda saxlayın.
4. `deploy/public_html.htaccess` faylını `public_html/.htaccess` edin. Rewrite-də backend yolu serverdəki real yola uyğun olmalıdır (məsələn `../backend/public/api/index.php`).
5. `backend/config/config.example.php`-ni `private/config.local.php` kimi kopyalayın:
   - `db.driver` = `pgsql`
   - host, port `5432`, db adı, user, password
   - `paths.public_media` = `public_html/media` mütləq yolu
6. PHP-FPM pool və ya Apache: `SetEnv FABER_CONFIG /home/USER/private/config.local.php`
7. `php backend/scripts/migrate.php`
8. `php backend/scripts/import.php` (təkrar işlədikdə `import_runs` sayəsində admin dəyişikliklərini əzmir)
9. `php backend/scripts/create-admin.php USERNAME STRONG_PASSWORD` (ən azı 8 simvol; şifrə repoya yazılmır)
10. `public/media/uploads/.htaccess` PHP icrasını bağlayır. Qovluq icazəsi `0755`, sahibi veb istifadəçisi.

## URL

| Ünvan | Məna |
|--------|------|
| `/az/` `/ru/` `/tr/` `/en/` | İctimai sayt |
| `/api/v1/bootstrap?lang=az` | Tərcümələr |
| `/secad` | Admin (sessiyasız istifadəçi login görür) |

Köhnə ünvanlar (`/mehsullar`, `/blog/...`) `.htaccess` ilə `/az/...` ünvanına 301 olur.

## Yoxlama (lokal SQLite, 2026-11-27)

| Ssenari | Nəticə |
|---------|--------|
| Miqrasiya + CSV/məhsul/xəbər/kataloq importu | Uğurlu (sqlite) |
| PHP sintaksis (admin, import) | Uğurlu |
| TypeScript (`tsc --noEmit`) | Uğurlu olmalıdır (son yoxlama) |
| `/secad` brauzer girişi | Lokal PHP server ilə yoxlanmalıdır; Hestia-da ayrıca təsdiq |
| Tərcümə dəyişikliyi buildsiz | API `bootstrap` DB-dən oxuyur, keş yoxdur |
| Məhsul CRUD UI | `/secad/products/new` və redaktə forması |
| Form POST | `POST /api/v1/forms/contact` |
| Redaktorun `/secad/users` | Rol yoxlaması ilə dashboard-a yönləndirilir |
| Dil prefiksi | React `/:lang` marşrutları |

## Yalnız real Hestia serverində təsdiqlənən

- PostgreSQL host və `FABER_CONFIG`
- SSL, `/secad` refresh, `.htaccess` yolu
- `upload_max_filesize` / `post_max_size` (ən azı 50M, RINDO PDF ~36MB)
- PHP `pdo_pgsql` genişlənməsi
