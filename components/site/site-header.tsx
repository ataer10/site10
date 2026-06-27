"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ShoppingCart, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, defaultSettings, type SiteSettings } from "@/lib/site";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { useCart, selectCount, useCartHydrated } from "@/lib/store/cart";

export function SiteHeader({
  settings = defaultSettings,
}: {
  settings?: SiteSettings;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Rota değişince mobil menüyü kapat
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full print:hidden">
      {/* Üst yardımcı şerit */}
      <div className="hidden border-b border-ink-800 bg-ink-900 text-ink-300 lg:block">
        <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-between px-8 text-xs">
          <p className="font-mono uppercase tracking-wide text-ink-400">
            {settings.tagline} · B2B Tedarik
          </p>
          <div className="flex items-center gap-6">
            <a
              href={settings.phoneHref}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Phone className="size-3.5" strokeWidth={1.5} />
              {settings.phone}
            </a>
            <span className="text-ink-600">|</span>
            <span>{settings.workingHours}</span>
          </div>
        </div>
      </div>

      {/* Ana bar */}
      <div className="border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label={settings.name} className="shrink-0">
            <Logo showTagline shortName={settings.shortName} tagline={settings.tagline} />
          </Link>

          {/* Masaüstü nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium tracking-tight text-ink-600 transition-colors hover:text-ink-900",
                  isActive(item.href) && "text-ink-900",
                )}
              >
                {item.title}
                {isActive(item.href) ? (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 bg-orange-500" />
                ) : null}
              </Link>
            ))}
          </nav>

          {/* Eylemler */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Ürün ara"
            >
              <Link href="/urunler">
                <Search strokeWidth={1.5} />
              </Link>
            </Button>
            <CartButton />
            <Button asChild variant="accent" className="hidden sm:inline-flex">
              <Link href="/teklif-iste">Teklif İste</Link>
            </Button>

            {/* Mobil menü tetikleyici */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobil menü paneli */}
      {open ? (
        <div className="border-b border-border bg-white lg:hidden">
          <nav className="mx-auto flex max-w-[1280px] flex-col px-4 py-2 sm:px-6">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b border-ink-100 py-3 text-sm font-medium text-ink-700 last:border-0",
                  isActive(item.href) && "text-orange-600",
                )}
              >
                {item.title}
              </Link>
            ))}
            <div className="py-3">
              <Button asChild variant="accent" className="w-full">
                <Link href="/teklif-iste">Teklif İste</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/** Sepet ikonu + canlı adet rozeti (hidrasyon güvenli). */
function CartButton() {
  const hydrated = useCartHydrated();
  const count = useCart(selectCount);
  return (
    <Button asChild variant="ghost" size="icon" aria-label="Sepet" className="relative">
      <Link href="/sepet">
        <ShoppingCart strokeWidth={1.5} />
        {hydrated && count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-grid min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] font-bold leading-5 text-white tnum">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
