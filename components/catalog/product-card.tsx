import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Product, grossPrice } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/catalog/product-image";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import type { CartProduct } from "@/lib/store/cart";

export function toCartProduct(p: Product): CartProduct {
  return {
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    listPrice: p.listPrice,
    vatRate: p.vatRate,
    brandName: p.brand?.name ?? null,
    imageUrl: p.imageUrl,
  };
}

export function ProductCard({ product }: { product: Product }) {
  const href = `/urunler/${product.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden border border-ink-200 bg-white transition-colors hover:border-ink-300">
      <Link href={href} className="relative block border-b border-ink-100">
        <ProductImage src={product.imageUrl} alt={product.name} />
        {product.brand ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-sm border border-ink-200 bg-white/90 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-tight text-ink-600 backdrop-blur">
            {product.brand.name}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.sku ? (
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
            {product.sku}
          </span>
        ) : null}
        <h3 className="mt-1 text-sm font-semibold leading-snug text-ink-900">
          <Link href={href} className="hover:text-steel-600">
            {product.name}
          </Link>
        </h3>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-ink-900 tnum">
              {formatPrice(product.listPrice)}
            </p>
            <p className="text-[11px] text-ink-400">
              KDV dahil {formatPrice(grossPrice(product))} · /{product.unit}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4">
          <AddToCartButton
            product={toCartProduct(product)}
            size="sm"
            className="flex-1"
          />
          <Link
            href={href}
            aria-label="Ürün detayı"
            className="grid size-8 shrink-0 place-items-center rounded-sm border border-ink-200 text-ink-500 transition-colors hover:border-ink-300 hover:text-steel-600"
          >
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
