"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { site } from "@/lib/site";

const nav = [
  { title: "Panel", href: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Teklifler", href: "/admin/teklifler", icon: FileText },
  { title: "Ürünler", href: "/admin/urunler", icon: Package },
];

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex shrink-0 flex-col border-ink-800 bg-ink-900 text-ink-300 lg:h-dvh lg:w-64 lg:border-r">
      {/* Marka */}
      <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
        <Link href="/admin" className="inline-flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-sm bg-white font-display text-base font-extrabold leading-none text-ink-900">
            B
          </span>
          <span className="font-display text-base font-extrabold uppercase tracking-tight text-white">
            {site.shortName}
            <span className="text-orange-500">.</span>
          </span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
        {nav.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-ink-800 text-white"
                  : "text-ink-400 hover:bg-ink-800/50 hover:text-white",
              )}
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Alt: kullanıcı + çıkış */}
      <div className="mt-auto hidden border-t border-ink-800 p-3 lg:block">
        <Link
          href="/"
          target="_blank"
          className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs text-ink-400 hover:text-white"
        >
          <ExternalLink className="size-3.5" strokeWidth={1.75} />
          Siteyi görüntüle
        </Link>
        {email ? (
          <p className="truncate px-3 pb-2 text-xs text-ink-500">{email}</p>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            Çıkış yap
          </button>
        </form>
      </div>
    </aside>
  );
}
