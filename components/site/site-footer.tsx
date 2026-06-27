import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/site/logo";
import { mainNav, site } from "@/lib/site";

const productLinks = [
  { title: "Tüm Ürünler", href: "/urunler" },
  { title: "Markalar", href: "/markalar" },
  { title: "Fiyat Listesi", href: "/fiyat-listesi" },
  { title: "Teklif İste", href: "/teklif-iste" },
];

const corporateLinks = [
  { title: "Hakkımızda", href: "/hakkimizda" },
  { title: "İletişim", href: "/iletisim" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-800 bg-ink-900 text-ink-300 print:hidden">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Marka + iletişim */}
          <div className="lg:col-span-5">
            <Link href="/" aria-label={site.name}>
              <span className="inline-flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="grid size-8 place-items-center rounded-sm bg-white font-display text-base font-extrabold leading-none text-ink-900"
                >
                  B
                </span>
                <span className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
                  {site.shortName}
                  <span className="text-orange-500">.</span>
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              {site.description}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ink-500" strokeWidth={1.5} />
                <span>
                  {site.address.line1}, {site.address.line2}
                  <br />
                  {site.address.city} / {site.address.country}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-ink-500" strokeWidth={1.5} />
                <a href={site.phoneHref} className="hover:text-white">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-ink-500" strokeWidth={1.5} />
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-ink-500" strokeWidth={1.5} />
                <span>{site.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Katalog */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
              Katalog
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-300 hover:text-white">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kurumsal */}
          <div className="lg:col-span-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-ink-500">
              Kurumsal
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {corporateLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink-300 hover:text-white">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.
          </p>
          <p className="font-mono uppercase tracking-wide">
            Fiyatlara KDV dahil değildir · TRY
          </p>
        </div>
      </Container>
    </footer>
  );
}
