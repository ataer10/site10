"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CircleCheckBig } from "lucide-react";
import { PARAM } from "@/lib/catalog-params";
import { heroChips, heroTrust } from "@/lib/content";

/**
 * Hero'nun alt kenarına oturan "Endüstriyel Komuta Çubuğu":
 * gerçek arama + hızlı kategori çipleri + Teklif İste + güven mikro-şeridi.
 * Teklif önizleme kartının yerine geçer.
 */
export function CommandBar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const needle = q.trim();
    router.push(
      needle ? `/urunler?${PARAM.q}=${encodeURIComponent(needle)}` : "/urunler",
    );
  }

  return (
    <div className="glass-dark border-t border-white/10">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-5 lg:py-5">
          {/* Arama */}
          <form onSubmit={onSubmit} className="flex flex-1 items-stretch gap-2">
            <div className="flex flex-1 items-center gap-3 rounded-sm border border-white/15 bg-white/5 px-3 transition-colors focus-within:border-white/40">
              <Search className="size-5 shrink-0 text-white/50" strokeWidth={1.75} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ürün, SKU veya marka ara…"
                aria-label="Katalogda ara"
                className="h-12 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/45"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-steel-600 active:bg-steel-700 sm:px-5"
            >
              <span className="hidden sm:inline">Ara</span>
              <ArrowRight className="size-4" strokeWidth={2} />
            </button>
          </form>

          {/* Hızlı kategori çipleri */}
          <div className="flex items-center gap-2 overflow-x-auto lg:flex-wrap lg:justify-end">
            <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wide text-white/40 xl:inline">
              Hızlı erişim
            </span>
            {heroChips.slice(0, 5).map((chip) => (
              <Link
                key={chip.slug}
                href={`/urunler?${PARAM.category}=${chip.slug}`}
                className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-[13px] font-medium text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Güven mikro-şeridi */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-white/10 py-2.5">
          {heroTrust.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-white/55"
            >
              <CircleCheckBig className="size-3.5 text-steel-300" strokeWidth={1.75} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
