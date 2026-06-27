import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/env";

/**
 * Service-role Supabase istemcisi — RLS'i bypass eder.
 * YALNIZCA sunucu tarafında (Server Action / route handler) kullanılır;
 * asla client'a sızdırılmaz. Teklif yazımı, admin CRUD, Storage upload için.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
