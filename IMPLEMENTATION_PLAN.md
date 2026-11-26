# Vikan dizaynı + Faberkimya kontenti — icra planı

Prinsiplər: **DESIGN = Vikan**, **CONTENT = Faberkimya**, **IMPLEMENTATION = React + TypeScript + Vite**, **pixel-perfect hədəf**, **səssiz buraxılış yoxdur**, **olmayan məlumat uydurulmur**.

Bu fayl təsdiqlənmiş planın iş nüsxəsidir. Tamamlanmış mərhələ yenidən icra olunmur.

## Mərhələ statusu

- [x] M0 — Plan faylı və checkpoint
- [x] M1 — Vikan reverse engineering (`research/vikan`)
- [x] M2 — Faberkimya tam inventar (214 məhsul)
- [x] M3 — Kontent xəritəsi (`research/content-map.json`)
- [x] M4 — Tətbiq skeleti, build təmiz
- [x] M5 — Chrome
- [x] M6 — Ana səhifə, yalnız map olunmuş kontent
- [x] M7 — Kataloq, axtarış, məhsul
- [x] M8 — Haqqında, əlaqə, kataloqlar, 404
- [x] M9 — 8 en Playwright-də
- [x] M10 — Funksional testlər keçib; piksel-diff blocker kimi hesabatdadır
- [x] M11 — MIGRATION_REPORT.md
- [ ] Tam qəbul: açıq blocker-lər səbəbindən layihə bitmiş elan olunmur

## Artıq ölçülmüş faktlar

HTTP/HTML/sitemap (2026-11-25). Computed CSS və screenshot M1-də bağlanır.

### Vikan (dizayn)

- Next.js App Router. Bu mühitdə logo linki `/int`.
- Header: Products, Industries, Knowledge, Support, Sustainability, About us, Where To Buy, Search, dil, əlaqə ikonu, My Vikan, mobil menyu.
- Ana səhifə: 1 header, 1 main, 13 section, 1 footer.
- Section sırası: hero, Built to perform, Food safety insights, Solutions that work, Support that delivers, Trusted by professionals worldwide, Insights, Knowledge Centre, Blog, Webinars, Training, Technical Collaboration and Awards, Case Stories, Stay Up-to-Date, Book a Meeting, Where to Buy, footer.
- Şrift: Inter (rəsmi OFL). Vikan woff faylları kopyalanmır.
- CSS parçasında breakpoint-lər: 640, 768, 840, 1024, 1280, 1366, 1400, 1500, 1792, 1920, 2440, 2560.
- Rəng nümunələri (tam palitra deyil): `#0057b8`, `#012f6c`, `#ffdd19`, `#e21f1d`, `#eb4f96`, `#037736`, `#00a6da`, `#eb540f`, `#6b675a`, `#21378c`, `#ecf5fe`, `#b8d1ea`, `#e0f0fb`, `#899fa1`, `#d0e3f6`.
- Sitemap: 24666 URL, 12 lokal. US ağacı ~2028 URL. Şablonlar: products, knowledge-center, industries, about, support, sustainability, contact, search, featured, legal, account.
- Vikan məhsul bazası, loqosu, Perfion şəkilləri və hesab/diler backend-i köçürülmür.

### Faberkimya (kontent)

- Shop2/Megagroup. Görünən mətn Azərbaycan dilindədir. `Az` və `Ru` eyni hosta gedir.
- Səhifələr: `/`, `/shrkt-haqnda`, `/elaqeler`, `/kataloqlar`, `/bize-yazin`, folder və product.
- Birinci keçid: 214 unikal məhsul URL (aşağı sərhəd; tam say M2).
- Qiymət rəqəmi, e-poçt və küçə ünvanı həmin keçiddə təsdiqlənməyib. Tapılmasa yazılmır.
- Telefonlar: (012) 441-69-02, (055) 266-60-10. Facebook: https://www.facebook.com/faberkimya.az
- Kataloq PDF-ləri faberkimya.com.tr üzərindədir; lokal endirilir.
- Shop2 səbət/müqayisə/bir klik backend-i bizdə yoxdur. Saxta uğur göstərilmir.

## Kontent xəritəsi

- Loqo: Faber `logo_pic.png`, Vikan loqo ölçüsündə container.
- Mega menu Products: Faber kateqoriya ağacı.
- About: `/shrkt-haqnda`.
- Əlaqə bloku: `/elaqeler`. Vikan ofisləri yox.
- Search: lokal inventar.
- Kataloqlar: lokal PDF.
- Forma: validasiya işləyir. Submit endpoint yoxdursa uğur mesajı yoxdur.
- Hero və 4 zolaq: real Faber başlıq/kateqoriya/şəkil.
- Knowledge, Blog, Webinar, Training, Awards, Case stories, Sustainability, Industries, My Vikan, newsletter, book-a-meeting: Faber korpusu tapılmayıb. Vikan mətni və uydurma məqalə yazılmır. Blocker.
- Səbət/checkout: yeni kart UI yoxdur. Blocker.
- Dil: ayrıca RU korpusu təsdiqlənməyibsə bir dilli AZ.

Faber səhifəsi Vikan-da şablonsuzdursa, mövcud Vikan layout/kart/form komponentinə oturdulur. Yeni vizual üslub yoxdur.

## Arxitektura

```
research/vikan/          tokens, DOM, interactions, screenshots
research/faberkimya/     crawl checkpoints
public/media/            logo, product images, pdf
src/data/                typed content
src/components/
src/pages/
src/styles/
tests/playwright/
CONTENT_INVENTORY.json
MIGRATION_REPORT.md
```

Stack: Vite, React, TypeScript, React Router, CSS Modules. GSAP yalnız ölçülmüş animasiya tələb edərsə. Data JSX-də hardcode olunmur. iframe yoxdur. Faber CSS köçürülmür.

## M0 — Plan faylı və checkpoint

- [ ] IMPLEMENTATION_PLAN.md yazıldı
- [ ] research/vikan/checkpoint.json
- [ ] research/faberkimya/checkpoint.json
- [ ] Eyni URL ikinci dəfə crawl olunmur

## M1 — Vikan reverse engineering

Genişliklər: 1920, 1440, 1280, 1024, 768, 430, 390, 375 və tapılmış breakpoint-lər.

Hər şablon (home, category, product, search, contact, content, 404) və element:

- [ ] Header, mega menu, dropdown, mobil menyu
- [ ] Hero, slider, section sırası
- [ ] Grid, container, məhsul kartı, kataloq, detal, qalereya
- [ ] Axtarış, filter, sort, breadcrumb
- [ ] Düymə, link, form, footer
- [ ] Scroll, hover, səhifə keçidi, loading
- [ ] DOM və computed CSS (rəng, font, size, weight, line-height, letter-spacing, width, height, margin, padding, gap, radius, shadow, aspect-ratio)
- [ ] Animasiya duration, easing, direction
- [ ] research/vikan/tokens.json
- [ ] research/vikan/components.json
- [ ] research/vikan/interactions.json
- [ ] Screenshot-lar
- [ ] Lisenziya: Vikan loqo, məhsul şəkli, ikon sprite və font faylı kopyalanmır

Görmədiyimiz komponent yaradılmır. Özbaşına rəng, ölçü, section və animasiya dəyişikliyi yoxdur.

## M2 — Faberkimya tam inventar

- [ ] Bütün məhsullar
- [ ] Kateqoriya və alt kateqoriya
- [ ] Ad, şəkil, qalereya, təsvir, texniki cədvəl, istifadə qaydası
- [ ] Kod, həcm/çəki/qablaşdırma, real qiymət
- [ ] Sertifikat, PDF
- [ ] Şirkət, tarix, xidmət, tərəfdaş, brend
- [ ] Xəbər/bloq əgər varsa
- [ ] Əlaqə, ünvan, telefon, e-poçt, sosial, dil, hüquqi
- [ ] Tapılan əlavə kontent
- [ ] Şəkillər və PDF lokal, orijinal, məhsula bağlı
- [ ] Placeholder və AI şəkil yoxdur
- [ ] Hotlink yoxdur
- [ ] Alınmayan URL `missing` massivində
- [ ] CONTENT_INVENTORY.json

## M3 — Xəritə

- [ ] Saylar inventarla bağlandı
- [ ] Sıfır korpuslu slotlar blocker
- [ ] Filter/sort yalnız ölçülən UI və mövcud data ilə
- [ ] Saxta rəng filteri və qiymət sortu yoxdur

## M4 — Skelet

- [ ] Vite + React + TypeScript + React Router
- [ ] npm run build təmiz
- [ ] tsc --noEmit təmiz
- [ ] Route-lar: /, kateqoriya, məhsul, axtarış, haqqında, əlaqə, kataloqlar, 404
- [ ] Boş link yoxdur
- [ ] Data src/data üzərindən

## M5 — Chrome

- [ ] Header
- [ ] Mega menu
- [ ] Mobil menyu
- [ ] Footer
- [ ] Breadcrumb
- [ ] Desktop və mobil açıb-bağlama
- [ ] Keyboard və route dəyişməsi

## M6 — Ana səhifə

- [ ] M1 section sırası
- [ ] Yalnız map olunmuş Faber kontenti
- [ ] Animasiya ölçülən duration/easing ilə
- [ ] Boş slot tamamlanmış işarələnmir

## M7 — Kataloq və məhsul

- [ ] Kateqoriya və alt kateqoriya
- [ ] Kart, filter, sort, axtarış
- [ ] Detal və qalereya
- [ ] Əlaqəli məhsul yalnız inventar əlaqəsi ilə
- [ ] Məhsul sayı inventarla eyni
- [ ] Şəkil container Vikan aspect-ratio və overflow

## M8 — Qalan səhifələr

- [ ] Haqqında
- [ ] Əlaqə validasiyası, saxta submit yox
- [ ] Kataloq PDF lokal
- [ ] 404
- [ ] Hüquqi səhifə yoxdursa route açılmır və raport olunur

## M9 — Responsive və hərəkət

- [ ] 1920, 1440, 1280, 1024, 768, 430, 390, 375
- [ ] Mobil bölüm silinmir
- [ ] Scroll mərhələləri və hover yoxlanır

## M10 — Vizual və funksional test

- [ ] Playwright screenshot
- [ ] Maskalı müqayisə (loqo, mətn, məhsul şəkli)
- [ ] Koordinat, ölçü, rəng, tipografiya, boşluq, section sırası
- [ ] Responsive, animasiya, menyu, şəkil container, scroll
- [ ] Console error, sınmış link, işləməyən düymə
- [ ] Vizual yoxlama keçmədən səhifə tamamlanmış sayılmır

## M11 — Hesabat

- [ ] Məhsul sayı
- [ ] Kateqoriya və alt kateqoriya sayı
- [ ] Şəkil, səhifə, sənəd, xəbər sayı
- [ ] Əlaqələrin düzgünlüyü
- [ ] Boş sahə, təkrar, əlçatmaz
- [ ] Açıq blocker varsa layihə “tam hazır” elan olunmur

## Tələb yoxlama siyahısı

- [ ] 1. Vikan görünüşü, Faber kontenti, React/TS, mənbələr qarışmır
- [ ] 2. Plan bütün maddələri saxlayır
- [ ] 3. Reverse engineering artefaktları və 8 en screenshot
- [ ] 4. Özbaşına HEX/ölçü/font/spacing/grid/radius/shadow/breakpoint/animasiya yoxdur
- [ ] 5. CONTENT_INVENTORY.json + missing
- [ ] 6. Son UI-də Vikan brendi qalmır; Faber CSS gəlmir
- [ ] 7. Media lokal və bağlıdır
- [ ] 8. Build, data-driven, iframe yox
- [ ] 9. Funksiyalar işləyir; saxta backend uğuru yoxdur
- [ ] 10. 8 en işləkdir
- [ ] 11. Playwright QA
- [ ] 12. Hesabat
- [ ] 13. Ölçülməyən xüsusiyyət blocker
- [ ] 14. Checkpoint və skript; keyfiyyət azaldılmır
- [ ] 15. Qəbul şərtləri; açıq blocker varsa “bitdi” deyilmir

## Blocker-lər

- Knowledge, Blog, Webinar, Training, Awards, Case stories, Sustainability, Industries, My Vikan, newsletter, book-a-meeting üçün Faber kontenti tapılmayıb.
- Forma göndərişi, səbət, ödəniş, captcha, hesab: backend yoxdur.
- Qiymət rəqəmi, e-poçt, küçə ünvanı, ayrıca RU korpusu, hüquqi səhifə M2-də yenidən yoxlanır.
- Pixel spec M1 bitmədən komponent kodlanmır.

## Fidelity düzəlişi — ana səhifə, Products menyusu, About

Referans: https://www.vikan.com/ . Kontent: Faberkimya. Bu blokdakı tələblər ixtisar olunmur.

- [x] F0 Tələblər bu faylda saxlanılıb
- [x] F1 Ana səhifə yenidən ölçülüb: header, hero, bütün section-lar, sıra, rəng, şrift, spacing, grid, şəkil, düymə, hover, scroll, footer, responsive
- [x] F2 Heç bir ana səhifə section-u silinməyib, birləşdirilməyib, sadələşdirilməyib
- [x] F3 Products menyusu real brauzerdə ölçülüb: açılış, bağlanış, istiqamət, duration, delay, easing, ölçü, koordinat, sütun, hover, overlay, mouse enter/leave/click, desktop və mobil
- [x] F4 Menyunun animasiyası təxmin edilməyib; ölçülmüş mərhələlər implementasiya olunub (0.3s ease, submenu 0.15s)
- [x] F5 About səhifəsi tam ölçülüb və section sırası, hero, grid, tipoqrafiya, şəkil, boşluq uyğunlaşıb
- [x] F6 Yalnız kateqoriya adı, məhsul, şirkət mətni və lokal şəkil Faber-dəndir
- [x] F7 Dizayn rəqəmləri research/vikan/fidelity ölçüsündən götürülüb
- [x] F8 Screenshot və menyu davranışı müqayisə olunub; panel 500px, açıq halda 1160px testlə təsdiqlənib
- [x] F9 Kataloq, axtarış və məhsul datası pozulmayıb (6 test keçib)
- [ ] F10 Tərəfdaş loqosu inventarda yoxdur; Trusted section qutusu boş qalır, Vikan loqosu qoyulmayıb
