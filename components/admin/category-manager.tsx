"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  CircleCheckBig,
  TriangleAlert,
  FolderTree,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
  updateSubcategoryAction,
  deleteSubcategoryAction,
} from "@/lib/actions/categories";

type Sub = { id: string; name: string; slug: string; productCount: number };
type Cat = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategories: Sub[];
};
type Res = { ok: boolean; demo?: boolean; error?: string };

export function CategoryManager({
  categories,
  demo,
}: {
  categories: Cat[];
  demo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [newCat, setNewCat] = React.useState("");
  const [editCat, setEditCat] = React.useState<{ id: string; name: string } | null>(null);
  const [subInput, setSubInput] = React.useState<Record<string, string>>({});
  const [editSub, setEditSub] = React.useState<{ id: string; name: string } | null>(null);

  function run(key: string, thunk: () => Promise<Res>, okText: string, after?: () => void) {
    setMsg(null);
    setBusy(key);
    startTransition(async () => {
      const res = await thunk();
      setBusy(null);
      if (res.ok) {
        after?.();
        router.refresh();
        setMsg({ kind: "ok", text: res.demo ? `${okText} (demo — kalıcı değil)` : okText });
      } else {
        setMsg({ kind: "err", text: res.error ?? "İşlem başarısız." });
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* Yeni kategori */}
      <div className="rounded-md border border-ink-200 bg-white p-4">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Yeni kategori
        </label>
        <div className="flex gap-2">
          <Input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Örn. Vana & Armatür"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCat.trim()) {
                e.preventDefault();
                run("new-cat", () => createCategoryAction(newCat), "Kategori eklendi.", () =>
                  setNewCat(""),
                );
              }
            }}
          />
          <Button
            variant="primary"
            onClick={() =>
              run("new-cat", () => createCategoryAction(newCat), "Kategori eklendi.", () =>
                setNewCat(""),
              )
            }
            disabled={pending || !newCat.trim()}
          >
            {busy === "new-cat" ? <Loader2 className="animate-spin" /> : <Plus strokeWidth={1.75} />}
            Ekle
          </Button>
        </div>
      </div>

      {msg ? (
        <div
          className={`flex items-start gap-2 rounded-sm border px-3 py-2 text-sm ${
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

      {/* Kategoriler */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-md border border-dashed border-ink-300 bg-white py-12 text-center">
          <FolderTree className="size-7 text-ink-300" strokeWidth={1.25} />
          <p className="mt-2 text-sm text-ink-400">Henüz kategori yok.</p>
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat.id} className="rounded-md border border-ink-200 bg-white">
            {/* Kategori başlığı */}
            <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
              {editCat?.id === cat.id ? (
                <>
                  <Input
                    value={editCat.name}
                    onChange={(e) => setEditCat({ id: cat.id, name: e.target.value })}
                    className="h-9"
                    autoFocus
                  />
                  <IconBtn
                    label="Kaydet"
                    busy={busy === `edit-cat-${cat.id}`}
                    onClick={() =>
                      run(
                        `edit-cat-${cat.id}`,
                        () => updateCategoryAction(cat.id, editCat.name),
                        "Kategori güncellendi.",
                        () => setEditCat(null),
                      )
                    }
                  >
                    <Check className="size-4 text-success" strokeWidth={2} />
                  </IconBtn>
                  <IconBtn label="Vazgeç" onClick={() => setEditCat(null)}>
                    <X className="size-4" strokeWidth={2} />
                  </IconBtn>
                </>
              ) : (
                <>
                  <FolderTree className="size-4 shrink-0 text-steel-600" strokeWidth={1.75} />
                  <span className="font-display text-sm font-bold tracking-tight text-ink-900">
                    {cat.name}
                  </span>
                  <span className="font-mono text-[11px] text-ink-400">/{cat.slug}</span>
                  <span className="rounded-sm bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-500">
                    {cat.productCount} ürün
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <IconBtn
                      label="Düzenle"
                      onClick={() => setEditCat({ id: cat.id, name: cat.name })}
                    >
                      <Pencil className="size-4" strokeWidth={1.75} />
                    </IconBtn>
                    <IconBtn
                      label="Sil"
                      danger
                      busy={busy === `del-cat-${cat.id}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `"${cat.name}" kategorisi silinsin mi?\n\n${cat.productCount} ürün kategorisiz kalır, ${cat.subcategories.length} alt kategori de silinir.`,
                          )
                        )
                          run(
                            `del-cat-${cat.id}`,
                            () => deleteCategoryAction(cat.id),
                            "Kategori silindi.",
                          );
                      }}
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </IconBtn>
                  </div>
                </>
              )}
            </div>

            {/* Alt kategoriler */}
            <div className="px-4 py-3">
              {cat.subcategories.length > 0 ? (
                <ul className="mb-3 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex items-center gap-2 rounded-sm py-1 text-sm"
                    >
                      <CornerDownRight className="size-3.5 shrink-0 text-ink-300" strokeWidth={1.75} />
                      {editSub?.id === sub.id ? (
                        <>
                          <Input
                            value={editSub.name}
                            onChange={(e) => setEditSub({ id: sub.id, name: e.target.value })}
                            className="h-8"
                            autoFocus
                          />
                          <IconBtn
                            label="Kaydet"
                            busy={busy === `edit-sub-${sub.id}`}
                            onClick={() =>
                              run(
                                `edit-sub-${sub.id}`,
                                () => updateSubcategoryAction(sub.id, editSub.name),
                                "Alt kategori güncellendi.",
                                () => setEditSub(null),
                              )
                            }
                          >
                            <Check className="size-4 text-success" strokeWidth={2} />
                          </IconBtn>
                          <IconBtn label="Vazgeç" onClick={() => setEditSub(null)}>
                            <X className="size-4" strokeWidth={2} />
                          </IconBtn>
                        </>
                      ) : (
                        <>
                          <span className="text-ink-800">{sub.name}</span>
                          <span className="font-mono text-[11px] text-ink-400">
                            /{sub.slug}
                          </span>
                          <span className="text-[11px] text-ink-400">
                            · {sub.productCount} ürün
                          </span>
                          <div className="ml-auto flex items-center gap-1">
                            <IconBtn
                              label="Düzenle"
                              onClick={() => setEditSub({ id: sub.id, name: sub.name })}
                            >
                              <Pencil className="size-3.5" strokeWidth={1.75} />
                            </IconBtn>
                            <IconBtn
                              label="Sil"
                              danger
                              busy={busy === `del-sub-${sub.id}`}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `"${sub.name}" alt kategorisi silinsin mi? ${sub.productCount} ürün alt kategorisiz kalır.`,
                                  )
                                )
                                  run(
                                    `del-sub-${sub.id}`,
                                    () => deleteSubcategoryAction(sub.id),
                                    "Alt kategori silindi.",
                                  );
                              }}
                            >
                              <Trash2 className="size-3.5" strokeWidth={1.75} />
                            </IconBtn>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-3 text-xs text-ink-400">Alt kategori yok.</p>
              )}

              {/* Alt kategori ekle */}
              <div className="flex gap-2">
                <Input
                  value={subInput[cat.id] ?? ""}
                  onChange={(e) =>
                    setSubInput((p) => ({ ...p, [cat.id]: e.target.value }))
                  }
                  placeholder="Alt kategori adı…"
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (subInput[cat.id] ?? "").trim()) {
                      e.preventDefault();
                      run(
                        `new-sub-${cat.id}`,
                        () => createSubcategoryAction(cat.id, subInput[cat.id] ?? ""),
                        "Alt kategori eklendi.",
                        () => setSubInput((p) => ({ ...p, [cat.id]: "" })),
                      );
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    run(
                      `new-sub-${cat.id}`,
                      () => createSubcategoryAction(cat.id, subInput[cat.id] ?? ""),
                      "Alt kategori eklendi.",
                      () => setSubInput((p) => ({ ...p, [cat.id]: "" })),
                    )
                  }
                  disabled={pending || !(subInput[cat.id] ?? "").trim()}
                >
                  {busy === `new-sub-${cat.id}` ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus strokeWidth={1.75} />
                  )}
                  Alt kategori
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {demo ? (
        <p className="text-xs text-ink-400">
          Not: Kalıcı kayıt için Supabase service-role anahtarı gereklidir.
        </p>
      ) : null}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
  busy,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={busy}
      className={`inline-grid size-7 place-items-center rounded-sm border border-ink-200 text-ink-500 transition-colors hover:bg-ink-50 disabled:opacity-50 ${
        danger ? "hover:border-danger/40 hover:text-danger" : "hover:text-ink-900"
      }`}
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : children}
    </button>
  );
}
