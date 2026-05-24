import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

describe("StudyPilot brand logo", () => {
  it("provides a reusable SVG logo component with size and text props", () => {
    const source = readFileSync(
      join(rootDir, "src", "components", "StudyPilotLogo.tsx"),
      "utf8"
    );

    expect(source).toContain("size = 40");
    expect(source).toContain("showText = false");
    expect(source).toContain("className");
    expect(source).toContain("<svg");
    expect(source).toContain("StudyPilot cat mark");
    expect(source).toContain("#FFFFFF");
    expect(source).toContain("#FACC15");
    expect(source).not.toContain("linearGradient");
  });

  it("uses the reusable logo in the main brand surfaces", () => {
    const files = [
      "src/components/SidebarNavigation.tsx",
      "src/components/EmptyState.tsx",
      "src/app/page.tsx",
      "src/app/login/page.tsx",
    ];

    for (const file of files) {
      const source = readFileSync(join(rootDir, file), "utf8");
      expect(source).toContain("StudyPilotLogo");
      expect(source).not.toMatch(/>\s*SP\s*</);
    }
  });

  it("ships a favicon/app icon SVG", () => {
    const iconPath = join(rootDir, "src", "app", "icon.svg");

    expect(existsSync(iconPath)).toBe(true);
    const source = readFileSync(iconPath, "utf8");
    expect(source).toContain("<svg");
    expect(source).toContain("StudyPilot cat mark");
    expect(source).toContain("#FFFFFF");
    expect(source).toContain("#FACC15");
  });
});
