/**
 * Supabase ortam değişkeni yardımcıları.
 * env tanımlı değilse uygulama seed verisine düşer (lib/data/catalog.ts).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Public (anon) Supabase erişimi yapılandırılmış mı? */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Sunucu tarafı admin (service-role) erişimi yapılandırılmış mı? */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
