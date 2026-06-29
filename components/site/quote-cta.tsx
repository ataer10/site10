"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart, selectCount, useCartHydrated } from "@/lib/store/cart";

/**
 * Sepete duyarlı "Teklif İste" CTA'sı.
 * - Sepet boş → /urunler (müşteri önce ürün ekler)
 * - Sepette ürün var → /teklif-iste (teklif formu)
 * Böylece akış: ürünleri sepete ekle → teklifi tamamla.
 */
export function QuoteCta({
  children = "Teklif İste",
  onNavigate,
  variant = "accent",
  size,
  className,
}: {
  children?: React.ReactNode;
  onNavigate?: () => void;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const hydrated = useCartHydrated();
  const count = useCart(selectCount);
  const href = hydrated && count > 0 ? "/teklif-iste" : "/urunler";

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href} onClick={onNavigate}>
        {children}
      </Link>
    </Button>
  );
}
