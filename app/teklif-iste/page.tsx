import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ComingSoon } from "@/components/site/coming-soon";

export const metadata: Metadata = {
  title: "Teklif İste",
  description: "Sepetinizi gönderin, iskontolu resmi teklifinizi alın.",
};

export default function TeklifIstePage() {
  return (
    <>
      <PageHeader
        title="Teklif İste"
        description="Bilgilerinizi bırakın; iskontolu resmi teklifiniz 24 saat içinde e-postanıza gelsin."
        breadcrumbs={[{ title: "Teklif İste" }]}
      />
      <ComingSoon
        phase="Faz 3 — Sepet + Teklif Talebi"
        note="Teklif formu, kayıt (Supabase) ve Resend e-postaları Faz 3'te gelecek."
      />
    </>
  );
}
