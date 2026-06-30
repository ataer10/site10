import { formatPrice } from "@/lib/utils";
import { defaultSettings, type SiteSettings } from "@/lib/site";

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

/** Admin'den düzenlenebilen müşteri e-postası metinleri. */
export type CustomerTemplate = {
  subject: string;
  title: string;
  intro: string;
  outro: string;
};
export type EmailTemplatesConfig = {
  quoteReceived: CustomerTemplate;
  quoteReady: CustomerTemplate;
};

/** Kod içi varsayılan metinler (DB yoksa/boşsa fallback + form varsayılanı). */
export const DEFAULT_TEMPLATES: EmailTemplatesConfig = {
  quoteReceived: {
    subject: "Teklif talebiniz alındı — {teklifNo}",
    title: "Teklif talebiniz alındı",
    intro:
      "Sayın {ad},\n\nTeklif talebiniz tarafımıza ulaştı. Ekibimiz iskontolu resmi teklifinizi hazırlayıp en kısa sürede (genellikle 24 saat içinde) e-posta ile paylaşacaktır.\n\nTalep numaranız: {teklifNo}",
    outro:
      "Not: Yukarıdaki tutarlar liste fiyatları üzerindendir; geçerli iskonto resmi teklifinizde uygulanacaktır.",
  },
  quoteReady: {
    subject: "Teklifiniz hazır — {teklifNo}",
    title: "İskontolu teklifiniz",
    intro:
      "Sayın {ad},\n\nTalebiniz üzerine hazırladığımız iskontolu resmi teklifimizi ekte PDF olarak bulabilirsiniz.",
    outro:
      "Sorularınız için bu e-postayı yanıtlayabilir ya da bizi arayabilirsiniz. İlginiz için teşekkür ederiz.",
  },
};

/** Şablonlarda kullanılabilir yer-tutucular (admin formunda gösterilir). */
export const TEMPLATE_PLACEHOLDERS = [
  { token: "{ad}", desc: "Müşteri adı" },
  { token: "{teklifNo}", desc: "Teklif numarası" },
  { token: "{tutar}", desc: "Genel toplam" },
  { token: "{firma}", desc: "Firma adı" },
  { token: "{gecerlilik}", desc: "Geçerlilik tarihi (yalnız resmi teklif)" },
] as const;

const C = {
  ink: "#16181D",
  steel: "#1B4965",
  orange: "#E2580C",
  border: "#DEE1E5",
  muted: "#6C7480",
  bg: "#F7F8F9",
};

/** {token} → değer. Bilinmeyen token boş string'e iner. */
function fill(tpl: string, vars: Record<string, string>): string {
  return (tpl ?? "").replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

/** Düz metni (boş satırla ayrılmış) <p> paragraflarına çevirir; HTML kaçışlı. */
function paragraphs(text: string, color: string, size = "14px"): string {
  return (text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:${size};line-height:1.6;color:${color};">${escapeHtml(
          p,
        ).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

function layout(
  title: string,
  body: string,
  site: SiteSettings = defaultSettings,
): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${C.border};">
  <tr><td style="background:${C.ink};padding:20px 28px;">
    <span style="font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase;">${site.shortName}<span style="color:#6E92AF;">.</span></span>
    <span style="font-size:11px;color:#9AA1AB;letter-spacing:1px;text-transform:uppercase;margin-left:8px;">${site.tagline}</span>
  </td></tr>
  <tr><td style="padding:28px;">
    <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${C.ink};">${escapeHtml(title)}</h1>
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

/** Firmaya: yeni teklif talebi. (Düzenlenebilir değil — iç bildirim.) */
export function newQuoteToCompany(
  d: QuoteEmailData,
  site: SiteSettings = defaultSettings,
): { subject: string; html: string } {
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
  return { subject: `Yeni Teklif Talebi — ${d.quoteNumber}`, html: layout("Yeni teklif talebi", body, site) };
}

/** Müşteriye: talep alındı onayı. (Metinler admin'den düzenlenebilir.) */
export function quoteReceivedToCustomer(
  d: QuoteEmailData,
  site: SiteSettings = defaultSettings,
  tpl: CustomerTemplate = DEFAULT_TEMPLATES.quoteReceived,
): { subject: string; html: string } {
  const vars: Record<string, string> = {
    ad: d.customerName,
    teklifNo: d.quoteNumber,
    tutar: formatPrice(d.grandTotal),
    firma: site.name,
    gecerlilik: "",
  };
  const body = `${paragraphs(fill(tpl.intro, vars), C.ink)}
<p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:${C.ink};">Talep özetiniz</p>
${itemsTable(d.items)}
${totalsBlock(d)}
${tpl.outro ? `<div style="margin-top:20px;">${paragraphs(fill(tpl.outro, vars), C.muted, "12px")}</div>` : ""}`;
  return {
    subject: fill(tpl.subject, vars),
    html: layout(fill(tpl.title, vars), body, site),
  };
}

/** Müşteriye: hazır resmi teklif (PDF ekli). (Metinler admin'den düzenlenebilir.) */
export function quoteReadyToCustomer(
  d: {
    quoteNumber: string;
    customerName: string;
    grandTotal: number;
    validUntil?: string | null;
  },
  site: SiteSettings = defaultSettings,
  tpl: CustomerTemplate = DEFAULT_TEMPLATES.quoteReady,
): { subject: string; html: string } {
  const valid = d.validUntil
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(d.validUntil))
    : null;
  const vars: Record<string, string> = {
    ad: d.customerName,
    teklifNo: d.quoteNumber,
    tutar: formatPrice(d.grandTotal),
    firma: site.name,
    gecerlilik: valid ?? "",
  };
  const infoTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};border:1px solid ${C.border};padding:14px 16px;margin:4px 0 18px;">
<tr><td style="font-size:13px;color:${C.muted};">Teklif No</td><td style="font-size:13px;color:${C.ink};font-family:monospace;text-align:right;">${d.quoteNumber}</td></tr>
<tr><td style="font-size:13px;color:${C.muted};">Genel Toplam</td><td style="font-size:15px;color:${C.ink};font-weight:bold;text-align:right;">${formatPrice(d.grandTotal)}</td></tr>
${valid ? `<tr><td style="font-size:13px;color:${C.muted};">Geçerlilik</td><td style="font-size:13px;color:${C.ink};text-align:right;">${valid}</td></tr>` : ""}
</table>`;
  const body = `${paragraphs(fill(tpl.intro, vars), C.ink)}${infoTable}${
    tpl.outro ? paragraphs(fill(tpl.outro, vars), C.muted, "13px") : ""
  }`;
  return {
    subject: fill(tpl.subject, vars),
    html: layout(fill(tpl.title, vars), body, site),
  };
}

/** Firmaya: iletişim formu mesajı. */
export function contactToCompany(c: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}, site: SiteSettings = defaultSettings): { subject: string; html: string } {
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
    html: layout("Yeni iletişim mesajı", body, site),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
