import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appDir = join(process.cwd(), "src", "app");

describe("AI API route deployment settings", () => {
  it("allows enough serverless time for study plan generation", () => {
    const source = readFileSync(
      join(appDir, "api", "generate-plan", "route.ts"),
      "utf8"
    );

    expect(source).toMatch(/export const runtime = "nodejs";/);
    expect(source).toMatch(/export const dynamic = "force-dynamic";/);
    expect(source).toMatch(/export const maxDuration = 60;/);
  });

  it("logs only safe metadata when study plan request JSON parsing fails", () => {
    const source = readFileSync(
      join(appDir, "api", "generate-plan", "route.ts"),
      "utf8",
    );

    expect(source).toContain("logInvalidGeneratePlanJson");
    expect(source).toContain("content-type");
    expect(source).toContain("content-length");
    expect(source).toContain("hasUser");
    expect(source).toContain("errorName");
    expect(source).toContain("safeErrorMessage");
    expect(source).not.toContain("console.error(body");
    expect(source).not.toContain("await request.text()");
  });

  it("allows enough serverless time for weekly summary generation", () => {
    const source = readFileSync(
      join(appDir, "api", "weekly-summary", "route.ts"),
      "utf8"
    );

    expect(source).toMatch(/export const maxDuration = 60;/);
  });
});
