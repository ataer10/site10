import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import type { FaqItem } from "@/lib/content";

/**
 * Anasayfa SSS — native <details> akordeon (istemci JS gerektirmez, erişilebilir,
 * SSR + SEO dostu). Maddeler admin'den gelir; FAQPage JSON-LD anasayfadan gömülür.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="border-b border-border bg-ink-50 py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Başlık + iletişim */}
          <div className="lg:col-span-4">
            <SectionHeading
              kicker="Sıkça Sorulan Sorular"
              title="Aklınızdaki sorular"
              description="Açık fiyatlı katalog ve üyeliksiz teklif sürecimize dair en çok merak edilenler."
            />
            <p className="mt-6 text-sm text-ink-500">
              Yanıtını bulamadınız mı?
            </p>
            <Button asChild variant="outline" className="mt-3">
              <Link href="/iletisim">Bize ulaşın</Link>
            </Button>
          </div>

          {/* Akordeon */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
              {items.map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-ink-100 last:border-0 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-bold tracking-tight text-ink-900 transition-colors hover:text-steel-600">
                    {item.q}
                    <ChevronDown
                      className="size-5 shrink-0 text-ink-400 transition-transform duration-200 ease-[var(--ease-industrial)] group-open:rotate-180"
                      strokeWidth={1.75}
                    />
                  </summary>
                  <p className="px-5 pb-4 text-sm leading-relaxed text-ink-600">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
