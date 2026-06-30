import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/data/admin-products";
import {
  ProductsManager,
  type ProductRow,
} from "@/components/admin/products-manager";

export default async function AdminUrunlerPage() {
  const products = await listAdminProducts();

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    brand: p.brandName,
    category: p.categoryName,
    listPrice: p.listPrice,
    unit: p.unit,
    isActive: p.isActive,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Ürünler
          </h1>
          <p className="mt-1 text-sm text-ink-500">{products.length} ürün</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/urunler/ice-aktar">
              <Upload strokeWidth={1.75} />
              Excel içe aktar
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/urunler/yeni">
              <Plus strokeWidth={1.75} />
              Yeni ürün
            </Link>
          </Button>
        </div>
      </div>

      <ProductsManager products={rows} />
    </div>
  );
}
