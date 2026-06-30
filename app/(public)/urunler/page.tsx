import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductRow } from "@/components/catalog/product-row";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { getBrands, getCategories, getProducts } from "@/lib/data/catalog";
import {
  parseProductFilters,
  PARAM,
  type SearchParamsRecord,
} from "@/lib/catalog-params";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}): Promise<Metadata> {
  const sp = await searchParams;
  // Filtre/sayfa parametreli varyantlar index'i şişirmesin:
  // canonical her zaman temel /urunler; varyantlar noindex,follow.
  const hasFilters = [
    PARAM.brand,
    PARAM.category,
    PARAM.subcategory,
    PARAM.q,
    PARAM.page,
  ].some((k) => typeof sp[k] === "string" && sp[k] !== "");

  return {
    title: "Ürün Kataloğu",
    description:
      "Endüstriyel tesisat malzemeleri kataloğu — vana, boru, pompa, bağlantı elemanları. Marka, kategori ve alt kategoriye göre filtreleyin; tüm fiyatlar herkese açık.",
    alternates: { canonical: "/urunler" },
    openGraph: { url: "/urunler" },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const view = sp[PARAM.view] === "izgara" ? "grid" : "list";

  const [{ items, total, page, pageCount }, brands, categories] =
    await Promise.all([getProducts(filters), getBrands(), getCategories()]);

  return (
    <>
      <PageHeader
        title="Ürün Kataloğu"
        description="Marka, kategori ve alt kategoriye göre filtreleyin; tüm fiyatlar açıktır."
        image="/img/pexels-sonny-vermeer-505472791-17728787.jpg"
        breadcrumbs={[{ title: "Ürünler" }]}
      />

      <Container className="py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Filtreler */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <CatalogFilters
                brands={brands.map((b) => ({ name: b.name, slug: b.slug }))}
                categories={categories.map((c) => ({
                  name: c.name,
                  slug: c.slug,
                  subcategories: c.subcategories.map((s) => ({
                    name: s.name,
                    slug: s.slug,
                  })),
                }))}
              />
            </div>
          </aside>

          {/* Sonuçlar */}
          <div className="lg:col-span-9">
            <CatalogToolbar total={total} />

            {items.length === 0 ? (
              <EmptyState />
            ) : view === "list" ? (
              <div className="mt-6 divide-y divide-ink-100 border-y border-ink-200">
                {items.map((p) => (
                  <ProductRow key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              pageCount={pageCount}
              searchParams={sp}
            />
          </div>
        </div>
      </Container>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center border border-dashed border-ink-300 bg-ink-50 px-6 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-md border border-ink-200 bg-white text-ink-400">
        <PackageSearch className="size-6" strokeWidth={1.5} />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
        Sonuç bulunamadı
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">
        Seçtiğiniz filtrelere uygun ürün yok. Filtreleri temizleyip yeniden
        deneyin.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/urunler">Filtreleri temizle</Link>
      </Button>
    </div>
  );
}
