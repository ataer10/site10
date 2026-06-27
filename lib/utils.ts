import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını çakışmadan birleştirir (shadcn deseni). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Türkçe (tr-TR) para biçimi — KDV hariç liste fiyatları için. */
export function formatPrice(
  value: number,
  currency: string = "TRY",
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Sade sayı biçimi (tr-TR). */
export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
