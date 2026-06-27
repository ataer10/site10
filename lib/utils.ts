import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını çakışmadan birleştirir (shadcn deseni). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ICU'nun para biçiminde sembol-rakam arasında kullandığı dar/kırılmaz boşluk
// varyantları. Node ve tarayıcı farklı varyant üretebilir → hidrasyon
// uyumsuzluğu. Hepsini kaldırarak server↔client çıktıyı birebir eşitleriz.
const INTL_SPACES = new RegExp(
  "[\\u00a0\\u202f\\u2009\\u2007\\u2008\\u200a\\u2060\\u3000]",
  "g",
);

/** Türkçe (tr-TR) para biçimi — KDV hariç liste fiyatları için. */
export function formatPrice(value: number, currency: string = "TRY"): string {
  const s = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return s.replace(INTL_SPACES, "");
}

/** Sade sayı biçimi (tr-TR). */
export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
