/**
 * Site yapılandırması.
 * Firma bilgileri artık admin panelden (site_settings tablosu) düzenlenebilir;
 * burada VARSAYILAN değerler tutulur (DB yok/anahtarsızken fallback).
 * Dinamik değerler için: lib/data/settings.ts → getSettings().
 */

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  address: { line1: string; line2: string; city: string; country: string };
  workingHours: string;
};

export const defaultSettings: SiteSettings = {
  name: "Birtek Endüstriyel",
  shortName: "Birtek",
  tagline: "Endüstriyel Tesisat Malzemeleri",
  description:
    "Endüstriyel tesisat malzemeleri tedarikçisi. Vana, fittings, pompa, boru ve bağlantı elemanlarında açık fiyatlı katalog ve hızlı teklif.",
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
};

/** Geriye dönük uyumluluk: statik fallback olarak kullanılan yerler. */
export const site = defaultSettings;

export const mainNav: { title: string; href: string }[] = [
  { title: "Ürünler", href: "/urunler" },
  { title: "Markalar", href: "/markalar" },
  { title: "Kataloglar", href: "/kataloglar" },
  { title: "Fiyat Listesi", href: "/fiyat-listesi" },
  { title: "Hakkımızda", href: "/hakkimizda" },
  { title: "İletişim", href: "/iletisim" },
];

export const VAT_RATE = 20; // KDV %
export const CURRENCY = "TRY";

/** Telefon metninden tel: linki üretir. */
export function toPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** wa.me linki — whatsapp numarası dinamik geçilir. */
export function whatsappLink(whatsapp: string, message?: string): string {
  const base = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
