import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandForm } from "@/components/admin/brand-form";
import { adminConfigured } from "@/lib/data/admin";

export default function YeniMarkaPage() {
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
        Yeni marka
      </h1>
      <BrandForm brand={null} demo={!adminConfigured()} />
    </div>
  );
}
