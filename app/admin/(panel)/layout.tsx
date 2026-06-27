import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { configured, email } = await getAdminSession();

  return (
    <div className="lg:flex">
      <AdminSidebar email={email} />
      <div className="min-w-0 flex-1 bg-ink-50">
        {!configured ? (
          <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-xs text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            <span>
              <strong>Demo modu</strong> — Supabase yapılandırılmadı. Veriler
              örnektir; kayıt/gönderim kalıcı değildir.{" "}
              <Link href="/admin/login" className="underline">
                Giriş ekranı
              </Link>
              .
            </span>
          </div>
        ) : null}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
