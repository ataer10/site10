import { formatPrice } from "@/lib/utils";
import { site } from "@/lib/site";

export type QuoteEmailItem = {
  name: string;
  sku: string | null;
  qty: number;
  unit: string;
  listPrice: number;
};

export type QuoteEmailData = {
  quoteNumber: string;
  customerName: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  note?: string | null;
  items: QuoteEmailItem[];
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  adminUrl?: string;
};

const C = {
  ink: "#16181D",
  steel: "#1B4965",
  orange: "#E2580C",
  border: "#DEE1E5",
  muted: "#6C7480",
  bg: "#F7F8F9",
};

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${C.border};">
  <tr><td style="background:${C.ink};padding:20px 28px;">
    <span style="font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase;">${site.shortName}<span style="color:${C.orange};">.</span></span>
    <span style="font-size:11px;color:#9AA1AB;letter-spacing:1px;text-transform:uppercase;margin-left:8px;">${site.tagline}</span>
  </td></tr>
  <tr><td style="padding:28px;">
    <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${C.ink};">${title}</h1>
    ${body}
  </td></tr>
  <tr><td style="background:${C.bg};border-top:1px solid ${C.border};padding:18px 28px;font-size:12px;color:${C.muted};">
    ${site.name} · ${site.phone} · ${site.email}<br>
    Bu e-posta ${site.url} üzerinden otomatik gönderilmiştir.
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

function itemsTable(items: QuoteEmailItem[]): string {
  const rows = items
    .map(
      (it) => `<tr>
<td style="padding:10px 8px;border-bottom:1px solid ${C.border};font-size:13px;color:${C.ink};">${escapeHtml(it.name)}${
        it.sku
          ? `<br><span style="font-family:monospace;font-size:11px;color:${C.muted};">${escapeHtml(it.sku)}</span>`
          : ""
      }</td>
<td style="padding:10px 8px;border-bottom:1px solid ${C.border};font-size:13px;text-align:center;color:${C.ink};white-space:nowrap;">${it.qty} ${escapeHtml(it.unit)}</td>
<td style="padding:10px 8px;border-bottom:1px solid ${C.border};font-size:13px;text-align:right;color:${C.ink};white-space:nowrap;">${formatPrice(it.listPrice)}</td>
<td style="padding:10px 8px;border-bottom:1px solid ${C.border};font-size:13px;text-align:right;color:${C.ink};white-space:nowrap;font-weight:bold;">${formatPrice(it.listPrice * it.qty)}</td>
</tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">
<thead><tr style="background:${C.bg};">
<th align="left" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${C.muted};border-bottom:1px solid ${C.border};">Ürün</th>
<th align="center" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${C.muted};border-bottom:1px solid ${C.border};">Adet</th>
<th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${C.muted};border-bottom:1px solid ${C.border};">Liste Fiyatı</th>
<th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${C.muted};border-bottom:1px solid ${C.border};">Tutar</th>
</tr></thead><tbody>${rows}</tbody></table>`;
}

function totalsBlock(d: QuoteEmailData): string {
  const row = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 8px;font-size:13px;color:${C.muted};">${label}</td>
<td style="padding:4px 8px;font-size:${bold ? "16px" : "13px"};text-align:right;color:${C.ink};${bold ? "font-weight:bold;" : ""}white-space:nowrap;">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
${row("Ara toplam (KDV hariç)", formatPrice(d.subtotal))}
${row("KDV", formatPrice(d.vatTotal))}
<tr><td colspan="2" style="border-top:1px solid ${C.border};padding-top:4px;"></td></tr>
${row("Genel toplam", formatPrice(d.grandTotal), true)}
</table>`;
}

function infoRow(label: string, value?: string | null): string {
  if (!value) return "";
  return `<tr><td style="padding:3px 0;font-size:13px;color:${C.muted};width:120px;">${label}</td><td style="padding:3px 0;font-size:13px;color:${C.ink};">${escapeHtml(value)}</td></tr>`;
}

/** Firmaya: yeni teklif talebi. */
export function newQuoteToCompany(d: QuoteEmailData): { subject: string; html: string } {
  const body = `
<p style="margin:0 0 16px;font-size:14px;color:${C.muted};">Yeni bir teklif talebi alındı. Teklif no: <strong style="color:${C.ink};font-family:monospace;">${d.quoteNumber}</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};border:1px solid ${C.border};padding:14px 16px;margin-bottom:20px;">
${infoRow("Ad Soyad", d.customerName)}
${infoRow("Firma", d.company)}
${infoRow("E-posta", d.email)}
${infoRow("Telefon", d.phone)}
${infoRow("Not", d.note)}
</table>
${itemsTable(d.items)}
${totalsBlock(d)}
${
  d.adminUrl
    ? `<div style="margin-top:24px;"><a href="${d.adminUrl}" style="display:inline-block;background:${C.steel};color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:3px;">Admin panelinde teklifi aç</a></div>`
    : ""
}`;
  return { subject: `Yeni Teklif Talebi — ${d.quoteNumber}`, html: layout("Yeni teklif talebi", body) };
}

/** Müşteriye: talep alındı onayı. */
export function quoteReceivedToCustomer(d: QuoteEmailData): { subject: string; html: string } {
  const body = `
<p style="margin:0 0 16px;font-size:14px;color:${C.ink};">Sayın ${escapeHtml(d.customerName)},</p>
<p style="margin:0 0 16px;font-size:14px;color:${C.muted};">Teklif talebiniz tarafımıza ulaştı. Ekibimiz iskontolu resmi teklifinizi hazırlayıp en kısa sürede (genellikle 24 saat içinde) e-posta ile paylaşacaktır.</p>
<p style="margin:0 0 16px;font-size:14px;color:${C.muted};">Talep numaranız: <strong style="color:${C.ink};font-family:monospace;">${d.quoteNumber}</strong></p>
<p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:${C.ink};">Talep özetiniz</p>
${itemsTable(d.items)}
${totalsBlock(d)}
<p style="margin:20px 0 0;font-size:12px;color:${C.muted};">Not: Yukarıdaki tutarlar liste fiyatları üzerindendir; geçerli iskonto resmi teklifinizde uygulanacaktır.</p>`;
  return {
    subject: `Teklif talebiniz alındı — ${d.quoteNumber}`,
    html: layout("Teklif talebiniz alındı", body),
  };
}

/** Firmaya: iletişim formu mesajı. */
export function contactToCompany(c: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): { subject: string; html: string } {
  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};border:1px solid ${C.border};padding:14px 16px;margin-bottom:18px;">
${infoRow("Ad Soyad", c.name)}
${infoRow("E-posta", c.email)}
${infoRow("Telefon", c.phone)}
${infoRow("Konu", c.subject)}
</table>
<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:${C.ink};">Mesaj</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:${C.ink};white-space:pre-wrap;">${escapeHtml(c.message)}</p>`;
  return {
    subject: `İletişim Formu — ${c.subject ? c.subject : c.name}`,
    html: layout("Yeni iletişim mesajı", body),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
