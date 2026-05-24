import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appDir = join(process.cwd(), "src", "app");

describe("app error pages", () => {
  it("does not render html or body tags from segment error.tsx", () => {
    const source = readFileSync(join(appDir, "error.tsx"), "utf8");

    expect(source).not.toContain("<html");
    expect(source).not.toContain("<body");
  });

  it("does not render html or body tags from not-found.tsx", () => {
    const source = readFileSync(join(appDir, "not-found.tsx"), "utf8");

    expect(source).not.toContain("<html");
    expect(source).not.toContain("<body");
  });
});
