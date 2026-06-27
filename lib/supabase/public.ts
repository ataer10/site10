import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";

/**
 * Cookie'siz public (anon) Supabase istemcisi — yalnızca herkese açık okumalar.
 * cookies() KULLANMAZ; bu sayede generateStaticParams + statik üretim çalışır
 * ve katalog sayfaları cache'lenebilir. (Oturum/cookie gereken yerler:
 * lib/supabase/server.ts.)
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
