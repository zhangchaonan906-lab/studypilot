"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "./SignOutButton";
import { StudyPilotLogo } from "./StudyPilotLogo";

type SidebarPlan = {
  id: string;
  title: string;
};

type SidebarNavigationProps = {
  plans: SidebarPlan[];
  userEmail: string | null;
};

const studyToolLinks = [
  { href: "/today", icon: "🎯", label: "今日任务" },
  { href: "/review", icon: "❌", label: "错题复习" },
  { href: "/weekly", icon: "📊", label: "周总结" },
  { href: "/focus", icon: "⏱️", label: "深度学习计时" },
  { href: "/resources", icon: "🌐", label: "资料资源" },
];

const exploreLinks = [
  { href: "/templates", icon: "🧩", label: "计划模板" },
  { href: "/marketplace", icon: "🌐", label: "计划市集" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/plans/new") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNavigation({ plans, userEmail }: SidebarNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm"
            aria-label="打开导航菜单"
            aria-expanded={isOpen}
          >
            ☰
          </button>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2" onClick={closeMenu}>
            <StudyPilotLogo size={36} />
            <span className="truncate text-base font-bold text-ink">StudyPilot</span>
          </Link>
          <Link
            href="/plans/new"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm"
          >
            新建
          </Link>
        </div>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="关闭导航菜单"
            className="absolute inset-0 bg-slate-900/30"
            onClick={closeMenu}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-2xl">
            <SidebarContent
              pathname={pathname}
              plans={plans}
              userEmail={userEmail}
              onNavigate={closeMenu}
            />
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white/95 shadow-sm backdrop-blur lg:flex">
        <SidebarContent pathname={pathname} plans={plans} userEmail={userEmail} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  plans,
  userEmail,
  onNavigate,
}: SidebarNavigationProps & {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-4">
      <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2" onClick={onNavigate}>
        <StudyPilotLogo size={40} />
        <span className="min-w-0">
          <span className="block truncate text-base font-bold text-ink">StudyPilot</span>
          <span className="block truncate text-xs text-slate-500">学习计划工作台</span>
        </span>
      </Link>

      <Link
        href="/plans/new"
        onClick={onNavigate}
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
          isActivePath(pathname, "/plans/new")
            ? "bg-primary text-white"
            : "bg-slate-900 text-white hover:bg-primary"
        }`}
      >
        <span aria-hidden="true">➕</span>
        新建计划
      </Link>

      <section className="mt-5 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
          我的学习计划
        </h2>
        <div data-sidebar-plan-list className="min-h-0 flex-1 overflow-y-auto pr-1">
          {plans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm leading-6 text-slate-500">
              暂无学习计划
            </p>
          ) : (
            <div className="space-y-1.5">
              {plans.map((plan) => (
                <SidebarLink
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  label={plan.title}
                  active={isActivePath(pathname, `/plans/${plan.id}`)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mt-5 shrink-0">
        <SidebarSection title="学习工具">
          <div className="space-y-1.5">
            {studyToolLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                active={isActivePath(pathname, link.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </SidebarSection>
      </div>

      <div className="mt-5 shrink-0">
        <SidebarSection title="探索">
          <div className="space-y-1.5">
            {exploreLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                active={isActivePath(pathname, link.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </SidebarSection>
      </div>

      <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
        <p className="truncate px-2 text-xs font-semibold text-slate-500">
          {userEmail ?? "我的账户"}
        </p>
        <div className="mt-3 [&>button]:w-full">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 first:mt-0">
      <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon?: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      className={`flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-indigo-50 text-primary ring-1 ring-indigo-100"
          : "text-slate-600 hover:bg-slate-50 hover:text-ink"
      }`}
    >
      {icon ? (
        <span className="shrink-0 text-base" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}
