"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Save, Loader2, CircleCheckBig, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { saveSettingsAction } from "@/lib/actions/admin";
import type { SettingsInput } from "@/lib/data/settings";

export function SettingsForm({
  initial,
  demo,
}: {
  initial: SettingsInput;
  demo: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const { register, handleSubmit } = useForm<SettingsInput>({ defaultValues: initial });

  function onSubmit(values: SettingsInput) {
    setMsg(null);
    startTransition(async () => {
      const res = await saveSettingsAction(values);
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: res.demo
                ? "Kaydedildi (demo — Supabase yokken kalıcı değil)."
                : "Ayarlar kaydedildi. Site genelinde güncellendi.",
            }
          : { kind: "err", text: res.error ?? "Kaydedilemedi." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
      <Card title="Firma kimliği">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Firma adı"><Input {...register("name")} /></F>
          <F label="Kısa ad (logo)"><Input {...register("shortName")} /></F>
          <div className="sm:col-span-2">
            <F label="Slogan / tagline"><Input {...register("tagline")} /></F>
          </div>
          <div className="sm:col-span-2">
            <F label="Açıklama"><Textarea {...register("description")} /></F>
          </div>
        </div>
      </Card>

      <Card title="İletişim">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="E-posta"><Input type="email" {...register("email")} /></F>
          <F label="Telefon"><Input {...register("phone")} placeholder="+90 212 000 00 00" /></F>
          <F label="WhatsApp numarası (905...)"><Input {...register("whatsapp")} placeholder="905000000000" /></F>
          <F label="Çalışma saatleri"><Input {...register("workingHours")} /></F>
        </div>
      </Card>

      <Card title="Adres">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <F label="Adres satırı 1"><Input {...register("addressLine1")} /></F>
          </div>
          <div className="sm:col-span-2">
            <F label="Adres satırı 2"><Input {...register("addressLine2")} /></F>
          </div>
          <F label="Şehir"><Input {...register("city")} /></F>
          <F label="Ülke"><Input {...register("country")} /></F>
        </div>
      </Card>

      {msg ? (
        <div
          className={`flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm ${
            msg.kind === "ok"
              ? "border-steel-200 bg-steel-50 text-steel-700"
              : "border-danger/30 bg-danger/5 text-danger"
          }`}
        >
          {msg.kind === "ok" ? (
            <CircleCheckBig className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          )}
          {msg.text}
        </div>
      ) : null}

      {demo ? (
        <p className="text-xs text-ink-400">
          Not: Değişikliklerin kalıcı olması ve sitede görünmesi için Supabase
          anahtarları (<code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>,
          anon) gereklidir.
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
        Kaydet
      </Button>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-5">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-700">
        {title}
      </h2>
      {children}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
