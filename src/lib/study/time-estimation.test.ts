import { describe, expect, it } from "vitest";
import { estimateDailyStudyMinutes } from "./time-estimation";

describe("estimateDailyStudyMinutes", () => {
  const baseInput = {
    goal: "完成高数期末复习",
    currentLevel: "基础薄弱",
    planDays: 14,
    restDaysPerWeek: 1,
    preference: "每天短时高频",
  };

  it("returns higher time for weaker foundation", () => {
    const weak = estimateDailyStudyMinutes({
      ...baseInput,
      currentLevel: "基础薄弱",
    });
    const strong = estimateDailyStudyMinutes({
      ...baseInput,
      currentLevel: "需要冲刺高分",
    });
    expect(weak.dailyMinutes).toBeGreaterThan(strong.dailyMinutes);
  });

  it("returns higher time for shorter plan duration", () => {
    const short = estimateDailyStudyMinutes({
      ...baseInput,
      planDays: 7,
    });
    const long = estimateDailyStudyMinutes({
      ...baseInput,
      planDays: 30,
    });
    expect(short.dailyMinutes).toBeGreaterThan(long.dailyMinutes);
  });

  it("returns higher time with more rest days", () => {
    const few = estimateDailyStudyMinutes({
      ...baseInput,
      restDaysPerWeek: 1,
    });
    const many = estimateDailyStudyMinutes({
      ...baseInput,
      restDaysPerWeek: 3,
    });
    expect(many.dailyMinutes).toBeGreaterThan(few.dailyMinutes);
  });

  it("never goes below 30 minutes", () => {
    const result = estimateDailyStudyMinutes({
      goal: "了解基本概念",
      currentLevel: "需要冲刺高分",
      planDays: 60,
      restDaysPerWeek: 0,
      preference: "多看讲解",
    });
    expect(result.dailyMinutes).toBeGreaterThanOrEqual(30);
  });

  it("never exceeds 180 minutes", () => {
    const result = estimateDailyStudyMinutes({
      goal: "高数线代概率论期末考试冲刺考研算法数据结构",
      currentLevel: "基础薄弱",
      planDays: 3,
      restDaysPerWeek: 5,
      preference: "多做题",
    });
    expect(result.dailyMinutes).toBeLessThanOrEqual(180);
  });

  it("rounds to nearest 15 minutes", () => {
    const result = estimateDailyStudyMinutes(baseInput);
    expect(result.dailyMinutes % 15).toBe(0);
  });

  it("returns sprint intensity for >120 minutes", () => {
    const result = estimateDailyStudyMinutes({
      ...baseInput,
      goal: "高数期末考试冲刺",
      currentLevel: "基础薄弱",
      planDays: 5,
      restDaysPerWeek: 3,
    });
    expect(result.intensity).toBe("冲刺");
    expect(result.dailyMinutes).toBeGreaterThan(120);
  });

  it("returns reasonable intensity for moderate inputs", () => {
    const result = estimateDailyStudyMinutes({
      goal: "完成基础知识学习",
      currentLevel: "需要冲刺高分",
      planDays: 21,
      restDaysPerWeek: 1,
      preference: "多看讲解",
    });
    expect(["轻松", "标准"]).toContain(result.intensity);
  });

  it("returns higher time for exam-related goals", () => {
    const exam = estimateDailyStudyMinutes({
      ...baseInput,
      goal: "考研数学冲刺",
    });
    const light = estimateDailyStudyMinutes({
      ...baseInput,
      goal: "了解入门基础知识",
    });
    expect(exam.dailyMinutes).toBeGreaterThan(light.dailyMinutes);
  });

  it("includes a reason string", () => {
    const result = estimateDailyStudyMinutes(baseInput);
    expect(result.reason.length).toBeGreaterThan(0);
    expect(typeof result.reason).toBe("string");
  });

  it("handles empty current level gracefully", () => {
    const result = estimateDailyStudyMinutes({
      ...baseInput,
      currentLevel: "",
    });
    expect(result.dailyMinutes).toBeGreaterThanOrEqual(30);
    expect(result.dailyMinutes).toBeLessThanOrEqual(180);
  });
});
