"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

/** Sepete eklenebilen ürünün taşıdığı asgari alanlar (snapshot kaynağı). */
export type CartProduct = {
  slug: string;
  name: string;
  sku: string | null;
  unit: string;
  listPrice: number;
  vatRate: number;
  brandName: string | null;
  imageUrl: string | null;
};

export type CartItem = CartProduct & { qty: number };

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === product.slug
                  ? { ...i, qty: Math.min(9999, i.qty + qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...product, qty }] };
        }),
      setQty: (slug, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, qty: Math.max(1, Math.min(9999, qty)) } : i,
          ),
        })),
      removeItem: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    { name: "birtek-cart" },
  ),
);

/* ----------------------------- Seçiciler ------------------------------ */

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.listPrice * i.qty, 0);

export const selectVatTotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.listPrice * i.qty * (i.vatRate / 100), 0);

/**
 * SSR/CSR hidrasyon uyumsuzluğunu önlemek için: persist hydrate olana kadar
 * `false` döner. Sepet sayısı/listesi yalnızca hidrasyon sonrası render edilir.
 */
export function useCartHydrated(): boolean {
  // SSR/prerender sırasında persist'e DOKUNMA — her zaman false başla,
  // yalnızca client mount'ta gerçek durumu oku.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useCart.persist?.onFinishHydration?.(() => setHydrated(true));
    if (useCart.persist?.hasHydrated?.()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
