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
  FileText,
  FileDown,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import {
  saveCatalogAction,
  deleteCatalogAction,
  uploadCatalogFileAction,
} from "@/lib/actions/admin";
import type { AdminCatalog, CatalogInput } from "@/lib/data/admin-catalogs";

type FormValues = {
  title: string;
  brandId: string;
  year: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  pdfUrl: string;
  coverUrl: string;
};

export function CatalogForm({
  catalog,
  brands,
  demo,
}: {
  catalog: AdminCatalog | null;
  brands: { id: string; name: string }[];
  demo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [busy, setBusy] = React.useState<"pdf" | "cover" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      title: catalog?.title ?? "",
      brandId: catalog?.brandId ?? "",
      year: catalog?.year ?? "",
      description: catalog?.description ?? "",
      sortOrder: catalog?.sortOrder ?? 0,
      isActive: catalog?.isActive ?? true,
      pdfUrl: catalog?.pdfUrl ?? "",
      coverUrl: catalog?.coverUrl ?? "",
    },
  });

  const pdfUrl = watch("pdfUrl");
  const coverUrl = watch("coverUrl");

  function onSubmit(v: FormValues) {
    setError(null);
    const input: CatalogInput = {
      title: v.title,
      brandId: v.brandId || null,
      year: v.year || null,
      description: v.description || null,
      sortOrder: Number(v.sortOrder) || 0,
      isActive: v.isActive,
      pdfUrl: v.pdfUrl || null,
      coverUrl: v.coverUrl || null,
    };
    startTransition(async () => {
      const res = await saveCatalogAction(catalog?.id ?? null, input);
      if (res.ok) {
        router.push("/admin/kataloglar");
        router.refresh();
      } else setError(res.error ?? "Kaydedilemedi.");
    });
  }

  function onDelete() {
    if (!catalog || !window.confirm("Katalog silinsin mi?")) return;
    startTransition(async () => {
      const res = await deleteCatalogAction(catalog.id);
      if (res.ok) {
        router.push("/admin/kataloglar");
        router.refresh();
      } else setError(res.error ?? "Silinemedi.");
    });
  }

  async function upload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "pdfUrl" | "coverUrl",
    kind: "pdf" | "cover",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(kind);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadCatalogFileAction(fd);
    setBusy(null);
    if (res.ok) setValue(field, res.url);
    else setError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-4xl gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-md border border-ink-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Başlık *</Label>
              <Input {...register("title")} placeholder="Sirkülasyon Pompaları Ürün Kataloğu" />
            </div>
            <div>
              <Label>Marka</Label>
              <select
                {...register("brandId")}
                className="h-10 w-full rounded-sm border border-input bg-white px-3 text-sm text-ink-800 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <option value="">— (Genel)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Yıl</Label>
                <Input {...register("year")} placeholder="2026" className="tnum" />
              </div>
              <div>
                <Label>Sıra</Label>
                <Input type="number" {...register("sortOrder", { valueAsNumber: true })} className="tnum" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Açıklama</Label>
              <Textarea {...register("description")} className="min-h-20" placeholder="Kısa açıklama…" />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-ink-800 sm:col-span-2">
              <input type="checkbox" {...register("isActive")} className="size-4 accent-steel-600" />
              Yayında (sitede görünsün)
            </label>
          </div>
        </div>
      </div>

      {/* Dosyalar */}
      <div className="space-y-5">
        <div className="rounded-md border border-ink-200 bg-white p-5">
          <Label>Katalog PDF</Label>
          <div className="mt-2 grid h-24 place-items-center rounded-sm border border-ink-200 bg-ink-50 text-ink-400">
            {pdfUrl ? (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-steel-600">
                <FileDown className="size-4" strokeWidth={1.75} /> PDF yüklü
              </a>
            ) : (
              <FileText className="size-7" strokeWidth={1.25} />
            )}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-ink-300 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
            {busy === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.75} />}
            PDF yükle
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e, "pdfUrl", "pdf")} />
          </label>
          <Input {...register("pdfUrl")} placeholder="…veya URL" className="mt-2 text-xs" />
        </div>

        <div className="rounded-md border border-ink-200 bg-white p-5">
          <Label>Kapak görseli (ops.)</Label>
          <div className="mt-2 grid aspect-[3/4] max-h-40 place-items-center overflow-hidden rounded-sm border border-ink-200 bg-ink-50">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" className="size-full object-cover" />
            ) : (
              <ImageOff className="size-7 text-ink-300" strokeWidth={1.25} />
            )}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-ink-300 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
            {busy === "cover" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.75} />}
            Kapak yükle
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "coverUrl", "cover")} />
          </label>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger lg:col-span-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      ) : null}
      {demo ? (
        <p className="text-xs text-ink-400 lg:col-span-3">Kaydetme/yükleme kalıcı olması için Supabase gerekir (demo).</p>
      ) : null}

      <div className="flex gap-2 lg:col-span-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
          {catalog ? "Güncelle" : "Yayınla"}
        </Button>
        {catalog ? (
          <Button type="button" variant="ghost" className="text-danger hover:bg-danger/5" onClick={onDelete} disabled={pending}>
            <Trash2 strokeWidth={1.75} /> Sil
          </Button>
        ) : null}
      </div>
    </form>
  );
}
