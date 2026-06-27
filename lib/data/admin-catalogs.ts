import "server-only";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCatalogs } from "@/lib/data/catalogs";

export type AdminCatalog = {
  id: string;
  title: string;
  brandId: string | null;
  brandName: string | null;
  pdfUrl: string | null;
  coverUrl: string | null;
  year: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogInput = {
  title: string;
  brandId: string | null;
  pdfUrl: string | null;
  coverUrl: string | null;
  year: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function listAdminCatalogs(): Promise<AdminCatalog[]> {
  if (!isSupabaseAdminConfigured()) {
    const demo = await getCatalogs();
    return demo.map((c) => ({
      id: c.id,
      title: c.title,
      brandId: c.brandSlug,
      brandName: c.brandName,
      pdfUrl: c.pdfUrl,
      coverUrl: c.coverUrl,
      year: c.year,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: true,
    }));
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("catalogs")
    .select("*, brand:brands(name)")
    .order("sort_order");
  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<
    Record<string, unknown> & { brand: { name: string } | null }
  >;
  return rows.map((c) => ({
    id: String(c.id),
    title: c.title as string,
    brandId: (c.brand_id as string) ?? null,
    brandName: c.brand?.name ?? null,
    pdfUrl: (c.pdf_url as string) ?? null,
    coverUrl: (c.cover_url as string) ?? null,
    year: (c.year as string) ?? null,
    description: (c.description as string) ?? null,
    sortOrder: Number(c.sort_order ?? 0),
    isActive: Boolean(c.is_active),
  }));
}

export async function getAdminCatalog(id: string): Promise<AdminCatalog | null> {
  const all = await listAdminCatalogs();
  return all.find((c) => c.id === id) ?? null;
}

const DEMO = { ok: true as const, demo: true };

export async function createCatalog(
  input: CatalogInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin.from("catalogs").insert({
    title: input.title,
    brand_id: input.brandId,
    pdf_url: input.pdfUrl,
    cover_url: input.coverUrl,
    year: input.year,
    description: input.description,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function updateCatalog(
  id: string,
  input: CatalogInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin
    .from("catalogs")
    .update({
      title: input.title,
      brand_id: input.brandId,
      pdf_url: input.pdfUrl,
      cover_url: input.coverUrl,
      year: input.year,
      description: input.description,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteCatalog(
  id: string,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin.from("catalogs").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
