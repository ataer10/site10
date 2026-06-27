"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  Trash2,
  Loader2,
  Upload,
  TriangleAlert,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { productFormSchema, type ProductFormInput } from "@/lib/validation";
import {
  saveProductAction,
  deleteProductAction,
  uploadProductImageAction,
} from "@/lib/actions/admin";
import type { AdminProduct, Taxonomy } from "@/lib/data/admin-products";

export function ProductForm({
  product,
  taxonomy,
  demo,
}: {
  product: AdminProduct | null;
  taxonomy: Taxonomy;
  demo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      brandId: product?.brandId ?? "",
      categoryId: product?.categoryId ?? "",
      subcategoryId: product?.subcategoryId ?? "",
      listPrice: product?.listPrice ?? 0,
      unit: product?.unit ?? "adet",
      vatRate: product?.vatRate ?? 20,
      description: product?.description ?? "",
      imageUrl: product?.imageUrl ?? "",
      isActive: product?.isActive ?? true,
    },
  });

  const categoryId = watch("categoryId");
  const imageUrl = watch("imageUrl");
  const subcategories =
    taxonomy.categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  function onSubmit(values: ProductFormInput) {
    setError(null);
    const input = {
      name: values.name,
      sku: values.sku || null,
      brandId: values.brandId || null,
      categoryId: values.categoryId || null,
      subcategoryId: values.subcategoryId || null,
      listPrice: values.listPrice,
      unit: values.unit,
      vatRate: values.vatRate,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      isActive: values.isActive,
    };
    startTransition(async () => {
      const res = await saveProductAction(product?.id ?? null, input);
      if (res.ok) {
        router.push("/admin/urunler");
        router.refresh();
      } else {
        setError(res.error ?? "Kaydedilemedi.");
      }
    });
  }

  function onDelete() {
    if (!product) return;
    if (!window.confirm("Bu ürün silinsin mi?")) return;
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (res.ok) {
        router.push("/admin/urunler");
        router.refresh();
      } else {
        setError(res.error ?? "Silinemedi.");
      }
    });
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadProductImageAction(fd);
    setUploading(false);
    if (res.ok) setValue("imageUrl", res.url, { shouldValidate: true });
    else setError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <Card title="Temel bilgiler">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Ürün adı *</Label>
              <Input {...register("name")} aria-invalid={!!errors.name} />
              {errors.name ? <Err msg={errors.name.message} /> : null}
            </div>
            <div>
              <Label>SKU</Label>
              <Input {...register("sku")} placeholder="VN-KV-15-25" />
            </div>
            <div>
              <Label>Birim</Label>
              <Input {...register("unit")} placeholder="adet, mt, kg…" />
            </div>
            <div>
              <Label>Liste fiyatı (₺) *</Label>
              <Input type="number" step="0.01" {...register("listPrice", { valueAsNumber: true })} aria-invalid={!!errors.listPrice} className="tnum" />
              {errors.listPrice ? <Err msg={errors.listPrice.message} /> : null}
            </div>
            <div>
              <Label>KDV %</Label>
              <Input type="number" step="0.5" {...register("vatRate", { valueAsNumber: true })} className="tnum" />
            </div>
          </div>
        </Card>

        <Card title="Sınıflandırma">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Marka</Label>
              <Select {...register("brandId")}>
                <option value="">—</option>
                {taxonomy.brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Kategori</Label>
              <Select {...register("categoryId")} onChange={(e) => { setValue("categoryId", e.target.value); setValue("subcategoryId", ""); }}>
                <option value="">—</option>
                {taxonomy.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Alt kategori</Label>
              <Select {...register("subcategoryId")} disabled={subcategories.length === 0}>
                <option value="">—</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <Card title="Açıklama">
          <Textarea {...register("description")} className="min-h-28" placeholder="Ürün açıklaması…" />
        </Card>
      </div>

      {/* Yan panel */}
      <div className="space-y-5 lg:col-span-4">
        <Card title="Görsel">
          <div className="aspect-square w-full overflow-hidden rounded-sm border border-ink-200 bg-ink-50">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="size-full object-contain p-2" />
            ) : (
              <div className="grid size-full place-items-center text-ink-300">
                <ImageOff className="size-8" strokeWidth={1.25} />
              </div>
            )}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-ink-300 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.75} />}
            {uploading ? "Yükleniyor…" : "Görsel yükle"}
            <input type="file" accept="image/*" className="hidden" onChange={onPickImage} disabled={uploading} />
          </label>
          <Input {...register("imageUrl")} placeholder="…veya görsel URL'i" className="mt-2 text-xs" />
          {demo ? (
            <p className="mt-2 text-[11px] text-ink-400">
              Görsel yükleme Supabase Storage gerektirir (demo modunda URL girebilirsiniz).
            </p>
          ) : null}
        </Card>

        <Card title="Yayın">
          <label className="flex items-center gap-2.5 text-sm text-ink-800">
            <input type="checkbox" {...register("isActive")} className="size-4 accent-steel-600" />
            Katalogda aktif
          </label>
        </Card>

        {error ? (
          <div className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button type="submit" variant="primary" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
            {product ? "Güncelle" : "Oluştur"}
          </Button>
          {product ? (
            <Button type="button" variant="ghost" className="w-full text-danger hover:bg-danger/5" onClick={onDelete} disabled={pending}>
              <Trash2 strokeWidth={1.75} />
              Sil
            </Button>
          ) : null}
        </div>
      </div>
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

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={`h-10 w-full rounded-sm border border-input bg-white px-3 text-sm text-ink-800 focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 ${className ?? ""}`}
    {...props}
  />
));
Select.displayName = "Select";

function Err({ msg }: { msg?: string }) {
  return <p className="mt-1 text-xs text-danger">{msg}</p>;
}
