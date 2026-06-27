"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CircleCheckBig, TriangleAlert, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { sendContactMessage } from "@/lib/actions/contact";

export function ContactForm() {
  const [pending, startTransition] = React.useTransition();
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  function onSubmit(values: ContactInput) {
    setError(null);
    startTransition(async () => {
      const res = await sendContactMessage(values);
      if (res.ok) {
        setDone(true);
        reset();
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-md border border-ink-200 bg-white px-6 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-md bg-steel-50 text-steel-600">
          <CircleCheckBig className="size-7" strokeWidth={1.5} />
        </span>
        <h3 className="mt-5 font-display text-lg font-bold text-ink-900">
          Mesajınız iletildi
        </h3>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          En kısa sürede size dönüş yapacağız. İlginiz için teşekkürler.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Yeni mesaj gönder
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-md border border-ink-200 bg-white p-6"
    >
      <h2 className="font-display text-base font-bold tracking-tight text-ink-900">
        Bize yazın
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Ad Soyad *" error={errors.name?.message}>
          <Input {...register("name")} aria-invalid={!!errors.name} placeholder="Adınız" />
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
          <Input type="tel" {...register("phone")} placeholder="0(5xx) xxx xx xx" />
        </Field>
        <Field label="Konu" error={errors.subject?.message}>
          <Input {...register("subject")} placeholder="Talebinizin konusu" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Mesaj *" error={errors.message?.message}>
            <Textarea
              {...register("message")}
              aria-invalid={!!errors.message}
              className="min-h-32"
              placeholder="Mesajınızı yazın…"
            />
          </Field>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      ) : null}

      <Button type="submit" variant="accent" size="lg" className="mt-5 w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" strokeWidth={2} />
            Gönderiliyor…
          </>
        ) : (
          <>
            <Send strokeWidth={1.75} />
            Mesajı Gönder
          </>
        )}
      </Button>
    </form>
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
