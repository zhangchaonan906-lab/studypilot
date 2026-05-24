import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./auth";

const rootDir = process.cwd();

describe("sidebar navigation shell", () => {
  it("uses an independent main content scroll container", () => {
    const appShellSource = readFileSync(
      join(rootDir, "src", "components", "AppShell.tsx"),
      "utf8"
    );
    const appLayoutSource = readFileSync(
      join(rootDir, "src", "app", "(app)", "layout.tsx"),
      "utf8"
    );

    expect(appShellSource).toContain("h-screen overflow-hidden");
    expect(appShellSource).toContain("flex-1 overflow-y-auto");
    expect(appLayoutSource).toContain('dynamic = "force-dynamic"');
  });

  it("renders the required sidebar entries and empty plan state", () => {
    const sidebarPath = join(rootDir, "src", "components", "SidebarNavigation.tsx");

    expect(existsSync(sidebarPath)).toBe(true);

    const source = readFileSync(sidebarPath, "utf8");
    expect(source).toContain("新建计划");
    expect(source).toContain("我的学习计划");
    expect(source).toContain("暂无学习计划");
    expect(source).toContain("今日任务");
    expect(source).toContain("课程表");
    expect(source).toContain("错题复习");
    expect(source).toContain("周总结");
    expect(source).toContain("深度学习计时");
    expect(source).toContain("猫爪打卡");
    expect(source).toContain("资料资源");
    expect(source).toContain("计划模板");
    expect(source).toContain("计划市集");
  });

  it("keeps sidebar fixed while preserving visible plan names", () => {
    const source = readFileSync(
      join(rootDir, "src", "components", "SidebarNavigation.tsx"),
      "utf8"
    );

    expect(source).toContain("hidden h-screen w-72");
    expect(source).toContain("data-sidebar-plan-list");
    expect(source).toContain("max-h-48 overflow-y-auto");
    expect(source).toContain("data-sidebar-scroll-area");
    expect(source).toContain("shrink-0 border-t");
  });

  it("keeps the new workspace routes protected", () => {
    expect(isProtectedPath("/focus")).toBe(true);
    expect(isProtectedPath("/resources")).toBe(true);
    expect(isProtectedPath("/templates")).toBe(true);
    expect(isProtectedPath("/marketplace")).toBe(true);
    expect(isProtectedPath("/schedule")).toBe(true);
    expect(isProtectedPath("/checkin")).toBe(true);
  });
});

describe("sidebar placeholder pages", () => {
  it.each([
    ["focus", "深度学习计时"],
    ["resources", "资料资源"],
    ["templates", "计划模板"],
    ["marketplace", "计划市集"],
  ])("%s page exists with the expected title", (route, title) => {
    const pagePath = join(rootDir, "src", "app", "(app)", route, "page.tsx");

    expect(existsSync(pagePath)).toBe(true);
    expect(readFileSync(pagePath, "utf8")).toContain(title);
  });
});

describe("plan rename", () => {
  it("rejects empty title after trim", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "data.ts"),
      "utf8"
    );
    expect(source).toContain("计划标题不能为空");
    expect(source).toContain("title.trim()");
  });

  it("rejects titles over 60 characters", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "data.ts"),
      "utf8"
    );
    expect(source).toContain("计划标题不能超过 60 个字");
  });

  it("validates plan ownership before update", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "data.ts"),
      "utf8"
    );
    expect(source).toContain('eq("user_id", userId)');
    expect(source).toContain("计划不存在或无权修改");
  });

  it("provides a server action with revalidation", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "actions.ts"),
      "utf8"
    );
    expect(source).toContain("renamePlanAction");
    expect(source).toContain("updatePlanTitle");
    expect(source).toContain('revalidatePath("/", "layout")');
  });
});

describe("sidebar plan item interactions", () => {
  const sidebarSource = readFileSync(
    join(rootDir, "src", "components", "SidebarNavigation.tsx"),
    "utf8"
  );

  it("renders plan items with inline action buttons", () => {
    expect(sidebarSource).toContain("PlanSidebarItem");
    expect(sidebarSource).toContain("重命名");
    expect(sidebarSource).toContain("删除计划");
  });

  it("has inline rename with max length and save/cancel", () => {
    expect(sidebarSource).toContain("maxLength={60}");
    expect(sidebarSource).toContain("保存中...");
    expect(sidebarSource).toContain("handleSaveRename");
  });

  it("has inline delete confirmation", () => {
    expect(sidebarSource).toContain("确认删除");
    expect(sidebarSource).toContain("删除中...");
  });

  it("shows more button on mobile via group hover pattern", () => {
    expect(sidebarSource).toContain("group-hover:opacity-100");
  });

  it("truncates long plan titles to prevent layout break", () => {
    expect(sidebarSource).toContain("block truncate");
  });
});

describe("sidebar delete behavior", () => {
  const sidebarSource = readFileSync(
    join(rootDir, "src", "components", "SidebarNavigation.tsx"),
    "utf8"
  );

  it("redirects to dashboard when deleting the currently viewed plan", () => {
    expect(sidebarSource).toContain('router.replace("/dashboard")');
  });

  it("refreshes without redirect when deleting a non-current plan", () => {
    expect(sidebarSource).toContain("router.refresh()");
  });

  it("reuses existing deletePlanAction", () => {
    expect(sidebarSource).toContain("deletePlanAction");
  });
});

describe("sidebar navigation for schedule and checkin", () => {
  const sidebarSource = readFileSync(
    join(rootDir, "src", "components", "SidebarNavigation.tsx"),
    "utf8",
  );

  it("has course schedule entry with calendar icon", () => {
    expect(sidebarSource).toContain('href: "/schedule"');
    expect(sidebarSource).toContain("📅");
    expect(sidebarSource).toContain("课程表");
  });

  it("has cat paw checkin entry with paw icon", () => {
    expect(sidebarSource).toContain('href: "/checkin"');
    expect(sidebarSource).toContain("🐾");
    expect(sidebarSource).toContain("猫爪打卡");
  });

  it("supports active path highlighting for schedule and checkin", () => {
    expect(sidebarSource).toContain("isActivePath");
    expect(sidebarSource).toContain("startsWith");
  });
});
