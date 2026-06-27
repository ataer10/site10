import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  BadgeCheck,
  Tag,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/catalog/product-image";
import { ProductCard, toCartProduct } from "@/components/catalog/product-card";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import {
  getProductBySlug,
  getAllProductSlugs,
  getRelatedProducts,
  grossPrice,
} from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return {
    title: product.name,
    description:
      product.description ??
      `${product.name} — ${product.brand?.name ?? "endüstriyel tesisat"} ürünü.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const specs = [
    product.sku ? { label: "Ürün Kodu (SKU)", value: product.sku, mono: true } : null,
    product.brand ? { label: "Marka", value: product.brand.name } : null,
    product.category ? { label: "Kategori", value: product.category.name } : null,
    product.subcategory
      ? { label: "Alt Kategori", value: product.subcategory.name }
      : null,
    { label: "Satış Birimi", value: product.unit },
    { label: "KDV Oranı", value: `%${product.vatRate}` },
  ].filter(Boolean) as { label: string; value: string; mono?: boolean }[];

  return (
    <div className="py-8 lg:py-12">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
            <li>
              <Link href="/" className="hover:text-ink-700">
                Anasayfa
              </Link>
            </li>
            <Crumb>
              <Link href="/urunler" className="hover:text-ink-700">
                Ürünler
              </Link>
            </Crumb>
            {product.category ? (
              <Crumb>
                <Link
                  href={`/urunler?kategori=${product.category.slug}`}
                  className="hover:text-ink-700"
                >
                  {product.category.name}
                </Link>
              </Crumb>
            ) : null}
            <Crumb>
              <span className="text-ink-700">{product.name}</span>
            </Crumb>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Görsel */}
          <div className="border border-ink-200">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>

          {/* Bilgi */}
          <div className="flex flex-col">
            {product.brand ? (
              <Link href={`/markalar/${product.brand.slug}`}>
                <Badge variant="steel">{product.brand.name}</Badge>
              </Link>
            ) : null}
            <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-3xl">
              {product.name}
            </h1>
            {product.sku ? (
              <p className="mt-2 font-mono text-sm uppercase tracking-wide text-ink-400">
                {product.sku}
              </p>
            ) : null}

            {/* Fiyat */}
            <div className="mt-6 border-y border-ink-200 py-5">
              <div className="flex items-end gap-3">
                <span className="font-display text-3xl font-extrabold tracking-tight text-ink-900 tnum">
                  {formatPrice(product.listPrice)}
                </span>
                <span className="pb-1 text-sm text-ink-400">/ {product.unit}</span>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                KDV (%{product.vatRate}) dahil{" "}
                <span className="font-semibold text-ink-700 tnum">
                  {formatPrice(grossPrice(product))}
                </span>
              </p>
            </div>

            {/* Sepete ekle */}
            <div className="mt-6">
              <AddToCartButton product={toCartProduct(product)} showQty />
              <p className="mt-3 text-xs text-ink-400">
                Sepete ekleyip{" "}
                <Link href="/teklif-iste" className="text-steel-600 hover:underline">
                  teklif talebi
                </Link>{" "}
                oluşturabilirsiniz. Liste fiyatına iskonto, resmi teklifte
                uygulanır.
              </p>
            </div>

            {/* Güven unsurları */}
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { icon: BadgeCheck, text: "Orijinal & faturalı" },
                { icon: ShieldCheck, text: "Üretici garantili" },
                { icon: Truck, text: "Stoktan sevkiyat" },
              ].map((t) => (
                <li
                  key={t.text}
                  className="flex items-center gap-2 rounded-sm border border-ink-200 bg-ink-50 px-3 py-2 text-xs font-medium text-ink-600"
                >
                  <t.icon className="size-4 shrink-0 text-steel-500" strokeWidth={1.5} />
                  {t.text}
                </li>
              ))}
            </ul>

            {/* Teknik özellikler */}
            <dl className="mt-8 divide-y divide-ink-100 border-t border-ink-200">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2.5">
                  <dt className="text-sm text-ink-500">{s.label}</dt>
                  <dd
                    className={
                      s.mono
                        ? "font-mono text-sm uppercase tracking-wide text-ink-800"
                        : "text-sm font-medium text-ink-800"
                    }
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Açıklama */}
        {product.description ? (
          <div className="mt-12 max-w-3xl">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-900">
              <Tag className="size-5 text-steel-500" strokeWidth={1.5} />
              Ürün Açıklaması
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              {product.description}
            </p>
          </div>
        ) : null}

        {/* İlgili ürünler */}
        {related.length > 0 ? (
          <section className="mt-16 border-t border-ink-200 pt-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">
              Benzer ürünler
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}

function Crumb({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <ChevronRight className="size-3.5 text-ink-300" strokeWidth={1.5} />
      {children}
    </li>
  );
}
