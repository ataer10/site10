import type { Metadata } from "next";
import { Library } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import { CatalogLibrary } from "@/components/catalog/catalog-library";
import { getCatalogs } from "@/lib/data/catalogs";

export const metadata: Metadata = {
  title: "Kataloglar",
  description:
    "Bayisi olduğumuz markaların resmi ürün kataloglarını PDF olarak indirin.",
};

export default async function KataloglarPage() {
  const catalogs = await getCatalogs();

  return (
    <>
      <PageHeader
        title="Kataloglar"
        description="Bayisi olduğumuz markaların resmi ürün kataloglarını markaya göre filtreleyin, inceleyin ve PDF olarak indirin."
        image="/img/pexels-sonny-29248902.jpg"
        breadcrumbs={[{ title: "Kataloglar" }]}
      />

      <Container className="py-10 lg:py-14">
        {catalogs.length === 0 ? (
          <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-ink-50 px-6 py-20 text-center">
            <Library className="size-8 text-ink-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-ink-500">Henüz katalog yayınlanmadı.</p>
          </div>
        ) : (
          <CatalogLibrary catalogs={catalogs} />
        )}
      </Container>
    </>
  );
}
