/**
 * lib/data/seed.ts -> supabase/seed.sql üreteci.
 * Çalıştır:  pnpm db:seed-sql
 * SQL, FK'leri slug üzerinden subselect ile bağlar; idempotent (on conflict).
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  seedBrands,
  seedCategories,
  seedSubcategories,
  seedProducts,
} from "../lib/data/seed";

const q = (v: string | null): string =>
  v === null ? "null" : `'${v.replace(/'/g, "''")}'`;

const lines: string[] = [];
lines.push("-- =====================================================================");
lines.push("--  Birtek — Seed verisi (OTOMATİK ÜRETİLDİ: pnpm db:seed-sql)");
lines.push("--  Kaynak: lib/data/seed.ts — elle düzenlemeyin.");
lines.push("-- =====================================================================");
lines.push("");

lines.push("-- Markalar");
for (const b of seedBrands) {
  lines.push(
    `insert into public.brands (name, slug, logo_url, catalog_pdf_url, sort_order) values (${q(b.name)}, ${q(b.slug)}, ${q(b.logoUrl)}, ${q(b.catalogPdfUrl)}, ${b.sortOrder}) on conflict (slug) do nothing;`,
  );
}
lines.push("");

lines.push("-- Kategoriler");
for (const c of seedCategories) {
  lines.push(
    `insert into public.categories (name, slug, sort_order) values (${q(c.name)}, ${q(c.slug)}, ${c.sortOrder}) on conflict (slug) do nothing;`,
  );
}
lines.push("");

lines.push("-- Alt kategoriler");
for (const s of seedSubcategories) {
  lines.push(
    `insert into public.subcategories (name, slug, category_id, sort_order) values (${q(s.name)}, ${q(s.slug)}, (select id from public.categories where slug = ${q(s.categorySlug)}), ${s.sortOrder}) on conflict (category_id, slug) do nothing;`,
  );
}
lines.push("");

lines.push("-- Ürünler");
for (const p of seedProducts) {
  lines.push(
    `insert into public.products (name, slug, sku, brand_id, category_id, subcategory_id, list_price, currency, unit, vat_rate, image_url, description, is_active) values (` +
      `${q(p.name)}, ${q(p.slug)}, ${q(p.sku)}, ` +
      `(select id from public.brands where slug = ${q(p.brandSlug)}), ` +
      `(select id from public.categories where slug = ${q(p.categorySlug)}), ` +
      `(select id from public.subcategories where slug = ${q(p.subcategorySlug)} and category_id = (select id from public.categories where slug = ${q(p.categorySlug)})), ` +
      `${p.listPrice}, 'TRY', ${q(p.unit)}, ${p.vatRate}, ${q(p.imageUrl)}, ${q(p.description)}, ${p.isActive}) ` +
      `on conflict (slug) do nothing;`,
  );
}
lines.push("");

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../supabase/seed.sql");
writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(
  `seed.sql üretildi: ${seedBrands.length} marka, ${seedCategories.length} kategori, ${seedSubcategories.length} alt kategori, ${seedProducts.length} ürün`,
);
