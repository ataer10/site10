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

/* ---------------------------- Hero slider ---------------------------- */

export type HeroSlide = {
  /** Üst etiket (mono kicker) — örn. "01 — Marka Vaadi" */
  tag: string;
  /** Büyük başlık; `accent` kelimesi çelik maviyle vurgulanır. */
  title: string;
  accent: string;
  /** Başlık sonrası kalan metin (accent'ten sonra). */
  titleTail?: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
};

/** Açılış sineması — `public/img` görselleriyle, kategori/temaya bağlı. */
export const heroSlides: HeroSlide[] = [
  {
    tag: "Endüstriyel Tesisat Tedariki",
    title: "Doğru parça,",
    accent: "net fiyat,",
    titleTail: " hızlı teklif.",
    subtitle:
      "Vana, boru, pompa ve bağlantı elemanlarında binlerce ürün — açık liste fiyatıyla, üyeliksiz.",
    image: "/img/pexels-sonny-vermeer-505472791-17728787.jpg",
    imageAlt: "Geniş endüstriyel tesisat ve boru hattı tesisi",
    cta: { label: "Kataloğu İncele", href: "/urunler" },
    secondary: { label: "Fiyat Listesi", href: "/fiyat-listesi" },
  },
  {
    tag: "Vana & Armatür",
    title: "Vanada",
    accent: "her ölçü,",
    titleTail: " her standart.",
    subtitle:
      "Küresel, kelebek, çek valf ve endüstriyel armatürler — PN16'dan yüksek basınca, orijinal ve faturalı.",
    image: "/img/pexels-88107820-10116844.jpg",
    imageAlt: "Endüstriyel turuncu vana ve hidrant kolonları",
    cta: { label: "Vanaları Gör", href: "/urunler?kategori=vana-armatur" },
    secondary: { label: "Tüm kategoriler", href: "/urunler" },
  },
  {
    tag: "Boru & Bağlantı",
    title: "Bağlantıda",
    accent: "sızdırmaz",
    titleTail: " çözüm.",
    subtitle:
      "Çelik, paslanmaz ve PPRC boru, dirsek, te ve fittings — projeye uygun her çapta eksiksiz tedarik.",
    image: "/img/pexels-sonny-29248902.jpg",
    imageAlt: "Paslanmaz çelik boru ve bağlantı parçaları",
    cta: { label: "Boru & Fittings", href: "/urunler?kategori=boru-fittings" },
    secondary: { label: "Markalar", href: "/markalar" },
  },
  {
    tag: "Resmi Teklif",
    title: "İskontolu teklif,",
    accent: "24 saatte",
    titleTail: " e-postanızda.",
    subtitle:
      "Sepetinizi oluşturun, malzeme listenizi gönderin; iskontolu resmi teklifinizi PDF olarak hızla alın.",
    image: "/img/pexels-marianna-zuzanna-498248397-16442684.jpg",
    imageAlt: "Tesisat hattında çalışan teknik ekip",
    cta: { label: "Teklif İste", href: "/teklif-iste" },
    secondary: { label: "Nasıl çalışır?", href: "/hakkimizda" },
  },
];

/** Komuta çubuğu hızlı kategori çipleri. */
export const heroChips: { label: string; slug: string }[] = [
  { label: "Vanalar", slug: "vana-armatur" },
  { label: "Borular", slug: "boru-fittings" },
  { label: "Pompalar", slug: "pompa-hidrofor" },
  { label: "Isıtma", slug: "isitma-tesisat" },
  { label: "Bağlantı", slug: "baglanti-elemanlari" },
  { label: "Ölçü & Kontrol", slug: "olcu-kontrol" },
];

/** Komuta çubuğu altı güven mikro-şeridi. */
export const heroTrust = [
  "Açık liste fiyatları",
  "Üyeliksiz teklif",
  "Orijinal & faturalı",
];

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
