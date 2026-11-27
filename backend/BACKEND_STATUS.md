# Backend və admin panel — status

## Hazır olanlar

- MySQL/MariaDB sxem (`backend/database/schema.sql`)
- PDO qatı, sessiya, CSRF, giriş cəhdi limiti, `password_hash`
- REST API: `/api/v1/bootstrap`, `translations`, `products`, `news`, `catalogs`, `forms/{key}`
- Admin `/secad`: giriş, tərcümələr (4 dil eyni formda), siyahılar (məhsul, kateqoriya, xəbər, kataloq), form müraciətləri, istifadəçilər (administrator)
- Import: `faber-i18n.csv`, `site.json`, xəbərlər (TS blok parse), 3 PDF kataloq
- Frontend: `/:lang/...` marşrutlar, i18n provider (API-dən tərcümə), əks əlaqə forması API-yə bağlı
- Hestia `.htaccess` nümunəsi və `HESETUP.md`

## Admin CRUD

Məhsul, kateqoriya, xəbər və kataloq üçün yarat / redaktə / sil, şəkil və PDF yükləmə, dil sahələri `/secad` daxilindədir. Verilənlər bazası PostgreSQL (prod) və ya SQLite (lokal).

## Lokal yoxlama

```bash
# Terminal 1
php -S 127.0.0.1:8080 -t backend/public backend/public/router.php

# Terminal 2
cp backend/config/config.example.php backend/config/config.local.php
# sqlite üçün driver=sqlite

php backend/scripts/migrate.php
php backend/scripts/import.php
php backend/scripts/create-admin.php admin SizinGucluSifreniz

npm run dev
```

Yoxlama nəticələri (lokal):

| Ssenari | Status |
|---------|--------|
| /secad login | PHP server lazımdır — Hestia-da təsdiqlənməlidir |
| Tərcümə dəyişikliyi → API | Kod hazırdır, DB + import sonrası işlək |
| Məhsul CRUD UI admin | DB import + siyahı; tam redaktə UI hissəvi |
| Form müraciəti | `feedback` POST hazırdır |
| Dil prefiksli URL | `/az/...` React marşrutları aktiv |

Serverdə yalnız real Hestia mühitində təsdiqlənə bilən addımlar: `.htaccess`, PHP-FPM `FABER_CONFIG`, MariaDB host, 36MB upload limiti.