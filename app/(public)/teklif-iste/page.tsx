"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleCheckBig,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import {
  useCart,
  selectSubtotal,
  selectVatTotal,
  useCartHydrated,
} from "@/lib/store/cart";
import { quoteCustomerSchema, type QuoteCustomerInput } from "@/lib/validation";
import { createQuote, type CreateQuoteResult } from "@/lib/actions/quote";
import { formatPrice } from "@/lib/utils";

export default function TeklifIstePage() {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const vatTotal = useCart(selectVatTotal);

  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<CreateQuoteResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteCustomerInput>({
    resolver: zodResolver(quoteCustomerSchema),
  });

  function onSubmit(values: QuoteCustomerInput) {
    const payload = {
      ...values,
      items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
    };
    startTransition(async () => {
      const res = await createQuote(payload);
      setResult(res);
      if (res.ok) clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Başarılı
  if (result?.ok) {
    return (
      <Container className="py-16 lg:py-24">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-md bg-steel-50 text-steel-600">
            <CircleCheckBig className="size-8" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            Talebiniz alındı
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
            Teklif talebiniz bize ulaştı. İskontolu resmi teklifinizi hazırlayıp
            en kısa sürede e-posta ile göndereceğiz.
          </p>
          <div className="mt-6 w-full rounded-md border border-ink-200 bg-ink-50 px-5 py-4">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-400">
              Talep Numaranız
            </p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink-900">
              {result.quoteNumber}
            </p>
          </div>
          <Button asChild variant="primary" className="mt-8">
            <Link href="/urunler">
              Kataloğa dön
              <ArrowRight strokeWidth={1.75} />
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  // Sepet boş
  if (hydrated && items.length === 0) {
    return (
      <Container className="py-16 lg:py-24">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-md border border-ink-200 bg-white text-ink-400">
            <ShoppingCart className="size-6" strokeWidth={1.5} />
          </span>
          <h1 className="mt-5 font-display text-xl font-bold text-ink-900">
            Teklif için sepetiniz boş
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            Önce katalogdan ürünleri sepete ekleyin, ardından teklif talebinizi
            oluşturun.
          </p>
          <Button asChild variant="primary" className="mt-6">
            <Link href="/urunler">
              Kataloğa git
              <ArrowRight strokeWidth={1.75} />
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Teklif İste
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Bilgilerinizi bırakın; iskontolu resmi teklifiniz en kısa sürede
          e-postanıza gelsin.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-7">
          <div className="rounded-md border border-ink-200 bg-white p-6">
            <h2 className="font-display text-base font-bold tracking-tight text-ink-900">
              İletişim Bilgileri
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad *" error={errors.customerName?.message}>
                <Input
                  {...register("customerName")}
                  aria-invalid={!!errors.customerName}
                  placeholder="Adınız ve soyadınız"
                />
              </Field>
              <Field label="Firma" error={errors.company?.message}>
                <Input {...register("company")} placeholder="Firma adı (opsiyonel)" />
              </Field>
              <Field label="E-posta *" error={errors.email?.message}>
                <Input
                  type="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  placeholder="ornek@firma.com"
                />
              </Field>
              <Field label="Telefon" error={errors.phone?.message}>
                <Input
                  type="tel"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                  placeholder="0(5xx) xxx xx xx"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Not" error={errors.note?.message}>
                  <Textarea
                    {...register("note")}
                    placeholder="Teslimat, termin veya özel talepleriniz…"
                  />
                </Field>
              </div>
            </div>

            {result && !result.ok ? (
              <div className="mt-4 flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                {result.error}
              </div>
            ) : null}

            <p className="mt-4 text-xs text-ink-400">
              Talebinizi göndererek bilgilerinizin teklif amacıyla işlenmesini
              kabul etmiş olursunuz.
            </p>
          </div>

          <div className="mt-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/sepet">
                <ArrowLeft strokeWidth={1.75} />
                Sepete dön
              </Link>
            </Button>
          </div>
        </div>

        {/* Sepet özeti */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-md border border-ink-200 bg-white">
            <div className="border-b border-ink-100 px-5 py-4">
              <h2 className="font-display text-base font-bold tracking-tight text-ink-900">
                Talep Özeti
              </h2>
            </div>

            {!hydrated ? (
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-ink-100" />
              </div>
            ) : (
              <>
                <ul className="max-h-72 divide-y divide-ink-100 overflow-y-auto px-5">
                  {items.map((it) => (
                    <li key={it.slug} className="flex justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate text-ink-800">{it.name}</span>
                        <span className="font-mono text-[11px] text-ink-400">
                          {it.qty} {it.unit} × {formatPrice(it.listPrice)}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-ink-900 tnum">
                        {formatPrice(it.listPrice * it.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-2 border-t border-ink-100 px-5 py-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Ara toplam</dt>
                    <dd className="text-ink-900 tnum">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-500">KDV</dt>
                    <dd className="text-ink-900 tnum">{formatPrice(vatTotal)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-ink-200 pt-2">
                    <dt className="font-display font-bold text-ink-900">Genel toplam</dt>
                    <dd className="font-display text-lg font-extrabold text-ink-900 tnum">
                      {formatPrice(subtotal + vatTotal)}
                    </dd>
                  </div>
                </dl>
              </>
            )}

            <div className="border-t border-ink-100 px-5 py-4">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                disabled={pending || !hydrated || items.length === 0}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" strokeWidth={2} />
                    Gönderiliyor…
                  </>
                ) : (
                  <>
                    Teklif Talebini Gönder
                    <ArrowRight strokeWidth={1.75} />
                  </>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-ink-400">
                Liste fiyatları üzerinden iskonto, resmi teklifinizde uygulanır.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Container>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
