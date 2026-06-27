"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";

/** Tarayıcı (client component) Supabase istemcisi — anon key. */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
