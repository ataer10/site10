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
import {
  createBrand,
  updateBrand,
  deleteBrand,
  type BrandInput,
} from "@/lib/data/admin-brands";
import {
  createCatalog,
  updateCatalog,
  deleteCatalog,
  type CatalogInput,
} from "@/lib/data/admin-catalogs";
import { updateSettings, type SettingsInput } from "@/lib/data/settings";
import { updateHeroSlides, type HeroSlideInput } from "@/lib/data/hero";
import { validateHeroImage } from "@/lib/hero-image";
import { imageSize } from "@/lib/image-size";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderQuotePdf } from "@/lib/pdf/quote-pdf";
import { calcQuote } from "@/lib/quote-calc";
import { sendEmail, COMPANY_EMAIL } from "@/lib/email/client";
import { quoteReadyToCustomer } from "@/lib/email/templates";
import { getSettings } from "@/lib/data/settings";
import { getEmailTemplates } from "@/lib/data/email-templates";
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

  const settings = await getSettings();
  const templates = await getEmailTemplates();
  const mail = quoteReadyToCustomer(
    {
      quoteNumber: quote.quoteNumber,
      customerName: quote.customerName,
      grandTotal: totals.grandTotal,
      validUntil: quote.validUntil,
    },
    settings,
    templates.quoteReady,
  );
  const r = await sendEmail({
    to: quote.email,
    replyTo: settings.email || COMPANY_EMAIL,
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
    revalidatePath("/admin/fiyat-listesi");
    revalidatePath("/urunler");
    revalidatePath("/fiyat-listesi");
  }
  return res;
}

/** Fiyat Listesi sayfası — yalnız liste fiyatlarını toplu günceller. */
export async function updateProductPricesAction(
  updates: { id: string; listPrice: number }[],
): Promise<{ ok: boolean; updated: number; demo?: boolean; error?: string }> {
  const valid = updates.filter(
    (u) => u.id && Number.isFinite(u.listPrice) && u.listPrice >= 0,
  );
  if (valid.length === 0) return { ok: true, updated: 0 };

  if (!isSupabaseAdminConfigured()) {
    return { ok: true, updated: valid.length, demo: true };
  }

  const admin = createAdminClient();
  const results = await Promise.all(
    valid.map((u) =>
      admin
        .from("products")
        .update({ list_price: u.listPrice })
        .eq("id", u.id)
        .then((r) => !r.error),
    ),
  );
  const updated = results.filter(Boolean).length;

  revalidatePath("/admin/fiyat-listesi");
  revalidatePath("/admin/urunler");
  revalidatePath("/fiyat-listesi");
  revalidatePath("/urunler");

  if (updated < valid.length) {
    return {
      ok: false,
      updated,
      error: `${valid.length - updated} satır güncellenemedi.`,
    };
  }
  return { ok: true, updated };
}

/* ------------------------------ Markalar ------------------------------ */

export async function saveBrandAction(id: string | null, input: BrandInput) {
  const res = id ? await updateBrand(id, input) : await createBrand(input);
  if (res.ok) {
    revalidatePath("/admin/markalar");
    revalidatePath("/markalar");
  }
  return res;
}

export async function deleteBrandAction(id: string) {
  const res = await deleteBrand(id);
  if (res.ok) {
    revalidatePath("/admin/markalar");
    revalidatePath("/markalar");
  }
  return res;
}

/* ------------------------------ Kataloglar ------------------------------ */

export async function saveCatalogAction(
  id: string | null,
  input: CatalogInput,
) {
  const res = id ? await updateCatalog(id, input) : await createCatalog(input);
  if (res.ok) {
    revalidatePath("/admin/kataloglar");
    revalidatePath("/kataloglar");
  }
  return res;
}

export async function deleteCatalogAction(id: string) {
  const res = await deleteCatalog(id);
  if (res.ok) {
    revalidatePath("/admin/kataloglar");
    revalidatePath("/kataloglar");
  }
  return res;
}

/** Katalog PDF / kapak yükleme — catalogs bucket. */
export async function uploadCatalogFileAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya seçilmedi." };
  }
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: "Yükleme için Supabase yapılandırılmalı (demo)." };
  }
  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const key = `${slugify(file.name.replace(/\.[^.]+$/, "")) || "katalog"}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from("catalogs")
    .upload(key, buffer, { contentType: file.type, upsert: true });
  if (error) return { ok: false, error: error.message };
  const { data } = admin.storage.from("catalogs").getPublicUrl(key);
  return { ok: true, url: data.publicUrl };
}

/* ------------------------------ Ayarlar ------------------------------ */

export async function saveSettingsAction(input: SettingsInput) {
  const res = await updateSettings(input);
  if (res.ok) {
    // Header/footer/iletişim/PDF her yerde güncellensin
    revalidatePath("/", "layout");
  }
  return res;
}

/* ------------------------------- Hero ------------------------------- */

export async function saveHeroAction(slides: HeroSlideInput[]) {
  const res = await updateHeroSlides(slides);
  if (res.ok) {
    // Anasayfa hero'su yeniden üretilsin
    revalidatePath("/", "layout");
  }
  return res;
}

/**
 * Hero görseli yükleme — site-assets bucket. Format + boyut + ölçü (server'da
 * header'dan okunan gerçek genişlik/yükseklik) sıkı doğrulanır; geçmezse reddedilir.
 */
export async function uploadHeroImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya seçilmedi." };
  }
  // 1) Format + boyut (ölçüden bağımsız ön denetim)
  const pre = validateHeroImage({ type: file.type, size: file.size });
  if (pre) return { ok: false, error: pre };

  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: "Görsel yükleme için Supabase yapılandırılmalı (demo modu).",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 2) Gerçek ölçüyü header'dan oku ve doğrula (kullanıcı atlatamasın)
  const dim = imageSize(buffer);
  if (!dim) {
    return {
      ok: false,
      error: "Görsel çözümlenemedi (bozuk dosya ya da desteklenmeyen biçim).",
    };
  }
  const dimErr = validateHeroImage({
    type: file.type,
    size: file.size,
    width: dim.width,
    height: dim.height,
  });
  if (dimErr) return { ok: false, error: dimErr };

  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `hero/${slugify(file.name.replace(/\.[^.]+$/, "")) || "hero"}-${Date.now()}.${ext}`;
  const { error } = await admin.storage
    .from("site-assets")
    .upload(key, buffer, { contentType: file.type, upsert: true });
  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from("site-assets").getPublicUrl(key);
  return { ok: true, url: data.publicUrl, width: dim.width, height: dim.height };
}

/* -------------------------- Görsel yükleme -------------------------- */

export type UploadResult =
  | { ok: true; url: string; width?: number; height?: number }
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

/** Marka logo/katalog yükleme — brand-assets bucket. */
export async function uploadBrandAssetAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya seçilmedi." };
  }
  if (!isSupabaseAdminConfigured()) {
    return { ok: false, error: "Yükleme için Supabase yapılandırılmalı (demo)." };
  }
  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const key = `${slugify(file.name.replace(/\.[^.]+$/, "")) || "marka"}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from("brand-assets")
    .upload(key, buffer, { contentType: file.type, upsert: true });
  if (error) return { ok: false, error: error.message };
  const { data } = admin.storage.from("brand-assets").getPublicUrl(key);
  return { ok: true, url: data.publicUrl };
}
