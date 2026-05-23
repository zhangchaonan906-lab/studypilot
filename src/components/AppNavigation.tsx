"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/lib/site";

function isRouteActive(pathname: string, href: string) {
  if (href === "/plans/new") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主导航"
      className="flex w-full gap-2 overflow-x-auto py-2 lg:justify-center"
    >
      {appRoutes.map((route) => {
        const isActive = isRouteActive(pathname, route.href);

        return (
          <Link
            key={route.href}
            href={route.href}
            className={`min-w-max rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-primary"
            }`}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
