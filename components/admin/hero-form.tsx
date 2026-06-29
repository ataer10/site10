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
  Upload,
  ImageOff,
  Info,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { saveHeroAction, uploadHeroImageAction } from "@/lib/actions/admin";
import type { HeroSlideInput } from "@/lib/data/hero";
import {
  HERO_IMAGE_SPEC,
  HERO_ACCEPT,
  validateHeroImage,
} from "@/lib/hero-image";

type SlideForm = Omit<HeroSlideInput, "secondary"> & {
  secondary: { label: string; href: string };
};
type Values = { slides: SlideForm[] };

const EMPTY: SlideForm = {
  tag: "",
  title: "",
  accent: "",
  titleTail: "",
  subtitle: "",
  image: "",
  imageAlt: "",
  cta: { label: "İncele", href: "/urunler" },
  secondary: { label: "", href: "" },
};

/** Seçilen dosyanın gerçek piksel ölçüsünü tarayıcıda okur. */
function readImageMeta(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("okunamadı"));
    };
    img.src = url;
  });
}

export function HeroForm({
  initial,
  demo,
}: {
  initial: HeroSlideInput[];
  demo: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [uploading, setUploading] = React.useState<number | null>(null);
  const [imgErr, setImgErr] = React.useState<Record<number, string>>({});

  const { register, handleSubmit, control, setValue, watch } = useForm<Values>({
    defaultValues: {
      slides: (initial.length ? initial : [EMPTY]).map((s) => ({
        ...EMPTY,
        ...s,
        cta: { ...EMPTY.cta, ...s.cta },
        secondary: s.secondary ?? { label: "", href: "" },
      })),
    },
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "slides" });
  const watched = watch("slides");

  function setErrAt(i: number, text: string | null) {
    setImgErr((m) => {
      const next = { ...m };
      if (text) next[i] = text;
      else delete next[i];
      return next;
    });
  }

  async function onPick(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrAt(i, null);
    setMsg(null);
    let dim: { width: number; height: number };
    try {
      dim = await readImageMeta(file);
    } catch {
      setErrAt(i, "Görsel okunamadı (bozuk dosya?).");
      e.target.value = "";
      return;
    }
    const v = validateHeroImage({
      type: file.type,
      size: file.size,
      width: dim.width,
      height: dim.height,
    });
    if (v) {
      setErrAt(i, v);
      e.target.value = "";
      return;
    }
    setUploading(i);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadHeroImageAction(fd);
    setUploading(null);
    e.target.value = "";
    if (res.ok) setValue(`slides.${i}.image`, res.url, { shouldDirty: true });
    else setErrAt(i, res.error);
  }

  function onSubmit(values: Values) {
    setMsg(null);
    for (let i = 0; i < values.slides.length; i++) {
      const s = values.slides[i];
      if (!s.image)
        return setMsg({ kind: "err", text: `Slayt ${i + 1}: görsel zorunlu.` });
      if (!s.title.trim())
        return setMsg({ kind: "err", text: `Slayt ${i + 1}: başlık zorunlu.` });
      if (!s.cta.label.trim() || !s.cta.href.trim())
        return setMsg({
          kind: "err",
          text: `Slayt ${i + 1}: birincil buton etiketi ve bağlantısı zorunlu.`,
        });
    }
    const payload: HeroSlideInput[] = values.slides.map((s) => ({
      ...s,
      secondary:
        s.secondary.label.trim() && s.secondary.href.trim()
          ? s.secondary
          : undefined,
    }));
    startTransition(async () => {
      const res = await saveHeroAction(payload);
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: res.demo
                ? "Kaydedildi (demo — Supabase yokken kalıcı değil)."
                : "Hero slaytları kaydedildi. Anasayfa güncellendi.",
            }
          : { kind: "err", text: res.error ?? "Kaydedilemedi." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5">
      {/* Görsel kuralları */}
      <div className="flex gap-3 rounded-md border border-steel-200 bg-steel-50 p-4 text-sm text-steel-800">
        <Info className="mt-0.5 size-5 shrink-0 text-steel-600" strokeWidth={1.75} />
        <div>
          <p className="font-semibold">Görsel kuralları (zorunlu)</p>
          <ul className="mt-1.5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <li>
              <strong>Biçim:</strong> {HERO_IMAGE_SPEC.formatLabel}
            </li>
            <li>
              <strong>Azami boyut:</strong> {HERO_IMAGE_SPEC.maxLabel}
            </li>
            <li>
              <strong>Önerilen ölçü:</strong> {HERO_IMAGE_SPEC.recommendedLabel}
            </li>
            <li>
              <strong>En az:</strong> {HERO_IMAGE_SPEC.minWidth}×
              {HERO_IMAGE_SPEC.minHeight} px · {HERO_IMAGE_SPEC.aspectLabel}
            </li>
          </ul>
          <p className="mt-1.5 text-xs text-steel-600">
            Bu kurallara uymayan görseller (yanlış biçim, çok büyük dosya, düşük
            çözünürlük veya dikey/kare oran) yüklenmez — böylece hero tasarımı
            bozulmaz.
          </p>
        </div>
      </div>

      {fields.map((field, i) => {
        const img = watched?.[i]?.image;
        const err = imgErr[i];
        return (
          <div key={field.id} className="rounded-md border border-ink-200 bg-white p-5">
            {/* Başlık + sıralama */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-700">
                Slayt {i + 1}
              </h2>
              <div className="flex items-center gap-1">
                <IconBtn
                  label="Yukarı taşı"
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  <ArrowUp className="size-4" strokeWidth={1.75} />
                </IconBtn>
                <IconBtn
                  label="Aşağı taşı"
                  disabled={i === fields.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <ArrowDown className="size-4" strokeWidth={1.75} />
                </IconBtn>
                <IconBtn
                  label="Slaytı sil"
                  disabled={fields.length <= 1}
                  danger
                  onClick={() => {
                    remove(i);
                    setErrAt(i, null);
                  }}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} />
                </IconBtn>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-12">
              {/* Görsel */}
              <div className="lg:col-span-5">
                <Label>Görsel *</Label>
                <div className="mt-1 aspect-[16/9] overflow-hidden rounded-sm border border-ink-200 bg-ink-50">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-ink-300">
                      <ImageOff className="size-8" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                {/* gizli alan — RHF değeri */}
                <input type="hidden" {...register(`slides.${i}.image` as const)} />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50">
                  {uploading === i ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" strokeWidth={1.75} />
                  )}
                  {uploading === i ? "Yükleniyor…" : img ? "Görseli değiştir" : "Görsel yükle"}
                  <input
                    type="file"
                    accept={HERO_ACCEPT}
                    className="hidden"
                    onChange={(e) => onPick(i, e)}
                    disabled={uploading !== null}
                  />
                </label>
                <p className="mt-1.5 text-xs text-ink-400">
                  {HERO_IMAGE_SPEC.formatLabel} · ≤ {HERO_IMAGE_SPEC.maxLabel} ·
                  ≥ {HERO_IMAGE_SPEC.minWidth}×{HERO_IMAGE_SPEC.minHeight} ·{" "}
                  {HERO_IMAGE_SPEC.aspectLabel}
                </p>
                {err ? (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-danger">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
                    {err}
                  </p>
                ) : null}

                <div className="mt-4">
                  <Label>Görsel alt metni (erişilebilirlik / SEO)</Label>
                  <Input
                    {...register(`slides.${i}.imageAlt` as const)}
                    placeholder="Örn. Endüstriyel vana ve boru hattı"
                  />
                </div>
              </div>

              {/* Metinler */}
              <div className="space-y-4 lg:col-span-7">
                <div>
                  <Label>Üst etiket (küçük mono yazı)</Label>
                  <Input
                    {...register(`slides.${i}.tag` as const)}
                    placeholder="Örn. Vana & Armatür"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Başlık (1. kısım) *</Label>
                    <Input
                      {...register(`slides.${i}.title` as const)}
                      placeholder="Vanada"
                    />
                  </div>
                  <div>
                    <Label>Vurgulu kısım (mavi)</Label>
                    <Input
                      {...register(`slides.${i}.accent` as const)}
                      placeholder="her ölçü,"
                    />
                  </div>
                  <div>
                    <Label>Başlık (son kısım)</Label>
                    <Input
                      {...register(`slides.${i}.titleTail` as const)}
                      placeholder=" her standart."
                    />
                  </div>
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <Textarea
                    rows={2}
                    {...register(`slides.${i}.subtitle` as const)}
                    placeholder="Slaytın altındaki kısa açıklama metni."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Birincil buton — etiket *</Label>
                    <Input
                      {...register(`slides.${i}.cta.label` as const)}
                      placeholder="Kataloğu İncele"
                    />
                  </div>
                  <div>
                    <Label>Birincil buton — bağlantı *</Label>
                    <Input
                      {...register(`slides.${i}.cta.href` as const)}
                      placeholder="/urunler?kategori=vana-armatur"
                    />
                  </div>
                  <div>
                    <Label>İkincil buton — etiket (ops.)</Label>
                    <Input
                      {...register(`slides.${i}.secondary.label` as const)}
                      placeholder="Fiyat Listesi"
                    />
                  </div>
                  <div>
                    <Label>İkincil buton — bağlantı (ops.)</Label>
                    <Input
                      {...register(`slides.${i}.secondary.href` as const)}
                      placeholder="/fiyat-listesi"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slayt ekle */}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ ...EMPTY })}
        disabled={fields.length >= 8}
      >
        <Plus strokeWidth={1.75} />
        Slayt ekle
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
          Not: Kalıcı kayıt ve görsel yükleme için Supabase anahtarları gereklidir.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending || uploading !== null}>
          {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
          Kaydet
        </Button>
        <span className="text-xs text-ink-400">{fields.length} slayt</span>
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
