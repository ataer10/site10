import Link from "next/link";
import { FileText, Package, ArrowRight, Inbox } from "lucide-react";
import { listQuotes, getQuoteStats } from "@/lib/data/admin";
import { QuoteStatusBadge } from "@/components/admin/quote-status";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, quotes] = await Promise.all([getQuoteStats(), listQuotes()]);
  const recent = quotes.slice(0, 6);

  const cards = [
    { label: "Toplam teklif", value: stats.total },
    { label: "Yeni", value: stats.new, accent: true },
    { label: "Teklif verildi", value: stats.quoted },
    { label: "Kapandı", value: stats.closed },
  ];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Panel
          </h1>
          <p className="mt-1 text-sm text-ink-500">Teklif kuyruğu ve özet.</p>
        </div>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-400">
              {c.label}
            </p>
            <p
              className={`mt-2 font-display text-3xl font-extrabold tracking-tight tnum ${
                c.accent && c.value > 0 ? "text-orange-600" : "text-ink-900"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Hızlı erişim */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/teklifler"
          className="group flex items-center justify-between rounded-md border border-ink-200 bg-white p-5 transition-colors hover:border-ink-300"
        >
          <span className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-sm bg-ink-900 text-white">
              <FileText className="size-5" strokeWidth={1.5} />
            </span>
            <span className="text-sm font-semibold text-ink-900">
              Teklifleri yönet
            </span>
          </span>
          <ArrowRight className="size-5 text-ink-300 group-hover:text-steel-600" strokeWidth={1.5} />
        </Link>
        <Link
          href="/admin/urunler"
          className="group flex items-center justify-between rounded-md border border-ink-200 bg-white p-5 transition-colors hover:border-ink-300"
        >
          <span className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-sm bg-ink-900 text-white">
              <Package className="size-5" strokeWidth={1.5} />
            </span>
            <span className="text-sm font-semibold text-ink-900">
              Ürünleri yönet
            </span>
          </span>
          <ArrowRight className="size-5 text-ink-300 group-hover:text-steel-600" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Son teklifler */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-ink-900">
          Son teklifler
        </h2>
        {recent.length === 0 ? (
          <EmptyQuotes />
        ) : (
          <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {recent.map((q) => (
                  <tr key={q.id} className="transition-colors hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/teklifler/${q.id}`}
                        className="font-mono text-xs font-medium text-steel-700 hover:underline"
                      >
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink-900">{q.customerName}</span>
                      {q.company ? (
                        <span className="block text-xs text-ink-400">{q.company}</span>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-ink-700 tnum sm:table-cell">
                      {q.grandTotal != null ? formatPrice(q.grandTotal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <QuoteStatusBadge status={q.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyQuotes() {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
      <Inbox className="size-8 text-ink-300" strokeWidth={1.5} />
      <p className="mt-3 text-sm text-ink-500">Henüz teklif talebi yok.</p>
    </div>
  );
}
