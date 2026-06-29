import "server-only";
import { cache } from "react";
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { heroSlides as defaultHeroSlides, type HeroSlide } from "@/lib/content";

export type HeroSlideInput = HeroSlide;

/** Gevşek gelen JSON kaydını güvenli HeroSlide'a indirger. */
function normalize(raw: unknown): HeroSlide | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const image = str(r.image);
  const title = str(r.title);
  // Görsel ve başlık olmadan slayt anlamsız → at.
  if (!image || (!title && !str(r.accent))) return null;

  const linkOf = (v: unknown): { label: string; href: string } | undefined => {
    if (!v || typeof v !== "object") return undefined;
    const o = v as Record<string, unknown>;
    const label = str(o.label);
    const href = str(o.href);
    return label && href ? { label, href } : undefined;
  };
  const cta = linkOf(r.cta) ?? { label: "İncele", href: "/urunler" };

  return {
    tag: str(r.tag),
    title,
    accent: str(r.accent),
    titleTail: str(r.titleTail),
    subtitle: str(r.subtitle),
    image,
    imageAlt: str(r.imageAlt) || title || "Hero görseli",
    cta,
    secondary: linkOf(r.secondary),
  };
}

/** Hero slaytları — DB'de varsa oradan, yoksa kod içi varsayılan (lib/content). */
export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  if (!isSupabaseConfigured()) return defaultHeroSlides;
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("hero_slides")
      .eq("id", "default")
      .single();
    if (error || !data) return defaultHeroSlides;
    const raw = (data as { hero_slides?: unknown }).hero_slides;
    if (!Array.isArray(raw) || raw.length === 0) return defaultHeroSlides;
    const slides = raw.map(normalize).filter((s): s is HeroSlide => s !== null);
    return slides.length > 0 ? slides : defaultHeroSlides;
  } catch {
    return defaultHeroSlides;
  }
});

/** Admin: hero slaytlarını kaydet. service_role yoksa demo (kalıcı değil). */
export async function updateHeroSlides(
  slides: HeroSlideInput[],
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return { ok: true, demo: true };
  // Sunucu tarafında da normalize edip yalnız geçerli slaytları yaz.
  const clean = slides
    .map(normalize)
    .filter((s): s is HeroSlide => s !== null);
  if (clean.length === 0) {
    return { ok: false, error: "En az bir geçerli slayt (görsel + başlık) gerekli." };
  }
  const admin = createAdminClient();
  // hero_slides kolonu üretilen Supabase tiplerinde yok (0004 migration) → cast.
  const row = {
    id: "default",
    hero_slides: clean,
    updated_at: new Date().toISOString(),
  } as never;
  const { error } = await admin.from("site_settings").upsert(row);
  return error ? { ok: false, error: error.message } : { ok: true };
}
