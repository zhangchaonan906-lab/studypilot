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

    expect(source).toMatch(/export const maxDuration = 60;/);
  });

  it("allows enough serverless time for weekly summary generation", () => {
    const source = readFileSync(
      join(appDir, "api", "weekly-summary", "route.ts"),
      "utf8"
    );

    expect(source).toMatch(/export const maxDuration = 60;/);
  });
});
