import Link from "next/link";
import { AppNavigation } from "./AppNavigation";
import { SignOutButton } from "./SignOutButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-sm">
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

      <div className="border-b border-slate-200/70 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AppNavigation />
        </div>
      </div>

      <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
