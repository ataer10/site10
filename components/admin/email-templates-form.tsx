"use client";

import * as React from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import {
  Save,
  Loader2,
  CircleCheckBig,
  TriangleAlert,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { saveEmailTemplatesAction } from "@/lib/actions/email-settings";
import {
  TEMPLATE_PLACEHOLDERS,
  type EmailTemplatesConfig,
} from "@/lib/email/templates";

export function EmailTemplatesForm({
  initial,
  demo,
}: {
  initial: EmailTemplatesConfig;
  demo: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const { register, handleSubmit } = useForm<EmailTemplatesConfig>({
    defaultValues: initial,
  });

  function onSubmit(values: EmailTemplatesConfig) {
    setMsg(null);
    startTransition(async () => {
      const res = await saveEmailTemplatesAction(values);
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: res.demo
                ? "Kaydedildi (demo — kalıcı değil)."
                : "E-posta şablonları kaydedildi.",
            }
          : { kind: "err", text: res.error ?? "Kaydedilemedi." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Yer-tutucu açıklaması */}
      <div className="flex gap-3 rounded-md border border-steel-200 bg-steel-50 p-4 text-sm text-steel-800">
        <Info className="mt-0.5 size-5 shrink-0 text-steel-600" strokeWidth={1.75} />
        <div>
          <p className="font-semibold">Yer-tutucular</p>
          <p className="mt-1 text-steel-700">
            Metinlerde aşağıdaki etiketleri kullanabilirsiniz; gönderim sırasında
            gerçek değerlerle değişir.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATE_PLACEHOLDERS.map((p) => (
              <span
                key={p.token}
                className="inline-flex items-center gap-1.5 rounded-sm border border-steel-200 bg-white px-2 py-1 text-xs"
              >
                <code className="font-mono font-semibold text-steel-700">
                  {p.token}
                </code>
                <span className="text-ink-500">{p.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <TemplateCard
        title="Teklif talebi onayı"
        desc="Müşteri teklif talebi gönderdiğinde otomatik gider (kalem tablosu + toplam otomatik eklenir)."
        prefix="quoteReceived"
        register={register}
      />
      <TemplateCard
        title="Resmi teklif gönderimi (PDF'li)"
        desc="Admin panelinden teklifi gönderdiğinizde müşteriye gider (teklif no, tutar, geçerlilik otomatik eklenir)."
        prefix="quoteReady"
        register={register}
      />

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
          Not: Kalıcı kayıt için Supabase service-role anahtarı gereklidir.
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
        Şablonları kaydet
      </Button>
    </form>
  );
}

function TemplateCard({
  title,
  desc,
  prefix,
  register,
}: {
  title: string;
  desc: string;
  prefix: "quoteReceived" | "quoteReady";
  register: UseFormRegister<EmailTemplatesConfig>;
}) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-700">
        {title}
      </h2>
      <p className="mt-1 text-xs text-ink-400">{desc}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>E-posta konusu</Label>
          <Input {...register(`${prefix}.subject` as const)} />
        </div>
        <div>
          <Label>Başlık (e-posta içi)</Label>
          <Input {...register(`${prefix}.title` as const)} />
        </div>
      </div>
      <div className="mt-4">
        <Label>Giriş metni</Label>
        <Textarea rows={4} {...register(`${prefix}.intro` as const)} />
        <p className="mt-1 text-xs text-ink-400">
          Boş satır bırakarak paragraf ayırabilirsiniz.
        </p>
      </div>
      <div className="mt-4">
        <Label>Alt not</Label>
        <Textarea rows={2} {...register(`${prefix}.outro` as const)} />
      </div>
    </div>
  );
}
