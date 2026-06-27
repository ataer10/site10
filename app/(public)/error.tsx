"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 lg:py-32">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-md border border-danger/30 bg-danger/5 text-danger">
          <TriangleAlert className="size-7" strokeWidth={1.5} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-ink-900">
          Bir hata oluştu
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
          Beklenmeyen bir sorun yaşandı. Lütfen tekrar deneyin; sorun devam
          ederse bizimle iletişime geçin.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="primary" size="lg">
            <RotateCcw strokeWidth={1.75} />
            Tekrar dene
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Anasayfa</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
