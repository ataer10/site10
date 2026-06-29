"use client";

import * as React from "react";
import {
  Search,
  X,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  SlidersHorizontal,
  Inbox,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export type PriceRow = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  listPrice: number;
  grossPrice: number;
  vatRate: number;
};

const collator = new Intl.Collator("tr", { sensitivity: "base", numeric: true });

const SORTS = [
  { value: "name-asc", label: "Ürün (A→Z)" },
  { value: "name-desc", label: "Ürün (Z→A)" },
  { value: "price-asc", label: "Fiyat (artan)" },
  { value: "price-desc", label: "Fiyat (azalan)" },
  { value: "sku-asc", label: "SKU (A→Z)" },
] as const;

const PAGE_SIZES = [25, 50, 100] as const;

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter((v) => v && v !== "—"))).sort((a, b) =>
    collator.compare(a, b),
  );
}

function sorter(sort: string): (a: PriceRow, b: PriceRow) => number {
  switch (sort) {
    case "name-desc":
      return (a, b) => collator.compare(b.name, a.name);
    case "price-asc":
      return (a, b) => a.listPrice - b.listPrice;
    case "price-desc":
      return (a, b) => b.listPrice - a.listPrice;
    case "sku-asc":
      return (a, b) => collator.compare(a.sku, b.sku);
    case "name-asc":
    default:
      return (a, b) => collator.compare(a.name, b.name);
  }
}

/** Sayfa numarası penceresi (1 … 4 5 6 … 12). */
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

export function PriceList({ rows }: { rows: PriceRow[] }) {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [sort, setSort] = React.useState<string>("name-asc");
  const [pageSize, setPageSize] = React.useState<number>(25);
  const [page, setPage] = React.useState(1);
  const [printing, setPrinting] = React.useState(false);

  const categories = React.useMemo(
    () => uniqueSorted(rows.map((r) => r.category)),
    [rows],
  );
  const brands = React.useMemo(
    () => uniqueSorted(rows.map((r) => r.brand)),
    [rows],
  );

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    const out = rows.filter(
      (r) =>
        (!cat || r.category === cat) &&
        (!brand || r.brand === brand) &&
        (!needle ||
          r.name.toLocaleLowerCase("tr").includes(needle) ||
          r.sku.toLocaleLowerCase("tr").includes(needle) ||
          r.brand.toLocaleLowerCase("tr").includes(needle) ||
          r.category.toLocaleLowerCase("tr").includes(needle)),
    );
    return out.sort(sorter(sort));
  }, [rows, q, cat, brand, sort]);

  // Filtre/sıralama/sayfa boyutu değişince ilk sayfaya dön
  React.useEffect(() => {
    setPage(1);
  }, [q, cat, brand, sort, pageSize]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const hasFilters = q.trim() !== "" || cat !== "" || brand !== "";

  // Yazdırırken tüm filtrelenmiş satırlar DOM'da olsun → sonra print
  React.useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done, { once: true });
    const t = window.setTimeout(() => window.print(), 60);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [printing]);

  const visibleRows = printing ? filtered : pageRows;

  function clearFilters() {
    setQ("");
    setCat("");
    setBrand("");
  }

  function downloadCsv() {
    const header = [
      "SKU",
      "Ürün",
      "Marka",
      "Kategori",
      "Birim",
      "Liste Fiyatı (TRY)",
      "KDV Dahil (TRY)",
      "KDV %",
    ];
    const tr = (n: number) =>
      n.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      header.map(esc).join(";"),
      ...filtered.map((r) =>
        [
          r.sku,
          r.name,
          r.brand,
          r.category,
          r.unit,
          tr(r.listPrice),
          tr(r.grossPrice),
          `%${r.vatRate}`,
        ]
          .map((v) => esc(String(v)))
          .join(";"),
      ),
    ];
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "birtek-fiyat-listesi.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + pageSize, total);

  return (
    <div>
      {/* Araç çubuğu */}
      <div className="rounded-md border border-ink-200 bg-white p-4 print:hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Arama */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ürün adı, SKU, marka veya kategori ara…"
              aria-label="Fiyat listesinde ara"
              className="h-10 w-full rounded-sm border border-input bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Aramayı temizle"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>

          {/* Filtreler */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <SelectBox
              value={cat}
              onChange={setCat}
              ariaLabel="Kategori filtresi"
              placeholder="Tüm kategoriler"
              options={categories}
            />
            <SelectBox
              value={brand}
              onChange={setBrand}
              ariaLabel="Marka filtresi"
              placeholder="Tüm markalar"
              options={brands}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sıralama"
              className="col-span-2 h-10 rounded-sm border border-input bg-white px-3 text-sm text-ink-800 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring sm:col-span-1"
            >
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* İndir */}
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <FileSpreadsheet strokeWidth={1.75} />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPrinting(true)}>
              <Printer strokeWidth={1.75} />
              Yazdır
            </Button>
          </div>
        </div>

        {hasFilters ? (
          <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3 text-xs text-ink-500">
            <SlidersHorizontal className="size-3.5 text-ink-400" strokeWidth={1.75} />
            <span>{total} sonuç</span>
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 font-medium text-steel-600 hover:text-steel-700"
            >
              Filtreleri temizle
            </button>
          </div>
        ) : null}
      </div>

      {/* Meta */}
      <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center print:hidden">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-400">
          {total > 0 ? (
            <>
              {from}–{to} / {total} ürün
            </>
          ) : (
            "Sonuç yok"
          )}{" "}
          · TRY · Fiyatlara KDV dahil değildir
        </p>
        {total > 0 ? (
          <label className="flex items-center gap-2 text-xs text-ink-500">
            <span>Sayfa başına</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Sayfa başına ürün"
              className="h-8 rounded-sm border border-input bg-white px-2 text-sm text-ink-800 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {/* Tablo */}
      {total === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-md border border-dashed border-ink-200 bg-ink-50/50 py-16 text-center">
          <Inbox className="size-8 text-ink-300" strokeWidth={1.25} />
          <p className="text-sm text-ink-500">
            Aramanıza uygun ürün bulunamadı.
          </p>
          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Filtreleri temizle
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-md border border-ink-200">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-ink-50">
                <TableHead className="w-[150px]">SKU</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead className="hidden md:table-cell">Marka</TableHead>
                <TableHead className="hidden lg:table-cell">Kategori</TableHead>
                <TableHead className="text-center">Birim</TableHead>
                <TableHead className="text-right">Liste (KDV hariç)</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  KDV Dahil
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((r) => (
                <TableRow key={`${r.sku}-${r.name}`} className="even:bg-ink-50/40">
                  <TableCell className="font-mono text-xs uppercase tracking-wide text-ink-500">
                    {r.sku}
                  </TableCell>
                  <TableCell className="font-medium text-ink-900">
                    {r.name}
                  </TableCell>
                  <TableCell className="hidden text-ink-600 md:table-cell">
                    {r.brand}
                  </TableCell>
                  <TableCell className="hidden text-ink-600 lg:table-cell">
                    {r.category}
                  </TableCell>
                  <TableCell className="text-center text-ink-500">
                    {r.unit}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-ink-900 tnum">
                    {formatPrice(r.listPrice)}
                  </TableCell>
                  <TableCell className="hidden text-right text-ink-500 tnum sm:table-cell">
                    {formatPrice(r.grossPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sayfalama */}
      {pageCount > 1 ? (
        <nav
          aria-label="Sayfalama"
          className="mt-6 flex items-center justify-center gap-1 print:hidden"
        >
          <PagerBtn
            onClick={() => setPage(safePage - 1)}
            disabled={safePage <= 1}
            ariaLabel="Önceki sayfa"
          >
            <ChevronRight className="size-4 rotate-180" strokeWidth={1.75} />
          </PagerBtn>
          {pageWindow(safePage, pageCount).map((p, i) =>
            p === "…" ? (
              <span
                key={`gap-${i}`}
                className="grid size-9 place-items-center text-sm text-ink-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === safePage ? "page" : undefined}
                className={cn(
                  "grid size-9 place-items-center rounded-sm border text-sm font-medium tnum transition-colors",
                  p === safePage
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
                )}
              >
                {p}
              </button>
            ),
          )}
          <PagerBtn
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= pageCount}
            ariaLabel="Sonraki sayfa"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </PagerBtn>
        </nav>
      ) : null}
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        "h-10 rounded-sm border border-input bg-white px-3 text-sm focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        value ? "text-ink-800" : "text-ink-500",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o} className="text-ink-800">
          {o}
        </option>
      ))}
    </select>
  );
}

function PagerBtn({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="grid size-9 place-items-center rounded-sm border border-ink-200 text-ink-600 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:border-ink-100 disabled:text-ink-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
