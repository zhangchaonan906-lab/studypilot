import { describe, expect, it } from "vitest";
import { appRoutes, mockPlans, todayTasks } from "./site";

describe("StudyPilot mock shell data", () => {
  it("defines the required first-version routes", () => {
    expect(appRoutes.map((route) => route.href)).toEqual([
      "/dashboard",
      "/plans/new",
      "/today",
      "/review",
      "/weekly",
    ]);
  });

  it("ships useful mock data for the initial pages", () => {
    expect(mockPlans.length).toBeGreaterThanOrEqual(2);
    expect(todayTasks.length).toBeGreaterThanOrEqual(3);
  });
});
