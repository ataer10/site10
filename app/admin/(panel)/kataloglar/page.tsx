import Link from "next/link";
import { Plus, Library, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAdminCatalogs } from "@/lib/data/admin-catalogs";

export default async function AdminKataloglarPage() {
  const catalogs = await listAdminCatalogs();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            Kataloglar
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {catalogs.length} katalog · bayisi olunan markaların resmi PDF'leri
          </p>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/kataloglar/yeni">
            <Plus strokeWidth={1.75} />
            Yeni katalog
          </Link>
        </Button>
      </div>

      {catalogs.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <Library className="size-8 text-ink-300" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-ink-500">Henüz katalog eklenmedi.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Katalog
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">
                  Marka
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                  PDF
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {catalogs.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/kataloglar/${c.id}`} className="font-medium text-ink-900 hover:text-steel-600">
                      {c.title}
                    </Link>
                    {c.year ? (
                      <span className="ml-2 font-mono text-[11px] text-ink-400">{c.year}</span>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">
                    {c.brandName ?? "Genel"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.pdfUrl ? (
                      <FileDown className="mx-auto size-4 text-steel-600" strokeWidth={1.75} />
                    ) : (
                      <FileText className="mx-auto size-4 text-ink-300" strokeWidth={1.5} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.isActive ? (
                      <Badge variant="success">Yayında</Badge>
                    ) : (
                      <Badge variant="outline">Taslak</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
