"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Save,
  Trash2,
  Loader2,
  Upload,
  TriangleAlert,
  ImageOff,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  saveBrandAction,
  deleteBrandAction,
  uploadBrandAssetAction,
} from "@/lib/actions/admin";
import type { AdminBrand, BrandInput } from "@/lib/data/admin-brands";
import { slugify } from "@/lib/slug";

type FormValues = {
  name: string;
  slug: string;
  logoUrl: string;
  catalogPdfUrl: string;
  sortOrder: number;
};

export function BrandForm({
  brand,
  demo,
}: {
  brand: AdminBrand | null;
  demo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [busy, setBusy] = React.useState<"logo" | "pdf" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      name: brand?.name ?? "",
      slug: brand?.slug ?? "",
      logoUrl: brand?.logoUrl ?? "",
      catalogPdfUrl: brand?.catalogPdfUrl ?? "",
      sortOrder: brand?.sortOrder ?? 0,
    },
  });

  const logoUrl = watch("logoUrl");
  const catalogPdfUrl = watch("catalogPdfUrl");

  function onSubmit(v: FormValues) {
    setError(null);
    const input: BrandInput = {
      name: v.name,
      slug: v.slug || slugify(v.name),
      logoUrl: v.logoUrl || null,
      catalogPdfUrl: v.catalogPdfUrl || null,
      sortOrder: Number(v.sortOrder) || 0,
    };
    startTransition(async () => {
      const res = await saveBrandAction(brand?.id ?? null, input);
      if (res.ok) {
        router.push("/admin/markalar");
        router.refresh();
      } else setError(res.error ?? "Kaydedilemedi.");
    });
  }

  function onDelete() {
    if (!brand || !window.confirm("Marka silinsin mi?")) return;
    startTransition(async () => {
      const res = await deleteBrandAction(brand.id);
      if (res.ok) {
        router.push("/admin/markalar");
        router.refresh();
      } else setError(res.error ?? "Silinemedi.");
    });
  }

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "catalogPdfUrl",
    kind: "logo" | "pdf",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(kind);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadBrandAssetAction(fd);
    setBusy(null);
    if (res.ok) setValue(field, res.url);
    else setError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="rounded-md border border-ink-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Marka adı *</Label>
            <Input
              {...register("name", {
                onBlur: (e) => {
                  if (!watch("slug")) setValue("slug", slugify(e.target.value));
                },
              })}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input {...register("slug")} placeholder="grundfos" className="font-mono text-sm" />
          </div>
          <div>
            <Label>Sıra</Label>
            <Input type="number" {...register("sortOrder", { valueAsNumber: true })} className="tnum" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Logo */}
        <div className="rounded-md border border-ink-200 bg-white p-5">
          <Label>Logo</Label>
          <div className="mt-2 grid h-24 place-items-center rounded-sm border border-ink-200 bg-ink-50">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="max-h-20 object-contain p-2" />
            ) : (
              <ImageOff className="size-7 text-ink-300" strokeWidth={1.25} />
            )}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-ink-300 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
            {busy === "logo" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.75} />}
            Logo yükle
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "logoUrl", "logo")} />
          </label>
          <Input {...register("logoUrl")} placeholder="…veya URL" className="mt-2 text-xs" />
        </div>

        {/* Katalog PDF */}
        <div className="rounded-md border border-ink-200 bg-white p-5">
          <Label>Katalog PDF</Label>
          <div className="mt-2 grid h-24 place-items-center rounded-sm border border-ink-200 bg-ink-50 text-ink-400">
            {catalogPdfUrl ? (
              <a href={catalogPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-steel-600">
                <FileDown className="size-4" strokeWidth={1.75} /> PDF yüklü
              </a>
            ) : (
              <FileDown className="size-7" strokeWidth={1.25} />
            )}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-ink-300 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
            {busy === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.75} />}
            PDF yükle
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e, "catalogPdfUrl", "pdf")} />
          </label>
          <Input {...register("catalogPdfUrl")} placeholder="…veya URL" className="mt-2 text-xs" />
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      ) : null}
      {demo ? (
        <p className="text-xs text-ink-400">Kaydetme/yükleme kalıcı olması için Supabase gerekir (demo).</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
          {brand ? "Güncelle" : "Oluştur"}
        </Button>
        {brand ? (
          <Button type="button" variant="ghost" className="text-danger hover:bg-danger/5" onClick={onDelete} disabled={pending}>
            <Trash2 strokeWidth={1.75} /> Sil
          </Button>
        ) : null}
      </div>
    </form>
  );
}
