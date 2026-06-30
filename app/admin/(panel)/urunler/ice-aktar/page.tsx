import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductImport } from "@/components/admin/product-import";
import { adminConfigured } from "@/lib/data/admin";
import { getBrands, getCategories } from "@/lib/data/catalog";

export default async function IceAktarPage() {
  const [brands, categories] = await Promise.all([getBrands(), getCategories()]);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/urunler"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Ürünlere dön
      </Link>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Excel ile toplu ürün ekle
      </h1>
      <p className="mb-6 text-sm text-ink-500">
        Hazır şablonu indirin, ürünlerinizi doldurun ve yükleyin. Yüklenen
        ürünler tek tek listeden de düzenlenebilir/silinebilir.
      </p>
      <ProductImport
        demo={!adminConfigured()}
        brands={brands.map((b) => b.name)}
        categories={categories.map((c) => ({
          name: c.name,
          subs: c.subcategories.map((s) => s.name),
        }))}
      />
    </div>
  );
}
