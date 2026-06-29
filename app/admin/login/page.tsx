import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "@/components/admin/login-form";
import { signOut } from "@/lib/actions/auth";
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
  const denied = sp.denied === "1";
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
              <span className="text-steel-500">.</span>
            </span>
          </Link>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-400">
            Yönetim Paneli
          </p>
        </div>

        {denied ? (
          <div className="mb-4 rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            <p className="font-semibold">Bu hesap yetkili değil</p>
            <p className="mt-1 text-danger/80">
              Giriş yaptığınız hesap yönetim paneline erişim yetkisine sahip
              değil. Yetkili bir hesapla giriş yapın.
            </p>
            <form action={signOut} className="mt-2">
              <button type="submit" className="text-xs font-medium underline">
                Oturumu kapat
              </button>
            </form>
          </div>
        ) : null}

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
