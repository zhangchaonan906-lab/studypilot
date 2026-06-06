import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readSource(...parts: string[]) {
  const filePath = join(rootDir, ...parts);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("ICP footer", () => {
  it("renders the required ICP filing text as a quiet external link", () => {
    const source = readSource("src", "components", "IcpFooter.tsx");

    expect(source).toContain("ICP备案号：皖ICP备2026016512号");
    expect(source).toContain("https://beian.miit.gov.cn/");
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
    expect(source).toContain("text-xs");
    expect(source).toContain("text-slate-400");
  });

  it("is shown on the landing page, login page, and app shell", () => {
    expect(readSource("src", "app", "page.tsx")).toContain("IcpFooter");
    expect(readSource("src", "app", "login", "page.tsx")).toContain("IcpFooter");
    expect(readSource("src", "components", "AppShell.tsx")).toContain("IcpFooter");
  });
});
