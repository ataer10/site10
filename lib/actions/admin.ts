"use server";

import { revalidatePath } from "next/cache";
import {
  saveQuoteDiscounts,
  setQuoteStatus,
  getQuote,
  type SaveDiscountsInput,
  type QuoteStatus,
} from "@/lib/data/admin";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  type ProductInput,
} from "@/lib/data/admin-products";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderQuotePdf } from "@/lib/pdf/quote-pdf";
import { calcQuote } from "@/lib/quote-calc";
import { sendEmail, COMPANY_EMAIL } from "@/lib/email/client";
import { quoteReadyToCustomer } from "@/lib/email/templates";
import { slugify } from "@/lib/slug";

/* ----------------------------- Teklif ----------------------------- */

export async function saveDiscountsAction(
  quoteId: string,
  input: SaveDiscountsInput,
) {
  const res = await saveQuoteDiscounts(quoteId, input);
  if (res.ok) revalidatePath(`/admin/teklifler/${quoteId}`);
  return res;
}

export async function setStatusAction(quoteId: string, status: QuoteStatus) {
  const res = await setQuoteStatus(quoteId, status);
  if (res.ok) {
    revalidatePath(`/admin/teklifler/${quoteId}`);
    revalidatePath(`/admin/teklifler`);
  }
  return res;
}

export type SendQuoteResult =
  | { ok: true; emailed: boolean; demo: boolean }
  | { ok: false; error: string };

export async function sendQuoteToCustomerAction(
  quoteId: string,
): Promise<SendQuoteResult> {
  const quote = await getQuote(quoteId);
  if (!quote) return { ok: false, error: "Teklif bulunamadı." };

  // PDF üret
  let pdf: Buffer;
  try {
    pdf = await renderQuotePdf(quote);
  } catch (err) {
    console.error("[sendQuote] PDF hatası:", err);
    return { ok: false, error: "PDF oluşturulamadı." };
  }

  const totals = calcQuote(
    (quote.items ?? []).map((it) => ({
      listPrice: it.listPrice,
      qty: it.qty,
      vatRate: it.vatRate,
      discountRate: it.discountRate,
    })),
    quote.globalDiscountRate,
  );

  const mail = quoteReadyToCustomer({
    quoteNumber: quote.quoteNumber,
    customerName: quote.customerName,
    grandTotal: totals.grandTotal,
    validUntil: quote.validUntil,
  });
  const r = await sendEmail({
    to: quote.email,
    replyTo: COMPANY_EMAIL,
    subject: mail.subject,
    html: mail.html,
    attachments: [{ filename: `${quote.quoteNumber}.pdf`, content: pdf }],
  });

  // Durumu 'quoted' yap
  await setQuoteStatus(quoteId, "quoted");
  revalidatePath(`/admin/teklifler/${quoteId}`);
  revalidatePath(`/admin/teklifler`);

  return { ok: true, emailed: r.sent, demo: !isSupabaseAdminConfigured() };
}

/* ----------------------------- Ürünler ----------------------------- */

export async function saveProductAction(
  id: string | null,
  input: ProductInput,
) {
  const res = id ? await updateProduct(id, input) : await createProduct(input);
  if (res.ok) {
    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");
  }
  return res;
}

export async function deleteProductAction(id: string) {
  const res = await deleteProduct(id);
  if (res.ok) {
    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");
  }
  return res;
}

export async function importProductsAction(rows: Record<string, string>[]) {
  const res = await importProducts(rows);
  if (res.ok) {
    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");
  }
  return res;
}

/* -------------------------- Görsel yükleme -------------------------- */

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadProductImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya seçilmedi." };
  }
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: "Görsel yükleme için Supabase yapılandırılmalı (demo modu).",
    };
  }
  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${slugify(file.name.replace(/\.[^.]+$/, "")) || "urun"}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from("product-images")
    .upload(key, buffer, { contentType: file.type, upsert: true });
  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from("product-images").getPublicUrl(key);
  return { ok: true, url: data.publicUrl };
}
