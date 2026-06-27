import Link from "next/link";
import { Plus, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAdminProducts } from "@/lib/data/admin-products";
import { formatPrice } from "@/lib/utils";

export default async function AdminUrunlerPage() {
  const products = await listAdminProducts();

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
              CSV içe aktar
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

      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <Package className="size-8 text-ink-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-ink-500">Henüz ürün yok.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Ürün
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 md:table-cell">
                  Marka / Kategori
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Liste Fiyatı
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/urunler/${p.id}`}
                      className="font-medium text-ink-900 hover:text-steel-600"
                    >
                      {p.name}
                    </Link>
                    {p.sku ? (
                      <span className="block font-mono text-[11px] text-ink-400">
                        {p.sku}
                      </span>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                    {p.brandName ?? "—"}
                    <span className="block text-xs text-ink-400">
                      {p.categoryName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-900 tnum">
                    {formatPrice(p.listPrice)}
                    <span className="block text-[11px] font-normal text-ink-400">
                      /{p.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.isActive ? (
                      <Badge variant="success">Aktif</Badge>
                    ) : (
                      <Badge variant="outline">Pasif</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
