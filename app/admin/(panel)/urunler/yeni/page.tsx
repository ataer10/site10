import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTaxonomy } from "@/lib/data/admin-products";
import { adminConfigured } from "@/lib/data/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function YeniUrunPage() {
  const taxonomy = await getTaxonomy();
  return (
    <div>
      <Link
        href="/admin/urunler"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Ürünlere dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Yeni ürün
      </h1>
      <ProductForm product={null} taxonomy={taxonomy} demo={!adminConfigured()} />
    </div>
  );
}
