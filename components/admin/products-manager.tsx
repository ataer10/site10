"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  X,
  Trash2,
  Pencil,
  ChevronRight,
  Loader2,
  CircleCheckBig,
  TriangleAlert,
  Package,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/lib/actions/admin";

export type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  listPrice: number;
  unit: string;
  isActive: boolean;
};

const collator = new Intl.Collator("tr", { sensitivity: "base", numeric: true });
const PAGE_SIZE = 25;

function uniqueSorted(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v && v !== "—"))).sort(
    (a, b) => collator.compare(a, b),
  );
}

function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const [rows, setRows] = React.useState<ProductRow[]>(products);
  React.useEffect(() => setRows(products), [products]);

  const [q, setQ] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [status, setStatus] = React.useState<"" | "active" | "passive">("");
  const [page, setPage] = React.useState(1);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const brands = React.useMemo(() => uniqueSorted(rows.map((r) => r.brand)), [rows]);
  const categories = React.useMemo(
    () => uniqueSorted(rows.map((r) => r.category)),
    [rows],
  );

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    const out = rows.filter(
      (r) =>
        (!brand || r.brand === brand) &&
        (!category || r.category === category) &&
        (!status || (status === "active" ? r.isActive : !r.isActive)) &&
        (!needle ||
          r.name.toLocaleLowerCase("tr").includes(needle) ||
          (r.sku ?? "").toLocaleLowerCase("tr").includes(needle) ||
          (r.brand ?? "").toLocaleLowerCase("tr").includes(needle) ||
          (r.category ?? "").toLocaleLowerCase("tr").includes(needle)),
    );
    return [...out].sort((a, b) => collator.compare(a.name, b.name));
  }, [rows, q, brand, category, status]);

  React.useEffect(() => setPage(1), [q, brand, category, status]);

  const hasFilter = !!q.trim() || !!brand || !!category || !!status;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  function clearFilters() {
    setQ("");
    setBrand("");
    setCategory("");
    setStatus("");
  }

  function onDelete(r: ProductRow) {
    if (!window.confirm(`"${r.name}" ürünü silinsin mi? Bu işlem geri alınamaz.`))
      return;
    setMsg(null);
    setDeletingId(r.id);
    startTransition(async () => {
      const res = await deleteProductAction(r.id);
      setDeletingId(null);
      if (res.ok) {
        setRows((prev) => prev.filter((x) => x.id !== r.id));
        setMsg({ kind: "ok", text: `"${r.name}" silindi.` });
      } else {
        setMsg({ kind: "err", text: res.error ?? "Silinemedi." });
      }
    });
  }

  const selectCls =
    "h-9 rounded-sm border border-input bg-white px-2.5 text-sm focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring";

  return (
    <div className="space-y-4">
      {/* Araç çubuğu */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ürün, SKU, marka ara…"
            aria-label="Ürün ara"
            className="h-9 w-full rounded-sm border border-input bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Temizle"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>

        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          aria-label="Marka filtresi"
          className={cn(selectCls, brand ? "text-ink-800" : "text-ink-500")}
        >
          <option value="">Tüm markalar</option>
          {brands.map((b) => (
            <option key={b} value={b} className="text-ink-800">
              {b}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Kategori filtresi"
          className={cn(selectCls, category ? "text-ink-800" : "text-ink-500")}
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c} value={c} className="text-ink-800">
              {c}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | "active" | "passive")}
          aria-label="Durum filtresi"
          className={cn(selectCls, status ? "text-ink-800" : "text-ink-500")}
        >
          <option value="">Tüm durumlar</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
        </select>

        <span className="ml-auto font-mono text-xs uppercase tracking-wide text-ink-400">
          {filtered.length} / {rows.length} ürün
        </span>
        {hasFilter ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-steel-600 hover:text-steel-700"
          >
            Temizle
          </button>
        ) : null}
      </div>

      {msg ? (
        <div
          className={`flex items-start gap-2 rounded-sm border px-3 py-2 text-sm ${
            msg.kind === "ok"
              ? "border-steel-200 bg-steel-50 text-steel-700"
              : "border-danger/30 bg-danger/5 text-danger"
          }`}
        >
          {msg.kind === "ok" ? (
            <CircleCheckBig className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          )}
          {msg.text}
        </div>
      ) : null}

      {/* Tablo */}
      <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Ürün
                </th>
                <th className="hidden px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500 md:table-cell">
                  Marka / Kategori
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Liste Fiyatı
                </th>
                <th className="hidden px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">
                  Durum
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {pageRows.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/urunler/${r.id}`}
                      className="font-medium text-ink-900 hover:text-steel-600"
                    >
                      {r.name}
                    </Link>
                    <span className="block font-mono text-[11px] text-ink-400">
                      {r.sku ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-2 text-ink-600 md:table-cell">
                    {r.brand ?? "—"}
                    <span className="block text-xs text-ink-400">
                      {r.category ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-ink-900 tabular-nums">
                    {formatPrice(r.listPrice)}
                    <span className="block text-[11px] font-normal text-ink-400">
                      /{r.unit}
                    </span>
                  </td>
                  <td className="hidden px-4 py-2 text-center sm:table-cell">
                    {r.isActive ? (
                      <span className="inline-flex rounded-sm border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex rounded-sm border border-ink-200 px-2 py-0.5 text-[11px] font-medium text-ink-400">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/urunler/${r.id}`}
                        aria-label={`${r.name} düzenle`}
                        className="inline-grid size-8 place-items-center rounded-sm border border-ink-200 text-ink-500 transition-colors hover:border-steel-300 hover:text-steel-600"
                      >
                        <Pencil className="size-4" strokeWidth={1.75} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(r)}
                        disabled={deletingId === r.id || pending}
                        aria-label={`${r.name} sil`}
                        className="inline-grid size-8 place-items-center rounded-sm border border-ink-200 text-ink-400 transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-40"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Package className="mx-auto size-7 text-ink-300" strokeWidth={1.25} />
                    <p className="mt-2 text-sm text-ink-400">
                      {hasFilter ? "Filtreye uygun ürün yok." : "Henüz ürün yok."}
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      {pageCount > 1 ? (
        <nav aria-label="Sayfalama" className="flex items-center justify-center gap-1">
          {pageWindow(safePage, pageCount).map((p, i) =>
            p === "…" ? (
              <span key={`g-${i}`} className="grid size-9 place-items-center text-sm text-ink-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === safePage ? "page" : undefined}
                className={cn(
                  "grid size-9 place-items-center rounded-sm border text-sm font-medium tabular-nums transition-colors",
                  p === safePage
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
                )}
              >
                {p}
              </button>
            ),
          )}
        </nav>
      ) : null}
    </div>
  );
}
