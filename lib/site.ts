/**
 * Merkezî site yapılandırması — firma bilgileri, navigasyon, sabitler.
 * İçerik dili Türkçe. Gerçek firma bilgileriyle güncellenecek.
 */
export const site = {
  name: "Birtek Endüstriyel",
  shortName: "Birtek",
  tagline: "Endüstriyel Tesisat Malzemeleri",
  description:
    "Endüstriyel tesisat malzemeleri tedarikçisi. Vana, fittings, pompa, boru ve bağlantı elemanlarında açık fiyatlı katalog ve hızlı teklif.",
  // .env.local: NEXT_PUBLIC_SITE_URL
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://birtek.example.com",
  email: "info@birtek.com.tr",
  phone: "+90 212 000 00 00",
  phoneHref: "tel:+902120000000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905000000000",
  address: {
    line1: "Organize Sanayi Bölgesi",
    line2: "1. Cadde No: 1",
    city: "İstanbul",
    country: "Türkiye",
  },
  workingHours: "Hafta içi 08:30 – 18:00",
} as const;

export const mainNav: { title: string; href: string }[] = [
  { title: "Ürünler", href: "/urunler" },
  { title: "Markalar", href: "/markalar" },
  { title: "Fiyat Listesi", href: "/fiyat-listesi" },
  { title: "Hakkımızda", href: "/hakkimizda" },
  { title: "İletişim", href: "/iletisim" },
];

export const VAT_RATE = 20; // KDV %
export const CURRENCY = "TRY";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
