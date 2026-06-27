import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Admin oturum bilgisi — layout başlığı ve demo banner için. */
export async function getAdminSession(): Promise<{
  configured: boolean;
  email: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { configured: false, email: null };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { configured: true, email: user?.email ?? null };
}
