import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleCheckBig,
  FileDown,
  Quote,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/site/icon";
import { CoverImage } from "@/components/site/media";
import { BrandStrip } from "@/components/site/brand-strip";
import { homeCategories, homeFeatures, homeStats } from "@/lib/content";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const heroTrust = ["Açık liste fiyatları", "Üyeliksiz teklif", "Orijinal & faturalı"];

/** Kategori → kapak görseli (olmayanlar koyu desenli kartla gösterilir). */
const CAT_IMG: Record<string, string> = {
  "vana-armatur": "/img/pexels-quangludo-12527113.jpg",
  "boru-fittings": "/img/pexels-sonny-29248902.jpg",
  "pompa-hidrofor": "/img/cat-pompa.jpg",
  "isitma-tesisat": "/img/cat-isitma.jpg",
  "baglanti-elemanlari": "/img/pexels-sharaf-design-1962240186-28900882.jpg",
  "olcu-kontrol": "/img/cat-olcu.jpg",
};

export default function HomePage() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="absolute inset-0 bg-grid opacity-[0.35]" aria-hidden />
        <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-12 lg:py-24">
          {/* Sol: metin */}
          <div className="order-2 lg:order-1 lg:col-span-6 lg:pr-6">
            <Badge variant="steel" className="mb-5">
              <span className="size-1.5 rounded-full bg-orange-500" />
              Endüstriyel Tesisat Tedariki · B2B
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-ink-900 text-balance sm:text-5xl xl:text-[3.4rem]">
              Tesisat malzemesinde{" "}
              <span className="text-steel-600">doğru parça,</span> net fiyat,
              hızlı teklif.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              Vana, boru, pompa ve bağlantı elemanlarında binlerce ürün — açık
              liste fiyatıyla. Sepetinizi oluşturun, iskontolu resmi teklifinizi
              24 saat içinde alın.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link href="/urunler">
                  Kataloğu İncele
                  <ArrowRight strokeWidth={1.75} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/teklif-iste">Teklif İste</Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {heroTrust.map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink-600"
                >
                  <CircleCheckBig className="size-4 text-steel-500" strokeWidth={1.75} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Sağ: kahraman görsel + çakışan teklif kartı */}
          <div className="relative order-1 lg:order-2 lg:col-span-6 lg:pb-10">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-ink-200 shadow-raised sm:aspect-[3/2] lg:ml-auto lg:aspect-[4/5] lg:max-w-md">
              <CoverImage
                src="/img/pexels-88107820-10116844.jpg"
                alt="Endüstriyel turuncu vana ve hidrant kolonları"
                priority
                overlay="none"
                sizes="(min-width: 1024px) 38vw, 100vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgb(13 14 18 / 0.35), transparent 45%)",
                }}
                aria-hidden
              />
            </div>
            {/* Teklif önizleme kartı — masaüstünde görsele çakışır */}
            <div className="mt-4 lg:absolute lg:-bottom-2 lg:left-0 lg:mt-0 lg:w-[19rem] xl:w-80">
              <QuotePreviewCard />
            </div>
          </div>
        </Container>
      </section>

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
                    <h3 className="font-display text-lg font-bold tracking-tight text-white transition-colors group-hover:text-orange-400">
                      {cat.title}
                    </h3>
                    <ArrowUpRight
                      className="size-5 shrink-0 text-white/70 transition-colors group-hover:text-orange-400"
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
              <Button asChild variant="accent" size="lg">
                <Link href="/teklif-iste">
                  <Quote strokeWidth={1.75} />
                  Teklif İste
                </Link>
              </Button>
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

/* -------------------------------------------------------------------- */
/*  Hero teknik teklif önizleme kartı                                   */
/* -------------------------------------------------------------------- */
function QuotePreviewCard() {
  const items = [
    { sku: "VN-DN50-PN16", name: "Küresel Vana DN50", qty: 8, price: 1240.0 },
    { sku: "FT-PS-90-42", name: "Paslanmaz Dirsek 90°", qty: 24, price: 86.5 },
    { sku: "PMP-CR5-12", name: "Sirkülasyon Pompası", qty: 2, price: 18950.0 },
  ];
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="overflow-hidden rounded-md border border-ink-300 bg-white shadow-raised">
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-900 px-5 py-3.5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            Teklif Önizleme
          </p>
          <p className="font-mono text-sm font-medium text-white">TKL-2026-0148</p>
        </div>
        <Badge variant="accent" className="border-orange-400/30 bg-orange-500/15 text-orange-200">
          Hazırlanıyor
        </Badge>
      </div>
      <div className="divide-y divide-ink-100">
        {items.map((it) => (
          <div key={it.sku} className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">{it.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
                {it.sku} · {it.qty} adet
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-ink-800 tnum">
              {formatPrice(it.qty * it.price)}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-ink-200 bg-ink-50 px-5 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
            Ara Toplam (KDV hariç)
          </p>
          <p className="text-xs text-ink-400">İskonto teklifte uygulanır</p>
        </div>
        <p className="font-display text-xl font-extrabold text-ink-900 tnum">
          {formatPrice(subtotal)}
        </p>
      </div>
    </div>
  );
}
