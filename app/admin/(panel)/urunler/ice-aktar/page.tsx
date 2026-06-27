import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CsvImport } from "@/components/admin/csv-import";
import { adminConfigured } from "@/lib/data/admin";

export default function CsvIceAktarPage() {
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
        CSV içe aktar
      </h1>
      <p className="mb-6 text-sm text-ink-500">
        Toplu ürün eklemek için CSV yükleyin. Mevcut ürünler{" "}
        <code className="font-mono text-xs">slug</code> üzerinden güncellenir.
      </p>
      <CsvImport demo={!adminConfigured()} />
    </div>
  );
}
