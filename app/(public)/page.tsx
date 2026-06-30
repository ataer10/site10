import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileDown, Quote } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/site/icon";
import { CoverImage } from "@/components/site/media";
import { BrandStrip } from "@/components/site/brand-strip";
import { FaqSection } from "@/components/site/faq-section";
import { HeroSlider } from "@/components/site/hero/hero-slider";
import { QuoteCta } from "@/components/site/quote-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getHeroSlides } from "@/lib/data/hero";
import { getFaq } from "@/lib/data/faq";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { homeCategories, homeFeatures, homeStats } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

/** Kategori → kapak görseli (olmayanlar koyu desenli kartla gösterilir). */
const CAT_IMG: Record<string, string> = {
  "vana-armatur": "/img/pexels-quangludo-12527113.jpg",
  "boru-fittings": "/img/pexels-sonny-29248902.jpg",
  "pompa-hidrofor": "/img/cat-pompa.jpg",
  "isitma-tesisat": "/img/cat-isitma.jpg",
  "baglanti-elemanlari": "/img/pexels-sharaf-design-1962240186-28900882.jpg",
  "olcu-kontrol": "/img/cat-olcu.jpg",
};

export default async function HomePage() {
  const [heroSlides, faq] = await Promise.all([getHeroSlides(), getFaq()]);
  return (
    <>
      {/* ===================== HERO — sinematik vitrin ===================== */}
      <HeroSlider slides={heroSlides} />

      {/* ============================ STATS ============================ */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <CoverImage
          src="/img/pexels-sonny-vermeer-505472791-17728787.jpg"
          overlay="darker"
          sizes="100vw"
        />
        <Container className="relative">
          <dl className="grid grid-cols-2 divide-ink-700/50 lg:grid-cols-4 lg:divide-x">
            {homeStats.map((s) => (
              <div key={s.label} className="px-2 py-9 lg:px-8">
                <dt className="font-display text-3xl font-extrabold tracking-tight text-white tnum lg:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-ink-300">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ========================== KATEGORİLER ========================== */}
      <section className="border-b border-border py-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              kicker="Ürün Grupları"
              title="Kategoriye göre keşfet"
              description="Endüstriyel tesisatın tüm ana grupları tek katalogda. Marka, kategori ve alt kategoriye göre filtreleyin."
            />
            <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
              <Link href="/urunler">
                Tüm ürünler
                <ArrowRight strokeWidth={1.75} />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/urunler?kategori=${cat.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-md border border-ink-200 bg-ink-900 p-5"
              >
                {CAT_IMG[cat.slug] ? (
                  <CoverImage
                    src={CAT_IMG[cat.slug]}
                    alt={cat.title}
                    overlay="bottom"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="transition-transform duration-500 ease-[var(--ease-industrial)] group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-grid opacity-[0.08]" aria-hidden />
                    <Icon
                      name={cat.icon}
                      className="absolute -bottom-3 -right-2 size-28 text-white/[0.06]"
                      strokeWidth={0.75}
                    />
                  </>
                )}
                <div className="relative">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-steel-200">
                    {cat.count}
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold tracking-tight text-white transition-colors group-hover:text-steel-200">
                      {cat.title}
                    </h3>
                    <ArrowUpRight
                      className="size-5 shrink-0 text-white/70 transition-colors group-hover:text-steel-200"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== NEDEN BİRTEK ========================== */}
      <section className="border-b border-border bg-ink-50 py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Görsel */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-ink-200 shadow-flat sm:aspect-[3/2] lg:aspect-[4/5]">
                <CoverImage
                  src="/img/pexels-marianna-zuzanna-498248397-16442684.jpg"
                  alt="Tesisat hatlarında çalışan teknik ekip"
                  overlay="none"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
            </div>
            {/* Özellikler */}
            <div className="lg:col-span-7">
              <SectionHeading
                kicker="Neden Birtek"
                title="Mühendislik disipliniyle tedarik"
                description="Bir tesisat projesinin malzeme listesini eksiksiz, doğru ve zamanında karşılamak için kurgulandık."
              />
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {homeFeatures.map((f) => (
                  <div key={f.title} className="flex gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-ink-900 text-white">
                      <Icon name={f.icon} className="size-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold tracking-tight text-ink-900">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-500">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================ MARKALAR ============================ */}
      <section className="border-b border-border py-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              kicker="Yetkili Bayilik"
              title="Çalıştığımız markalar"
              description="Avrupa ve dünya standartlarında üreticilerin orijinal ürünlerini yetkili kanaldan tedarik ediyoruz."
            />
            <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
              <Link href="/markalar">
                Tüm markalar
                <ArrowRight strokeWidth={1.75} />
              </Link>
            </Button>
          </div>
          <div className="mt-10">
            <BrandStrip />
          </div>
        </Container>
      </section>

      {/* ============================== SSS ============================== */}
      <JsonLd data={faqJsonLd(faq)} />
      <FaqSection items={faq} />

      {/* ============================ CTA BANDI ============================ */}
      <section className="relative overflow-hidden">
        <CoverImage
          src="/img/pexels-sonny-vermeer-505472791-17728787.jpg"
          overlay="left"
          sizes="100vw"
        />
        <Container className="relative py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl">
              Malzeme listenizi gönderin, teklifiniz hazırlansın.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-200">
              Sepetinizi oluşturup teklif talebinizi iletin; iskontolu resmi
              teklifinizi PDF olarak en geç 24 saat içinde e-postanıza
              gönderelim.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <QuoteCta variant="accent" size="lg">
                <Quote strokeWidth={1.75} />
                Teklif İste
              </QuoteCta>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10"
              >
                <Link href="/fiyat-listesi">
                  <FileDown strokeWidth={1.75} />
                  Fiyat Listesi
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
