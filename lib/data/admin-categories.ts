import "server-only";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedCategories, seedSubcategories, seedProducts } from "@/lib/data/seed";
import { slugify } from "@/lib/slug";

export type AdminSubcategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
};
export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
  subcategories: AdminSubcategory[];
};

type Res = { ok: boolean; demo?: boolean; error?: string };
const DEMO: Res = { ok: true, demo: true };

function uniqueErr(error: { code?: string; message: string }, dup: string): Res {
  return { ok: false, error: error.code === "23505" ? dup : error.message };
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  if (!isSupabaseAdminConfigured()) {
    const catCount = new Map<string, number>();
    const subCount = new Map<string, number>();
    for (const p of seedProducts) {
      catCount.set(p.categorySlug, (catCount.get(p.categorySlug) ?? 0) + 1);
      const sk = `${p.categorySlug}/${p.subcategorySlug}`;
      subCount.set(sk, (subCount.get(sk) ?? 0) + 1);
    }
    return seedCategories.map((c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      sortOrder: c.sortOrder,
      productCount: catCount.get(c.slug) ?? 0,
      subcategories: seedSubcategories
        .filter((s) => s.categorySlug === c.slug)
        .map((s) => ({
          id: `${c.slug}/${s.slug}`,
          name: s.name,
          slug: s.slug,
          sortOrder: s.sortOrder,
          productCount: subCount.get(`${c.slug}/${s.slug}`) ?? 0,
        })),
    }));
  }

  const admin = createAdminClient();
  const [catsRes, subsRes] = await Promise.all([
    admin.from("categories").select("*, products(count)").order("sort_order"),
    admin.from("subcategories").select("*, products(count)").order("sort_order"),
  ]);
  if (catsRes.error) throw catsRes.error;
  if (subsRes.error) throw subsRes.error;

  type Row = Record<string, unknown> & { products?: { count: number }[] };
  const subsByCat = new Map<string, AdminSubcategory[]>();
  for (const s of (subsRes.data ?? []) as unknown as Row[]) {
    const catId = String(s.category_id ?? "");
    if (!catId) continue;
    const arr = subsByCat.get(catId) ?? [];
    arr.push({
      id: String(s.id),
      name: s.name as string,
      slug: s.slug as string,
      sortOrder: Number(s.sort_order ?? 0),
      productCount: s.products?.[0]?.count ?? 0,
    });
    subsByCat.set(catId, arr);
  }

  return ((catsRes.data ?? []) as unknown as Row[]).map((c) => ({
    id: String(c.id),
    name: c.name as string,
    slug: c.slug as string,
    sortOrder: Number(c.sort_order ?? 0),
    productCount: c.products?.[0]?.count ?? 0,
    subcategories: subsByCat.get(String(c.id)) ?? [],
  }));
}

function maxSort(data: unknown): number {
  const arr = data as { sort_order?: number }[] | null;
  return Number(arr?.[0]?.sort_order ?? 0) + 1;
}

/* ----------------------------- Kategori ----------------------------- */

export async function createCategory(name: string): Promise<Res> {
  const n = name.trim();
  if (!n) return { ok: false, error: "Kategori adı boş olamaz." };
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const { error } = await admin
    .from("categories")
    .insert({ name: n, slug: slugify(n), sort_order: maxSort(data) });
  return error ? uniqueErr(error, "Bu kategori zaten mevcut.") : { ok: true };
}

export async function updateCategory(id: string, name: string): Promise<Res> {
  const n = name.trim();
  if (!n) return { ok: false, error: "Kategori adı boş olamaz." };
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .update({ name: n, slug: slugify(n) })
    .eq("id", id);
  return error ? uniqueErr(error, "Bu kategori zaten mevcut.") : { ok: true };
}

export async function deleteCategory(id: string): Promise<Res> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  // FK: alt kategoriler cascade silinir; ürünlerin kategorisi NULL olur.
  const { error } = await admin.from("categories").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* --------------------------- Alt kategori --------------------------- */

export async function createSubcategory(
  categoryId: string,
  name: string,
): Promise<Res> {
  const n = name.trim();
  if (!n) return { ok: false, error: "Alt kategori adı boş olamaz." };
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { data } = await admin
    .from("subcategories")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const { error } = await admin.from("subcategories").insert({
    category_id: categoryId,
    name: n,
    slug: slugify(n),
    sort_order: maxSort(data),
  });
  return error
    ? uniqueErr(error, "Bu alt kategori bu kategoride zaten var.")
    : { ok: true };
}

export async function updateSubcategory(id: string, name: string): Promise<Res> {
  const n = name.trim();
  if (!n) return { ok: false, error: "Alt kategori adı boş olamaz." };
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  const { error } = await admin
    .from("subcategories")
    .update({ name: n, slug: slugify(n) })
    .eq("id", id);
  return error
    ? uniqueErr(error, "Bu alt kategori bu kategoride zaten var.")
    : { ok: true };
}

export async function deleteSubcategory(id: string): Promise<Res> {
  if (!isSupabaseAdminConfigured()) return DEMO;
  const admin = createAdminClient();
  // FK: ürünlerin alt kategorisi NULL olur.
  const { error } = await admin.from("subcategories").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
