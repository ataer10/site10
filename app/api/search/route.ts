import { type NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

/**
 * Header arama paleti (Cmd/Ctrl+K) için hafif typeahead uç noktası.
 * Cookie'siz okur (loadCatalog → public client). robots.txt /api'yi disallow eder.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  const { items, total } = await getProducts({ q, page: 1, perPage: 8 });

  return NextResponse.json({
    total,
    items: items.map((p) => ({
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      brand: p.brand?.name ?? null,
      category: p.category?.name ?? null,
      price: p.listPrice,
    })),
  });
}
