import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { listQuotes, type QuoteStatus } from "@/lib/data/admin";
import { QuoteStatusBadge } from "@/components/admin/quote-status";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SearchParamsRecord } from "@/lib/catalog-params";

const TABS: { key: string; label: string; status?: QuoteStatus }[] = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni", status: "new" },
  { key: "quoted", label: "Teklif verildi", status: "quoted" },
  { key: "closed", label: "Kapandı", status: "closed" },
];

export default async function TekliflerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const sp = await searchParams;
  const active = typeof sp.durum === "string" ? sp.durum : "all";
  const status = TABS.find((t) => t.key === active)?.status;
  const quotes = await listQuotes(status);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Teklifler
      </h1>

      {/* Sekmeler */}
      <div className="mb-5 flex gap-1 border-b border-ink-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/teklifler" : `/admin/teklifler?durum=${t.key}`}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active === t.key
                ? "border-steel-500 text-ink-900"
                : "border-transparent text-ink-500 hover:text-ink-800",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <Inbox className="size-8 text-ink-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-ink-500">Bu durumda teklif yok.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Teklif No
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Müşteri
                </th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">
                  Tutar
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Durum
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {quotes.map((q) => (
                <tr key={q.id} className="group transition-colors hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/teklifler/${q.id}`}
                      className="font-mono text-xs font-medium text-steel-700 hover:underline"
                    >
                      {q.quoteNumber}
                    </Link>
                    <span className="block text-[11px] text-ink-400">{q.createdAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink-900">{q.customerName}</span>
                    {q.company ? (
                      <span className="block text-xs text-ink-400">{q.company}</span>
                    ) : null}
                    <span className="block text-[11px] text-ink-400">
                      {q.itemCount ?? 0} kalem
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right font-semibold text-ink-900 tnum sm:table-cell">
                    {q.grandTotal != null ? formatPrice(q.grandTotal) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <QuoteStatusBadge status={q.status} />
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Link
                      href={`/admin/teklifler/${q.id}`}
                      className="inline-grid size-7 place-items-center rounded-sm text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      aria-label="Aç"
                    >
                      <ChevronRight className="size-4" strokeWidth={1.75} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
