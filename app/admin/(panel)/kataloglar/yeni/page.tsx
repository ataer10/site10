import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CatalogForm } from "@/components/admin/catalog-form";
import { getTaxonomy } from "@/lib/data/admin-products";
import { adminConfigured } from "@/lib/data/admin";

export default async function YeniKatalogPage() {
  const tax = await getTaxonomy();
  return (
    <div>
      <Link
        href="/admin/kataloglar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Kataloglara dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Yeni katalog
      </h1>
      <CatalogForm
        catalog={null}
        brands={tax.brands.map((b) => ({ id: b.id, name: b.name }))}
        demo={!adminConfigured()}
      />
    </div>
  );
}
