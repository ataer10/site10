import "server-only";
import { cache } from "react";
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultSettings, toPhoneHref, type SiteSettings } from "@/lib/site";

export type SettingsInput = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  workingHours: string;
};

/** Sitenin firma bilgileri — DB (site_settings) varsa oradan, yoksa default. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return defaultSettings;
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "default")
      .single();
    if (error || !data) return defaultSettings;
    const phone = data.phone ?? defaultSettings.phone;
    return {
      name: data.company_name ?? defaultSettings.name,
      shortName: data.short_name ?? defaultSettings.shortName,
      tagline: data.tagline ?? defaultSettings.tagline,
      description: data.description ?? defaultSettings.description,
      url: defaultSettings.url,
      email: data.email ?? defaultSettings.email,
      phone,
      phoneHref: toPhoneHref(phone),
      whatsapp: data.whatsapp ?? defaultSettings.whatsapp,
      address: {
        line1: data.address_line1 ?? defaultSettings.address.line1,
        line2: data.address_line2 ?? defaultSettings.address.line2,
        city: data.city ?? defaultSettings.address.city,
        country: data.country ?? defaultSettings.address.country,
      },
      workingHours: data.working_hours ?? defaultSettings.workingHours,
    };
  } catch {
    return defaultSettings;
  }
});

/** Admin: ayarları kaydet. service_role yoksa demo (kalıcı değil). */
export async function updateSettings(
  input: SettingsInput,
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) return { ok: true, demo: true };
  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    id: "default",
    company_name: input.name,
    short_name: input.shortName,
    tagline: input.tagline,
    description: input.description,
    email: input.email,
    phone: input.phone,
    whatsapp: input.whatsapp,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2,
    city: input.city,
    country: input.country,
    working_hours: input.workingHours,
    updated_at: new Date().toISOString(),
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Mevcut ayarları form için düz input'a çevirir. */
export function settingsToInput(s: SiteSettings): SettingsInput {
  return {
    name: s.name,
    shortName: s.shortName,
    tagline: s.tagline,
    description: s.description,
    email: s.email,
    phone: s.phone,
    whatsapp: s.whatsapp,
    addressLine1: s.address.line1,
    addressLine2: s.address.line2,
    city: s.address.city,
    country: s.address.country,
    workingHours: s.workingHours,
  };
}
