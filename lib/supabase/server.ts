import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";

/**
 * Sunucu (RSC / Server Action) Supabase istemcisi — anon key + cookie köprüsü.
 * Next 16: cookies() bir Promise döner, bu yüzden await ediyoruz.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // RSC'den çağrıldığında cookie yazımı engellenebilir; ortada
          // session'ı yenileyen bir middleware varsa sorun değil.
        }
      },
    },
  });
}
