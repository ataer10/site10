import "server-only";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedBrands, seedProducts } from "@/lib/data/seed";
import { slugify } from "@/lib/slug";

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  catalogPdfUrl: string | null;
  sortOrder: number;
  productCount: number;
};

export type BrandInput = {
  name: string;
  slug: string;
  logoUrl: string | null;
  catalogPdfUrl: string | null;
  sortOrder: number;
};

export async function listAdminBrands(): Promise<AdminBrand[]> {
  if (!isSupabaseAdminConfigured()) {
    const counts = new Map<string, number>();
    for (const p of seedProducts)
      counts.set(p.brandSlug, (counts.get(p.brandSlug) ?? 0) + 1);
    return seedBrands.map((b) => ({
      id: b.slug,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      catalogPdfUrl: b.catalogPdfUrl,
      sortOrder: b.sortOrder,
      productCount: counts.get(b.slug) ?? 0,
    }));
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("brands")
    .select("*, products(count)")
    .order("sort_order");
  if (error) throw error;
  const rows = (data ?? []) as unknown as Array<
    Record<string, unknown> & { products?: { count: number }[] }
  >;
  return rows.map((b) => ({
    id: String(b.id),
    name: b.name as string,
    slug: b.slug as string,
    logoUrl: (b.logo_url as string) ?? null,
    catalogPdfUrl: (b.catalog_pdf_url as string) ?? null,
    sortOrder: Number(b.sort_order ?? 0),
    productCount: b.products?.[0]?.count ?? 0,
  }));
}

export async function getAdminBrand(id: string): Promise<AdminBrand | null> {
  const all = await listAdminBrands();
  return all.find((b) => b.id === id) ?? null;
}

const DEMO = { ok: true as const, demo: true };

export async function createBrand(
  input: BrandInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin.from("brands").insert({
    name: input.name,
    slug: input.slug || slugify(input.name),
    logo_url: input.logoUrl,
    catalog_pdf_url: input.catalogPdfUrl,
    sort_order: input.sortOrder,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function updateBrand(
  id: string,
  input: BrandInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin
    .from("brands")
    .update({
      name: input.name,
      slug: input.slug || slugify(input.name),
      logo_url: input.logoUrl,
      catalog_pdf_url: input.catalogPdfUrl,
      sort_order: input.sortOrder,
    })
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteBrand(
  id: string,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin.from("brands").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
