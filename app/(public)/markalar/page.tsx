import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import { BrandCard } from "@/components/catalog/brand-card";
import { loadCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/markalar" },
  openGraph: { url: "/markalar" },
  title: "Markalar",
  description:
    "Yetkili bayiliğini yaptığımız endüstriyel tesisat markaları — Grundfos, Wilo, Viega, Geberit, Festo ve daha fazlası.",
};

export default async function MarkalarPage() {
  const { brands, products } = await loadCatalog();

  const countBySlug = new Map<string, number>();
  for (const p of products) {
    if (p.brand) countBySlug.set(p.brand.slug, (countBySlug.get(p.brand.slug) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader
        title="Markalar"
        description="Avrupa ve dünya standartlarında üreticilerin orijinal ürünlerini yetkili kanaldan tedarik ediyoruz."
        image="/img/pexels-sharaf-design-1962240186-28900882.jpg"
        breadcrumbs={[{ title: "Markalar" }]}
      />

      <Container className="py-12 lg:py-16">
        <div className="grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <BrandCard
              key={b.slug}
              brand={b}
              productCount={countBySlug.get(b.slug) ?? 0}
            />
          ))}
        </div>
      </Container>
    </>
  );
}
