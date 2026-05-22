import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getAuthRedirectPath, isProtectedPath } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const redirectPath = getAuthRedirectPath(pathname, false);
    return redirectPath
      ? NextResponse.redirect(new URL(redirectPath, request.url))
      : NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = getAuthRedirectPath(pathname, Boolean(user));

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (!user && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
