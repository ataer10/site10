"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { saveFaqAction } from "@/lib/actions/faq";
import type { FaqItem } from "@/lib/content";

type Values = { items: FaqItem[] };

export function FaqManager({
  initial,
  demo,
}: {
  initial: FaqItem[];
  demo: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const { register, handleSubmit, control } = useForm<Values>({
    defaultValues: { items: initial.length ? initial : [{ q: "", a: "" }] },
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });

  function onSubmit(values: Values) {
    setMsg(null);
    const clean = values.items.filter((i) => i.q.trim() && i.a.trim());
    if (clean.length === 0) {
      setMsg({ kind: "err", text: "En az bir geçerli soru-cevap gerekli." });
      return;
    }
    startTransition(async () => {
      const res = await saveFaqAction(clean);
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: res.demo
                ? "Kaydedildi (demo — kalıcı değil)."
                : "SSS kaydedildi. Anasayfa güncellendi.",
            }
          : { kind: "err", text: res.error ?? "Kaydedilemedi." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-4">
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-md border border-ink-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-700">
              Soru {i + 1}
            </h2>
            <div className="flex items-center gap-1">
              <IconBtn label="Yukarı" disabled={i === 0} onClick={() => move(i, i - 1)}>
                <ArrowUp className="size-4" strokeWidth={1.75} />
              </IconBtn>
              <IconBtn
                label="Aşağı"
                disabled={i === fields.length - 1}
                onClick={() => move(i, i + 1)}
              >
                <ArrowDown className="size-4" strokeWidth={1.75} />
              </IconBtn>
              <IconBtn
                label="Sil"
                danger
                disabled={fields.length <= 1}
                onClick={() => remove(i)}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
              </IconBtn>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Soru</Label>
              <Input
                {...register(`items.${i}.q` as const)}
                placeholder="Örn. Fiyatlara KDV dahil mi?"
              />
            </div>
            <div>
              <Label>Cevap</Label>
              <Textarea
                rows={3}
                {...register(`items.${i}.a` as const)}
                placeholder="Kısa, net bir yanıt…"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ q: "", a: "" })}
        disabled={fields.length >= 20}
      >
        <Plus strokeWidth={1.75} />
        Soru ekle
      </Button>

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

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
          Kaydet
        </Button>
        <span className="text-xs text-ink-400">{fields.length} soru</span>
      </div>
    </form>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-8 place-items-center rounded-sm border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "hover:border-danger/40 hover:text-danger" : "hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}
