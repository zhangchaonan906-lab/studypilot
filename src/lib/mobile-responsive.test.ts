import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readSource(...parts: string[]) {
  return readFileSync(join(rootDir, ...parts), "utf8");
}

describe("mobile responsive shell", () => {
  const appShellSource = readSource("src", "components", "AppShell.tsx");
  const sidebarSource = readSource("src", "components", "SidebarNavigation.tsx");
  const globalCss = readSource("src", "app", "globals.css");

  it("reserves a stable mobile header height before page content", () => {
    expect(globalCss).toContain("--mobile-header-height: 64px");
    expect(sidebarSource).toContain("h-[var(--mobile-header-height)]");
    expect(appShellSource).toContain("data-app-main");
    expect(appShellSource).toContain("pt-[calc(var(--mobile-header-height)+1rem)]");
  });

  it("uses dynamic viewport height and bottom safe-area padding", () => {
    expect(appShellSource).toContain("min-h-dvh");
    expect(appShellSource).not.toContain("h-screen overflow-hidden");
    expect(appShellSource).toContain("pb-[calc(env(safe-area-inset-bottom)+1.5rem)]");
  });

  it("keeps the mobile header controls compact at 360px", () => {
    expect(sidebarSource).toContain("shrink-0");
    expect(sidebarSource).toContain("max-[360px]:hidden");
    expect(sidebarSource).toContain("w-[min(20rem,88vw)]");
  });

  it("keeps body text on the system sans-serif stack", () => {
    expect(globalCss).toContain("font-family: Arial");
    expect(globalCss).not.toMatch(/font-family:[^;]*(cursive|Comic Sans|KaiTi|STKaiti)/i);
  });
});

describe("mobile responsive page surfaces", () => {
  it("keeps /login compact with dynamic viewport spacing", () => {
    const source = readSource("src", "app", "login", "page.tsx");

    expect(source).toContain("min-h-dvh");
    expect(source).toContain("pb-[calc(env(safe-area-inset-bottom)+2rem)]");
    expect(source).toContain("min-h-[calc(100dvh-5rem)]");
    expect(source).toContain("text-3xl font-bold");
    expect(source).toContain("sm:text-4xl lg:text-5xl");
  });

  it("renders /checkin with compact mobile stats, actions, and calendar cells", () => {
    const source = readSource("src", "app", "(app)", "checkin", "CheckinClient.tsx");

    expect(source).toContain("mt-4 space-y-4 sm:mt-6 sm:space-y-6");
    expect(source).toContain("grid gap-3 sm:grid-cols-3");
    expect(source).toContain("data-checkin-stat-card");
    expect(source).toContain("text-2xl sm:text-3xl");
    expect(source).toContain("w-full sm:w-auto");
    expect(source).toContain("rounded-lg sm:rounded-xl");
  });

  it("keeps /today grouped tasks readable and moves side content below on mobile", () => {
    const todaySource = readSource("src", "app", "(app)", "today", "page.tsx");
    const toggleSource = readSource("src", "components", "TaskCompletionToggle.tsx");

    expect(todaySource).toContain("xl:grid-cols-[minmax(0,1fr)_360px]");
    expect(todaySource).toContain("today.planGroups.map");
    expect(toggleSource).toContain("break-words");
    expect(toggleSource).toContain("sm:ml-10");
    expect(toggleSource).toContain("w-full justify-center sm:w-fit");
  });

  it("keeps /plans/new fields single-column on mobile and preserves key fields", () => {
    const source = readSource("src", "components", "NewPlanForm.tsx");

    expect(source).toContain("grid gap-4 sm:gap-6");
    expect(source).toContain("grid gap-4 sm:grid-cols-2 xl:grid-cols-4");
    expect(source).toContain("自动估算每日学习时间");
    expect(source).toContain('name="goal"');
    expect(source).toContain('name="total_days"');
    expect(source).toContain('name="daily_minutes"');
    expect(source).toContain("btn-primary w-full sm:w-fit");
  });

  it("keeps focus timer and schedule controls from overflowing on mobile", () => {
    const focusSource = readSource("src", "components", "FocusTimer.tsx");
    const scheduleSource = readSource(
      "src",
      "app",
      "(app)",
      "schedule",
      "TimetableClient.tsx",
    );

    expect(focusSource).toContain("w-full max-w-2xl");
    expect(focusSource).toContain("text-5xl sm:text-7xl");
    expect(focusSource).toContain("w-full sm:w-auto");
    expect(scheduleSource).toContain("flex-col gap-3 sm:flex-row");
    expect(scheduleSource).toContain("grid gap-3 sm:grid-cols-2");
    expect(scheduleSource).toContain("max-h-[min(80dvh,42rem)]");
  });

  it("uses shrinkable columns beside fixed-width side panels", () => {
    expect(readSource("src", "app", "(app)", "dashboard", "page.tsx")).toContain(
      "xl:grid-cols-[minmax(0,1fr)_360px]",
    );
    expect(readSource("src", "app", "(app)", "plans", "[id]", "page.tsx")).toContain(
      "xl:grid-cols-[minmax(0,1fr)_320px]",
    );
    expect(readSource("src", "app", "(app)", "review", "page.tsx")).toContain(
      "xl:grid-cols-[minmax(0,1fr)_380px]",
    );
    expect(readSource("src", "app", "(app)", "weekly", "page.tsx")).toContain(
      "xl:grid-cols-[380px_minmax(0,1fr)]",
    );
  });
});
