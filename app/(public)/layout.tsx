import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { JsonLd } from "@/components/seo/json-ld";
import { getSettings } from "@/lib/data/settings";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

/** Kamuya açık site düzeni — header, footer, WhatsApp float. */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-full flex-col">
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloat settings={settings} />
    </div>
  );
}
