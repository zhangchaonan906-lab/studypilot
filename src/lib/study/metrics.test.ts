import { describe, expect, it } from "vitest";
import {
  calculateCompletionRate,
  getCurrentWeekRange,
  getDaysUntilDeadline,
  getPlanWeekIndex,
} from "./metrics";

describe("study metrics", () => {
  it("calculates completion rate from task completion flags", () => {
    expect(
      calculateCompletionRate([
        { is_completed: true },
        { is_completed: false },
        { is_completed: true },
      ])
    ).toEqual({
      completed: 2,
      total: 3,
      rate: 67,
    });
  });

  it("returns zero completion rate when there are no tasks", () => {
    expect(calculateCompletionRate([])).toEqual({
      completed: 0,
      total: 0,
      rate: 0,
    });
  });

  it("returns 100% when all tasks are completed", () => {
    expect(
      calculateCompletionRate([
        { is_completed: true },
        { is_completed: true },
      ])
    ).toEqual({
      completed: 2,
      total: 2,
      rate: 100,
    });
  });

  it("returns 0% when no tasks are completed", () => {
    expect(
      calculateCompletionRate([
        { is_completed: false },
        { is_completed: false },
      ])
    ).toEqual({
      completed: 0,
      total: 2,
      rate: 0,
    });
  });

  it("calculates remaining days until a deadline", () => {
    expect(getDaysUntilDeadline("2026-05-31", "2026-05-23")).toBe(8);
    expect(getDaysUntilDeadline("2026-05-23", "2026-05-23")).toBe(0);
    expect(getDaysUntilDeadline("2026-05-20", "2026-05-23")).toBe(0);
  });

  it("uses Monday to Sunday as the weekly summary range", () => {
    expect(getCurrentWeekRange("2026-05-23")).toEqual({
      startDate: "2026-05-18",
      endDate: "2026-05-24",
    });

    expect(getCurrentWeekRange("2026-05-24")).toEqual({
      startDate: "2026-05-18",
      endDate: "2026-05-24",
    });
  });

  it("calculates plan week index from the plan start week", () => {
    expect(getPlanWeekIndex("2026-05-23", "2026-05-18")).toBe(1);
    expect(getPlanWeekIndex("2026-05-23", "2026-05-25")).toBe(2);
    expect(getPlanWeekIndex("2026-05-23", "2026-06-01")).toBe(3);
  });
});
