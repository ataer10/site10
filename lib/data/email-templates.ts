import "server-only";
import { cache } from "react";
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_TEMPLATES,
  type CustomerTemplate,
  type EmailTemplatesConfig,
} from "@/lib/email/templates";

function mergeTpl(raw: unknown, def: CustomerTemplate): CustomerTemplate {
  if (!raw || typeof raw !== "object") return def;
  const r = raw as Record<string, unknown>;
  const pick = (v: unknown, d: string) =>
    typeof v === "string" && v.trim() ? v : d;
  return {
    subject: pick(r.subject, def.subject),
    title: pick(r.title, def.title),
    intro: pick(r.intro, def.intro),
    outro: pick(r.outro, def.outro),
  };
}

/** Müşteri e-posta şablonları — DB'de varsa oradan (kod varsayılanıyla harmanlanır). */
export const getEmailTemplates = cache(async (): Promise<EmailTemplatesConfig> => {
  if (!isSupabaseConfigured()) return DEFAULT_TEMPLATES;
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("email_templates")
      .eq("id", "default")
      .single();
    if (error || !data) return DEFAULT_TEMPLATES;
    const raw = (data as { email_templates?: unknown }).email_templates;
    if (!raw || typeof raw !== "object") return DEFAULT_TEMPLATES;
    const r = raw as Record<string, unknown>;
    return {
      quoteReceived: mergeTpl(r.quoteReceived, DEFAULT_TEMPLATES.quoteReceived),
      quoteReady: mergeTpl(r.quoteReady, DEFAULT_TEMPLATES.quoteReady),
    };
  } catch {
    return DEFAULT_TEMPLATES;
  }
});

/** Admin: müşteri e-posta şablonlarını kaydet. */
export async function updateEmailTemplates(
  input: EmailTemplatesConfig,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return { ok: true, demo: true };
  const admin = createAdminClient();
  // email_templates kolonu üretilen Supabase tiplerinde yok (0006) → cast.
  const row = {
    id: "default",
    email_templates: input,
    updated_at: new Date().toISOString(),
  } as never;
  const { error } = await admin.from("site_settings").upsert(row);
  return error ? { ok: false, error: error.message } : { ok: true };
}
