import Link from "next/link";
import { Compass, ArrowRight, Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const links = [
  { title: "Ürün Kataloğu", href: "/urunler" },
  { title: "Markalar", href: "/markalar" },
  { title: "Kataloglar", href: "/kataloglar" },
  { title: "Fiyat Listesi", href: "/fiyat-listesi" },
  { title: "İletişim", href: "/iletisim" },
];

export default function NotFound() {
  return (
    <Container className="py-24 lg:py-32">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-md border border-ink-200 bg-ink-50 text-steel-600">
          <Compass className="size-7" strokeWidth={1.5} />
        </span>
        <p className="mt-6 font-mono text-sm uppercase tracking-[0.18em] text-steel-600">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900">
          Sayfa bulunamadı
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
          Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Aşağıdaki
          bağlantılardan devam edebilir ya da kataloğumuzda arama yapabilirsiniz.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="accent" size="lg">
            <Link href="/urunler">
              <Search strokeWidth={1.75} />
              Kataloğu İncele
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              Anasayfa
              <ArrowRight strokeWidth={1.75} />
            </Link>
          </Button>
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-ink-200 pt-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-500 hover:text-steel-600"
            >
              {l.title}
            </Link>
          ))}
        </nav>
      </div>
    </Container>
  );
}
