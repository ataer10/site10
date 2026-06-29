"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CornerDownLeft,
  Loader2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Package,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PARAM } from "@/lib/catalog-params";

type Result = {
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  price: number;
};

/**
 * Global ürün arama paleti. Cmd/Ctrl+K veya `/` ile açılır; `/api/search`'ten
 * debounce'lu typeahead sonuç gösterir, klavyeyle gezilir. Header'a gömülür.
 */
export function SearchPalette({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Global kısayollar: Cmd/Ctrl+K ve "/"
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing =
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Açılınca odak + sayfa kaydırma kilidi
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Debounce'lu sorgu
  React.useEffect(() => {
    if (!open) return;
    const needle = q.trim();
    if (needle.length < 2) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(needle)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { items?: Result[]; total?: number };
        setResults(data.items ?? []);
        setTotal(data.total ?? 0);
        setActive(0);
      } catch {
        /* iptal edildi */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQ("");
    setResults([]);
    setActive(0);
  }, []);

  const goAll = React.useCallback(() => {
    const needle = q.trim();
    if (needle.length < 2) return;
    close();
    router.push(`/urunler?${PARAM.q}=${encodeURIComponent(needle)}`);
  }, [q, close, router]);

  const goTo = React.useCallback(
    (slug: string) => {
      close();
      router.push(`/urunler/${slug}`);
    },
    [close, router],
  );

  // active === results.length → "tümünü gör" satırı
  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    const max = results.length; // son indeks = tümünü gör
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, max));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length && active < results.length) goTo(results[active].slug);
      else goAll();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const showAllRow = q.trim().length >= 2;

  return (
    <>
      {/* Tetikleyici */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ürün ara"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-sm border px-2.5 text-sm font-medium transition-colors sm:px-3",
          tone === "light"
            ? "border-white/20 text-white/85 hover:border-white/40 hover:bg-white/10"
            : "border-ink-200 text-ink-500 hover:border-ink-300 hover:text-ink-800",
        )}
      >
        <Search className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="hidden lg:inline">Ara</span>
        <kbd
          className={cn(
            "ml-1 hidden rounded-[3px] border px-1.5 py-0.5 font-mono text-[10px] font-medium lg:inline",
            tone === "light"
              ? "border-white/20 text-white/60"
              : "border-ink-200 text-ink-400",
          )}
        >
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ürün arama"
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
        >
          <button
            type="button"
            aria-label="Aramayı kapat"
            onClick={close}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-ink-200 bg-white shadow-raised">
            {/* Girdi */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-4">
              {loading ? (
                <Loader2 className="size-5 shrink-0 animate-spin text-steel-500" strokeWidth={1.75} />
              ) : (
                <Search className="size-5 shrink-0 text-ink-400" strokeWidth={1.75} />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Ürün, SKU veya marka ara…"
                aria-label="Arama terimi"
                className="h-14 w-full bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden shrink-0 rounded-[3px] border border-ink-200 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:inline">
                ESC
              </kbd>
            </div>

            {/* Sonuçlar */}
            <div className="max-h-[min(60vh,26rem)] overflow-y-auto py-2">
              {q.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-400">
                  Aramak için en az 2 karakter yazın.
                </p>
              ) : results.length === 0 && !loading ? (
                <p className="px-4 py-8 text-center text-sm text-ink-400">
                  “{q.trim()}” için sonuç bulunamadı.
                </p>
              ) : (
                <ul className="px-2">
                  {results.map((r, i) => (
                    <li key={r.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goTo(r.slug)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-sm px-2 py-2.5 text-left transition-colors",
                          active === i ? "bg-ink-100" : "hover:bg-ink-50",
                        )}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-ink-200 bg-ink-50 text-ink-400">
                          <Package className="size-4" strokeWidth={1.5} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink-900">
                            {r.name}
                          </span>
                          <span className="block truncate font-mono text-[11px] uppercase tracking-wide text-ink-400">
                            {[r.sku, r.brand, r.category].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-ink-800 tnum">
                          {formatPrice(r.price)}
                        </span>
                      </button>
                    </li>
                  ))}

                  {showAllRow ? (
                    <li>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(results.length)}
                        onClick={goAll}
                        className={cn(
                          "mt-1 flex w-full items-center justify-between gap-3 rounded-sm border-t border-ink-100 px-2 py-2.5 text-left transition-colors",
                          active === results.length ? "bg-ink-100" : "hover:bg-ink-50",
                        )}
                      >
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-steel-600">
                          <ArrowRight className="size-4" strokeWidth={1.75} />
                          “{q.trim()}” için tüm sonuçlar
                          {total > results.length ? (
                            <span className="font-mono text-xs text-ink-400">
                              ({total})
                            </span>
                          ) : null}
                        </span>
                        <CornerDownLeft className="size-4 text-ink-400" strokeWidth={1.5} />
                      </button>
                    </li>
                  ) : null}
                </ul>
              )}
            </div>

            {/* Alt ipucu çubuğu */}
            <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50 px-4 py-2.5 text-[11px] text-ink-400">
              <span className="inline-flex items-center gap-1.5 font-mono">
                <ArrowUp className="size-3" /> <ArrowDown className="size-3" /> gezin
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono">
                <CornerDownLeft className="size-3" /> aç · ESC kapat
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
