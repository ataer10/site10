import { getHeroSlides } from "@/lib/data/hero";
import { adminConfigured } from "@/lib/data/admin";
import { HeroForm } from "@/components/admin/hero-form";

export default async function HeroPage() {
  const slides = await getHeroSlides();
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Hero / Vitrin
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-500">
        Anasayfanın üst bölümündeki sinematik slaytların metin ve görselleri.
        Sürükleyici ilk izlenim burada yönetilir; slayt ekleyip sıralayabilir,
        her slaytın başlığını, açıklamasını, butonlarını ve görselini
        değiştirebilirsiniz.
      </p>
      <HeroForm initial={slides} demo={!adminConfigured()} />
    </div>
  );
}
