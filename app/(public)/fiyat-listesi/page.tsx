import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import { PriceList, type PriceRow } from "@/components/catalog/price-list";
import { getPriceList, grossPrice } from "@/lib/data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/fiyat-listesi" },
  openGraph: { url: "/fiyat-listesi" },
  title: "Fiyat Listesi",
  description:
    "Tüm ürünlerin güncel liste fiyatları — aranabilir, filtrelenebilir ve sayfalı tablo; Excel (CSV) veya PDF olarak indirilebilir.",
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
        description="Güncel liste fiyatları (KDV hariç). Arayın, filtreleyin; Excel veya PDF olarak indirin."
        image="/img/pexels-quangludo-12527113.jpg"
        breadcrumbs={[{ title: "Fiyat Listesi" }]}
      />

      <Container className="py-10 lg:py-14">
        <PriceList rows={rows} />
      </Container>
    </>
  );
}
