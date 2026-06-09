"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignOutButton } from "./SignOutButton";
import { StudyPilotLogo } from "./StudyPilotLogo";
import { renamePlanAction, deletePlanAction } from "@/lib/study/actions";

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
  { href: "/schedule", icon: "📅", label: "课程表" },
  { href: "/review", icon: "❌", label: "错题复习" },
  { href: "/weekly", icon: "📊", label: "周总结" },
  { href: "/focus", icon: "⏱️", label: "深度学习计时" },
  { href: "/checkin", icon: "🐾", label: "猫爪打卡" },
  { href: "/notes", icon: "📝", label: "学习笔记" },
  { href: "/resources", icon: "🌐", label: "资料资源" },
];

const exploreLinks = [
  { href: "/templates", icon: "🧩", label: "计划模板" },
  { href: "/marketplace", icon: "🌐", label: "计划市集" },
  { href: "/a3", icon: "🏆", label: "软件杯 A3 演示" },
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
      <header className="fixed inset-x-0 top-0 z-30 h-[var(--mobile-header-height)] border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur lg:hidden">
        <div className="flex h-full items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm"
            aria-label="打开导航菜单"
            aria-expanded={isOpen}
          >
            ☰
          </button>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2" onClick={closeMenu}>
            <StudyPilotLogo size={34} />
            <span className="truncate text-base font-bold text-ink max-[360px]:hidden">
              StudyPilot
            </span>
          </Link>
          <Link
            href="/plans/new"
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm"
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

      <div data-sidebar-scroll-area className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        <SidebarSection title="我的学习计划">
          <div data-sidebar-plan-list className="max-h-48 overflow-y-auto pr-1">
            {plans.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm leading-6 text-slate-500">
                暂无学习计划
              </p>
            ) : (
              <div className="space-y-1.5">
                {plans.map((plan) => (
                  <PlanSidebarItem
                    key={plan.id}
                    plan={plan}
                    active={isActivePath(pathname, `/plans/${plan.id}`)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </SidebarSection>

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

type PlanSidebarItemMode = "normal" | "menu" | "rename" | "delete";

function PlanSidebarItem({
  plan,
  active,
  onNavigate,
}: {
  plan: { id: string; title: string };
  active: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<PlanSidebarItemMode>("normal");
  const [renameValue, setRenameValue] = useState(plan.title);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetError() {
    setError(null);
  }

  function handleOpenMenu() {
    setMode("menu");
    resetError();
  }

  function handleCloseMenu() {
    setMode("normal");
    resetError();
  }

  function handleStartRename() {
    setRenameValue(plan.title);
    setMode("rename");
    resetError();
  }

  function handleStartDelete() {
    setMode("delete");
    resetError();
  }

  function handleCancel() {
    if (isPending) return;
    setMode("normal");
    resetError();
  }

  function handleSaveRename() {
    const trimmed = renameValue.trim();
    if (trimmed.length === 0) {
      setError("计划标题不能为空。");
      return;
    }
    if (trimmed.length > 60) {
      setError("计划标题不能超过 60 个字。");
      return;
    }
    if (trimmed === plan.title) {
      setMode("normal");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await renamePlanAction(plan.id, trimmed);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMode("normal");
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deletePlanAction(plan.id, false);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMode("normal");
      if (active) {
        router.replace("/dashboard");
      } else {
        router.refresh();
      }
    });
  }

  if (mode === "rename") {
    return (
      <div className="rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => {
              setRenameValue(e.target.value);
              resetError();
            }}
            maxLength={60}
            autoFocus
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-ink placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveRename}
            className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
        ) : null}
      </div>
    );
  }

  if (mode === "delete") {
    return (
      <div className="rounded-xl bg-red-50 px-3 py-2.5">
        <p className="text-sm font-semibold text-red-700">{`确定要删除"${plan.title}"吗？`}</p>
        <p className="mt-1 text-xs leading-5 text-red-600/80">
          删除后无法恢复，该计划下的每日任务、资料、复盘和错题都会被删除。
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "删除中..." : "确认删除"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-1">
        <Link
          href={`/plans/${plan.id}`}
          onClick={onNavigate}
          title={plan.title}
          className={`min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            active
              ? "bg-indigo-50 text-primary ring-1 ring-indigo-100"
              : "text-slate-600 hover:bg-slate-50 hover:text-ink"
          }`}
        >
          <span className="block truncate">{plan.title}</span>
        </Link>
        <button
          type="button"
          onClick={mode === "menu" ? handleCloseMenu : handleOpenMenu}
          aria-label={mode === "menu" ? "关闭操作菜单" : "打开操作菜单"}
          className={`shrink-0 rounded-lg p-1.5 text-sm font-bold leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:opacity-0 sm:group-hover:opacity-100 ${
            mode === "menu" ? "bg-slate-100 text-slate-600 opacity-100" : ""
          }`}
        >
          ···
        </button>
      </div>
      {mode === "menu" ? (
        <div className="mt-1 flex items-center gap-1.5 px-3">
          <button
            type="button"
            onClick={handleStartRename}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            重命名
          </button>
          <button
            type="button"
            onClick={handleStartDelete}
            className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
          >
            删除计划
          </button>
        </div>
      ) : null}
    </div>
  );
}
