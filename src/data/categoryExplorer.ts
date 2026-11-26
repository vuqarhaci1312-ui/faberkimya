export type CategoryExplorerItem = {
  slug: string;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
};

/** İki sıralı kateqoriya paneli — şəkillər orijinal PNG, `/public/media/category-lines/`. */
export const categoryExplorerItems: CategoryExplorerItem[] = [
  {
    slug: "mtbx-gigiyenas",
    title: "Mətbəx gigiyenası",
    image: "/media/category-lines/metbex-gigiyenasi.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "camashir-gigiynasi",
    title: "Çamaşır gigiyenası",
    image: "/media/category-lines/camasir-gigiyenasi.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "tmizlik",
    title: "Təmizlik",
    image: "/media/category-lines/temizlik.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "təmizlik-avadanligi",
    title: "Təmizlik avadanlığı",
    image: "/media/category-lines/temizlik-avadanligi.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "xsi-gigiyena",
    title: "Şəxsi gigiyena",
    image: "/media/category-lines/sexsi-gigiyena.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "qida-s-nayesi-mu-ssis-l-rind-gigiyena-qaydalar",
    title: "Qida gigiyenası",
    image: "/media/category-lines/qida-gigiyenasi.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "hamam-otann-gigiyenas",
    title: "Hamam təmizliyi və gigiyenası",
    image: "/media/category-lines/hamam-gigiyenasi.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "hovuza-qulluq",
    title: "Hovuza qulluq",
    image: "/media/category-lines/hovuza-qulluq.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "dispenserlər",
    title: "Dispenserlər",
    image: "/media/category-lines/dispenserler.png",
    imageWidth: 400,
    imageHeight: 320,
  },
  {
    slug: "kagiz-məhsullari",
    title: "Kağız məhsulları",
    image: "/media/category-lines/kagiz-gigiyena-mehsullari.png",
    imageWidth: 400,
    imageHeight: 320,
  },
];