import { describe, expect, it } from "vitest";
import {
  calculatePlanDays,
  generatedPlanSchema,
  validateGeneratePlanRequest,
  validateGeneratedPlan,
} from "./schemas";

describe("generate plan request validation", () => {
  it("accepts a valid request and calculates capped plan days", () => {
    const currentDate = new Date(2026, 4, 23);
    const result = validateGeneratePlanRequest(
      {
        title: "高数期末冲刺",
        goal: "复习积分和导数应用",
        currentLevel: "基础薄弱",
        deadline: "2026-06-30",
        dailyMinutes: 90,
        restDaysPerWeek: 1,
        preference: "多做题",
      },
      currentDate
    );

    expect(result.success).toBe(true);
    expect(calculatePlanDays("2026-06-30", currentDate)).toBe(30);
  });

  it("rejects invalid request fields with Chinese messages", () => {
    const currentDate = new Date(2026, 4, 23);

    expect(
      validateGeneratePlanRequest(
        {
          title: "",
          goal: "",
          deadline: "2026-05-22",
          dailyMinutes: 10,
          restDaysPerWeek: 7,
        },
        currentDate
      ).success
    ).toBe(false);
  });

  it("caps generated days at 30 for public beta", () => {
    expect(calculatePlanDays("2026-12-31", new Date(2026, 4, 23))).toBe(30);
  });
});

describe("generated plan schema", () => {
  const generatedPlan = {
    title: "高数 30 天计划",
    overview: "每天完成重点知识、练习和复盘。",
    days: [
      {
        dayIndex: 1,
        date: "2026-05-23",
        title: "极限基础诊断",
        summary: "完成极限薄弱点排查。",
        reviewMethod: "用 10 分钟主动回忆公式和典型错误。",
        tasks: [
          {
            content: "完成 8 道极限计算题并标记错因",
            priority: "must",
            estimatedMinutes: 35,
          },
          {
            content: "整理 3 条等价无穷小使用条件",
            priority: "should",
            estimatedMinutes: 20,
          },
        ],
        resources: [
          {
            title: "极限等价无穷小讲解",
            type: "search_keyword",
            description: "搜索课程讲义和例题讲解，不使用具体 URL。",
            searchKeywords: "高等数学 等价无穷小 极限 例题",
          },
        ],
      },
    ],
  };

  it("validates strict generated JSON shape", () => {
    expect(generatedPlanSchema.safeParse(generatedPlan).success).toBe(true);
  });

  it("accepts common AI field aliases and defaults missing resources", () => {
    const result = generatedPlanSchema.safeParse({
      title: "高数计划",
      overview: "每日练习。",
      days: [
        {
          dayIndex: "1",
          date: "2026-05-23",
          title: "积分诊断",
          summary: "找到薄弱点。",
          review_method: null,
          tasks: [
            {
              content: "完成 8 道换元积分题并标记错因",
              priority: "high",
              estimated_minutes: "35",
            },
            {
              content: "整理 3 条换元法适用条件",
              priority: "medium",
              estimatedMinutes: 20,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.days[0].resources).toEqual([]);
      expect(result.data.days[0].reviewMethod).toBe("完成后用 5 分钟回顾今日重点。");
      expect(result.data.days[0].tasks[0].priority).toBe("must");
      expect(result.data.days[0].tasks[0].estimatedMinutes).toBe(35);
    }
  });

  it("accepts search keyword aliases in resources", () => {
    const result = generatedPlanSchema.safeParse({
      ...generatedPlan,
      days: [
        {
          ...generatedPlan.days[0],
          resources: [
            {
              title: "积分例题",
              type: "search_keyword",
              description: "搜索例题讲解。",
              search_keywords: "高等数学 积分 例题",
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.days[0].resources[0].searchKeywords).toBe("高等数学 积分 例题");
    }
  });

  it("rejects invalid priorities and too few tasks", () => {
    const invalid = {
      ...generatedPlan,
      days: [
        {
          ...generatedPlan.days[0],
          tasks: [
            {
              content: "认真学习",
              priority: "urgent",
              estimatedMinutes: 30,
            },
          ],
        },
      ],
    };

    expect(generatedPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects more than four tasks per day", () => {
    const invalid = {
      ...generatedPlan,
      days: [
        {
          ...generatedPlan.days[0],
          tasks: [
            ...generatedPlan.days[0].tasks,
            {
              content: "完成 4 道导数应用题并标记错因",
              priority: "should",
              estimatedMinutes: 10,
            },
            {
              content: "整理 2 个常见解题模板",
              priority: "optional",
              estimatedMinutes: 10,
            },
            {
              content: "复述今天的关键公式",
              priority: "optional",
              estimatedMinutes: 5,
            },
          ],
        },
      ],
    };

    expect(generatedPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects task totals that exceed daily minutes", () => {
    const result = validateGeneratedPlan(
      generatedPlanSchema.parse({
        ...generatedPlan,
        days: [
          {
            ...generatedPlan.days[0],
            tasks: [
              ...generatedPlan.days[0].tasks,
              {
                content: "完成 20 道综合题并复盘",
                priority: "optional",
                estimatedMinutes: 80,
              },
            ],
          },
        ],
      }),
      {
        startDate: "2026-05-23",
        deadline: "2026-05-25",
        dailyMinutes: 90,
        maxDays: 3,
      }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("超过每天可学习时间");
  });

  it("does not reject resources on non-resource days after normalization", () => {
    const result = validateGeneratedPlan(
      generatedPlanSchema.parse({
        ...generatedPlan,
        days: [
          {
            ...generatedPlan.days[0],
            dayIndex: 15,
            date: "2026-06-06",
            resources: [
              {
                title: "额外资料",
                type: "search_keyword",
                description: "即使出现也不应让计划失败。",
                searchKeywords: "高等数学 复习",
              },
            ],
          },
        ],
      }),
      {
        startDate: "2026-05-23",
        deadline: "2026-06-30",
        dailyMinutes: 90,
        maxDays: 30,
      }
    );

    expect(result.ok).toBe(true);
  });
});
