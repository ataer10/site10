"use client";

import * as React from "react";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartProduct } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

/**
 * Sepete Ekle — kart için sade, ürün detayı için adet seçicili (showQty).
 * Eklemeden sonra ~1.5 sn "Eklendi" geri bildirimi gösterir.
 */
export function AddToCartButton({
  product,
  showQty = false,
  compact = false,
  size = "md",
  className,
}: {
  product: CartProduct;
  showQty?: boolean;
  /** Liste satırı için kompakt adet seçici + buton (yan yana, küçük). */
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  }

  if (!showQty) {
    return (
      <Button
        type="button"
        variant={added ? "solid" : "primary"}
        size={size}
        onClick={handleAdd}
        className={className}
        aria-label={`${product.name} ürününü sepete ekle`}
      >
        {added ? (
          <>
            <Check strokeWidth={2} /> Eklendi
          </>
        ) : (
          <>
            <ShoppingCart strokeWidth={1.75} /> Sepete Ekle
          </>
        )}
      </Button>
    );
  }

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div className="inline-flex h-9 items-stretch rounded-sm border border-ink-300">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid w-8 place-items-center text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40"
            aria-label="Adet azalt"
            disabled={qty <= 1}
          >
            <Minus className="size-3.5" strokeWidth={1.75} />
          </button>
          <input
            type="number"
            min={1}
            max={9999}
            value={qty}
            onChange={(e) => {
              const v = Number.parseInt(e.target.value, 10);
              setQty(Number.isFinite(v) && v > 0 ? Math.min(9999, v) : 1);
            }}
            className="w-10 border-x border-ink-200 text-center text-sm font-semibold text-ink-900 tnum outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Adet"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(9999, q + 1))}
            className="grid w-8 place-items-center text-ink-600 transition-colors hover:bg-ink-50"
            aria-label="Adet artır"
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <Button
          type="button"
          variant={added ? "solid" : "primary"}
          size="sm"
          onClick={handleAdd}
          aria-label={`${product.name} ürününü sepete ekle`}
        >
          {added ? (
            <>
              <Check strokeWidth={2} /> Eklendi
            </>
          ) : (
            <>
              <ShoppingCart strokeWidth={1.75} /> Sepete Ekle
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <div className="inline-flex h-12 items-stretch rounded-sm border border-ink-300">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid w-11 place-items-center text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40"
          aria-label="Adet azalt"
          disabled={qty <= 1}
        >
          <Minus className="size-4" strokeWidth={1.75} />
        </button>
        <input
          type="number"
          min={1}
          max={9999}
          value={qty}
          onChange={(e) => {
            const v = Number.parseInt(e.target.value, 10);
            setQty(Number.isFinite(v) && v > 0 ? Math.min(9999, v) : 1);
          }}
          className="w-14 border-x border-ink-200 text-center text-sm font-semibold text-ink-900 tnum outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Adet"
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(9999, q + 1))}
          className="grid w-11 place-items-center text-ink-600 transition-colors hover:bg-ink-50"
          aria-label="Adet artır"
        >
          <Plus className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <Button
        type="button"
        variant={added ? "solid" : "accent"}
        size="lg"
        onClick={handleAdd}
        className="flex-1"
      >
        {added ? (
          <>
            <Check strokeWidth={2} /> Sepete Eklendi
          </>
        ) : (
          <>
            <ShoppingCart strokeWidth={1.75} /> Sepete Ekle
          </>
        )}
      </Button>
    </div>
  );
}
