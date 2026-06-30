import { listAdminCategories } from "@/lib/data/admin-categories";
import { adminConfigured } from "@/lib/data/admin";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function KategorilerPage() {
  const categories = await listAdminCategories();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Kategoriler
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-500">
        Kategori ve alt kategori ekleyin, adlarını düzenleyin veya silin.
        Değişiklikler ürün filtrelerinde ve menüde anında yansır. Bir kategoriyi
        silmek ürünleri silmez; yalnız kategorisiz bırakır.
      </p>
      <CategoryManager categories={categories} demo={!adminConfigured()} />
    </div>
  );
}
