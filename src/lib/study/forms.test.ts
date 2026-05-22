import { describe, expect, it } from "vitest";
import {
  getLocalDateString,
  getTaskCompletionPatch,
  parseCreatePlanFormData,
  parseMistakeReviewFormData,
} from "./forms";

function formDataFrom(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("study form parsing", () => {
  it("parses a basic plan form into a plans insert payload", () => {
    const result = parseCreatePlanFormData(
      formDataFrom({
        title: "高数期末冲刺",
        goal: "30 天完成高数复习",
        current_level: "基础薄弱",
        deadline: "2026-06-30",
        daily_minutes: "90",
        rest_days_per_week: "1",
        preference: "多做题",
      })
    );

    expect(result).toEqual({
      ok: true,
      data: {
        title: "高数期末冲刺",
        goal: "30 天完成高数复习",
        current_level: "基础薄弱",
        deadline: "2026-06-30",
        daily_minutes: 90,
        rest_days_per_week: 1,
        preference: "多做题",
        overview: "手动创建的基础计划，后续可接入 AI 生成每日安排。",
      },
    });
  });

  it("returns Chinese validation messages for invalid plan input", () => {
    expect(parseCreatePlanFormData(formDataFrom({ title: "", goal: "" }))).toEqual({
      ok: false,
      error: "请填写计划标题和学习目标。",
    });

    expect(
      parseCreatePlanFormData(
        formDataFrom({
          title: "高数",
          goal: "复习",
          deadline: "2026-06-30",
          daily_minutes: "0",
        })
      )
    ).toEqual({
      ok: false,
      error: "每天学习时间至少需要 1 分钟。",
    });
  });

  it("parses mistake review form data", () => {
    const result = parseMistakeReviewFormData(
      formDataFrom({
        plan_id: "plan-1",
        task_id: "",
        date: "2026-05-23",
        question: "积分换元漏掉上下限",
        mistake_reason: "步骤检查不够",
        correct_method: "先换元再代入新边界",
        next_action: "明天二刷",
      })
    );

    expect(result).toEqual({
      ok: true,
      data: {
        plan_id: "plan-1",
        task_id: null,
        date: "2026-05-23",
        question: "积分换元漏掉上下限",
        mistake_reason: "步骤检查不够",
        correct_method: "先换元再代入新边界",
        next_action: "明天二刷",
      },
    });
  });

  it("creates task completion patches", () => {
    const now = new Date("2026-05-23T08:00:00.000Z");

    expect(getTaskCompletionPatch(true, now)).toEqual({
      is_completed: true,
      completed_at: "2026-05-23T08:00:00.000Z",
    });

    expect(getTaskCompletionPatch(false, now)).toEqual({
      is_completed: false,
      completed_at: null,
    });
  });

  it("formats dates for database date columns", () => {
    expect(getLocalDateString(new Date(2026, 4, 23))).toBe("2026-05-23");
  });
});
