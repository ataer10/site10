import Link from "next/link";
import { cn } from "@/lib/utils";
import { homeBrands } from "@/lib/content";

/**
 * Marka logo şeridi — gri-ton, hover'da renklenir.
 * Faz 1'de gerçek logo yerine tipografik kelime-marka kullanılır;
 * Faz 2'de Supabase Storage'daki logo_url ile değiştirilecek.
 */
export function BrandStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-ink-100 border-y border-ink-100 sm:grid-cols-4",
        className,
      )}
    >
      {homeBrands.map((brand) => (
        <Link
          key={brand.slug}
          href={`/markalar/${brand.slug}`}
          className="group flex h-20 items-center justify-center px-4"
        >
          <span className="font-display text-base font-bold uppercase tracking-tight text-ink-400 transition-colors duration-200 group-hover:text-steel-600">
            {brand.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
