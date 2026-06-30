import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Product, grossPrice } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { productFallbackImage } from "@/lib/product-image";
import { ProductImage } from "@/components/catalog/product-image";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { toCartProduct } from "@/components/catalog/product-card";

/** Liste görünümü satırı — yatay, kompakt. */
export function ProductRow({ product }: { product: Product }) {
  const href = `/urunler/${product.slug}`;
  return (
    <article className="flex items-center gap-4 bg-white py-3">
      <Link
        href={href}
        className="block w-20 shrink-0 overflow-hidden rounded-sm border border-ink-200 sm:w-24"
      >
        <ProductImage
          src={product.imageUrl}
          fallbackSrc={productFallbackImage(product.category?.slug, product.slug)}
          alt={product.name}
          sizes="96px"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {product.sku ? (
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
              {product.sku}
            </span>
          ) : null}
          {product.brand ? (
            <span className="font-display text-[11px] font-bold uppercase tracking-tight text-ink-500">
              {product.brand.name}
            </span>
          ) : null}
        </div>
        <h3 className="mt-0.5 truncate text-sm font-semibold text-ink-900">
          <Link href={href} className="hover:text-steel-600">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-xs text-ink-400">
          {product.category?.name ?? "—"}
          {product.subcategory ? ` · ${product.subcategory.name}` : ""}
        </p>
        {/* Mobil fiyat */}
        <p className="mt-1 font-display text-base font-extrabold tracking-tight text-ink-900 tnum sm:hidden">
          {formatPrice(product.listPrice)}
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">
            /{product.unit}
          </span>
        </p>
      </div>

      {/* Masaüstü fiyat */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="font-display text-lg font-extrabold tracking-tight text-ink-900 tnum">
          {formatPrice(product.listPrice)}
        </p>
        <p className="text-[11px] text-ink-400">
          KDV dahil {formatPrice(grossPrice(product))} · /{product.unit}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <AddToCartButton product={toCartProduct(product)} showQty compact />
        <Link
          href={href}
          aria-label="Ürün detayı"
          className="hidden size-9 shrink-0 place-items-center rounded-sm border border-ink-200 text-ink-500 transition-colors hover:border-ink-300 hover:text-steel-600 sm:grid"
        >
          <ArrowUpRight className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </article>
  );
}
