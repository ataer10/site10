import "server-only";
import path from "node:path";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import { calcQuote } from "@/lib/quote-calc";
import type { AdminQuote } from "@/lib/data/admin";
import { type SiteSettings } from "@/lib/site";
import { getSettings } from "@/lib/data/settings";

// Türkçe kapsamlı font (Helvetica ş/ğ/ı bozuyor)
Font.register({
  family: "DejaVu",
  fonts: [
    { src: path.join(process.cwd(), "lib/pdf/fonts/DejaVuSans.ttf") },
    {
      src: path.join(process.cwd(), "lib/pdf/fonts/DejaVuSans-Bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

const C = {
  ink: "#16181D",
  steel: "#1B4965",
  orange: "#E2580C",
  border: "#DEE1E5",
  muted: "#6C7480",
  light: "#F7F8F9",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "DejaVu",
    fontSize: 9,
    color: C.ink,
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 18, fontWeight: "bold", color: C.ink },
  brandDot: { color: C.orange },
  tagline: { fontSize: 7, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 },
  docTitle: { fontSize: 16, fontWeight: "bold", color: C.steel, textAlign: "right" },
  docMeta: { fontSize: 8, color: C.muted, textAlign: "right", marginTop: 2 },
  rule: { borderBottomWidth: 1, borderBottomColor: C.ink, marginVertical: 12 },
  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  box: { width: "48%" },
  label: { fontSize: 7, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  strong: { fontWeight: "bold" },
  // tablo
  th: { flexDirection: "row", backgroundColor: C.ink, color: "#fff", paddingVertical: 6, paddingHorizontal: 6 },
  thc: { fontSize: 7.5, fontWeight: "bold", textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 6, paddingHorizontal: 6 },
  td: { fontSize: 8.5 },
  cName: { width: "34%" },
  cQty: { width: "11%", textAlign: "right" },
  cList: { width: "15%", textAlign: "right" },
  cDisc: { width: "11%", textAlign: "right" },
  cNet: { width: "14%", textAlign: "right" },
  cTotal: { width: "15%", textAlign: "right" },
  sku: { fontSize: 6.5, color: C.muted },
  totals: { marginTop: 12, marginLeft: "auto", width: "45%" },
  totRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totLabel: { fontSize: 8.5, color: C.muted },
  totVal: { fontSize: 8.5 },
  grand: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: C.ink },
  grandLabel: { fontSize: 10, fontWeight: "bold" },
  grandVal: { fontSize: 12, fontWeight: "bold", color: C.steel },
  note: { marginTop: 18, padding: 10, backgroundColor: C.light, borderWidth: 1, borderColor: C.border },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, fontSize: 7, color: C.muted, textAlign: "center" },
});

function tl(n: number): string {
  return (
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) +
    " ₺"
  );
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

function QuoteDocument({
  quote,
  issued,
  site,
}: {
  quote: AdminQuote;
  issued: Date;
  site: SiteSettings;
}) {
  const items = quote.items ?? [];
  const totals = calcQuote(
    items.map((it) => ({
      listPrice: it.listPrice,
      qty: it.qty,
      vatRate: it.vatRate,
      discountRate: it.discountRate,
    })),
    quote.globalDiscountRate,
  );
  const validUntil = quote.validUntil ? new Date(quote.validUntil) : null;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brand}>
              {site.shortName.toUpperCase()}
              <Text style={s.brandDot}>.</Text>
            </Text>
            <Text style={s.tagline}>{site.tagline}</Text>
            <Text style={[s.td, { color: C.muted, marginTop: 6 }]}>
              {site.address.line1}, {site.address.line2}
            </Text>
            <Text style={[s.td, { color: C.muted }]}>
              {site.address.city} / {site.address.country}
            </Text>
            <Text style={[s.td, { color: C.muted }]}>
              {site.phone} · {site.email}
            </Text>
          </View>
          <View>
            <Text style={s.docTitle}>FİYAT TEKLİFİ</Text>
            <Text style={s.docMeta}>No: {quote.quoteNumber}</Text>
            <Text style={s.docMeta}>Tarih: {fmtDate(issued)}</Text>
            {validUntil ? (
              <Text style={s.docMeta}>Geçerlilik: {fmtDate(validUntil)}</Text>
            ) : null}
          </View>
        </View>

        <View style={s.rule} />

        {/* Müşteri */}
        <View style={s.twoCol}>
          <View style={s.box}>
            <Text style={s.label}>Sayın</Text>
            <Text style={s.strong}>{quote.customerName}</Text>
            {quote.company ? <Text>{quote.company}</Text> : null}
            <Text style={{ color: C.muted }}>{quote.email}</Text>
            {quote.phone ? <Text style={{ color: C.muted }}>{quote.phone}</Text> : null}
          </View>
          <View style={s.box}>
            <Text style={s.label}>Teklif Durumu</Text>
            <Text>
              {quote.status === "quoted" ? "Teklif hazırlandı" : "Hazırlanıyor"}
            </Text>
            <Text style={[s.label, { marginTop: 8 }]}>Genel İskonto</Text>
            <Text>%{quote.globalDiscountRate}</Text>
          </View>
        </View>

        {/* Kalemler */}
        <View style={s.th}>
          <Text style={[s.thc, s.cName]}>Ürün</Text>
          <Text style={[s.thc, s.cQty]}>Adet</Text>
          <Text style={[s.thc, s.cList]}>Liste</Text>
          <Text style={[s.thc, s.cDisc]}>İsk.%</Text>
          <Text style={[s.thc, s.cNet]}>Net Fiyat</Text>
          <Text style={[s.thc, s.cTotal]}>Tutar</Text>
        </View>
        {totals.lines.map((ln, idx) => {
          const it = items[idx];
          return (
            <View style={s.tr} key={it.id} wrap={false}>
              <View style={s.cName}>
                <Text style={s.td}>{it.productName}</Text>
                {it.sku ? <Text style={s.sku}>{it.sku}</Text> : null}
              </View>
              <Text style={[s.td, s.cQty]}>
                {it.qty} {it.unit}
              </Text>
              <Text style={[s.td, s.cList]}>{tl(it.listPrice)}</Text>
              <Text style={[s.td, s.cDisc]}>%{ln.effectiveRate}</Text>
              <Text style={[s.td, s.cNet]}>{tl(ln.netUnit)}</Text>
              <Text style={[s.td, s.cTotal, s.strong]}>{tl(ln.lineNet)}</Text>
            </View>
          );
        })}

        {/* Toplamlar */}
        <View style={s.totals}>
          <View style={s.totRow}>
            <Text style={s.totLabel}>Ara toplam (liste)</Text>
            <Text style={s.totVal}>{tl(totals.subtotal)}</Text>
          </View>
          <View style={s.totRow}>
            <Text style={s.totLabel}>İskonto</Text>
            <Text style={s.totVal}>- {tl(totals.discountTotal)}</Text>
          </View>
          <View style={s.totRow}>
            <Text style={s.totLabel}>Net ara toplam</Text>
            <Text style={s.totVal}>{tl(totals.netSubtotal)}</Text>
          </View>
          <View style={s.totRow}>
            <Text style={s.totLabel}>KDV</Text>
            <Text style={s.totVal}>{tl(totals.vatTotal)}</Text>
          </View>
          <View style={s.grand}>
            <Text style={s.grandLabel}>GENEL TOPLAM</Text>
            <Text style={s.grandVal}>{tl(totals.grandTotal)}</Text>
          </View>
        </View>

        {/* Notlar / şartlar */}
        <View style={s.note}>
          <Text style={s.label}>Notlar ve Şartlar</Text>
          {quote.note ? <Text style={{ marginBottom: 4 }}>{quote.note}</Text> : null}
          <Text style={{ color: C.muted }}>
            • Fiyatlara KDV {validUntil ? "dahil değildir; tabloda ayrıca gösterilmiştir" : "ayrıca eklenmiştir"}.
          </Text>
          <Text style={{ color: C.muted }}>
            • Bu teklif {validUntil ? fmtDate(validUntil) + " tarihine kadar" : "15 gün"} geçerlidir.
          </Text>
          <Text style={{ color: C.muted }}>• Ödeme ve teslimat koşulları siparişte teyit edilir.</Text>
        </View>

        <Text style={s.footer} fixed>
          {site.name} · {site.phone} · {site.email} · {site.url.replace(/^https?:\/\//, "")}
        </Text>
      </Page>
    </Document>
  );
}

/** Teklifi PDF buffer'ına render eder. */
export async function renderQuotePdf(quote: AdminQuote): Promise<Buffer> {
  const site = await getSettings();
  const buf = await renderToBuffer(
    <QuoteDocument quote={quote} issued={new Date()} site={site} />,
  );
  return buf as Buffer;
}
