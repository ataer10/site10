import "server-only";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  seedProducts,
  seedBrands,
  seedCategories,
  seedSubcategories,
} from "@/lib/data/seed";
import { slugify } from "@/lib/slug";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brandId: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  brandName: string | null;
  categoryName: string | null;
  listPrice: number;
  unit: string;
  vatRate: number;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
};

export type ProductInput = {
  name: string;
  sku: string | null;
  brandId: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  listPrice: number;
  unit: string;
  vatRate: number;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

export type Taxonomy = {
  brands: { id: string; name: string; slug: string }[];
  categories: {
    id: string;
    name: string;
    slug: string;
    subcategories: { id: string; name: string; slug: string }[];
  }[];
};

/* ----------------------------- Taksonomi ----------------------------- */

export async function getTaxonomy(): Promise<Taxonomy> {
  if (!isSupabaseAdminConfigured()) {
    return {
      brands: seedBrands.map((b) => ({ id: b.slug, name: b.name, slug: b.slug })),
      categories: seedCategories.map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        subcategories: seedSubcategories
          .filter((s) => s.categorySlug === c.slug)
          .map((s) => ({ id: `${c.slug}/${s.slug}`, name: s.name, slug: s.slug })),
      })),
    };
  }
  const admin = createAdminClient();
  const [b, c, s] = await Promise.all([
    admin.from("brands").select("id,name,slug").order("sort_order"),
    admin.from("categories").select("id,name,slug").order("sort_order"),
    admin.from("subcategories").select("id,name,slug,category_id").order("sort_order"),
  ]);
  return {
    brands: (b.data ?? []).map((x) => ({ id: x.id, name: x.name, slug: x.slug })),
    categories: (c.data ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      subcategories: (s.data ?? [])
        .filter((sc) => sc.category_id === cat.id)
        .map((sc) => ({ id: sc.id, name: sc.name, slug: sc.slug })),
    })),
  };
}

/* ------------------------------ Listele ------------------------------ */

export async function listAdminProducts(): Promise<AdminProduct[]> {
  if (!isSupabaseAdminConfigured()) {
    const brandName = new Map(seedBrands.map((b) => [b.slug, b.name]));
    const catName = new Map(seedCategories.map((c) => [c.slug, c.name]));
    return seedProducts.map((p) => ({
      id: p.slug,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brandId: p.brandSlug,
      categoryId: p.categorySlug,
      subcategoryId: p.subcategorySlug,
      brandName: brandName.get(p.brandSlug) ?? null,
      categoryName: catName.get(p.categorySlug) ?? null,
      listPrice: p.listPrice,
      unit: p.unit,
      vatRate: p.vatRate,
      imageUrl: p.imageUrl,
      description: p.description,
      isActive: p.isActive,
    }));
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*, brand:brands(name), category:categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) => {
    const row = p as Record<string, unknown> & {
      brand: { name: string } | null;
      category: { name: string } | null;
    };
    return {
      id: String(row.id),
      name: row.name as string,
      slug: row.slug as string,
      sku: (row.sku as string) ?? null,
      brandId: (row.brand_id as string) ?? null,
      categoryId: (row.category_id as string) ?? null,
      subcategoryId: (row.subcategory_id as string) ?? null,
      brandName: row.brand?.name ?? null,
      categoryName: row.category?.name ?? null,
      listPrice: Number(row.list_price),
      unit: (row.unit as string) ?? "adet",
      vatRate: Number(row.vat_rate ?? 20),
      imageUrl: (row.image_url as string) ?? null,
      description: (row.description as string) ?? null,
      isActive: Boolean(row.is_active),
    };
  });
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const all = await listAdminProducts();
  return all.find((p) => p.id === id) ?? null;
}

/* --------------------------- Yaz / sil --------------------------- */

const DEMO = { ok: true as const, demo: true };

export async function createProduct(
  input: ProductInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string; id?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert({
      name: input.name,
      slug: slugify(input.name) || `urun-${Date.now()}`,
      sku: input.sku,
      brand_id: input.brandId,
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId,
      list_price: input.listPrice,
      unit: input.unit,
      vat_rate: input.vatRate,
      description: input.description,
      image_url: input.imageUrl,
      is_active: input.isActive,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({
      name: input.name,
      sku: input.sku,
      brand_id: input.brandId,
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId,
      list_price: input.listPrice,
      unit: input.unit,
      vat_rate: input.vatRate,
      description: input.description,
      image_url: input.imageUrl,
      is_active: input.isActive,
    })
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteProduct(
  id: string,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ----------------------------- CSV import ----------------------------- */

export type CsvImportResult = {
  ok: boolean;
  demo?: boolean;
  inserted: number;
  errors: string[];
};

/**
 * Satırlar: {name, sku, brand, category, subcategory, list_price, unit, vat_rate, description}
 * brand/category/subcategory adlarla eşlenir (slug'a çevrilip aranır).
 */
export async function importProducts(
  rows: Record<string, string>[],
): Promise<CsvImportResult> {
  const errors: string[] = [];
  const tax = await getTaxonomy();
  const brandBySlug = new Map(tax.brands.map((b) => [b.slug, b.id]));
  const catBySlug = new Map(tax.categories.map((c) => [c.slug, c.id]));
  const subBySlug = new Map(
    tax.categories.flatMap((c) => c.subcategories.map((s) => [s.slug, s.id])),
  );

  const prepared = rows
    .map((r, idx) => {
      const name = (r.name ?? r.ad ?? r["ürün"] ?? "").trim();
      if (!name) {
        errors.push(`Satır ${idx + 2}: ad boş, atlandı.`);
        return null;
      }
      const price = Number(
        String(r.list_price ?? r.fiyat ?? r.price ?? "0").replace(",", "."),
      );
      if (!Number.isFinite(price) || price <= 0) {
        errors.push(`Satır ${idx + 2}: geçersiz fiyat, atlandı.`);
        return null;
      }
      return {
        name,
        slug: slugify(name),
        sku: (r.sku ?? r["ürün kodu"] ?? null) || null,
        brand_id: brandBySlug.get(slugify(r.brand ?? r.marka ?? "")) ?? null,
        category_id: catBySlug.get(slugify(r.category ?? r.kategori ?? "")) ?? null,
        subcategory_id:
          subBySlug.get(slugify(r.subcategory ?? r["alt kategori"] ?? "")) ?? null,
        list_price: price,
        unit: (r.unit ?? r.birim ?? "adet").trim() || "adet",
        vat_rate: Number(String(r.vat_rate ?? r.kdv ?? "20").replace(",", ".")) || 20,
        description: (r.description ?? r["açıklama"] ?? null) || null,
        is_active: true,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (!isSupabaseAdminConfigured()) {
    return { ok: true, demo: true, inserted: prepared.length, errors };
  }

  const admin = createAdminClient();
  const { error, count } = await admin
    .from("products")
    .upsert(prepared, { onConflict: "slug", count: "exact" });
  if (error) return { ok: false, inserted: 0, errors: [...errors, error.message] };
  return { ok: true, inserted: count ?? prepared.length, errors };
}
