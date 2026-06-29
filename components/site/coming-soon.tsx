import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

/**
 * Faz 1 yer tutucusu — sonraki fazlarda geliştirilecek rotalar için.
 * Tasarım dilini koruyan basit bir "yakında" bloğu.
 */
export function ComingSoon({
  phase,
  note,
}: {
  phase: string;
  note?: string;
}) {
  return (
    <Container className="py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-md border border-ink-200 bg-ink-50 text-steel-600">
          <Construction className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-steel-600">
          {phase}
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900">
          Bu bölüm yapım aşamasında
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
          {note ??
            "Tasarım sistemi (Faz 1) tamamlandı. Bu sayfa sonraki fazda işlevsel hale getirilecek."}
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/">
            <ArrowLeft strokeWidth={1.75} />
            Anasayfaya dön
          </Link>
        </Button>
      </div>
    </Container>
  );
}
