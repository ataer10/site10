import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/url";
import { getAllProductSlugs, getBrands } from "@/lib/data/catalog";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC: { path: string; priority: number; freq: Freq }[] = [
  { path: "/", priority: 1, freq: "daily" },
  { path: "/urunler", priority: 0.9, freq: "daily" },
  { path: "/markalar", priority: 0.7, freq: "weekly" },
  { path: "/kataloglar", priority: 0.6, freq: "weekly" },
  { path: "/fiyat-listesi", priority: 0.6, freq: "weekly" },
  { path: "/hakkimizda", priority: 0.5, freq: "monthly" },
  { path: "/iletisim", priority: 0.5, freq: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [slugs, brands] = await Promise.all([
    getAllProductSlugs(),
    getBrands(),
  ]);

  return [
    ...STATIC.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...brands.map((b) => ({
      url: `${SITE_URL}/markalar/${b.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as Freq,
      priority: 0.6,
    })),
    ...slugs.map((s) => ({
      url: `${SITE_URL}/urunler/${s}`,
      lastModified: now,
      changeFrequency: "weekly" as Freq,
      priority: 0.7,
    })),
  ];
}
