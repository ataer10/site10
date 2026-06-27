import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ComingSoon } from "@/components/site/coming-soon";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Adres, telefon, e-posta ve iletişim formu.",
};

export default function IletisimPage() {
  return (
    <>
      <PageHeader
        title="İletişim"
        description="Bize ulaşın; teklif, teknik destek ve tedarik talepleriniz için buradayız."
        breadcrumbs={[{ title: "İletişim" }]}
      />
      <ComingSoon
        phase="Faz 3 — Sepet + Teklif Talebi"
        note="İletişim formu (Resend ile mail), harita ve WhatsApp bağlantısı Faz 3'te gelecek."
      />
    </>
  );
}
