import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/product-card";
import {
  getBrandBySlug,
  getAllBrandSlugs,
  getProductsByBrand,
} from "@/lib/data/catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  const slugs = await getAllBrandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Marka bulunamadı", robots: { index: false } };
  const title = `${brand.name} Ürünleri`;
  const description = `${brand.name} ürünleri — yetkili kanaldan orijinal endüstriyel tesisat malzemeleri, açık liste fiyatı ve hızlı teklif.`;
  const path = `/markalar/${brand.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title, description },
  };
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const products = await getProductsByBrand(slug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Anasayfa", path: "/" },
            { name: "Markalar", path: "/markalar" },
            { name: brand.name, path: `/markalar/${brand.slug}` },
          ]),
          itemListJsonLd(
            products.slice(0, 30).map((p) => ({
              name: p.name,
              path: `/urunler/${p.slug}`,
            })),
          ),
        ]}
      />
      <PageHeader
        title={brand.name}
        description={`${brand.name} ürün grubundan ${products.length} ürün listeleniyor.`}
        breadcrumbs={[
          { title: "Markalar", href: "/markalar" },
          { title: brand.name },
        ]}
      />

      <Container className="py-10 lg:py-14">
        {/* Katalog PDF */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-ink-200 pb-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
              Marka Kataloğu
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {brand.catalogPdfUrl
                ? `${brand.name} ürün kataloğunu PDF olarak indirin.`
                : "Bu marka için katalog PDF'i yakında eklenecek."}
            </p>
          </div>
          {brand.catalogPdfUrl ? (
            <Button asChild variant="outline">
              <a
                href={brand.catalogPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileDown strokeWidth={1.75} />
                Katalog PDF indir
              </a>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <FileDown strokeWidth={1.75} />
              Katalog yakında
            </Button>
          )}
        </div>

        {/* Ürünler */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center border border-dashed border-ink-300 bg-ink-50 px-6 py-16 text-center">
            <p className="text-sm text-ink-500">
              Bu markaya ait listelenecek ürün bulunamadı.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/urunler">
                Tüm kataloğu gör
                <ArrowRight strokeWidth={1.75} />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
