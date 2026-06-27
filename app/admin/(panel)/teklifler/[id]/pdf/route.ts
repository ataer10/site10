import { getQuote } from "@/lib/data/admin";
import { renderQuotePdf } from "@/lib/pdf/quote-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    return new Response("Teklif bulunamadı", { status: 404 });
  }

  const pdf = await renderQuotePdf(quote);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
