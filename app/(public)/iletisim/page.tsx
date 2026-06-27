import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/site/contact-form";
import { whatsappLink } from "@/lib/site";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Adres, telefon, e-posta, WhatsApp ve iletişim formu ile bize ulaşın.",
};

export default async function IletisimPage() {
  const settings = await getSettings();
  const fullAddress = `${settings.address.line1}, ${settings.address.line2}, ${settings.address.city}, ${settings.address.country}`;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=14&output=embed`;

  return (
    <>
      <PageHeader
        title="İletişim"
        description="Teklif, teknik destek ve tedarik talepleriniz için bize ulaşın."
        image="/img/pexels-pixabay-357440.jpg"
        breadcrumbs={[{ title: "İletişim" }]}
      />

      <Container className="py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Bilgiler */}
          <div className="lg:col-span-5">
            <div className="rounded-md border border-ink-200 bg-white">
              <ul className="divide-y divide-ink-100">
                <InfoItem icon={MapPin} label="Adres">
                  {settings.address.line1}, {settings.address.line2}
                  <br />
                  {settings.address.city} / {settings.address.country}
                </InfoItem>
                <InfoItem icon={Phone} label="Telefon">
                  <a href={settings.phoneHref} className="hover:text-steel-600">
                    {settings.phone}
                  </a>
                </InfoItem>
                <InfoItem icon={Mail} label="E-posta">
                  <a href={`mailto:${settings.email}`} className="hover:text-steel-600">
                    {settings.email}
                  </a>
                </InfoItem>
                <InfoItem icon={Clock} label="Çalışma Saatleri">
                  {settings.workingHours}
                </InfoItem>
              </ul>
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappLink(
                settings.whatsapp,
                `Merhaba, ${settings.name} ile iletişime geçmek istiyorum.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-md border border-[#1f8a4c]/30 bg-[#1f8a4c]/5 px-5 py-4 transition-colors hover:bg-[#1f8a4c]/10"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-sm bg-[#1f8a4c] text-white">
                  <MessageCircle className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">
                    WhatsApp'tan yazın
                  </span>
                  <span className="block text-xs text-ink-500">
                    Hızlı yanıt için en pratik yol
                  </span>
                </span>
              </span>
              <span className="font-mono text-xs uppercase tracking-wide text-[#1f8a4c]">
                Aç →
              </span>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>

      {/* Harita */}
      <section className="border-t border-border">
        <div className="relative h-[360px] w-full bg-ink-100">
          <iframe
            title="Harita"
            src={mapSrc}
            className="absolute inset-0 size-full grayscale-[0.3]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-ink-200 bg-ink-50 text-steel-600">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-400">
          {label}
        </p>
        <p className="mt-1 text-sm text-ink-700">{children}</p>
      </div>
    </li>
  );
}
