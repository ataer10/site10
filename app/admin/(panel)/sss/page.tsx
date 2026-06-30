import { getFaq } from "@/lib/data/faq";
import { adminConfigured } from "@/lib/data/admin";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function SssPage() {
  const faq = await getFaq();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        SSS (Sıkça Sorulan Sorular)
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-500">
        Anasayfadaki SSS bölümünün soru-cevapları. Ekleyin, düzenleyin, sıralayın
        veya silin; değişiklikler anasayfada ve arama motoru zengin sonuçlarında
        (FAQ) yansır.
      </p>
      <FaqManager initial={faq} demo={!adminConfigured()} />
    </div>
  );
}
