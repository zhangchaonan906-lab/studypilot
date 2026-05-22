import { describe, expect, it } from "vitest";
import { parseDailyReflectionFormData } from "./forms";

function formDataFrom(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("daily reflection form parsing", () => {
  it("accepts the fixed mood and difficulty options", () => {
    const result = parseDailyReflectionFormData(
      formDataFrom({
        plan_id: "plan-1",
        date: "2026-05-23",
        mood: "轻松",
        difficulty: "刚好",
        note: "今天完成得比较稳。",
      })
    );

    expect(result).toEqual({
      ok: true,
      data: {
        plan_id: "plan-1",
        date: "2026-05-23",
        mood: "轻松",
        difficulty: "刚好",
        note: "今天完成得比较稳。",
      },
    });
  });

  it("rejects unknown mood and difficulty values", () => {
    expect(
      parseDailyReflectionFormData(
        formDataFrom({
          plan_id: "plan-1",
          mood: "非常开心",
          difficulty: "完全不会",
        })
      )
    ).toEqual({
      ok: false,
      error: "请选择有效的学习状态和难度感受。",
    });
  });
});
