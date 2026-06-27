import Link from "next/link";
import { ArrowUpRight, FileDown } from "lucide-react";
import type { Brand } from "@/lib/data/catalog";

export function BrandCard({
  brand,
  productCount,
}: {
  brand: Brand;
  productCount: number;
}) {
  return (
    <article className="group relative flex flex-col bg-white p-6 transition-colors hover:bg-ink-50">
      <Link
        href={`/markalar/${brand.slug}`}
        className="flex items-start justify-between"
      >
        {/* Gri-ton tipografik logo (gerçek logo Faz: Storage logo_url) */}
        <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-ink-400 transition-colors group-hover:text-steel-600">
          {brand.name}
        </span>
        <ArrowUpRight
          className="size-5 text-ink-300 transition-colors group-hover:text-orange-500"
          strokeWidth={1.5}
        />
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-ink-400">
          {productCount} ürün
        </span>
        {brand.catalogPdfUrl ? (
          <a
            href={brand.catalogPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-steel-600 hover:underline"
          >
            <FileDown className="size-3.5" strokeWidth={1.75} />
            Katalog
          </a>
        ) : null}
      </div>
    </article>
  );
}
