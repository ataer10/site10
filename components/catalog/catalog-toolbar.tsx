"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PARAM,
  SORT_OPTIONS,
  buildQuery,
  type SearchParamsRecord,
} from "@/lib/catalog-params";

export function CatalogToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current: SearchParamsRecord = Object.fromEntries(searchParams.entries());
  const sort = searchParams.get(PARAM.sort) ?? "name-asc";
  const initialQ = searchParams.get(PARAM.q) ?? "";
  // Varsayılan görünüm: liste. Izgara yalnız ?gorunum=izgara ile.
  const view = searchParams.get(PARAM.view) === "izgara" ? "izgara" : "liste";

  function setView(v: "izgara" | "liste") {
    router.push(
      `${pathname}${buildQuery(current, {
        [PARAM.view]: v === "izgara" ? "izgara" : null,
      })}`,
      { scroll: false },
    );
  }

  const [term, setTerm] = React.useState(initialQ);
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL dışarıdan değişirse (ör. temizle) input'u eşitle
  React.useEffect(() => {
    setTerm(searchParams.get(PARAM.q) ?? "");
  }, [searchParams]);

  function pushQuery(value: string) {
    router.push(
      `${pathname}${buildQuery(current, { [PARAM.q]: value || null, [PARAM.page]: null })}`,
      { scroll: false },
    );
  }

  function onTermChange(value: string) {
    setTerm(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => pushQuery(value), 350);
  }

  function onSortChange(value: string) {
    router.push(
      `${pathname}${buildQuery(current, { [PARAM.sort]: value, [PARAM.page]: null })}`,
      { scroll: false },
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Arama */}
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          strokeWidth={1.5}
        />
        <input
          type="search"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
          placeholder="Ürün adı veya SKU ara…"
          className="h-10 w-full rounded-sm border border-input bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
          aria-label="Ürün ara"
        />
        {term ? (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              pushQuery("");
            }}
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-ink-400 hover:text-ink-700"
            aria-label="Aramayı temizle"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="font-mono text-xs uppercase tracking-wide text-ink-400">
          {total} ürün
        </span>

        {/* Görünüm: ızgara / liste */}
        <div
          className="inline-flex shrink-0 overflow-hidden rounded-sm border border-input"
          role="group"
          aria-label="Görünüm"
        >
          <button
            type="button"
            onClick={() => setView("izgara")}
            aria-pressed={view === "izgara"}
            aria-label="Izgara görünüm"
            className={cn(
              "grid size-9 place-items-center transition-colors",
              view === "izgara"
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-50",
            )}
          >
            <LayoutGrid className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setView("liste")}
            aria-pressed={view === "liste"}
            aria-label="Liste görünüm"
            className={cn(
              "grid size-9 place-items-center border-l border-input transition-colors",
              view === "liste"
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-50",
            )}
          >
            <List className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-ink-500 sm:inline">Sırala</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 rounded-sm border border-input bg-white px-3 pr-8 text-sm text-ink-800 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
            aria-label="Sıralama"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
