import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CoverImage } from "@/components/site/media";
import { cn } from "@/lib/utils";

type Crumb = { title: string; href?: string };

/** İç sayfa başlığı — breadcrumb + başlık + açıklama, koyu endüstriyel bant.
 *  `image` verilirse arka plana koyu-overlay'li fotoğraf yerleşir. */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  image,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  image?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-ink-800 bg-ink-900 text-white",
        className,
      )}
    >
      {image ? (
        <CoverImage src={image} overlay="darker" sizes="100vw" />
      ) : (
        <div className="absolute inset-0 bg-grid opacity-[0.06]" aria-hidden />
      )}
      <Container className="relative py-12 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
            <li>
              <Link href="/" className="hover:text-white">
                Anasayfa
              </Link>
            </li>
            {breadcrumbs.map((c) => (
              <li key={c.title} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-ink-600" strokeWidth={1.5} />
                {c.href ? (
                  <Link href={c.href} className="hover:text-white">
                    {c.title}
                  </Link>
                ) : (
                  <span className="text-ink-200">{c.title}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-3xl font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-300">
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
