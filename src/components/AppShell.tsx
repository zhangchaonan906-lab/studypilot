import Link from "next/link";
import { appRoutes } from "@/lib/site";
import { SignOutButton } from "./SignOutButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              SP
            </span>
            <span>
              <span className="block text-base font-bold text-ink">StudyPilot</span>
              <span className="hidden text-xs text-slate-500 sm:block">今天也稳稳推进一点</span>
            </span>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto grid min-w-0 max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <nav className="flex w-full max-w-full gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-soft lg:flex-col lg:overflow-visible">
            {appRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="min-w-max rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-primary lg:min-w-0"
              >
                <span className="block font-semibold">{route.label}</span>
                <span className="hidden text-xs text-slate-500 lg:block">{route.description}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
