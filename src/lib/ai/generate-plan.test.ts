import { describe, expect, it } from "vitest";
import { buildGeneratePlanMessages, generatePlan, parseAIJson } from "./generate-plan";

const input = {
  title: "高数期末冲刺",
  goal: "复习积分和导数应用",
  currentLevel: "基础薄弱",
  deadline: "2026-05-24",
  dailyMinutes: 90,
  restDaysPerWeek: 1,
  preference: "多做题",
  startDate: "2026-05-23",
  maxDays: 2,
};

describe("generatePlan", () => {
  it("builds a prompt that requires strict Chinese JSON", () => {
    const messages = buildGeneratePlanMessages(input);
    const prompt = messages.map((message) => message.content).join("\n");

    expect(prompt).toContain("严格 JSON");
    expect(prompt).toContain("内容必须是中文");
    expect(prompt).toContain("每 7 天安排一次复盘任务");
    expect(prompt).toContain("不要编造具体 URL");
  });

  it("parses fenced or noisy JSON without accepting invalid shapes", () => {
    expect(parseAIJson('```json\n{"title":"计划","overview":"总览","days":[]}\n```')).toEqual({
      title: "计划",
      overview: "总览",
      days: [],
    });
  });

  it("validates AI output before returning", async () => {
    const plan = await generatePlan(input, async () =>
      JSON.stringify({
        title: "高数两天计划",
        overview: "先诊断，再练习。",
        days: [
          {
            dayIndex: 1,
            date: "2026-05-23",
            title: "积分诊断",
            summary: "找到换元法薄弱点。",
            reviewMethod: "整理错因并主动回忆。",
            tasks: [
              {
                content: "完成 8 道换元积分题并标记错因",
                priority: "must",
                estimatedMinutes: 40,
              },
              {
                content: "整理 3 条换元法适用条件",
                priority: "should",
                estimatedMinutes: 20,
              },
            ],
            resources: [
              {
                title: "换元积分题型",
                type: "search_keyword",
                description: "搜索课程讲义和例题讲解。",
                searchKeywords: "高等数学 换元积分 例题",
              },
            ],
          },
        ],
      })
    );

    expect(plan.title).toBe("高数两天计划");
  });

  it("throws Chinese errors for invalid AI JSON", async () => {
    await expect(generatePlan(input, async () => "not json")).rejects.toThrow(
      "AI 没有返回有效 JSON"
    );
  });
});
