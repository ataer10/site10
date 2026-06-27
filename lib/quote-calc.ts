/**
 * Teklif hesap motoru — client (canlı önizleme) ve server (kaydet/PDF) ortak.
 * server-only YOK (client-safe).
 *
 * İskonto mantığı (prompt §5): kalem bazlı iskonto öncelikli; kalem iskontosu
 * null ise genel iskonto uygulanır. Net birim = liste * (1 - iskonto/100).
 * KDV her kalemin kendi oranından hesaplanır.
 */

export type CalcInputItem = {
  listPrice: number;
  qty: number;
  vatRate: number;
  /** Kalem bazlı iskonto %; null ise genel iskonto kullanılır. */
  discountRate: number | null;
};

export type CalcLine = CalcInputItem & {
  effectiveRate: number;
  netUnit: number;
  lineNet: number; // net * qty (KDV hariç)
  lineGross: number; // listPrice * qty (iskontosuz)
  lineVat: number;
  lineTotal: number; // lineNet + lineVat
};

export type QuoteTotals = {
  lines: CalcLine[];
  subtotal: number; // iskontosuz ara toplam (Σ liste*adet)
  netSubtotal: number; // iskontolu ara toplam (Σ net*adet)
  discountTotal: number; // subtotal - netSubtotal
  vatTotal: number;
  grandTotal: number; // netSubtotal + vatTotal
};

function r2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clampRate(n: number | null | undefined): number | null {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Math.min(100, Math.max(0, n));
}

export function calcQuote(
  items: CalcInputItem[],
  globalDiscountRate: number,
): QuoteTotals {
  const global = clampRate(globalDiscountRate) ?? 0;

  const lines: CalcLine[] = items.map((it) => {
    const itemRate = clampRate(it.discountRate);
    const effectiveRate = itemRate ?? global;
    const netUnit = r2(it.listPrice * (1 - effectiveRate / 100));
    const lineNet = r2(netUnit * it.qty);
    const lineGross = r2(it.listPrice * it.qty);
    const lineVat = r2(lineNet * (it.vatRate / 100));
    const lineTotal = r2(lineNet + lineVat);
    return {
      ...it,
      effectiveRate,
      netUnit,
      lineNet,
      lineGross,
      lineVat,
      lineTotal,
    };
  });

  const subtotal = r2(lines.reduce((s, l) => s + l.lineGross, 0));
  const netSubtotal = r2(lines.reduce((s, l) => s + l.lineNet, 0));
  const discountTotal = r2(subtotal - netSubtotal);
  const vatTotal = r2(lines.reduce((s, l) => s + l.lineVat, 0));
  const grandTotal = r2(netSubtotal + vatTotal);

  return { lines, subtotal, netSubtotal, discountTotal, vatTotal, grandTotal };
}
