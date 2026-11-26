import { ekolojiTemizBlocks } from "./news/ekolojiTemiz";
import { professionalHygieneBlocks } from "./news/professionalHygiene";
import { publicHygieneBlocks } from "./news/publicHygiene";
import { safeCleaningBlocks } from "./news/safeCleaning";
import type { HomeNewsItem } from "./newsTypes";

export type { HomeNewsItem, NewsBlock } from "./newsTypes";

export const homeNewsItems: HomeNewsItem[] = [
  {
    id: "safe-cleaning",
    slug: "temizlik-vasitelerinin-duzgun-secilmesi",
    title: "Təmizlik vasitələrinin düzgün seçilməsi və təhlükəsiz istifadəsi",
    subtitle: "Səthə uyğun məhsul seçin və istifadə qaydalarına əməl edin.",
    seoTitle: "Təmizlik vasitələrinin seçilməsi və istifadə qaydaları",
    metaDescription:
      "Təmizlik vasitələrini necə düzgün seçmək olar? Peşəkar təmizlik məhsullarının təhlükəsiz istifadəsi, dozalanması və saxlanması qaydalarını öyrənin.",
    keywords:
      "Təmizlik vasitələri, kimyəvi təmizlik məhsulları, peşəkar təmizlik məhsulları, təhlükəsiz təmizlik, sənaye təmizlik vasitələri",
    banner: "/media/news/safe-cleaning-choices.png",
    bannerWidth: 1672,
    bannerHeight: 941,
    to: "/blog/temizlik-vasitelerinin-duzgun-secilmesi",
    blocks: safeCleaningBlocks,
  },
  {
    id: "professional-hygiene",
    slug: "pesekar-temizlik-ve-gigiyena",
    title: "Peşəkar təmizlik və gigiyenanın insan sağlamlığında rolu",
    subtitle: "Təmiz və gigiyenik mühit sağlam həyat üçün vacibdir.",
    seoTitle: "Peşəkar təmizlik və gigiyenanın sağlamlıqda rolu",
    metaDescription:
      "Peşəkar təmizlik və gigiyenanın insan sağlamlığına təsiri, effektiv təmizlik üsulları və təhlükəsiz mühitin yaradılması haqqında məlumat əldə edin.",
    keywords:
      "Peşəkar təmizlik, gigiyena, təmizlik vasitələri, dezinfeksiya, sənaye təmizliyi, sağlam mühit",
    banner: "/media/news/neon-temizlik-gigiyena.png",
    bannerWidth: 1672,
    bannerHeight: 941,
    to: "/blog/pesekar-temizlik-ve-gigiyena",
    blocks: professionalHygieneBlocks,
  },
  {
    id: "ekoloji-temiz",
    slug: "ekoloji-temizlik-ve-dayaniqli-gigiyena",
    title: "Ekoloji təmiz məhsullar və dayanıqlı gigiyena həlləri",
    subtitle: "Bioparçalanan tərkib və ekoloji tarazlıq üçün təmiz formulalar.",
    seoTitle: "Ekoloji təmiz məhsullar və dayanıqlı gigiyena",
    metaDescription:
      "Ekoloji təmizlik məhsullarının üstünlükləri, dayanıqlı gigiyena həlləri və ətraf mühitə təsiri azaldan müasir təmizlik üsulları ilə tanış olun.",
    keywords:
      "Ekoloji təmizlik məhsulları, dayanıqlı gigiyena, ekoloji təmiz vasitələr, ətraf mühit, yaşıl təmizlik, bioloji parçalana bilən məhsullar",
    banner: "/media/news/ekoloji-temiz-gigiyena.png",
    bannerWidth: 1655,
    bannerHeight: 950,
    to: "/blog/ekoloji-temizlik-ve-dayaniqli-gigiyena",
    blocks: ekolojiTemizBlocks,
  },
  {
    id: "public-hygiene",
    slug: "ictimai-mekanlarda-gigiyena-standartlari",
    title: "İctimai məkanlarda gigiyena standartlarının qorunmasının əhəmiyyəti",
    subtitle:
      "İctimai iaşə, ofis və istirahət zonalarında standartlara riayət müştəri sağlamlığı və etibar üçün vacibdir.",
    seoTitle: "İctimai məkanlarda gigiyena və təmizlik standartları",
    metaDescription:
      "Otel, restoran, ofis və digər ictimai məkanlarda gigiyena standartlarının qorunması, peşəkar təmizlik və dezinfeksiya üsullarını öyrənin.",
    keywords:
      "Gigiyena standartları, ictimai məkanlarda təmizlik, restoran gigiyenası, otel təmizliyi, qida gigiyenası, peşəkar dezinfeksiya",
    banner: "/media/news/public-hygiene-standards.png",
    bannerWidth: 1654,
    bannerHeight: 951,
    to: "/blog/ictimai-mekanlarda-gigiyena-standartlari",
    blocks: publicHygieneBlocks,
  },
];

export function getHomeNewsItemBySlug(slug: string) {
  return homeNewsItems.find((item) => item.slug === slug);
}

/** @deprecated slug istifadə edin */
export function getHomeNewsItem(id: string) {
  return homeNewsItems.find((item) => item.id === id || item.slug === id);
}