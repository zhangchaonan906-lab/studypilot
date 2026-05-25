import { describe, expect, it } from "vitest";
import {
  appRoutes,
  capabilityCards,
  learningLoopSteps,
  mockPlans,
  sceneTags,
  todayTasks,
} from "./site";

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

  it("provides learning loop steps for the landing page", () => {
    expect(learningLoopSteps).toHaveLength(4);
    expect(learningLoopSteps[0].title).toBe("输入学习目标");
    expect(learningLoopSteps[3].title).toBe("打卡复盘 + 周总结");
  });

  it("provides scene tags for the landing page", () => {
    expect(sceneTags.length).toBeGreaterThanOrEqual(7);
    expect(sceneTags.map((s) => s.label)).toContain("期末冲刺");
    expect(sceneTags.map((s) => s.label)).toContain("编程入门");
    expect(sceneTags.map((s) => s.label)).toContain("自我提升");
  });

  it("provides capability cards for the landing page", () => {
    expect(capabilityCards.length).toBeGreaterThanOrEqual(4);
    expect(capabilityCards.map((c) => c.title)).toContain("AI 学习计划");
  });
});
