"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Save,
  Loader2,
  Trash2,
  ChevronRight,
  ChevronDown,
  CircleCheckBig,
  TriangleAlert,
  FileSpreadsheet,
  Pencil,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductImport } from "@/components/admin/product-import";
import {
  updateProductPricesAction,
  deleteProductAction,
} from "@/lib/actions/admin";

export type PriceRow = {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  listPrice: number;
  unit: string;
  vatRate: number;
  isActive: boolean;
};
type RefCategory = { name: string; subs: string[] };

const collator = new Intl.Collator("tr", { sensitivity: "base", numeric: true });
const PAGE_SIZE = 25;

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

export function PriceListManager({
  products,
  brands,
  categories,
  demo,
}: {
  products: PriceRow[];
  brands: string[];
  categories: RefCategory[];
  demo: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = React.useState<PriceRow[]>(products);
  // Sunucu verisi tazelenince (toplu içe aktarma sonrası) tabloyu güncelle
  React.useEffect(() => setRows(products), [products]);

  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [edits, setEdits] = React.useState<Record<string, string>>({});
  const [saving, startSave] = React.useTransition();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const editedPrice = React.useCallback(
    (r: PriceRow): number | null => {
      const raw = edits[r.id];
      if (raw === undefined || raw.trim() === "") return null;
      const n = parseFloat(raw.replace(",", "."));
      return Number.isFinite(n) ? n : null;
    },
    [edits],
  );
  const isDirty = React.useCallback(
    (r: PriceRow): boolean => {
      const p = editedPrice(r);
      return p !== null && p >= 0 && p !== r.listPrice;
    },
    [editedPrice],
  );

  const dirtyCount = rows.filter(isDirty).length;

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    const out = needle
      ? rows.filter(
          (r) =>
            r.name.toLocaleLowerCase("tr").includes(needle) ||
            (r.sku ?? "").toLocaleLowerCase("tr").includes(needle) ||
            (r.brand ?? "").toLocaleLowerCase("tr").includes(needle) ||
            (r.category ?? "").toLocaleLowerCase("tr").includes(needle),
        )
      : rows;
    return [...out].sort((a, b) => collator.compare(a.name, b.name));
  }, [rows, q]);

  React.useEffect(() => setPage(1), [q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  function onSave() {
    const updates = rows
      .filter(isDirty)
      .map((r) => ({ id: r.id, listPrice: editedPrice(r)! }));
    if (!updates.length) return;
    setMsg(null);
    startSave(async () => {
      const res = await updateProductPricesAction(updates);
      if (res.updated > 0) {
        const map = new Map(updates.map((u) => [u.id, u.listPrice]));
        setRows((prev) =>
          prev.map((r) =>
            map.has(r.id) ? { ...r, listPrice: map.get(r.id)! } : r,
          ),
        );
        setEdits({});
      }
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: `${res.updated} fiyat güncellendi${res.demo ? " (demo — kalıcı değil)" : ""}.`,
            }
          : { kind: "err", text: res.error ?? "Güncellenemedi." },
      );
    });
  }

  function onDelete(r: PriceRow) {
    if (!window.confirm(`"${r.name}" ürünü silinsin mi? Bu işlem geri alınamaz.`))
      return;
    setMsg(null);
    setDeletingId(r.id);
    startSave(async () => {
      const res = await deleteProductAction(r.id);
      setDeletingId(null);
      if (res.ok) {
        setRows((prev) => prev.filter((x) => x.id !== r.id));
        setEdits((prev) => {
          const n = { ...prev };
          delete n[r.id];
          return n;
        });
        setMsg({ kind: "ok", text: `"${r.name}" silindi.` });
      } else {
        setMsg({ kind: "err", text: res.error ?? "Silinemedi." });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Toplu işlemler (Excel) — katlanır */}
      <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-800">
            <FileSpreadsheet className="size-4 text-steel-600" strokeWidth={1.75} />
            Excel ile toplu işlemler — şablon indir / toplu yükle
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-ink-400 transition-transform",
              importOpen && "rotate-180",
            )}
            strokeWidth={2}
          />
        </button>
        {importOpen ? (
          <div className="border-t border-ink-100 p-5">
            <ProductImport
              demo={demo}
              brands={brands}
              categories={categories}
              onImported={() => router.refresh()}
            />
          </div>
        ) : null}
      </div>

      {/* Arama */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
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
            className="h-10 w-full rounded-sm border border-input bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
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
        <p className="font-mono text-xs uppercase tracking-wide text-ink-400">
          {filtered.length} ürün
        </p>
      </div>

      {msg ? (
        <div
          className={`flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm ${
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
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Ürün
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 lg:table-cell">
                  Marka / Kategori
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Liste Fiyatı (₺)
                </th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">
                  KDV Dahil
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {pageRows.map((r) => {
                const dirty = isDirty(r);
                const livePrice = editedPrice(r) ?? r.listPrice;
                const gross = livePrice * (1 + r.vatRate / 100);
                return (
                  <tr
                    key={r.id}
                    className={cn(dirty ? "bg-steel-50/60" : "hover:bg-ink-50")}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/urunler/${r.id}`}
                        className="font-medium text-ink-900 hover:text-steel-600"
                      >
                        {r.name}
                      </Link>
                      <span className="block font-mono text-[11px] text-ink-400">
                        {r.sku ?? "—"}
                        {!r.isActive ? " · pasif" : ""}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 text-ink-600 lg:table-cell">
                      {r.brand ?? "—"}
                      <span className="block text-xs text-ink-400">
                        {r.category ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {dirty ? (
                          <Pencil className="size-3 text-steel-500" strokeWidth={2} />
                        ) : null}
                        <input
                          type="text"
                          inputMode="decimal"
                          value={edits[r.id] ?? String(r.listPrice)}
                          onChange={(e) =>
                            setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                          aria-label={`${r.name} liste fiyatı`}
                          className={cn(
                            "h-9 w-28 rounded-sm border bg-white px-2 text-right text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
                            dirty
                              ? "border-steel-400 text-ink-900"
                              : "border-input text-ink-800",
                          )}
                        />
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-right text-ink-500 tabular-nums sm:table-cell">
                      {formatPrice(gross)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onDelete(r)}
                        disabled={deletingId === r.id || saving}
                        aria-label={`${r.name} sil`}
                        className="inline-grid size-8 place-items-center rounded-sm border border-ink-200 text-ink-400 transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-40"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" strokeWidth={1.75} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-400">
                    Ürün bulunamadı.
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

      {/* Kaydetme çubuğu (değişiklik varken) */}
      {dirtyCount > 0 ? (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-md border border-steel-300 bg-white px-5 py-3 shadow-raised">
          <p className="text-sm text-ink-700">
            <strong className="text-ink-900">{dirtyCount}</strong> üründe fiyat
            değişikliği var.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEdits({})}
              disabled={saving}
            >
              Vazgeç
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save strokeWidth={1.75} />
              )}
              Değişiklikleri kaydet ({dirtyCount})
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
