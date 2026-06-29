import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  ShieldCheck,
  Handshake,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { PageHeader } from "@/components/site/page-header";
import { CoverImage } from "@/components/site/media";
import { Button } from "@/components/ui/button";
import { homeStats } from "@/lib/content";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/hakkimizda" },
  openGraph: { url: "/hakkimizda" },
  title: "Hakkımızda",
  description:
    "Birtek Endüstriyel; vana, boru, pompa ve tesisat malzemelerinde yetkili distribütör kanalından B2B tedarik sağlayan bir mühendislik tedarik firmasıdır.",
};

const values = [
  {
    icon: Target,
    title: "Doğru Parça",
    body: "Her talebe teknik olarak doğru ürünle yanıt veririz. Yanlış malzeme, projede gecikme demektir; biz baştan doğrusunu öneririz.",
  },
  {
    icon: ShieldCheck,
    title: "Orijinal & Garantili",
    body: "Yalnızca yetkili distribütör kanalından, faturalı ve üretici garantili ürün tedarik ederiz. Paralel/kopya ürün satmayız.",
  },
  {
    icon: Handshake,
    title: "Uzun Vadeli İş Ortaklığı",
    body: "Tek seferlik satış değil; mekanik taahhüt, tesis ve sanayi müşterileriyle yıllara yayılan tedarik ilişkisi kurarız.",
  },
  {
    icon: Gauge,
    title: "Hız & Şeffaflık",
    body: "Açık liste fiyatı, net teklif, takip edilebilir sevkiyat. Sürpriz yok; baştan sona şeffaf bir süreç.",
  },
];

const milestones = [
  { year: "1994", text: "Tesisat malzemeleri toptan ticaretiyle kuruluş." },
  { year: "2006", text: "Avrupalı üreticilerle yetkili bayilik anlaşmaları." },
  { year: "2015", text: "Organize sanayi bölgesinde merkez depo ve lojistik." },
  { year: "2026", text: "Açık fiyatlı dijital katalog ve online teklif sistemi." },
];

export default async function HakkimizdaPage() {
  const site = await getSettings();
  return (
    <>
      <PageHeader
        title="Tesisatın arkasındaki tedarik disiplini"
        description="1994'ten bu yana endüstriyel tesisat malzemelerinde, mühendislik titizliğiyle doğru ürünü doğru zamanda tedarik ediyoruz."
        image="/img/pexels-pixabay-357440.jpg"
        breadcrumbs={[{ title: "Hakkımızda" }]}
      />

      {/* Kurumsal anlatı */}
      <section className="border-b border-border py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              kicker="Biz Kimiz"
              title="Bir malzeme tedarikçisinden fazlası"
            />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-600">
              <p>
                {site.name}, endüstriyel tesisat malzemeleri alanında faaliyet
                gösteren bir B2B tedarik firmasıdır. Vana ve armatürlerden boru
                ve bağlantı elemanlarına, pompalardan ölçü-kontrol
                ekipmanlarına kadar geniş bir ürün yelpazesini tek çatı altında
                sunarız.
              </p>
              <p>
                Müşterilerimiz; mekanik taahhüt firmaları, sanayi tesisleri,
                tesisat ustaları ve bakım-onarım ekipleridir. Onların ortak
                beklentisi nettir: doğru ürün, açık fiyat ve zamanında
                sevkiyat. Biz de iş modelimizi tam olarak bunun üzerine kurduk.
              </p>
              <p>
                Fiyatlarımızı herkese açık tutuyoruz. Dilediğiniz ürünü
                kataloğumuzdan inceleyebilir, sepetinize ekleyebilir ve
                üyeliğe gerek kalmadan iskontolu resmi teklifinizi talep
                edebilirsiniz.
              </p>
            </div>
          </div>

          {/* Görsel */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/2] overflow-hidden rounded-md border border-ink-200 shadow-flat lg:aspect-[4/5]">
              <CoverImage
                src="/img/pexels-marianna-zuzanna-498248397-16442684.jpg"
                alt="Tesisat hatlarında çalışan teknik ekip"
                overlay="none"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
          </div>
          </div>

          {/* Sayılarla firma */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 lg:grid-cols-4">
            {homeStats.map((s) => (
              <div key={s.label} className="bg-white p-6">
                <p className="font-display text-3xl font-extrabold tracking-tight text-steel-600 tnum">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Değerler */}
      <section className="border-b border-border bg-ink-50 py-20">
        <Container>
          <SectionHeading
            kicker="Değerlerimiz"
            title="Çalışma şeklimizi belirleyen ilkeler"
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 bg-white p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-ink-900 text-white">
                  <v.icon className="size-5" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-ink-900">
                    {v.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Tarihçe */}
      <section className="border-b border-border py-20">
        <Container>
          <SectionHeading kicker="Yolculuğumuz" title="Kısa tarihçe" />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m) => (
              <li key={m.year} className="bg-white p-6">
                <span className="font-mono text-sm font-medium text-steel-600">
                  {m.year}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {m.text}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-steel-700">
        <Container className="flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
          <h2 className="max-w-xl font-display text-2xl font-extrabold tracking-tight text-white text-balance sm:text-3xl">
            Projeniz için malzeme listenizi birlikte çıkaralım.
          </h2>
          <Button asChild variant="accent" size="lg" className="shrink-0">
            <Link href="/iletisim">
              İletişime Geç
              <ArrowRight strokeWidth={1.75} />
            </Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
