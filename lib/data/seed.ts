/**
 * KANONİK SEED VERİSİ
 * -------------------
 * Tek doğruluk kaynağı. İki yerde kullanılır:
 *  1) `lib/data/catalog.ts` — Supabase env tanımlı değilken uygulamanın
 *     çalışmaya devam etmesi için fallback veri kaynağı.
 *  2) `scripts/gen-seed-sql.ts` — `supabase/seed.sql` dosyasını üretir.
 *
 * İlişkiler slug ile kurulur (uuid'siz, taşınabilir). Supabase'de gerçek
 * satırlar uuid PK alır; uygulama yönlendirmesi slug üzerinden çalışır.
 */

export type SeedBrand = {
  name: string;
  slug: string;
  logoUrl: string | null;
  catalogPdfUrl: string | null;
  sortOrder: number;
};

export type SeedCategory = {
  name: string;
  slug: string;
  sortOrder: number;
};

export type SeedSubcategory = {
  name: string;
  slug: string;
  categorySlug: string;
  sortOrder: number;
};

export type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  brandSlug: string;
  categorySlug: string;
  subcategorySlug: string;
  listPrice: number;
  unit: string;
  vatRate: number;
  imageUrl: string | null;
  description: string;
  isActive: boolean;
};

export const seedBrands: SeedBrand[] = [
  { name: "Grundfos", slug: "grundfos", logoUrl: null, catalogPdfUrl: null, sortOrder: 1 },
  { name: "Wilo", slug: "wilo", logoUrl: null, catalogPdfUrl: null, sortOrder: 2 },
  { name: "Viega", slug: "viega", logoUrl: null, catalogPdfUrl: null, sortOrder: 3 },
  { name: "Geberit", slug: "geberit", logoUrl: null, catalogPdfUrl: null, sortOrder: 4 },
  { name: "Festo", slug: "festo", logoUrl: null, catalogPdfUrl: null, sortOrder: 5 },
  { name: "Würth", slug: "wurth", logoUrl: null, catalogPdfUrl: null, sortOrder: 6 },
  { name: "Danfoss", slug: "danfoss", logoUrl: null, catalogPdfUrl: null, sortOrder: 7 },
  { name: "Honeywell", slug: "honeywell", logoUrl: null, catalogPdfUrl: null, sortOrder: 8 },
];

export const seedCategories: SeedCategory[] = [
  { name: "Vana & Armatür", slug: "vana-armatur", sortOrder: 1 },
  { name: "Boru & Fittings", slug: "boru-fittings", sortOrder: 2 },
  { name: "Pompa & Hidrofor", slug: "pompa-hidrofor", sortOrder: 3 },
  { name: "Isıtma & Tesisat", slug: "isitma-tesisat", sortOrder: 4 },
  { name: "Bağlantı Elemanları", slug: "baglanti-elemanlari", sortOrder: 5 },
  { name: "Ölçü & Kontrol", slug: "olcu-kontrol", sortOrder: 6 },
];

export const seedSubcategories: SeedSubcategory[] = [
  // Vana & Armatür
  { name: "Küresel Vana", slug: "kuresel-vana", categorySlug: "vana-armatur", sortOrder: 1 },
  { name: "Kelebek Vana", slug: "kelebek-vana", categorySlug: "vana-armatur", sortOrder: 2 },
  { name: "Çek Valf", slug: "cek-valf", categorySlug: "vana-armatur", sortOrder: 3 },
  { name: "Pislik Tutucu", slug: "pislik-tutucu", categorySlug: "vana-armatur", sortOrder: 4 },
  // Boru & Fittings
  { name: "Çelik Boru", slug: "celik-boru", categorySlug: "boru-fittings", sortOrder: 1 },
  { name: "Paslanmaz Fittings", slug: "paslanmaz-fittings", categorySlug: "boru-fittings", sortOrder: 2 },
  { name: "PPRC Boru & Ek", slug: "pprc-boru", categorySlug: "boru-fittings", sortOrder: 3 },
  { name: "Dirsek & Te", slug: "dirsek-te", categorySlug: "boru-fittings", sortOrder: 4 },
  // Pompa & Hidrofor
  { name: "Sirkülasyon Pompası", slug: "sirkulasyon-pompasi", categorySlug: "pompa-hidrofor", sortOrder: 1 },
  { name: "Dalgıç Pompa", slug: "dalgic-pompa", categorySlug: "pompa-hidrofor", sortOrder: 2 },
  { name: "Hidrofor", slug: "hidrofor", categorySlug: "pompa-hidrofor", sortOrder: 3 },
  // Isıtma & Tesisat
  { name: "Kollektör", slug: "kollektor", categorySlug: "isitma-tesisat", sortOrder: 1 },
  { name: "Vana Grubu", slug: "vana-grubu", categorySlug: "isitma-tesisat", sortOrder: 2 },
  { name: "Genleşme Tankı", slug: "genlesme-tanki", categorySlug: "isitma-tesisat", sortOrder: 3 },
  // Bağlantı Elemanları
  { name: "Kelepçe", slug: "kelepce", categorySlug: "baglanti-elemanlari", sortOrder: 1 },
  { name: "Conta & Sızdırmazlık", slug: "conta-sizdirmazlik", categorySlug: "baglanti-elemanlari", sortOrder: 2 },
  { name: "Cıvata & Somun", slug: "civata-somun", categorySlug: "baglanti-elemanlari", sortOrder: 3 },
  // Ölçü & Kontrol
  { name: "Manometre", slug: "manometre", categorySlug: "olcu-kontrol", sortOrder: 1 },
  { name: "Termometre", slug: "termometre", categorySlug: "olcu-kontrol", sortOrder: 2 },
  { name: "Basınç Düşürücü", slug: "basinc-dusurucu", categorySlug: "olcu-kontrol", sortOrder: 3 },
];

export const seedProducts: SeedProduct[] = [
  // ---- Vana & Armatür ----
  {
    name: "Pirinç Küresel Vana DN15 PN25",
    slug: "pirinc-kuresel-vana-dn15-pn25",
    sku: "VN-KV-15-25",
    brandSlug: "wurth",
    categorySlug: "vana-armatur",
    subcategorySlug: "kuresel-vana",
    listPrice: 142.5,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Tam geçişli pirinç küresel vana, 1/2\" iç-iç dişli. PN25 basınç sınıfı, su ve hava hatları için uygun. Çelik kollu, kromajlı yüzey.",
    isActive: true,
  },
  {
    name: "Pirinç Küresel Vana DN25 PN25",
    slug: "pirinc-kuresel-vana-dn25-pn25",
    sku: "VN-KV-25-25",
    brandSlug: "wurth",
    categorySlug: "vana-armatur",
    subcategorySlug: "kuresel-vana",
    listPrice: 268.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "1\" tam geçişli pirinç küresel vana. Sıcak su ve kalorifer tesisatına uygun, PN25 basınç sınıfı.",
    isActive: true,
  },
  {
    name: "Paslanmaz Küresel Vana DN50 3 Parça",
    slug: "paslanmaz-kuresel-vana-dn50-3-parca",
    sku: "VN-PKV-50-3P",
    brandSlug: "festo",
    categorySlug: "vana-armatur",
    subcategorySlug: "kuresel-vana",
    listPrice: 1240.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "AISI 316 paslanmaz çelik 3 parçalı küresel vana, DN50. Sökülebilir gövde, endüstriyel proses hatları için.",
    isActive: true,
  },
  {
    name: "Wafer Tip Kelebek Vana DN100",
    slug: "wafer-kelebek-vana-dn100",
    sku: "VN-KB-100-W",
    brandSlug: "danfoss",
    categorySlug: "vana-armatur",
    subcategorySlug: "kelebek-vana",
    listPrice: 1980.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Wafer tip kelebek vana DN100, EPDM sızdırmazlık, döküm gövde. Kollu manuel kumanda. Soğutma ve su hatları.",
    isActive: true,
  },
  {
    name: "Wafer Tip Kelebek Vana DN150",
    slug: "wafer-kelebek-vana-dn150",
    sku: "VN-KB-150-W",
    brandSlug: "danfoss",
    categorySlug: "vana-armatur",
    subcategorySlug: "kelebek-vana",
    listPrice: 3150.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Wafer tip kelebek vana DN150, redüktörlü dişli kumanda. EPDM conta, GG25 döküm gövde.",
    isActive: true,
  },
  {
    name: "Yaylı Çek Valf DN32",
    slug: "yayli-cek-valf-dn32",
    sku: "VN-CV-32-Y",
    brandSlug: "danfoss",
    categorySlug: "vana-armatur",
    subcategorySlug: "cek-valf",
    listPrice: 410.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Pirinç gövde yaylı çek valf DN32, dişli bağlantı. Geri akışı önler, yatay/dikey montaj.",
    isActive: true,
  },
  {
    name: "Pislik Tutucu Y Tip DN40",
    slug: "pislik-tutucu-y-tip-dn40",
    sku: "VN-PT-40-Y",
    brandSlug: "honeywell",
    categorySlug: "vana-armatur",
    subcategorySlug: "pislik-tutucu",
    listPrice: 520.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Y tip pislik tutucu DN40, paslanmaz filtre eleği. Pompa ve sayaç koruması için hat üzeri montaj.",
    isActive: true,
  },

  // ---- Boru & Fittings ----
  {
    name: "Dikişli Siyah Çelik Boru DN50",
    slug: "dikisli-siyah-celik-boru-dn50",
    sku: "BR-CB-50",
    brandSlug: "wurth",
    categorySlug: "boru-fittings",
    subcategorySlug: "celik-boru",
    listPrice: 285.0,
    unit: "mt",
    vatRate: 20,
    imageUrl: null,
    description:
      "Dikişli siyah çelik boru 2\", TS EN 10255 standart. Kalorifer ve basınçlı su hatları için, 6 m boy.",
    isActive: true,
  },
  {
    name: "Dikişsiz Çelik Boru DN80 Sch40",
    slug: "dikissiz-celik-boru-dn80-sch40",
    sku: "BR-CB-80-S40",
    brandSlug: "wurth",
    categorySlug: "boru-fittings",
    subcategorySlug: "celik-boru",
    listPrice: 640.0,
    unit: "mt",
    vatRate: 20,
    imageUrl: null,
    description:
      "Dikişsiz çelik boru DN80, Schedule 40. Yüksek basınç proses ve buhar hatları için.",
    isActive: true,
  },
  {
    name: "Paslanmaz Dirsek 90° DN42",
    slug: "paslanmaz-dirsek-90-dn42",
    sku: "FT-PS-90-42",
    brandSlug: "viega",
    categorySlug: "boru-fittings",
    subcategorySlug: "paslanmaz-fittings",
    listPrice: 86.5,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "AISI 316L paslanmaz pres dirsek 90°, Ø42 mm. Press-fit sistem, içme suyu uyumlu conta.",
    isActive: true,
  },
  {
    name: "Paslanmaz Te DN28",
    slug: "paslanmaz-te-dn28",
    sku: "FT-PS-TE-28",
    brandSlug: "viega",
    categorySlug: "boru-fittings",
    subcategorySlug: "paslanmaz-fittings",
    listPrice: 74.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Paslanmaz press te Ø28 mm, eşit çıkışlı. Sanayi ve tesisat hatlarında hızlı montaj.",
    isActive: true,
  },
  {
    name: "PPRC Boru PN20 Ø32",
    slug: "pprc-boru-pn20-32",
    sku: "BR-PPRC-32-20",
    brandSlug: "geberit",
    categorySlug: "boru-fittings",
    subcategorySlug: "pprc-boru",
    listPrice: 58.0,
    unit: "mt",
    vatRate: 20,
    imageUrl: null,
    description:
      "PPRC boru PN20, Ø32 mm. Sıcak-soğuk temiz su tesisatı, füzyon kaynaklı birleşim. 4 m boy.",
    isActive: true,
  },
  {
    name: "PPRC Dirsek 90° Ø25",
    slug: "pprc-dirsek-90-25",
    sku: "FT-PPRC-90-25",
    brandSlug: "geberit",
    categorySlug: "boru-fittings",
    subcategorySlug: "dirsek-te",
    listPrice: 9.75,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "PPRC dirsek 90°, Ø25 mm. Temiz su tesisatı için füzyon kaynaklı ek parçası.",
    isActive: true,
  },
  {
    name: "Dövme Çelik Te DN25",
    slug: "dovme-celik-te-dn25",
    sku: "FT-CE-TE-25",
    brandSlug: "wurth",
    categorySlug: "boru-fittings",
    subcategorySlug: "dirsek-te",
    listPrice: 64.5,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Dövme çelik dişli te 1\", siyah. Basınçlı hatlarda dayanıklı bağlantı elemanı.",
    isActive: true,
  },

  // ---- Pompa & Hidrofor ----
  {
    name: "Frekans Kontrollü Sirkülasyon Pompası 25-60",
    slug: "sirkulasyon-pompasi-25-60",
    sku: "PMP-SR-2560",
    brandSlug: "grundfos",
    categorySlug: "pompa-hidrofor",
    subcategorySlug: "sirkulasyon-pompasi",
    listPrice: 7450.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Islak rotorlu, frekans konvertörlü sirkülasyon pompası 25/6-180. A enerji sınıfı, kalorifer tesisatı için.",
    isActive: true,
  },
  {
    name: "Dik Milli Çok Kademeli Pompa CR5-12",
    slug: "cok-kademeli-pompa-cr5-12",
    sku: "PMP-CR5-12",
    brandSlug: "grundfos",
    categorySlug: "pompa-hidrofor",
    subcategorySlug: "sirkulasyon-pompasi",
    listPrice: 18950.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Dik milli, çok kademeli santrifüj pompa CR5-12. Paslanmaz hidrolik, basınçlandırma ve transfer uygulamaları.",
    isActive: true,
  },
  {
    name: "Dalgıç Drenaj Pompası 0.75kW",
    slug: "dalgic-drenaj-pompasi-075kw",
    sku: "PMP-DLG-075",
    brandSlug: "wilo",
    categorySlug: "pompa-hidrofor",
    subcategorySlug: "dalgic-pompa",
    listPrice: 9850.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Paslanmaz gövdeli dalgıç drenaj pompası 0.75 kW, flatörlü. Pis su ve drenaj çukurları için.",
    isActive: true,
  },
  {
    name: "Paket Hidrofor 2 Pompalı 1.5kW",
    slug: "paket-hidrofor-2-pompali-15kw",
    sku: "PMP-HDR-2x15",
    brandSlug: "wilo",
    categorySlug: "pompa-hidrofor",
    subcategorySlug: "hidrofor",
    listPrice: 64200.0,
    unit: "takım",
    vatRate: 20,
    imageUrl: null,
    description:
      "İki pompalı paket hidrofor sistemi, 2x1.5 kW, kontrol panolu. Bina ve site temiz su basınçlandırma.",
    isActive: true,
  },

  // ---- Isıtma & Tesisat ----
  {
    name: "Pirinç Kollektör 4 Çıkışlı 1\"",
    slug: "pirinc-kollektor-4-cikis-1",
    sku: "IS-KOL-4-1",
    brandSlug: "viega",
    categorySlug: "isitma-tesisat",
    subcategorySlug: "kollektor",
    listPrice: 1320.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Yerden ısıtma için pirinç kollektör, 4 çıkışlı, debimetreli. 1\" ana giriş, ayar vanalı.",
    isActive: true,
  },
  {
    name: "Termostatik Vana Grubu Köşe",
    slug: "termostatik-vana-grubu-kose",
    sku: "IS-TVG-K",
    brandSlug: "danfoss",
    categorySlug: "isitma-tesisat",
    subcategorySlug: "vana-grubu",
    listPrice: 685.0,
    unit: "takım",
    vatRate: 20,
    imageUrl: null,
    description:
      "Panel radyatör için köşe termostatik vana grubu. Termostatik kafa + geri dönüş vanası dahil.",
    isActive: true,
  },
  {
    name: "Kapalı Genleşme Tankı 24 lt",
    slug: "kapali-genlesme-tanki-24lt",
    sku: "IS-GT-24",
    brandSlug: "wilo",
    categorySlug: "isitma-tesisat",
    subcategorySlug: "genlesme-tanki",
    listPrice: 1180.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Membranlı kapalı genleşme tankı 24 litre, 3 bar ön basınç. Kapalı ısıtma devreleri için.",
    isActive: true,
  },

  // ---- Bağlantı Elemanları ----
  {
    name: "Çift Vidalı Boru Kelepçesi DN50",
    slug: "cift-vidali-boru-kelepcesi-dn50",
    sku: "BG-KLP-50",
    brandSlug: "wurth",
    categorySlug: "baglanti-elemanlari",
    subcategorySlug: "kelepce",
    listPrice: 38.5,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Kauçuk takviyeli çift vidalı boru kelepçesi 2\". M8/M10 kombine somunlu, galvaniz kaplı.",
    isActive: true,
  },
  {
    name: "Klingerit Conta DN50 PN16",
    slug: "klingerit-conta-dn50-pn16",
    sku: "BG-CNT-50-16",
    brandSlug: "wurth",
    categorySlug: "baglanti-elemanlari",
    subcategorySlug: "conta-sizdirmazlik",
    listPrice: 22.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Flanş contası klingerit DN50 PN16. Yağ, su ve buhar hatlarına uygun sızdırmazlık elemanı.",
    isActive: true,
  },
  {
    name: "Paslanmaz Cıvata Somun Set M12x40",
    slug: "paslanmaz-civata-somun-m12x40",
    sku: "BG-CS-M12-40",
    brandSlug: "wurth",
    categorySlug: "baglanti-elemanlari",
    subcategorySlug: "civata-somun",
    listPrice: 14.75,
    unit: "takım",
    vatRate: 20,
    imageUrl: null,
    description:
      "A2 paslanmaz cıvata + somun + pul seti M12x40. Flanş ve kelepçe bağlantıları için.",
    isActive: true,
  },

  // ---- Ölçü & Kontrol ----
  {
    name: "Gliserinli Manometre 0-16 bar Ø63",
    slug: "gliserinli-manometre-0-16-bar-63",
    sku: "OK-MNM-16-63",
    brandSlug: "honeywell",
    categorySlug: "olcu-kontrol",
    subcategorySlug: "manometre",
    listPrice: 245.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Gliserin dolgulu manometre 0-16 bar, Ø63 mm kadran, alttan bağlantı 1/4\". Titreşimli hatlar için.",
    isActive: true,
  },
  {
    name: "Daldırma Termometre 0-120°C",
    slug: "daldirma-termometre-0-120",
    sku: "OK-TRM-120",
    brandSlug: "honeywell",
    categorySlug: "olcu-kontrol",
    subcategorySlug: "termometre",
    listPrice: 190.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Daldırma tip kadranlı termometre 0-120°C, kovanlı. Kalorifer ve sıcak su hatları sıcaklık ölçümü.",
    isActive: true,
  },
  {
    name: "Basınç Düşürücü Vana DN20",
    slug: "basinc-dusurucu-vana-dn20",
    sku: "OK-BDV-20",
    brandSlug: "honeywell",
    categorySlug: "olcu-kontrol",
    subcategorySlug: "basinc-dusurucu",
    listPrice: 1450.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Ayarlanabilir basınç düşürücü vana DN20, manometre bağlantı çıkışlı. Şebeke basıncını sabitler.",
    isActive: true,
  },
  {
    name: "Diferansiyel Basınç Anahtarı",
    slug: "diferansiyel-basinc-anahtari",
    sku: "OK-DBA-01",
    brandSlug: "danfoss",
    categorySlug: "olcu-kontrol",
    subcategorySlug: "basinc-dusurucu",
    listPrice: 2380.0,
    unit: "adet",
    vatRate: 20,
    imageUrl: null,
    description:
      "Ayarlanabilir diferansiyel basınç anahtarı, pompa ve filtre kontrolü için. IP54 koruma.",
    isActive: true,
  },
];
