import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "@/components/admin/login-form";
import { site } from "@/lib/site";
import type { SearchParamsRecord } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Admin Giriş",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  const configured = isSupabaseConfigured();

  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label={site.name}
          >
            <span className="grid size-9 place-items-center rounded-sm bg-ink-900 font-display text-lg font-extrabold leading-none text-white">
              B
            </span>
            <span className="font-display text-xl font-extrabold uppercase tracking-tight text-ink-900">
              {site.shortName}
              <span className="text-orange-500">.</span>
            </span>
          </Link>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-400">
            Yönetim Paneli
          </p>
        </div>

        <div className="rounded-md border border-ink-200 bg-white p-6 shadow-flat">
          <LoginForm configured={configured} next={next} />
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Yalnızca yetkili firma personeli içindir.
        </p>
      </div>
    </div>
  );
}
