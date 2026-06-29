import "server-only";
import { cache } from "react";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

export type EmailSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

/** Forma giden güvenli görünüm — ŞİFRE YOK (yalnız var/yok bilgisi). */
export type EmailSettingsSafe = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  hasPassword: boolean;
};

export type EmailSettingsInput = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string; // boş → mevcut şifre korunur
  from: string;
};

/**
 * Tam SMTP ayarları (şifre dahil) — yalnız sunucu/email client kullanır.
 * service_role gerekir; yoksa null.
 */
export const getEmailSettings = cache(async (): Promise<EmailSettings | null> => {
  if (!isSupabaseAdminConfigured()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("email_settings")
      .select("*")
      .eq("id", "default")
      .single();
    if (error || !data) return null;
    const d = data as Record<string, unknown>;
    const host = (d.smtp_host as string) ?? "";
    if (!host) return null;
    return {
      host,
      port: Number(d.smtp_port ?? 587),
      secure: Boolean(d.smtp_secure),
      user: (d.smtp_user as string) ?? "",
      pass: (d.smtp_pass as string) ?? "",
      from: (d.smtp_from as string) ?? "",
    };
  } catch {
    return null;
  }
});

/** Admin formu için: şifresiz, "şifre tanımlı mı" bilgisiyle. */
export async function getEmailSettingsSafe(): Promise<EmailSettingsSafe> {
  const s = await getEmailSettings();
  return {
    host: s?.host ?? "",
    port: s?.port ?? 587,
    secure: s?.secure ?? false,
    user: s?.user ?? "",
    from: s?.from ?? "",
    hasPassword: Boolean(s?.pass),
  };
}

/** SMTP gerçekten yapılandırılmış mı (en az host)? */
export async function isSmtpConfigured(): Promise<boolean> {
  const s = await getEmailSettings();
  return Boolean(s?.host);
}

/** Admin: SMTP ayarlarını kaydet. Şifre boşsa mevcut korunur. */
export async function updateEmailSettings(
  input: EmailSettingsInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return { ok: true, demo: true };
  const admin = createAdminClient();
  const row: Record<string, unknown> = {
    id: "default",
    smtp_host: input.host || null,
    smtp_port: input.port || 587,
    smtp_secure: input.secure,
    smtp_user: input.user || null,
    smtp_from: input.from || null,
    updated_at: new Date().toISOString(),
  };
  // Yalnız yeni şifre girildiyse güncelle (boşsa mevcut şifre korunur).
  if (input.pass) row.smtp_pass = input.pass;
  const { error } = await admin.from("email_settings").upsert(row as never);
  return error ? { ok: false, error: error.message } : { ok: true };
}
