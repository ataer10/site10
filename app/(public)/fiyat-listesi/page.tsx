import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  PriceListActions,
  type PriceRow,
} from "@/components/catalog/price-list-actions";
import { getPriceList, grossPrice } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fiyat Listesi",
  description:
    "Tüm ürünlerin güncel liste fiyatları — tablo halinde, Excel (CSV) veya PDF olarak indirilebilir.",
};

export default async function FiyatListesiPage() {
  const products = await getPriceList();

  const rows: PriceRow[] = products.map((p) => ({
    sku: p.sku ?? "—",
    name: p.name,
    brand: p.brand?.name ?? "—",
    category: p.category?.name ?? "—",
    unit: p.unit,
    listPrice: p.listPrice,
    grossPrice: grossPrice(p),
    vatRate: p.vatRate,
  }));

  return (
    <>
      <PageHeader
        title="Fiyat Listesi"
        description="Güncel liste fiyatları (KDV hariç). Excel veya PDF olarak indirebilirsiniz."
        breadcrumbs={[{ title: "Fiyat Listesi" }]}
      />

      <Container className="py-10 lg:py-14">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-400">
            {rows.length} ürün · Para birimi TRY · Fiyatlara KDV dahil değildir
          </p>
          <PriceListActions rows={rows} />
        </div>

        <div className="overflow-hidden rounded-md border border-ink-200">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-ink-50">
                <TableHead className="w-[140px]">SKU</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead className="hidden md:table-cell">Marka</TableHead>
                <TableHead className="hidden lg:table-cell">Kategori</TableHead>
                <TableHead className="text-center">Birim</TableHead>
                <TableHead className="text-right">Liste Fiyatı</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  KDV Dahil
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell className="font-mono text-xs uppercase tracking-wide text-ink-500">
                    {p.sku ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium text-ink-900">
                    {p.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-ink-600">
                    {p.brand?.name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-ink-600">
                    {p.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-center text-ink-500">
                    {p.unit}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-ink-900 tnum">
                    {formatPrice(p.listPrice)}
                  </TableCell>
                  <TableCell className="hidden text-right text-ink-500 tnum sm:table-cell">
                    {formatPrice(grossPrice(p))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Container>
    </>
  );
}
