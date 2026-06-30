import { listAdminProducts } from "@/lib/data/admin-products";
import { getBrands, getCategories } from "@/lib/data/catalog";
import { adminConfigured } from "@/lib/data/admin";
import {
  PriceListManager,
  type PriceRow,
} from "@/components/admin/price-list-manager";

export default async function AdminFiyatListesiPage() {
  const [products, brands, categories] = await Promise.all([
    listAdminProducts(),
    getBrands(),
    getCategories(),
  ]);

  const rows: PriceRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    brand: p.brandName,
    category: p.categoryName,
    listPrice: p.listPrice,
    unit: p.unit,
    vatRate: p.vatRate,
    isActive: p.isActive,
  }));

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Fiyat Listesi
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-500">
        Sitedeki “Fiyat Listesi” sayfasının yönetimi. Fiyatları doğrudan tabloda
        düzenleyin, ürünleri tek tek silin ya da Excel ile toplu güncelleyin.
        Değişiklikler hem fiyat listesinde hem katalogda anında yansır.
      </p>
      <PriceListManager
        products={rows}
        brands={brands.map((b) => b.name)}
        categories={categories.map((c) => ({
          name: c.name,
          subs: c.subcategories.map((s) => s.name),
        }))}
        demo={!adminConfigured()}
      />
    </div>
  );
}
