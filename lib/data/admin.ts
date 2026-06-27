import "server-only";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedProducts } from "@/lib/data/seed";
import { calcQuote } from "@/lib/quote-calc";

export const adminConfigured = isSupabaseAdminConfigured;

/* ------------------------------ Tipler ------------------------------ */

export type QuoteStatus = "new" | "quoted" | "closed";

export type AdminQuoteItem = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  qty: number;
  unit: string;
  listPrice: number;
  discountRate: number | null;
  vatRate: number;
  note: string | null;
};

export type AdminQuote = {
  id: string;
  quoteNumber: string;
  customerName: string;
  company: string | null;
  email: string;
  phone: string | null;
  note: string | null;
  status: QuoteStatus;
  globalDiscountRate: number;
  subtotal: number | null;
  discountTotal: number | null;
  vatTotal: number | null;
  grandTotal: number | null;
  validUntil: string | null;
  createdAt: string | null;
  itemCount?: number;
  items?: AdminQuoteItem[];
};

/* ----------------------------- Demo veri ----------------------------- */

function demoQuotes(): AdminQuote[] {
  const p = (slug: string) => seedProducts.find((x) => x.slug === slug)!;
  const mk = (
    id: string,
    no: string,
    name: string,
    company: string,
    email: string,
    status: QuoteStatus,
    items: { p: ReturnType<typeof p>; qty: number; disc?: number | null }[],
    daysAgo: number,
  ): AdminQuote => {
    const qi: AdminQuoteItem[] = items.map((it, i) => ({
      id: `${id}-i${i}`,
      productId: null,
      productName: it.p.name,
      sku: it.p.sku,
      qty: it.qty,
      unit: it.p.unit,
      listPrice: it.p.listPrice,
      discountRate: it.disc ?? null,
      vatRate: it.p.vatRate,
      note: null,
    }));
    const totals = calcQuote(
      qi.map((x) => ({
        listPrice: x.listPrice,
        qty: x.qty,
        vatRate: x.vatRate,
        discountRate: x.discountRate,
      })),
      0,
    );
    return {
      id,
      quoteNumber: no,
      customerName: name,
      company,
      email,
      phone: "+90 532 000 00 00",
      note: status === "new" ? "Termin önemli, en kısa sürede dönüş bekliyoruz." : null,
      status,
      globalDiscountRate: 0,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      vatTotal: totals.vatTotal,
      grandTotal: totals.grandTotal,
      validUntil: null,
      createdAt: `demo-${daysAgo}g önce`,
      itemCount: qi.length,
      items: qi,
    };
  };

  return [
    mk(
      "demo-1",
      "TKL-2026-0007",
      "Mehmet Yılmaz",
      "Yılmaz Mekanik Tesisat Ltd.",
      "mehmet@yilmazmekanik.com",
      "new",
      [
        { p: p("paslanmaz-kuresel-vana-dn50-3-parca"), qty: 6 },
        { p: p("cok-kademeli-pompa-cr5-12"), qty: 2 },
        { p: p("paslanmaz-dirsek-90-dn42"), qty: 40 },
      ],
      1,
    ),
    mk(
      "demo-2",
      "TKL-2026-0006",
      "Ayşe Demir",
      "Demir İnşaat A.Ş.",
      "satinalma@demirinsaat.com",
      "quoted",
      [
        { p: p("wafer-kelebek-vana-dn150"), qty: 4, disc: 12 },
        { p: p("gliserinli-manometre-0-16-bar-63"), qty: 10, disc: 10 },
      ],
      4,
    ),
  ];
}

/* ----------------------------- Teklifler ----------------------------- */

export async function listQuotes(status?: QuoteStatus): Promise<AdminQuote[]> {
  if (!isSupabaseAdminConfigured()) {
    const all = demoQuotes();
    return status ? all.filter((q) => q.status === status) : all;
  }
  const admin = createAdminClient();
  let query = admin
    .from("quotes")
    .select("*, quote_items(count)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<
    Record<string, unknown> & { quote_items?: { count: number }[] }
  >;
  return rows.map((q) => ({
    ...mapQuoteRow(q),
    itemCount: q.quote_items?.[0]?.count ?? 0,
  }));
}

export async function getQuote(id: string): Promise<AdminQuote | null> {
  if (!isSupabaseAdminConfigured()) {
    return demoQuotes().find((q) => q.id === id) ?? null;
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const row = data as unknown as Record<string, unknown> & {
    quote_items?: Array<Record<string, unknown>>;
  };
  const items = (row.quote_items ?? []) as Array<Record<string, unknown>>;
  return {
    ...mapQuoteRow(row),
    items: items.map(mapItemRow),
  };
}

export type SaveDiscountsInput = {
  globalDiscountRate: number;
  validUntil: string | null;
  items: { id: string; discountRate: number | null; note?: string | null }[];
};

export async function saveQuoteDiscounts(
  id: string,
  input: SaveDiscountsInput,
): Promise<{ ok: boolean; error?: string }> {
  const quote = await getQuote(id);
  if (!quote || !quote.items) return { ok: false, error: "Teklif bulunamadı." };

  // Kalem iskontolarını eşle
  const byId = new Map(input.items.map((i) => [i.id, i]));
  const calcItems = quote.items.map((it) => {
    const override = byId.get(it.id);
    return {
      listPrice: it.listPrice,
      qty: it.qty,
      vatRate: it.vatRate,
      discountRate: override ? override.discountRate : it.discountRate,
    };
  });
  const totals = calcQuote(calcItems, input.globalDiscountRate);

  if (!isSupabaseAdminConfigured()) {
    // demo: kalıcı değil ama akış başarılı
    return { ok: true };
  }

  const admin = createAdminClient();
  const { error: qErr } = await admin
    .from("quotes")
    .update({
      global_discount_rate: input.globalDiscountRate,
      valid_until: input.validUntil,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      vat_total: totals.vatTotal,
      grand_total: totals.grandTotal,
    })
    .eq("id", id);
  if (qErr) return { ok: false, error: qErr.message };

  for (const it of input.items) {
    const { error } = await admin
      .from("quote_items")
      .update({ discount_rate: it.discountRate, note: it.note ?? null })
      .eq("id", it.id);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return { ok: true };
  const admin = createAdminClient();
  const { error } = await admin.from("quotes").update({ status }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ------------------------------ Eşleme ------------------------------ */

function mapQuoteRow(q: Record<string, unknown>): AdminQuote {
  return {
    id: String(q.id),
    quoteNumber: (q.quote_number as string) ?? "",
    customerName: (q.customer_name as string) ?? "",
    company: (q.company as string) ?? null,
    email: (q.email as string) ?? "",
    phone: (q.phone as string) ?? null,
    note: (q.note as string) ?? null,
    status: ((q.status as string) ?? "new") as QuoteStatus,
    globalDiscountRate: Number(q.global_discount_rate ?? 0),
    subtotal: q.subtotal != null ? Number(q.subtotal) : null,
    discountTotal: q.discount_total != null ? Number(q.discount_total) : null,
    vatTotal: q.vat_total != null ? Number(q.vat_total) : null,
    grandTotal: q.grand_total != null ? Number(q.grand_total) : null,
    validUntil: (q.valid_until as string) ?? null,
    createdAt: (q.created_at as string) ?? null,
  };
}

function mapItemRow(it: Record<string, unknown>): AdminQuoteItem {
  return {
    id: String(it.id),
    productId: (it.product_id as string) ?? null,
    productName: (it.product_name as string) ?? "",
    sku: (it.sku as string) ?? null,
    qty: Number(it.qty ?? 1),
    unit: (it.unit as string) ?? "adet",
    listPrice: Number(it.list_price ?? 0),
    discountRate: it.discount_rate != null ? Number(it.discount_rate) : null,
    vatRate: Number(it.vat_rate ?? 20),
    note: (it.note as string) ?? null,
  };
}

/* ---------------------- Özet (dashboard) ---------------------- */

export async function getQuoteStats(): Promise<{
  total: number;
  new: number;
  quoted: number;
  closed: number;
}> {
  const all = await listQuotes();
  return {
    total: all.length,
    new: all.filter((q) => q.status === "new").length,
    quoted: all.filter((q) => q.status === "quoted").length,
    closed: all.filter((q) => q.status === "closed").length,
  };
}
