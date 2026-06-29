"use client";

import * as React from "react";
import {
  FileText,
  FileDown,
  Search,
  X,
  Library,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Catalog } from "@/lib/data/catalogs";

type BrandFacet = { key: string; label: string; count: number };
type View = "list" | "grid";

export function CatalogLibrary({ catalogs }: { catalogs: Catalog[] }) {
  const [query, setQuery] = React.useState("");
  const [brand, setBrand] = React.useState("all");
  const [view, setView] = React.useState<View>("list");

  const facets = React.useMemo<BrandFacet[]>(() => {
    const map = new Map<string, number>();
    for (const c of catalogs) {
      const key = c.brandName ?? "Genel";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "tr"))
      .map(([label, count]) => ({ key: label, label, count }));
  }, [catalogs]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return catalogs.filter((c) => {
      if (brand !== "all" && (c.brandName ?? "Genel") !== brand) return false;
      if (!q) return true;
      return (
        c.title.toLocaleLowerCase("tr").includes(q) ||
        (c.brandName ?? "").toLocaleLowerCase("tr").includes(q) ||
        (c.year ?? "").includes(q)
      );
    });
  }, [catalogs, brand, query]);

  return (
    <div>
      {/* Araç çubuğu */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" strokeWidth={1.5} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Katalog veya marka ara…"
              className="h-10 w-full rounded-sm border border-input bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
                aria-label="Aramayı temizle"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-400">
              {filtered.length} katalog
            </span>
            {/* Görünüm geçişi */}
            <div className="inline-flex rounded-sm border border-ink-200 p-0.5">
              <ViewBtn active={view === "list"} onClick={() => setView("list")} label="Liste">
                <List className="size-4" strokeWidth={1.75} />
              </ViewBtn>
              <ViewBtn active={view === "grid"} onClick={() => setView("grid")} label="Izgara">
                <LayoutGrid className="size-4" strokeWidth={1.75} />
              </ViewBtn>
            </div>
          </div>
        </div>

        {/* Marka filtre çipleri */}
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          <Chip active={brand === "all"} onClick={() => setBrand("all")} label="Tümü" count={catalogs.length} />
          {facets.map((f) => (
            <Chip key={f.key} active={brand === f.key} onClick={() => setBrand(f.key)} label={f.label} count={f.count} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-ink-50 px-6 py-20 text-center">
          <Library className="size-8 text-ink-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-ink-500">Eşleşen katalog bulunamadı.</p>
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {filtered.map((c) => (
            <CatalogRow key={c.id} catalog={c} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((c) => (
            <CatalogCard key={c.id} catalog={c} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Liste satırı ------------------------------- */

function CatalogRow({ catalog }: { catalog: Catalog }) {
  const hasPdf = Boolean(catalog.pdfUrl);
  const brandName = catalog.brandName ?? "Genel";
  const cls =
    "group flex items-center gap-4 rounded-md border border-ink-200 bg-white p-3 transition-colors hover:border-ink-300 hover:bg-ink-50";
  const inner = (
    <>
      {/* Mini kapak */}
      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-sm bg-ink-900">
        {catalog.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={catalog.coverUrl} alt="" className="size-full object-cover" />
        ) : (
          <>
            <span className="absolute inset-0 bg-grid opacity-10" aria-hidden />
            <FileText className="relative size-6 text-white/70" strokeWidth={1.25} />
          </>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[10px] uppercase tracking-wide text-steel-600">
            {brandName}
          </span>
          {catalog.year ? (
            <span className="shrink-0 rounded-sm bg-ink-100 px-1.5 py-px font-mono text-[10px] font-medium text-ink-500">
              {catalog.year}
            </span>
          ) : null}
        </div>
        <h3 className="truncate text-sm font-semibold text-ink-900">{catalog.title}</h3>
        {catalog.description ? (
          <p className="truncate text-xs text-ink-400">{catalog.description}</p>
        ) : null}
      </div>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-medium",
          hasPdf
            ? "bg-ink-900 text-white group-hover:bg-ink-800"
            : "border border-ink-200 text-ink-400",
        )}
      >
        {hasPdf ? <FileDown className="size-3.5" strokeWidth={1.75} /> : <FileText className="size-3.5" strokeWidth={1.5} />}
        <span className="hidden sm:inline">{hasPdf ? "İndir" : "Yakında"}</span>
      </span>
    </>
  );
  return hasPdf ? (
    <a href={catalog.pdfUrl!} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cn(cls, "cursor-default")}>{inner}</div>
  );
}

/* -------------------------------- Izgara kartı -------------------------------- */

function CatalogCard({ catalog }: { catalog: Catalog }) {
  const hasPdf = Boolean(catalog.pdfUrl);
  const brandName = catalog.brandName ?? "Genel";
  const cls =
    "group flex flex-col overflow-hidden rounded-md border border-ink-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-raised";
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-900">
        {catalog.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={catalog.coverUrl} alt={catalog.title} className="size-full object-cover" />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid opacity-[0.07]" aria-hidden />
            <span className="absolute left-3 top-3 h-0.5 w-7 bg-steel-500" aria-hidden />
            <span className="absolute left-3 right-3 top-5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-steel-300">
              {brandName}
            </span>
            <FileText className="absolute -bottom-2 -right-2 size-20 text-white/[0.06]" strokeWidth={0.75} aria-hidden />
            <span className="absolute bottom-3 left-3 font-display text-xl font-extrabold leading-none text-white/90 tnum">
              {catalog.year ?? ""}
            </span>
            <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">
              Katalog
            </span>
          </div>
        )}
        {catalog.coverUrl && catalog.year ? (
          <span className="absolute right-2 top-2 rounded-sm bg-ink-900/85 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
            {catalog.year}
          </span>
        ) : null}
        {hasPdf ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/0 opacity-0 transition-all duration-200 group-hover:bg-ink-900/35 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-raised">
              <FileDown className="size-3.5" strokeWidth={1.75} />
              PDF aç
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <span className="font-mono text-[10px] uppercase tracking-wide text-steel-600">
          {brandName}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900">
          {catalog.title}
        </h3>
        <span
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-medium",
            hasPdf ? "text-steel-600" : "text-ink-400",
          )}
        >
          {hasPdf ? (
            <><FileDown className="size-3.5" strokeWidth={1.75} /> PDF indir</>
          ) : (
            <><FileText className="size-3.5" strokeWidth={1.5} /> PDF yakında</>
          )}
        </span>
      </div>
    </>
  );
  return hasPdf ? (
    <a href={catalog.pdfUrl!} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cn(cls, "cursor-default")}>{inner}</div>
  );
}

/* --------------------------------- yardımcılar -------------------------------- */

function Chip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-ink-900 bg-ink-900 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
      )}
    >
      {label}
      <span className="tnum text-xs text-ink-400">{count}</span>
    </button>
  );
}

function ViewBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-8 place-items-center rounded-sm transition-colors",
        active ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100",
      )}
    >
      {children}
    </button>
  );
}
