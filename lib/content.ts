/**
 * Faz 1 statik içerik — anasayfa & hakkımızda için yer tutucu veri.
 * Faz 2'de kategori/marka/ürün Supabase'den gelecek.
 */

export type HomeCategory = {
  title: string;
  slug: string;
  description: string;
  /** Lucide ikon adı (components/site/category-card içinde eşlenir) */
  icon:
    | "Gauge"
    | "Workflow"
    | "Droplets"
    | "Flame"
    | "Bolt"
    | "Wind"
    | "Filter"
    | "Ruler";
  count: string;
};

export const homeCategories: HomeCategory[] = [
  {
    title: "Vana & Armatür",
    slug: "vana-armatur",
    description: "Küresel vana, kelebek vana, çek valf ve endüstriyel armatürler.",
    icon: "Gauge",
    count: "1.240+ ürün",
  },
  {
    title: "Boru & Fittings",
    slug: "boru-fittings",
    description: "Çelik, paslanmaz ve PPRC boru, dirsek, te ve bağlantı parçaları.",
    icon: "Workflow",
    count: "2.100+ ürün",
  },
  {
    title: "Pompa & Hidrofor",
    slug: "pompa-hidrofor",
    description: "Sirkülasyon, dalgıç ve santrifüj pompalar, hidrofor sistemleri.",
    icon: "Droplets",
    count: "480+ ürün",
  },
  {
    title: "Isıtma & Tesisat",
    slug: "isitma-tesisat",
    description: "Kombi, kazan bağlantıları, kollektör ve ısıtma grubu malzemeleri.",
    icon: "Flame",
    count: "760+ ürün",
  },
  {
    title: "Bağlantı Elemanları",
    slug: "baglanti-elemanlari",
    description: "Cıvata, somun, kelepçe, conta ve sızdırmazlık ürünleri.",
    icon: "Bolt",
    count: "3.500+ ürün",
  },
  {
    title: "Ölçü & Kontrol",
    slug: "olcu-kontrol",
    description: "Manometre, termometre, basınç düşürücü ve kontrol ekipmanları.",
    icon: "Ruler",
    count: "640+ ürün",
  },
];

export type HomeBrand = { name: string; slug: string };

export const homeBrands: HomeBrand[] = [
  { name: "Grundfos", slug: "grundfos" },
  { name: "Wilo", slug: "wilo" },
  { name: "Viega", slug: "viega" },
  { name: "Geberit", slug: "geberit" },
  { name: "Festo", slug: "festo" },
  { name: "Würth", slug: "wurth" },
  { name: "Danfoss", slug: "danfoss" },
  { name: "Honeywell", slug: "honeywell" },
];

export const homeStats: { value: string; label: string }[] = [
  { value: "30+", label: "Yıllık tedarik tecrübesi" },
  { value: "9.500+", label: "Stoklu ürün çeşidi" },
  { value: "40+", label: "Yetkili marka bayiliği" },
  { value: "24 saat", label: "İçinde teklif dönüşü" },
];

export type Feature = {
  title: string;
  description: string;
  icon:
    | "ShieldCheck"
    | "Truck"
    | "FileText"
    | "Headset"
    | "Wallet"
    | "BadgeCheck";
};

export const homeFeatures: Feature[] = [
  {
    title: "Açık Liste Fiyatı",
    description:
      "Tüm katalog fiyatları herkese açık. Üye olmadan görür, sepete ekler, teklif istersiniz.",
    icon: "FileText",
  },
  {
    title: "Orijinal & Garantili",
    description:
      "Yalnızca yetkili distribütör kanalından, faturalı ve üretici garantili ürün.",
    icon: "BadgeCheck",
  },
  {
    title: "Hızlı Teklif",
    description:
      "Sepetinizi gönderin, iskontolu resmi teklifiniz 24 saat içinde PDF olarak gelsin.",
    icon: "FileText",
  },
  {
    title: "Stoktan Sevkiyat",
    description:
      "Geniş depo stoğu ve anlaşmalı kargo ile Türkiye geneline hızlı sevkiyat.",
    icon: "Truck",
  },
  {
    title: "Proje Desteği",
    description:
      "Tesisat ve mekanik projeleriniz için teknik ekipten malzeme listesi desteği.",
    icon: "Headset",
  },
  {
    title: "Cari & Vade",
    description:
      "Kurumsal müşterilere açık hesap, vadeli alım ve özel iskonto koşulları.",
    icon: "Wallet",
  },
];
