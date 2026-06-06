import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "./lib/auth";

const rootProductionHost = "studypilot.cn";
const canonicalProductionHost = "www.studypilot.cn";
const publicRoutes = new Set(["/", "/login", "/auth/callback"]);
const rootDomainApiError = "请使用 www.studypilot.cn 访问正式站点。";

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname);
}

function isRootProductionHost(request: NextRequest) {
  return request.nextUrl.hostname === rootProductionHost;
}

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function isPageNavigationMethod(method: string) {
  return method === "GET" || method === "HEAD";
}

function isStaticAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    /\.(?:css|js|map|svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|woff|woff2)$/i.test(pathname)
  );
}

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name, value }) => {
    if (!value) {
      return false;
    }

    return (
      (name.startsWith("sb-") && name.includes("auth-token")) ||
      name === "supabase-auth-token" ||
      name.includes("supabase-auth-token")
    );
  });
}

function createCanonicalHostRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.protocol = "https:";
  redirectUrl.hostname = canonicalProductionHost;
  redirectUrl.port = "";

  return NextResponse.redirect(redirectUrl, 308);
}

function createLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(redirectUrl);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isRootProductionHost(request)) {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: rootDomainApiError }, { status: 400 });
    }

    if (isPageNavigationMethod(request.method)) {
      return createCanonicalHostRedirect(request);
    }
  }

  if (isPublicRoute(pathname) || isStaticAssetPath(pathname)) {
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !hasSupabaseAuthCookie(request)) {
    return createLoginRedirect(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
