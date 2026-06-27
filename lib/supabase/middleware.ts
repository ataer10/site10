import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/admin-access";

/**
 * Oturumu tazeler ve /admin'i korur.
 * Supabase yapılandırılmamışsa (anahtar yok) demo modunda guard ETMEZ —
 * admin UI'ı görülebilir kalır; anahtar eklenince koruma devreye girer.
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login";

  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response; // demo modu
  }

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Yalnızca beyaz listedeki e-posta admin sayılır
  const isAdmin = Boolean(user && isAdminEmail(user.email));

  if (path.startsWith("/admin") && !isLogin && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", path);
    if (user && !isAdmin) url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }
  if (isLogin && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
