"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/catalog/product-image";
import {
  useCart,
  selectSubtotal,
  selectVatTotal,
  useCartHydrated,
} from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

export default function SepetPage() {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const vatTotal = useCart(selectVatTotal);

  return (
    <Container className="py-10 lg:py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            Teklif Sepeti
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Ürünleri gözden geçirin, adetleri düzenleyin ve teklif talebine
            geçin.
          </p>
        </div>
      </div>

      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Kalemler */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-md border border-ink-200">
              {items.map((item, idx) => (
                <div
                  key={item.slug}
                  className={`flex gap-4 p-4 ${idx > 0 ? "border-t border-ink-100" : ""}`}
                >
                  <Link
                    href={`/urunler/${item.slug}`}
                    className="size-20 shrink-0 overflow-hidden rounded-sm border border-ink-200"
                  >
                    <ProductImage src={item.imageUrl} alt={item.name} sizes="80px" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {item.brandName ? (
                          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
                            {item.brandName}
                            {item.sku ? ` · ${item.sku}` : ""}
                          </span>
                        ) : null}
                        <h3 className="truncate text-sm font-semibold text-ink-900">
                          <Link
                            href={`/urunler/${item.slug}`}
                            className="hover:text-steel-600"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-0.5 text-xs text-ink-400">
                          {formatPrice(item.listPrice)} / {item.unit} · KDV %
                          {item.vatRate}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        aria-label="Kalemi kaldır"
                        className="shrink-0 rounded-sm p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-danger"
                      >
                        <Trash2 className="size-4" strokeWidth={1.75} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3">
                      {/* Adet */}
                      <div className="inline-flex h-9 items-stretch rounded-sm border border-ink-300">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className="grid w-9 place-items-center text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40"
                          aria-label="Adet azalt"
                        >
                          <Minus className="size-3.5" strokeWidth={1.75} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={9999}
                          value={item.qty}
                          onChange={(e) => {
                            const v = Number.parseInt(e.target.value, 10);
                            setQty(item.slug, Number.isFinite(v) ? v : 1);
                          }}
                          className="w-12 border-x border-ink-200 text-center text-sm font-semibold text-ink-900 tnum outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label="Adet"
                        />
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className="grid w-9 place-items-center text-ink-600 transition-colors hover:bg-ink-50"
                          aria-label="Adet artır"
                        >
                          <Plus className="size-3.5" strokeWidth={1.75} />
                        </button>
                      </div>

                      <span className="font-display text-base font-bold text-ink-900 tnum">
                        {formatPrice(item.listPrice * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/urunler">
                  <ArrowLeft strokeWidth={1.75} />
                  Alışverişe devam
                </Link>
              </Button>
              <button
                onClick={clear}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-danger"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
                Sepeti temizle
              </button>
            </div>
          </div>

          {/* Özet */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-md border border-ink-200 bg-white">
              <div className="border-b border-ink-100 px-5 py-4">
                <h2 className="font-display text-base font-bold tracking-tight text-ink-900">
                  Özet
                </h2>
              </div>
              <dl className="space-y-3 px-5 py-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Ara toplam (KDV hariç)</dt>
                  <dd className="font-medium text-ink-900 tnum">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">KDV</dt>
                  <dd className="font-medium text-ink-900 tnum">
                    {formatPrice(vatTotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-ink-200 pt-3">
                  <dt className="font-display font-bold text-ink-900">
                    Genel toplam
                  </dt>
                  <dd className="font-display text-lg font-extrabold text-ink-900 tnum">
                    {formatPrice(subtotal + vatTotal)}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-ink-100 px-5 py-4">
                <Button asChild variant="accent" size="lg" className="w-full">
                  <Link href="/teklif-iste">
                    Teklif İste
                    <ArrowRight strokeWidth={1.75} />
                  </Link>
                </Button>
                <p className="mt-3 text-center text-xs text-ink-400">
                  Liste fiyatları üzerinden iskonto, resmi teklifinizde
                  uygulanır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-ink-300 bg-ink-50 px-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-md border border-ink-200 bg-white text-ink-400">
        <ShoppingCart className="size-6" strokeWidth={1.5} />
      </span>
      <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
        Sepetiniz boş
      </h2>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        Katalogdan ürünleri sepete ekleyin, ardından tek tıkla teklif talebi
        oluşturun.
      </p>
      <Button asChild variant="primary" className="mt-6">
        <Link href="/urunler">
          Kataloğa git
          <ArrowRight strokeWidth={1.75} />
        </Link>
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-px lg:col-span-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex gap-4 rounded-md border border-ink-200 p-4"
          >
            <div className="size-20 shrink-0 animate-pulse rounded-sm bg-ink-100" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-24 animate-pulse rounded bg-ink-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
              <div className="h-3 w-32 animate-pulse rounded bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-4">
        <div className="h-64 animate-pulse rounded-md border border-ink-200 bg-ink-50" />
      </div>
    </div>
  );
}
