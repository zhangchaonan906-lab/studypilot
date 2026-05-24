import { describe, expect, it } from "vitest";
import {
  buildGeneratePlanPayloadFromFormData,
  calculateDeadlineDate,
  getDefaultStartDate,
} from "./plan-dates";

function formDataFrom(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

const baseFormEntries = {
  title: "高数期末冲刺",
  goal: "复习积分和导数应用",
  current_level: "基础薄弱",
  start_date: "2026-06-01",
  total_days: "7",
  daily_minutes: "90",
  rest_days_per_week: "1",
  preference: "多做题",
};

describe("new plan date fields", () => {
  it("defaults the start date to today", () => {
    expect(getDefaultStartDate(new Date(2026, 4, 23))).toBe("2026-05-23");
  });

  it("updates the deadline when plan days change", () => {
    expect(calculateDeadlineDate("2026-06-01", 7)).toBe("2026-06-07");
    expect(calculateDeadlineDate("2026-06-01", 14)).toBe("2026-06-14");
  });

  it("uses the start date as the deadline for a one-day plan", () => {
    expect(calculateDeadlineDate("2026-06-01", 1)).toBe("2026-06-01");
  });

  it("uses start date plus 29 days as the deadline for a 30-day plan", () => {
    expect(calculateDeadlineDate("2026-06-01", 30)).toBe("2026-06-30");
  });

  it("rejects plan days below one with a Chinese message", () => {
    const result = buildGeneratePlanPayloadFromFormData(
      formDataFrom({ ...baseFormEntries, total_days: "0" }),
      new Date(2026, 4, 23)
    );

    expect(result).toEqual({
      ok: false,
      error: "计划天数必须在 1 到 30 天之间。",
    });
  });

  it("rejects plan days above thirty with a Chinese message", () => {
    const result = buildGeneratePlanPayloadFromFormData(
      formDataFrom({ ...baseFormEntries, total_days: "31" }),
      new Date(2026, 4, 23)
    );

    expect(result).toEqual({
      ok: false,
      error: "计划天数必须在 1 到 30 天之间。",
    });
  });

  it("rejects invalid start dates with a Chinese message", () => {
    const result = buildGeneratePlanPayloadFromFormData(
      formDataFrom({ ...baseFormEntries, start_date: "2026-02-31" }),
      new Date(2026, 4, 23)
    );

    expect(result).toEqual({
      ok: false,
      error: "请选择有效的起始日期。",
    });
  });

  it("rejects an empty start date with a Chinese message", () => {
    const result = buildGeneratePlanPayloadFromFormData(
      formDataFrom({ ...baseFormEntries, start_date: "" }),
      new Date(2026, 4, 23)
    );

    expect(result).toEqual({
      ok: false,
      error: "请选择有效的起始日期。",
    });
  });

  it("does not build an AI request payload for invalid form values", () => {
    const result = buildGeneratePlanPayloadFromFormData(
      formDataFrom({ ...baseFormEntries, total_days: "-3" }),
      new Date(2026, 4, 23)
    );

    expect(result.ok).toBe(false);
  });

  it("builds a payload with startDate, totalDays and computed deadline", () => {
    const result = buildGeneratePlanPayloadFromFormData(
      formDataFrom({ ...baseFormEntries, total_days: "10" }),
      new Date(2026, 4, 23)
    );

    expect(result).toEqual({
      ok: true,
      data: {
        title: "高数期末冲刺",
        goal: "复习积分和导数应用",
        currentLevel: "基础薄弱",
        startDate: "2026-06-01",
        totalDays: 10,
        deadline: "2026-06-10",
        dailyMinutes: 90,
        restDaysPerWeek: 1,
        preference: "多做题",
      },
    });
  });
});
