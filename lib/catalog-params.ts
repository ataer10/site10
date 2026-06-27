/**
 * Katalog URL parametreleri — hem server (sayfa) hem client (filtre/toolbar)
 * tarafından kullanılır. `server-only` import YOK (client güvenli).
 */

export const PARAM = {
  brand: "marka",
  category: "kategori",
  subcategory: "altkategori",
  q: "arama",
  sort: "sirala",
  page: "sayfa",
} as const;

export const SORT_OPTIONS = [
  { value: "name-asc", label: "İsim (A→Z)" },
  { value: "name-desc", label: "İsim (Z→A)" },
  { value: "price-asc", label: "Fiyat (artan)" },
  { value: "price-desc", label: "Fiyat (azalan)" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_PER_PAGE = 12;

export type ProductFilters = {
  brand?: string;
  category?: string;
  subcategory?: string;
  q?: string;
  sort?: SortValue;
  page?: number;
  perPage?: number;
};

export type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const SORT_VALUES = SORT_OPTIONS.map((o) => o.value) as readonly string[];

/** searchParams nesnesini tip güvenli ProductFilters'a çevirir. */
export function parseProductFilters(sp: SearchParamsRecord): ProductFilters {
  const sortRaw = first(sp[PARAM.sort]);
  const sort = (
    sortRaw && SORT_VALUES.includes(sortRaw) ? sortRaw : "name-asc"
  ) as SortValue;
  const pageRaw = Number.parseInt(first(sp[PARAM.page]) ?? "1", 10);

  return {
    brand: first(sp[PARAM.brand]) || undefined,
    category: first(sp[PARAM.category]) || undefined,
    subcategory: first(sp[PARAM.subcategory]) || undefined,
    q: first(sp[PARAM.q]) || undefined,
    sort,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

/**
 * Mevcut parametreleri kopyalayıp `updates` ile günceller; değeri null olan
 * anahtarı siler. `?...` (soru işaretli) query string döner; boşsa "?".
 */
export function buildQuery(
  current: SearchParamsRecord,
  updates: Record<string, string | number | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(current)) {
    const v = first(val);
    if (v) params.set(key, v);
  }
  for (const [key, val] of Object.entries(updates)) {
    if (val === null || val === "") params.delete(key);
    else params.set(key, String(val));
  }
  const s = params.toString();
  return s ? `?${s}` : "?";
}
