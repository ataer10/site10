import Link from "next/link";
import { Plus, Tags, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminBrands } from "@/lib/data/admin-brands";

export default async function AdminMarkalarPage() {
  const brands = await listAdminBrands();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Markalar
          </h1>
          <p className="mt-1 text-sm text-ink-500">{brands.length} marka</p>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/markalar/yeni">
            <Plus strokeWidth={1.75} />
            Yeni marka
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <Tags className="size-8 text-ink-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-ink-500">Henüz marka yok.</p>
        </div>
      ) : (
        <div className="grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/admin/markalar/${b.id}`}
              className="flex items-center justify-between gap-3 bg-white p-4 transition-colors hover:bg-ink-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-sm border border-ink-200 bg-white">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt="" className="size-full object-contain p-1" />
                  ) : (
                    <span className="font-display text-xs font-bold text-ink-400">
                      {b.name.charAt(0)}
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900">{b.name}</p>
                  <p className="font-mono text-[11px] text-ink-400">
                    {b.productCount} ürün
                  </p>
                </div>
              </div>
              {b.catalogPdfUrl ? (
                <FileDown className="size-4 shrink-0 text-steel-500" strokeWidth={1.75} />
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
