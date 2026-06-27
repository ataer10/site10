import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandForm } from "@/components/admin/brand-form";
import { getAdminBrand } from "@/lib/data/admin-brands";
import { adminConfigured } from "@/lib/data/admin";

export default async function MarkaDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getAdminBrand(id);
  if (!brand) notFound();

  return (
    <div>
      <Link
        href="/admin/markalar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Markalara dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        {brand.name}
      </h1>
      <BrandForm brand={brand} demo={!adminConfigured()} />
    </div>
  );
}
