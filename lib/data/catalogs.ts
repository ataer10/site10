import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { seedBrands } from "@/lib/data/seed";

export type Catalog = {
  id: string;
  title: string;
  brandName: string | null;
  brandSlug: string | null;
  pdfUrl: string | null;
  coverUrl: string | null;
  year: string | null;
  description: string | null;
  sortOrder: number;
};

const collator = new Intl.Collator("tr", { sensitivity: "base" });

/** Yayındaki kataloglar — marka adına göre sıralı. */
export const getCatalogs = cache(async (): Promise<Catalog[]> => {
  if (!isSupabaseConfigured()) return demoCatalogs();
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("catalogs")
      .select("*, brand:brands(name,slug)")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    const rows = (data ?? []) as unknown as Array<
      Record<string, unknown> & { brand: { name: string; slug: string } | null }
    >;
    const items = rows.map((c) => ({
      id: String(c.id),
      title: c.title as string,
      brandName: c.brand?.name ?? null,
      brandSlug: c.brand?.slug ?? null,
      pdfUrl: (c.pdf_url as string) ?? null,
      coverUrl: (c.cover_url as string) ?? null,
      year: (c.year as string) ?? null,
      description: (c.description as string) ?? null,
      sortOrder: Number(c.sort_order ?? 0),
    }));
    return sortCatalogs(items);
  } catch (err) {
    console.error("[catalogs] okuma hatası, demo'ya düşülüyor:", err);
    return demoCatalogs();
  }
});

function sortCatalogs(items: Catalog[]): Catalog[] {
  return [...items].sort((a, b) => {
    const c = collator.compare(a.brandName ?? "Genel", b.brandName ?? "Genel");
    return c !== 0 ? c : a.sortOrder - b.sortOrder || collator.compare(a.title, b.title);
  });
}

/** Demo: Supabase yokken örnek kataloglar (PDF eklenmemiş). */
function demoCatalogs(): Catalog[] {
  const b = (slug: string) => seedBrands.find((x) => x.slug === slug);
  const mk = (
    id: string,
    title: string,
    brandSlug: string,
    year: string,
    description: string,
  ): Catalog => {
    const brand = b(brandSlug);
    return {
      id,
      title,
      brandName: brand?.name ?? null,
      brandSlug: brand?.slug ?? null,
      pdfUrl: null,
      coverUrl: null,
      year,
      description,
      sortOrder: 0,
    };
  };
  return sortCatalogs([
    mk("d1", "Sirkülasyon Pompaları Ürün Kataloğu", "grundfos", "2026", "Isıtma ve soğutma pompaları genel kataloğu."),
    mk("d2", "Basınçlandırma Sistemleri", "grundfos", "2025", "Hidrofor ve çok kademeli pompa serileri."),
    mk("d3", "Sirkülasyon & Dalgıç Pompa Kataloğu", "wilo", "2026", "Wilo pompa ürün ailesi."),
    mk("d4", "Atık Su & Drenaj Pompaları", "wilo", "2025", "Dalgıç drenaj ve pis su pompaları."),
    mk("d5", "Press Fitting Sistemleri", "viega", "2025", "Paslanmaz ve karbon çelik press sistemleri."),
    mk("d6", "Yerden Isıtma Kollektörleri", "viega", "2026", "Kollektör ve dağıtım grupları."),
    mk("d7", "Tesisat Sistemleri Genel Katalog", "geberit", "2026", "Gömme rezervuar ve tesisat çözümleri."),
    mk("d8", "Endüstriyel Otomasyon Bileşenleri", "festo", "2025", "Pnömatik ve bağlantı ürünleri."),
    mk("d9", "Vana & Aktüatör Kataloğu", "danfoss", "2026", "Motorlu vana, aktüatör ve kontrol ürünleri."),
    mk("d10", "Ölçü & Kontrol Ekipmanları", "honeywell", "2026", "Manometre, termometre ve basınç kontrol."),
    mk("d11", "Bağlantı Elemanları & Kelepçeler", "wurth", "2025", "Cıvata, somun, kelepçe ve sızdırmazlık."),
    mk("d12", "Diferansiyel Basınç Çözümleri", "danfoss", "2024", "Basınç dengeleme ve kontrol vanaları."),
  ]);
}
