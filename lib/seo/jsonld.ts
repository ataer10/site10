/**
 * Tip-güvenli JSON-LD üreticileri (schema.org). server-only YOK.
 * Sayfalar getSettings()/veri katmanından beslenen değerleri geçer.
 */
import { absoluteUrl, SITE_URL } from "@/lib/seo/url";
import type { SiteSettings } from "@/lib/site";

type Json = Record<string, unknown>;

/** Organization + LocalBusiness (kök). İletişim/adres getSettings()'ten. */
export function organizationJsonLd(s: SiteSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: s.name,
    alternateName: s.shortName,
    url: SITE_URL || undefined,
    logo: absoluteUrl("/img/logo.png"),
    image: absoluteUrl("/img/logo.png"),
    description: s.description,
    email: s.email,
    telephone: s.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${s.address.line1}, ${s.address.line2}`,
      addressLocality: s.address.city,
      addressCountry: "TR",
    },
    areaServed: "TR",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: s.phone,
      email: s.email,
      contactType: "sales",
      availableLanguage: ["Turkish"],
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "18:00",
    },
  };
}

/** WebSite + site içi arama (SearchAction → /urunler?arama=). */
export function websiteJsonLd(s: SiteSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL || undefined,
    name: s.name,
    inLanguage: "tr-TR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/urunler?arama={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList — items: { name, path } (Anasayfa otomatik eklenmez; çağıran ekler). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export type ProductLd = {
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  brandName: string | null;
  listPrice: number;
  currency: string;
};

/** Product + Offer (fiyat teklif bazlı → liste fiyatı + InStock, dürüst). */
export function productJsonLd(p: ProductLd): Json {
  const url = absoluteUrl(`/urunler/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku ?? undefined,
    description: p.description ?? `${p.name} — ${p.brandName ?? "endüstriyel tesisat"} ürünü.`,
    image: p.imageUrl ? absoluteUrl(p.imageUrl) : absoluteUrl("/img/logo.png"),
    url,
    brand: p.brandName
      ? { "@type": "Brand", name: p.brandName }
      : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: p.currency || "TRY",
      price: p.listPrice.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

/** FAQPage — anasayfa SSS bölümü (görünür içerikle birebir aynı olmalı). */
export function faqJsonLd(items: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/** ItemList — ürün/marka listelerinde (opsiyonel). */
export function itemListJsonLd(
  items: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}
