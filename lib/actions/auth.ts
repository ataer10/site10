"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SignInResult = { ok: boolean; error?: string };

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Supabase yapılandırılmamış — giriş için anahtarlar gerekli (demo modu).",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    return { ok: false, error: "E-posta veya şifre hatalı." };
  }
  return { ok: true };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
