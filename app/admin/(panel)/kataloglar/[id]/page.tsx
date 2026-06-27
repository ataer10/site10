import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatalogForm } from "@/components/admin/catalog-form";
import { getAdminCatalog } from "@/lib/data/admin-catalogs";
import { getTaxonomy } from "@/lib/data/admin-products";
import { adminConfigured } from "@/lib/data/admin";

export default async function KatalogDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [catalog, tax] = await Promise.all([getAdminCatalog(id), getTaxonomy()]);
  if (!catalog) notFound();

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
        {catalog.title}
      </h1>
      <CatalogForm
        catalog={catalog}
        brands={tax.brands.map((b) => ({ id: b.id, name: b.name }))}
        demo={!adminConfigured()}
      />
    </div>
  );
}
