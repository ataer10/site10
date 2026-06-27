import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, StickyNote } from "lucide-react";
import { getQuote, adminConfigured } from "@/lib/data/admin";
import { QuoteStatusBadge } from "@/components/admin/quote-status";
import { QuoteBuilder, type BuilderItem } from "@/components/admin/quote-builder";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const items: BuilderItem[] = (quote.items ?? []).map((it) => ({
    id: it.id,
    productName: it.productName,
    sku: it.sku,
    qty: it.qty,
    unit: it.unit,
    listPrice: it.listPrice,
    vatRate: it.vatRate,
    discountRate: it.discountRate,
  }));

  return (
    <div>
      <Link
        href="/admin/teklifler"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Tekliflere dön
      </Link>

      {/* Başlık */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
              {quote.quoteNumber}
            </h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">{quote.createdAt}</p>
        </div>
      </div>

      {/* Müşteri */}
      <div className="mb-6 grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
        <Info icon={Building2} label="Müşteri" value={quote.customerName} sub={quote.company} />
        <Info icon={Mail} label="E-posta" value={quote.email} />
        <Info icon={Phone} label="Telefon" value={quote.phone ?? "—"} />
        <Info icon={StickyNote} label="Not" value={quote.note ?? "—"} />
      </div>

      {/* İskonto oluşturucu */}
      <QuoteBuilder
        quoteId={quote.id}
        status={quote.status}
        initialGlobal={quote.globalDiscountRate}
        initialValidUntil={quote.validUntil}
        items={items}
        demo={!adminConfigured()}
      />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-1.5 text-ink-400">
        <Icon className="size-3.5" strokeWidth={1.75} />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-sm font-medium text-ink-900">{value}</p>
      {sub ? <p className="truncate text-xs text-ink-400">{sub}</p> : null}
    </div>
  );
}
