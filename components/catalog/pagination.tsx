import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARAM, buildQuery, type SearchParamsRecord } from "@/lib/catalog-params";

/** Sayfa numarası penceresi (ör. 1 … 4 5 6 … 12). */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7)
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}

export function Pagination({
  page,
  pageCount,
  searchParams,
  basePath = "/urunler",
}: {
  page: number;
  pageCount: number;
  searchParams: SearchParamsRecord;
  basePath?: string;
}) {
  if (pageCount <= 1) return null;
  const href = (n: number) =>
    `${basePath}${buildQuery(searchParams, { [PARAM.page]: n === 1 ? null : n })}`;

  return (
    <nav
      aria-label="Sayfalama"
      className="mt-10 flex items-center justify-center gap-1"
    >
      <PagerLink
        href={href(page - 1)}
        disabled={page <= 1}
        ariaLabel="Önceki sayfa"
      >
        <ChevronRight className="size-4 rotate-180" strokeWidth={1.75} />
      </PagerLink>

      {pageWindow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="grid size-9 place-items-center text-sm text-ink-400"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid size-9 place-items-center rounded-sm border text-sm font-medium tnum transition-colors",
              p === page
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <PagerLink
        href={href(page + 1)}
        disabled={page >= pageCount}
        ariaLabel="Sonraki sayfa"
      >
        <ChevronRight className="size-4" strokeWidth={1.75} />
      </PagerLink>
    </nav>
  );
}

function PagerLink({
  href,
  disabled,
  ariaLabel,
  children,
}: {
  href: string;
  disabled: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        aria-label={ariaLabel}
        className="grid size-9 cursor-not-allowed place-items-center rounded-sm border border-ink-100 text-ink-300"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="grid size-9 place-items-center rounded-sm border border-ink-200 text-ink-600 transition-colors hover:border-ink-300 hover:bg-ink-50"
    >
      {children}
    </Link>
  );
}
