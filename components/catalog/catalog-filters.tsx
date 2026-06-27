"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PARAM, buildQuery, type SearchParamsRecord } from "@/lib/catalog-params";

type BrandLite = { name: string; slug: string };
type CategoryLite = {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
};

export function CatalogFilters({
  brands,
  categories,
}: {
  brands: BrandLite[];
  categories: CategoryLite[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const current: SearchParamsRecord = Object.fromEntries(
    searchParams.entries(),
  );
  const selBrand = searchParams.get(PARAM.brand) ?? undefined;
  const selCategory = searchParams.get(PARAM.category) ?? undefined;
  const selSub = searchParams.get(PARAM.subcategory) ?? undefined;
  const hasActive = Boolean(selBrand || selCategory || selSub || searchParams.get(PARAM.q));

  function navigate(updates: Record<string, string | number | null>) {
    // Filtre değişince sayfayı 1'e çek
    router.push(`${pathname}${buildQuery(current, { ...updates, [PARAM.page]: null })}`, {
      scroll: false,
    });
  }

  function toggleBrand(slug: string) {
    navigate({ [PARAM.brand]: selBrand === slug ? null : slug });
  }
  function toggleCategory(slug: string) {
    if (selCategory === slug) {
      navigate({ [PARAM.category]: null, [PARAM.subcategory]: null });
    } else {
      navigate({ [PARAM.category]: slug, [PARAM.subcategory]: null });
    }
  }
  function toggleSub(catSlug: string, subSlug: string) {
    if (selSub === subSlug) {
      navigate({ [PARAM.subcategory]: null });
    } else {
      navigate({ [PARAM.category]: catSlug, [PARAM.subcategory]: subSlug });
    }
  }
  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  return (
    <>
      {/* Mobil tetikleyici */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          <SlidersHorizontal strokeWidth={1.75} />
          Filtreler
          {hasActive ? (
            <span className="ml-1 inline-grid size-5 place-items-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
              !
            </span>
          ) : null}
        </Button>
        {hasActive ? (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-steel-600 hover:underline"
          >
            Temizle
          </button>
        ) : null}
      </div>

      <div className={cn("space-y-8", open ? "block" : "hidden lg:block")}>
        {/* Başlık + temizle (masaüstü) */}
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900">
            Filtreler
          </h2>
          {hasActive ? (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-steel-600 hover:underline"
            >
              <X className="size-3.5" strokeWidth={2} />
              Temizle
            </button>
          ) : null}
        </div>

        {/* Markalar */}
        <FilterGroup title="Marka">
          <ul className="space-y-0.5">
            {brands.map((b) => (
              <li key={b.slug}>
                <FilterRow
                  active={selBrand === b.slug}
                  onClick={() => toggleBrand(b.slug)}
                  label={b.name}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>

        {/* Kategoriler + alt kategoriler */}
        <FilterGroup title="Kategori">
          <ul className="space-y-0.5">
            {categories.map((c) => {
              const isOpen = selCategory === c.slug;
              return (
                <li key={c.slug}>
                  <button
                    onClick={() => toggleCategory(c.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      isOpen
                        ? "font-semibold text-steel-700"
                        : "text-ink-700 hover:bg-ink-50",
                    )}
                  >
                    <span>{c.name}</span>
                    <ChevronRight
                      className={cn(
                        "size-4 text-ink-400 transition-transform",
                        isOpen && "rotate-90 text-steel-600",
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                  {isOpen && c.subcategories.length > 0 ? (
                    <ul className="mb-1 ml-2 mt-0.5 space-y-0.5 border-l border-ink-200 pl-2">
                      {c.subcategories.map((s) => (
                        <li key={s.slug}>
                          <FilterRow
                            active={selSub === s.slug}
                            onClick={() => toggleSub(c.slug, s.slug)}
                            label={s.name}
                            small
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      </div>
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-ink-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterRow({
  active,
  onClick,
  label,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left transition-colors",
        small ? "text-[13px]" : "text-sm",
        active
          ? "bg-steel-50 font-medium text-steel-700"
          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
      )}
      aria-pressed={active}
    >
      <span>{label}</span>
      {active ? (
        <Check className="size-3.5 text-steel-600" strokeWidth={2} />
      ) : null}
    </button>
  );
}
