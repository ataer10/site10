import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ProductRow } from "@/lib/supabase/types";
import {
  type ProductFilters,
  type SortValue,
  DEFAULT_PER_PAGE,
} from "@/lib/catalog-params";

export type { ProductFilters, SortValue } from "@/lib/catalog-params";
export { SORT_OPTIONS, DEFAULT_PER_PAGE } from "@/lib/catalog-params";
import {
  seedBrands,
  seedCategories,
  seedSubcategories,
  seedProducts,
} from "@/lib/data/seed";

/* --------------------------- Domain tipleri --------------------------- */

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  catalogPdfUrl: string | null;
  sortOrder: number;
};

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  sortOrder: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  subcategories: Subcategory[];
};

export type ProductRef = { name: string; slug: string } | null;

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  listPrice: number;
  currency: string;
  unit: string;
  vatRate: number;
  imageUrl: string | null;
  description: string | null;
  brand: ProductRef;
  category: ProductRef;
  subcategory: ProductRef;
};

export type Catalog = {
  brands: Brand[];
  categories: Category[];
  products: Product[];
};

/* ------------------------------ Sıralama ------------------------------ */

const collator = new Intl.Collator("tr", { sensitivity: "base", numeric: true });

/* --------------------------- Katalog yükleme -------------------------- */

/** Tüm katalog (markalar/kategoriler/ürünler) — istek başına memoize edilir. */
export const loadCatalog = cache(async (): Promise<Catalog> => {
  if (isSupabaseConfigured()) {
    try {
      return await loadFromSupabase();
    } catch (err) {
      console.error("[catalog] Supabase okuması başarısız, seed'e düşülüyor:", err);
    }
  }
  return loadFromSeed();
});

async function loadFromSupabase(): Promise<Catalog> {
  const { createPublicClient } = await import("@/lib/supabase/public");
  const supabase = createPublicClient();

  const [brandsRes, categoriesRes, subcategoriesRes, productsRes] =
    await Promise.all([
      supabase.from("brands").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("subcategories").select("*").order("sort_order"),
      supabase
        .from("products")
        .select(
          "*, brand:brands(name,slug), category:categories(name,slug), subcategory:subcategories(name,slug)",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

  if (brandsRes.error) throw brandsRes.error;
  if (categoriesRes.error) throw categoriesRes.error;
  if (subcategoriesRes.error) throw subcategoriesRes.error;
  if (productsRes.error) throw productsRes.error;

  type SubRow = NonNullable<typeof subcategoriesRes.data>[number];
  const subsByCategoryId = new Map<string, SubRow[]>();
  for (const s of subcategoriesRes.data ?? []) {
    if (!s.category_id) continue;
    const arr = subsByCategoryId.get(s.category_id) ?? [];
    arr.push(s);
    subsByCategoryId.set(s.category_id, arr);
  }

  const brands: Brand[] = (brandsRes.data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logo_url,
    catalogPdfUrl: b.catalog_pdf_url,
    sortOrder: b.sort_order ?? 0,
  }));

  const categories: Category[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    sortOrder: c.sort_order ?? 0,
    subcategories: (subsByCategoryId.get(c.id) ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      categorySlug: c.slug,
      sortOrder: s.sort_order ?? 0,
    })),
  }));

  type ProductJoinedRow = ProductRow & {
    brand: { name: string; slug: string } | null;
    category: { name: string; slug: string } | null;
    subcategory: { name: string; slug: string } | null;
  };
  const productRows = (productsRes.data ?? []) as unknown as ProductJoinedRow[];
  const products: Product[] = productRows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    listPrice: Number(row.list_price),
    currency: row.currency ?? "TRY",
    unit: row.unit ?? "adet",
    vatRate: Number(row.vat_rate ?? 20),
    imageUrl: row.image_url,
    description: row.description,
    brand: row.brand ? { name: row.brand.name, slug: row.brand.slug } : null,
    category: row.category
      ? { name: row.category.name, slug: row.category.slug }
      : null,
    subcategory: row.subcategory
      ? { name: row.subcategory.name, slug: row.subcategory.slug }
      : null,
  }));

  return { brands, categories, products };
}

function loadFromSeed(): Catalog {
  const brands: Brand[] = seedBrands.map((b) => ({
    id: b.slug,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
    catalogPdfUrl: b.catalogPdfUrl,
    sortOrder: b.sortOrder,
  }));

  const categories: Category[] = seedCategories.map((c) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    sortOrder: c.sortOrder,
    subcategories: seedSubcategories
      .filter((s) => s.categorySlug === c.slug)
      .map((s) => ({
        id: `${c.slug}/${s.slug}`,
        name: s.name,
        slug: s.slug,
        categorySlug: c.slug,
        sortOrder: s.sortOrder,
      })),
  }));

  const brandBySlug = new Map(seedBrands.map((b) => [b.slug, b]));
  const categoryBySlug = new Map(seedCategories.map((c) => [c.slug, c]));
  const subBySlug = new Map(
    seedSubcategories.map((s) => [`${s.categorySlug}/${s.slug}`, s]),
  );

  const products: Product[] = seedProducts
    .filter((p) => p.isActive)
    .map((p) => {
      const b = brandBySlug.get(p.brandSlug);
      const c = categoryBySlug.get(p.categorySlug);
      const s = subBySlug.get(`${p.categorySlug}/${p.subcategorySlug}`);
      return {
        id: p.slug,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        listPrice: p.listPrice,
        currency: "TRY",
        unit: p.unit,
        vatRate: p.vatRate,
        imageUrl: p.imageUrl,
        description: p.description,
        brand: b ? { name: b.name, slug: b.slug } : null,
        category: c ? { name: c.name, slug: c.slug } : null,
        subcategory: s ? { name: s.name, slug: s.slug } : null,
      };
    });

  return { brands, categories, products };
}

/* ------------------------------ Sorgular ------------------------------ */

export type ProductQueryResult = {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductQueryResult> {
  const { products } = await loadCatalog();
  const {
    brand,
    category,
    subcategory,
    q,
    sort = "name-asc",
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = filters;

  let items = products;

  if (brand) items = items.filter((p) => p.brand?.slug === brand);
  if (category) items = items.filter((p) => p.category?.slug === category);
  if (subcategory)
    items = items.filter((p) => p.subcategory?.slug === subcategory);

  if (q && q.trim()) {
    const needle = q.trim().toLocaleLowerCase("tr");
    items = items.filter(
      (p) =>
        p.name.toLocaleLowerCase("tr").includes(needle) ||
        (p.sku ?? "").toLocaleLowerCase("tr").includes(needle) ||
        (p.brand?.name ?? "").toLocaleLowerCase("tr").includes(needle),
    );
  }

  items = sortProducts(items, sort);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * perPage;
  const paged = items.slice(start, start + perPage);

  return { items: paged, total, page: safePage, perPage, pageCount };
}

function sortProducts(items: Product[], sort: SortValue): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.listPrice - b.listPrice);
    case "price-desc":
      return copy.sort((a, b) => b.listPrice - a.listPrice);
    case "name-desc":
      return copy.sort((a, b) => collator.compare(b.name, a.name));
    case "name-asc":
    default:
      return copy.sort((a, b) => collator.compare(a.name, b.name));
  }
}

export async function getBrands(): Promise<Brand[]> {
  const { brands } = await loadCatalog();
  return brands;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const { brands } = await loadCatalog();
  return brands.find((b) => b.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const { categories } = await loadCatalog();
  return categories;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { products } = await loadCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByBrand(
  brandSlug: string,
): Promise<Product[]> {
  const { products } = await loadCatalog();
  return sortProducts(
    products.filter((p) => p.brand?.slug === brandSlug),
    "name-asc",
  );
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const { products } = await loadCatalog();
  return products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.subcategory?.slug === product.subcategory?.slug,
    )
    .slice(0, limit);
}

/** /urunler/[slug] ve /markalar/[slug] için statik üretim. */
export async function getAllProductSlugs(): Promise<string[]> {
  const { products } = await loadCatalog();
  return products.map((p) => p.slug);
}

export async function getAllBrandSlugs(): Promise<string[]> {
  const { brands } = await loadCatalog();
  return brands.map((b) => b.slug);
}

/** Fiyat listesi — tüm aktif ürünler düz liste (kategori/marka sırasıyla). */
export async function getPriceList(): Promise<Product[]> {
  const { products } = await loadCatalog();
  return [...products].sort((a, b) => {
    const c = collator.compare(a.category?.name ?? "", b.category?.name ?? "");
    return c !== 0 ? c : collator.compare(a.name, b.name);
  });
}

/** Brüt (KDV dahil) birim fiyat. */
export function grossPrice(p: Pick<Product, "listPrice" | "vatRate">): number {
  return p.listPrice * (1 + p.vatRate / 100);
}
