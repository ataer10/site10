"use server";

import { createQuoteSchema, type CreateQuoteInput } from "@/lib/validation";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedProducts } from "@/lib/data/seed";
import { sendEmail, COMPANY_EMAIL } from "@/lib/email/client";
import {
  newQuoteToCompany,
  quoteReceivedToCustomer,
  type QuoteEmailItem,
} from "@/lib/email/templates";
import { getSettings } from "@/lib/data/settings";

type ResolvedItem = {
  productId: string | null;
  name: string;
  sku: string | null;
  qty: number;
  unit: string;
  listPrice: number;
  vatRate: number;
};

export type CreateQuoteResult =
  | {
      ok: true;
      quoteNumber: string;
      persisted: boolean;
      emailed: boolean;
    }
  | { ok: false; error: string };

/** Sepetten gelen kalemleri yetkili kaynaktan çözer; fiyatlar burada dondurulur. */
async function resolveItems(
  items: CreateQuoteInput["items"],
): Promise<ResolvedItem[]> {
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const slugs = items.map((i) => i.slug);
    const { data, error } = await admin
      .from("products")
      .select("id, slug, name, sku, list_price, vat_rate, unit")
      .in("slug", slugs);
    if (error) throw error;
    const bySlug = new Map((data ?? []).map((p) => [p.slug, p]));
    return items
      .map((i): ResolvedItem | null => {
        const p = bySlug.get(i.slug);
        if (!p) return null;
        return {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          qty: i.qty,
          unit: p.unit ?? "adet",
          listPrice: Number(p.list_price),
          vatRate: Number(p.vat_rate ?? 20),
        };
      })
      .filter((x): x is ResolvedItem => x !== null);
  }

  // Fallback: seed verisi
  const bySlug = new Map(seedProducts.map((p) => [p.slug, p]));
  return items
    .map((i): ResolvedItem | null => {
      const p = bySlug.get(i.slug);
      if (!p) return null;
      return {
        productId: null,
        name: p.name,
        sku: p.sku,
        qty: i.qty,
        unit: p.unit,
        listPrice: p.listPrice,
        vatRate: p.vatRate,
      };
    })
    .filter((x): x is ResolvedItem => x !== null);
}

function demoQuoteNumber(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `TKL-${year}-${n}`;
}

export async function createQuote(
  input: CreateQuoteInput,
): Promise<CreateQuoteResult> {
  // 1) Doğrula
  const parsed = createQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Form bilgileri geçersiz." };
  }
  const data = parsed.data;

  // 2) Kalemleri çöz + fiyatları dondur
  let items: ResolvedItem[];
  try {
    items = await resolveItems(data.items);
  } catch (err) {
    console.error("[createQuote] ürün çözümleme hatası:", err);
    return { ok: false, error: "Ürünler doğrulanamadı, lütfen tekrar deneyin." };
  }
  if (items.length === 0) {
    return { ok: false, error: "Geçerli ürün bulunamadı." };
  }

  // 3) Toplamlar (talep aşamasında iskonto yok; admin Faz 4'te uygular)
  const subtotal = round2(items.reduce((s, i) => s + i.listPrice * i.qty, 0));
  const vatTotal = round2(
    items.reduce((s, i) => s + i.listPrice * i.qty * (i.vatRate / 100), 0),
  );
  const grandTotal = round2(subtotal + vatTotal);

  // 4) Kaydet (admin varsa) ya da demo no üret
  let quoteNumber = demoQuoteNumber();
  let quoteId: string | null = null;
  let persisted = false;

  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { data: quote, error: qErr } = await admin
      .from("quotes")
      .insert({
        customer_name: data.customerName,
        company: data.company || null,
        email: data.email,
        phone: data.phone || null,
        note: data.note || null,
        status: "new",
        global_discount_rate: 0,
        subtotal,
        discount_total: 0,
        vat_total: vatTotal,
        grand_total: grandTotal,
      })
      .select("id, quote_number")
      .single();

    if (qErr || !quote) {
      console.error("[createQuote] quote insert hatası:", qErr);
      return { ok: false, error: "Teklif kaydedilemedi, lütfen tekrar deneyin." };
    }
    quoteId = quote.id;
    quoteNumber = quote.quote_number ?? quoteNumber;

    const { error: iErr } = await admin.from("quote_items").insert(
      items.map((it) => ({
        quote_id: quote.id,
        product_id: it.productId,
        product_name: it.name,
        sku: it.sku,
        qty: it.qty,
        list_price: it.listPrice,
        discount_rate: 0,
        vat_rate: it.vatRate,
      })),
    );
    if (iErr) {
      console.error("[createQuote] quote_items insert hatası:", iErr);
      return { ok: false, error: "Teklif kalemleri kaydedilemedi." };
    }
    persisted = true;
  }

  // 5) E-postalar (graceful)
  const emailItems: QuoteEmailItem[] = items.map((it) => ({
    name: it.name,
    sku: it.sku,
    qty: it.qty,
    unit: it.unit,
    listPrice: it.listPrice,
  }));
  const settings = await getSettings();
  const emailData = {
    quoteNumber,
    customerName: data.customerName,
    company: data.company,
    email: data.email,
    phone: data.phone,
    note: data.note,
    items: emailItems,
    subtotal,
    vatTotal,
    grandTotal,
    adminUrl: quoteId ? `${settings.url}/admin/teklifler/${quoteId}` : undefined,
  };

  let emailed = false;
  if (COMPANY_EMAIL) {
    const r = await sendEmail({
      to: COMPANY_EMAIL,
      replyTo: data.email,
      ...newQuoteToCompany(emailData, settings),
    });
    emailed = r.sent;
  }
  // Müşteriye onay
  await sendEmail({
    to: data.email,
    ...quoteReceivedToCustomer(emailData, settings),
  });

  return { ok: true, quoteNumber, persisted, emailed };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
