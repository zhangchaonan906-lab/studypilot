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
    expect(source).toContain("错题复习");
    expect(source).toContain("周总结");
    expect(source).toContain("深度学习计时");
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
