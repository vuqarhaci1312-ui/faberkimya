# Miqrasiya hesabatı

Tarix: 2026-11-25. Kontent mənbəyi `http://faberkimya.az/`. Dizayn mənbəyi `https://www.vikan.com/int` (header 100px / 80px, Inter, `#012f6c`, kart radius 8px). Layihə açıq blocker-lərlə işləkdir və tam bağlanmış sayılmır.

## Saylar

| Göstərici | Mənbə | Köçürülən |
| --- | --- | --- |
| Məhsul | 214 unikal URL (213 siyahı + `/p/1` üzrə TƏMİZLİK SƏBƏTİ) | 214 |
| Kateqoriya | 24 folder | 24 |
| Alt kateqoriya ağacı | Folder URL-lərində ayrıca parent yoxdur | 0 ayrıca node; 24 folder eyni səviyyədə saxlanılıb |
| Məhsul şəkli | 214 lokal fayl | 214, hamısı məhsula bağlı |
| Şəkilsiz məhsul | 0 | 0 |
| Təsvirsiz məhsul | 0 | 0 |
| Məhsul kodu | Shop2 “Артикул: нет” | 214 boş; uydurulmayıb |
| Qiymət | Nümunədə `0 руб.` | yazılmayıb |
| Kontent səhifəsi | haqqında, əlaqə, kataloqlar, əks əlaqə | 4 |
| PDF | 5 link | 0 fayl, hamısı HTTP 404 |
| Xəbər / məqalə | tapılmayıb | 0 |
| Hüquqi səhifə | tapılmayıb | route açılmayıb |
| Məhsul-kateqoriya əlaqəsi | hər məhsulun folder-i var | 0 məhsul kateqoriyasız |

## Əlaqə

- Telefon: (012) 441-69-02, (055) 266-60-10
- E-poçt: info@faberkimya.az (əlaqə səhifəsində)
- Facebook: https://www.facebook.com/faberkimya.az
- Küçə ünvanı mənbə mətnində təsdiqlənmədi
- `Az` və `Ru` keçidləri eyni `http://az.faberkimya.az` ünvanına gedir. Ayrı RU korpusu yoxdur

## Yoxlama

- `npm run build` keçib (`tsc --noEmit` və Vite)
- Playwright: 5 test keçib (214 məhsul, axtarış, forma saxta uğur göstərmir, 404, header 100px və 80px, 8 en)
- Vikan mətninin ana səhifədə qalmadığı testlə yoxlanıb
- Şəkillər `public/media` altındadır, hotlink yoxdur

## Açıq blocker-lər

- Knowledge, Blog, Webinar, Training, Awards, Case stories, Sustainability, Industries, My Vikan, newsletter, book-a-meeting və tərəfdaş loqoları üçün Faber kontenti yoxdur. Boş slot Vikan mətni və ya uydurma məqalə ilə doldurulmayıb.
- Forma poçt serverinə bağlanmır. Validasiya işləyir. Uğurlu göndəriş göstərilmir.
- Səbət, ödəniş, captcha və hesab Shop2 backend-inə bağlıdır. Yeni kart UI yaradılmayıb.
- 5 kataloq PDF-i 404-dir.
- Məhsul kodu və qiymət mənbədə yoxdur.
- Vikan ikon faylları kopyalanmayıb. Axtarış, telefon, ox və menyu işarələri bu layihədə çəkilib.
- Animasiya API ölçülən node-larda `transition-duration: 0s` qaytardı. Əlavə animasiya yazılmayıb.
- Tam maskalı piksel-diff Vikan fotoları ilə üst-üstə düşmür, çünki şəkil və mətn qəsdən Faber-dəndir. Statik chrome ölçülmüş tokenlərə bağlanıb.

Bu blocker-lər açıq qaldığı üçün layihə tam hazır elan edilmir.
