import "server-only";
import { cache } from "react";
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { homeFaq, type FaqItem } from "@/lib/content";

function normalize(raw: unknown): FaqItem[] | null {
  if (!Array.isArray(raw)) return null;
  const out = raw
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const o = r as Record<string, unknown>;
      const q = typeof o.q === "string" ? o.q.trim() : "";
      const a = typeof o.a === "string" ? o.a.trim() : "";
      return q && a ? { q, a } : null;
    })
    .filter((x): x is FaqItem => x !== null);
  return out.length ? out : null;
}

/** SSS maddeleri — DB'de varsa oradan, yoksa kod içi varsayılan (homeFaq). */
export const getFaq = cache(async (): Promise<FaqItem[]> => {
  if (!isSupabaseConfigured()) return homeFaq;
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("faq")
      .eq("id", "default")
      .single();
    if (error || !data) return homeFaq;
    return normalize((data as { faq?: unknown }).faq) ?? homeFaq;
  } catch {
    return homeFaq;
  }
});

/** Admin: SSS maddelerini kaydet. */
export async function updateFaq(
  items: FaqItem[],
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  const clean = normalize(items);
  if (!clean) return { ok: false, error: "En az bir geçerli soru-cevap gerekli." };
  if (!isSupabaseAdminConfigured()) return { ok: true, demo: true };
  const admin = createAdminClient();
  // faq kolonu üretilen Supabase tiplerinde yok (0007) → cast.
  const row = {
    id: "default",
    faq: clean,
    updated_at: new Date().toISOString(),
  } as never;
  const { error } = await admin.from("site_settings").upsert(row);
  return error ? { ok: false, error: error.message } : { ok: true };
}
