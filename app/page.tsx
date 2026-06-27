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
import { BrandStrip } from "@/components/site/brand-strip";
import {
  homeCategories,
  homeFeatures,
  homeStats,
} from "@/lib/content";
import { formatPrice } from "@/lib/utils";

const heroTrust = [
  "Açık liste fiyatları",
  "Üyeliksiz teklif",
  "Orijinal & faturalı",
];

export default function HomePage() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-y-0 right-0 hidden w-1/2 bg-ink-50/60 lg:block"
          aria-hidden
        />
        <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
          {/* Sol: metin */}
          <div className="lg:col-span-7 lg:pr-10">
            <Badge variant="steel" className="mb-5">
              <span className="size-1.5 rounded-full bg-orange-500" />
              Endüstriyel Tesisat Tedariki · B2B
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 text-balance sm:text-5xl lg:text-6xl">
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
                  <CircleCheckBig
                    className="size-4 text-steel-500"
                    strokeWidth={1.75}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Sağ: teknik teklif önizleme paneli */}
          <div className="lg:col-span-5">
            <QuotePreviewCard />
          </div>
        </Container>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="border-b border-border bg-ink-900">
        <Container>
          <dl className="grid grid-cols-2 divide-ink-800 lg:grid-cols-4 lg:divide-x">
            {homeStats.map((s) => (
              <div key={s.label} className="px-2 py-8 lg:px-8">
                <dt className="font-display text-3xl font-extrabold tracking-tight text-white tnum lg:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-ink-400">{s.label}</dd>
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

          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
            {homeCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/urunler?kategori=${cat.slug}`}
                className="group relative flex flex-col gap-4 bg-white p-6 transition-colors hover:bg-ink-50"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-sm border border-ink-200 bg-white text-steel-600 transition-colors group-hover:border-steel-300 group-hover:bg-steel-50">
                    <Icon name={cat.icon} className="size-5" />
                  </span>
                  <ArrowUpRight
                    className="size-5 text-ink-300 transition-colors group-hover:text-orange-500"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-ink-900">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    {cat.description}
                  </p>
                </div>
                <span className="mt-auto font-mono text-xs uppercase tracking-wide text-ink-400">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== NEDEN BİRTEK ========================== */}
      <section className="border-b border-border bg-ink-50 py-20">
        <Container>
          <SectionHeading
            kicker="Neden Birtek"
            title="Mühendislik disipliniyle tedarik"
            description="Bir tesisat projesinin malzeme listesini eksiksiz, doğru ve zamanında karşılamak için kurgulandık."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
            {homeFeatures.map((f) => (
              <div key={f.title} className="flex flex-col gap-3 bg-white p-6">
                <span className="grid size-10 place-items-center rounded-sm bg-ink-900 text-white">
                  <Icon name={f.icon} className="size-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-display text-base font-bold tracking-tight text-ink-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-500">
                  {f.description}
                </p>
              </div>
            ))}
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
      <section className="bg-steel-700">
        <Container className="py-16">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl">
                Malzeme listenizi gönderin, teklifiniz hazırlansın.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-steel-100">
                Sepetinizi oluşturup teklif talebinizi iletin; iskontolu resmi
                teklifinizi PDF olarak en geç 24 saat içinde e-postanıza
                gönderelim.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
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
                className="border-steel-300/40 bg-transparent text-white hover:border-white hover:bg-white/10"
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
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-md border border-ink-200 bg-white/40" aria-hidden />
      <div className="overflow-hidden rounded-md border border-ink-300 bg-white shadow-raised">
        {/* başlık */}
        <div className="flex items-center justify-between border-b border-ink-200 bg-ink-900 px-5 py-3.5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Teklif Önizleme
            </p>
            <p className="font-mono text-sm font-medium text-white">
              TKL-2026-0148
            </p>
          </div>
          <Badge variant="accent" className="border-orange-400/30 bg-orange-500/15 text-orange-200">
            Hazırlanıyor
          </Badge>
        </div>

        {/* kalemler */}
        <div className="divide-y divide-ink-100">
          {items.map((it) => (
            <div
              key={it.sku}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">
                  {it.name}
                </p>
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

        {/* toplam */}
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
    </div>
  );
}
