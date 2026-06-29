"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  ShoppingCart,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Trash2,
  Clock,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { mainNav, defaultSettings, type SiteSettings } from "@/lib/site";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { SearchPalette } from "@/components/site/search-palette";
import {
  useCart,
  selectCount,
  selectSubtotal,
  useCartHydrated,
} from "@/lib/store/cart";

type NavCategory = {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
};

const PRODUCTS_HREF = "/urunler";

export function SiteHeader({
  settings = defaultSettings,
  categories = [],
}: {
  settings?: SiteSettings;
  categories?: NavCategory[];
}) {
  const pathname = usePathname();
  const overlay = pathname === "/";

  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);

  // Mega menü hover köprüsü — panel header kutusunun dışında olduğu için
  // kapatmayı kısa gecikmeyle yap; panele girince gecikme iptal edilir.
  const megaTimer = React.useRef<number | undefined>(undefined);
  const openMega = React.useCallback(() => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(true);
  }, []);
  const closeMega = React.useCallback(() => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(false);
  }, []);
  const scheduleCloseMega = React.useCallback(() => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 130);
  }, []);

  // Sadece anasayfada şeffaf → kaydırınca katı. Diğer sayfalar daima katı.
  React.useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  // Rota değişince tüm panelleri kapat
  React.useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  const solid = !overlay || scrolled;
  const light = !solid; // beyaz logo/nav (koyu hero üstünde)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50 w-full print:hidden",
        overlay ? "fixed" : "sticky",
      )}
      onMouseLeave={scheduleCloseMega}
    >
      {/* Üst yardımcı şerit (lg) */}
      <div
        className={cn(
          "hidden border-b transition-colors duration-200 ease-[var(--ease-industrial)] lg:block",
          solid
            ? "border-ink-800 bg-ink-900 text-ink-300"
            : "border-white/10 bg-transparent text-white/70",
        )}
      >
        <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-between px-8 text-xs">
          <p className="font-mono uppercase tracking-wide">
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
            <span className={solid ? "text-ink-600" : "text-white/30"}>|</span>
            <span>{settings.workingHours}</span>
          </div>
        </div>
      </div>

      {/* Ana bar */}
      <div
        className={cn(
          "border-b transition-colors duration-200 ease-[var(--ease-industrial)]",
          solid
            ? "border-border bg-white/85 shadow-flat backdrop-blur supports-[backdrop-filter]:bg-white/75"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label={settings.name}
            className="flex shrink-0 items-center"
          >
            <Logo priority light={light} />
          </Link>

          {/* Masaüstü nav + mega menü */}
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) =>
              item.href === PRODUCTS_HREF ? (
                <button
                  key={item.href}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={megaOpen}
                  onMouseEnter={openMega}
                  onFocus={openMega}
                  onClick={() => (megaOpen ? closeMega() : openMega())}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeMega();
                  }}
                  className={cn(
                    "relative inline-flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-tight transition-colors",
                    light
                      ? "text-white/85 hover:text-white"
                      : "text-ink-600 hover:text-ink-900",
                    isActive(item.href) && (light ? "text-white" : "text-ink-900"),
                  )}
                >
                  {item.title}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      megaOpen && "rotate-180",
                    )}
                    strokeWidth={2}
                  />
                  {isActive(item.href) ? (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 bg-steel-500" />
                  ) : null}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={closeMega}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium tracking-tight transition-colors",
                    light
                      ? "text-white/85 hover:text-white"
                      : "text-ink-600 hover:text-ink-900",
                    isActive(item.href) && (light ? "text-white" : "text-ink-900"),
                  )}
                >
                  {item.title}
                  {isActive(item.href) ? (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 bg-steel-500" />
                  ) : null}
                </Link>
              ),
            )}
          </nav>

          {/* Eylemler */}
          <div className="flex items-center gap-2">
            <SearchPalette tone={light ? "light" : "dark"} />
            <CartButton settings={settings} light={light} />
            <Button asChild variant="accent" className="hidden sm:inline-flex">
              <Link href="/teklif-iste">Teklif İste</Link>
            </Button>
            <Button
              variant={light ? "ghost" : "outline"}
              size="icon"
              className={cn(
                "lg:hidden",
                light && "text-white hover:bg-white/10 hover:text-white",
              )}
              aria-label="Menüyü aç"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Mega menü paneli */}
        {megaOpen && categories.length > 0 ? (
          <MegaMenu
            categories={categories}
            onNavigate={closeMega}
            onMouseEnter={openMega}
            onMouseLeave={scheduleCloseMega}
          />
        ) : null}
      </div>

      {/* Mobil drawer */}
      {mobileOpen ? (
        <MobileDrawer
          settings={settings}
          categories={categories}
          onClose={() => setMobileOpen(false)}
        />
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------- */
/*  Mega menü — Ürünler                                                  */
/* -------------------------------------------------------------------- */
function MegaMenu({
  categories,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: {
  categories: NavCategory[];
  onNavigate: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="absolute inset-x-0 top-full hidden justify-center px-4 lg:flex"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        role="menu"
        aria-label="Ürün kategorileri"
        className="mt-2 w-full max-w-[60rem] overflow-hidden rounded-lg border border-border bg-white shadow-raised"
      >
        <div className="grid gap-px bg-ink-100 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.slug} className="bg-white p-4">
              <Link
                href={`${PRODUCTS_HREF}?kategori=${cat.slug}`}
                onClick={onNavigate}
                className="group inline-flex items-center gap-1.5 font-display text-sm font-bold tracking-tight text-ink-900 hover:text-steel-600"
              >
                {cat.name}
                <ArrowUpRight
                  className="size-3.5 text-ink-300 transition-colors group-hover:text-steel-500"
                  strokeWidth={1.75}
                />
              </Link>
              {cat.subcategories.length > 0 ? (
                <ul className="mt-2.5 space-y-1.5">
                  {cat.subcategories.slice(0, 5).map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`${PRODUCTS_HREF}?kategori=${cat.slug}&altkategori=${sub.slug}`}
                        onClick={onNavigate}
                        className="text-[13px] text-ink-500 transition-colors hover:text-ink-900"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
        <Link
          href={PRODUCTS_HREF}
          onClick={onNavigate}
          className="flex items-center justify-between bg-ink-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          <span className="inline-flex items-center gap-2">
            Tüm ürün kataloğunu gör
          </span>
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Sepet ikonu + mini-sepet                                            */
/* -------------------------------------------------------------------- */
function CartButton({
  settings,
  light,
}: {
  settings: SiteSettings;
  light: boolean;
}) {
  const hydrated = useCartHydrated();
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sepet"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative",
          light && "text-white hover:bg-white/10 hover:text-white",
        )}
      >
        <ShoppingCart strokeWidth={1.5} />
        {hydrated && count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-grid min-w-5 place-items-center rounded-full bg-steel-500 px-1 text-[11px] font-bold leading-5 text-white tnum">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Button>

      {open && hydrated ? (
        <div className="absolute right-0 top-full z-50 w-80 overflow-hidden rounded-lg border border-border bg-white pt-1 shadow-raised">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              Sepet
            </p>
            <p className="text-xs text-ink-400">
              {count > 0 ? `${count} kalem` : "Boş"}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-ink-500">Sepetiniz henüz boş.</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={PRODUCTS_HREF}>Kataloğa göz at</Link>
              </Button>
            </div>
          ) : (
            <>
              <ul className="max-h-72 divide-y divide-ink-100 overflow-y-auto">
                {items.slice(0, 5).map((it) => (
                  <li
                    key={it.slug}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/urunler/${it.slug}`}
                        className="block truncate text-sm font-medium text-ink-900 hover:text-steel-600"
                      >
                        {it.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-400">
                        {it.qty} × {formatPrice(it.listPrice)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-ink-800 tnum">
                        {formatPrice(it.listPrice * it.qty)}
                      </span>
                      <button
                        type="button"
                        aria-label={`${it.name} ürününü sepetten çıkar`}
                        onClick={() => removeItem(it.slug)}
                        className="text-ink-300 transition-colors hover:text-danger"
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {items.length > 5 ? (
                <p className="border-t border-ink-100 px-4 py-2 text-center text-xs text-ink-400">
                  +{items.length - 5} kalem daha
                </p>
              ) : null}
              <div className="border-t border-ink-100 bg-ink-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
                    Ara Toplam (KDV hariç)
                  </span>
                  <span className="font-display text-base font-extrabold text-ink-900 tnum">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/sepet">Sepete Git</Link>
                  </Button>
                  <Button asChild variant="accent" size="sm">
                    <Link href="/teklif-iste">Teklif İste</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Mobil drawer                                                        */
/* -------------------------------------------------------------------- */
function MobileDrawer({
  settings,
  categories,
  onClose,
}: {
  settings: SiteSettings;
  categories: NavCategory[];
  onClose: () => void;
}) {
  const [catsOpen, setCatsOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
      className="fixed inset-0 z-[90] lg:hidden"
    >
      <button
        type="button"
        aria-label="Menüyü kapat"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white shadow-raised outline-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo />
          <Button
            variant="outline"
            size="icon"
            aria-label="Menüyü kapat"
            onClick={onClose}
          >
            <X strokeWidth={1.5} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
          {mainNav.map((item) =>
            item.href === PRODUCTS_HREF ? (
              <div key={item.href} className="border-b border-ink-100">
                <button
                  type="button"
                  onClick={() => setCatsOpen((v) => !v)}
                  aria-expanded={catsOpen}
                  className="flex w-full items-center justify-between py-3 text-sm font-medium text-ink-800"
                >
                  {item.title}
                  <ChevronDown
                    className={cn(
                      "size-4 text-ink-400 transition-transform",
                      catsOpen && "rotate-180",
                    )}
                    strokeWidth={2}
                  />
                </button>
                {catsOpen ? (
                  <ul className="pb-3">
                    <li>
                      <Link
                        href={PRODUCTS_HREF}
                        onClick={onClose}
                        className="block py-1.5 pl-3 text-[13px] font-medium text-steel-600"
                      >
                        Tüm ürünler
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`${PRODUCTS_HREF}?kategori=${cat.slug}`}
                          onClick={onClose}
                          className="block py-1.5 pl-3 text-[13px] text-ink-500 hover:text-ink-900"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block border-b border-ink-100 py-3 text-sm font-medium text-ink-800 last:border-0"
              >
                {item.title}
              </Link>
            ),
          )}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <Button asChild variant="accent" className="w-full">
            <Link href="/teklif-iste" onClick={onClose}>
              Teklif İste
            </Link>
          </Button>
          <div className="mt-4 space-y-2 text-sm text-ink-500">
            <a
              href={settings.phoneHref}
              className="inline-flex items-center gap-2 hover:text-ink-900"
            >
              <Phone className="size-4" strokeWidth={1.5} />
              {settings.phone}
            </a>
            <p className="inline-flex items-center gap-2">
              <Clock className="size-4 text-ink-400" strokeWidth={1.5} />
              {settings.workingHours}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
