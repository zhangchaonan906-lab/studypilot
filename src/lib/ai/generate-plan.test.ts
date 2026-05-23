import { describe, expect, it } from "vitest";
import {
  buildGeneratePlanMessages,
  generatePlan,
  normalizeAIPlanResult,
  parseAIJson,
} from "./generate-plan";

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

function buildValidPlan() {
  return {
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
  };
}

describe("generatePlan", () => {
  it("builds a prompt that requires strict Chinese JSON", () => {
    const messages = buildGeneratePlanMessages(input);
    const prompt = messages.map((message) => message.content).join("\n");

    expect(prompt).toContain("严格 JSON");
    expect(prompt).toContain("只输出 JSON");
    expect(prompt).toContain("不要 ```json 代码块");
    expect(prompt).toContain("不要解释文字");
    expect(prompt).toContain("不要前缀或后缀");
    expect(prompt).toContain("内容必须是中文");
    expect(prompt).toContain("每 7 天安排一次复盘任务");
    expect(prompt).toContain("不要编造具体 URL");
    expect(prompt).toContain("每天任务数量 2 到 4 个");
    expect(prompt).toContain("第 1 天以及之后每 3 天生成 resources");
    expect(prompt).toContain("dayIndex 为 1、4、7、10、13、16");
    expect(prompt).toContain("每个 day 都必须包含 resources 字段");
    expect(prompt).toContain("resources 返回空数组 []");
    expect(prompt).toContain("后端会自动忽略");
    expect(prompt).toContain("每个 day 都必须包含 dayIndex、date、title、summary、reviewMethod、tasks、resources");
    expect(prompt).toContain("每个 day 都必须包含 tasks 数组");
    expect(prompt).toContain("每个 task 必须包含 content、priority、estimatedMinutes");
    expect(prompt).toContain("每个 day 必须包含 reviewMethod");
    expect(prompt).toContain("reviewMethod 控制在一句话以内");
    expect(prompt).toContain("不要生成“自己制定计划”");
    expect(prompt).toContain("输出要简洁");
  });

  it("parses fenced or noisy JSON without accepting invalid shapes", () => {
    expect(parseAIJson('```json\n{"title":"计划","overview":"总览","days":[]}\n```')).toEqual({
      title: "计划",
      overview: "总览",
      days: [],
    });
  });

  it("extracts the first complete JSON object from surrounding text", () => {
    expect(
      parseAIJson(
        '前置说明 {这不是合法 JSON}\n{"title":"计划","overview":"总览","days":[]}\n后置说明 {"extra":true}'
      )
    ).toEqual({
      title: "计划",
      overview: "总览",
      days: [],
    });
  });

  it("validates AI output before returning", async () => {
    const plan = await generatePlan(input, async () => JSON.stringify(buildValidPlan()));

    expect(plan.title).toBe("高数两天计划");
  });

  it("normalizes common AI field variants before schema validation", async () => {
    const plan = await generatePlan(input, async () =>
      JSON.stringify({
        title: "高数两天计划",
        overview: "先诊断，再练习。",
        days: [
          {
            dayIndex: "1",
            date: "2026/05/23",
            title: "",
            tasks: [
              {
                content: "完成 8 道换元积分题并标记错因",
                priority: "重要",
                estimated_minutes: "40",
              },
              {
                content: "整理 3 条换元法适用条件",
                priority: "建议",
              },
            ],
            resources: [
              {
                title: "换元积分题型",
                type: "search_keyword",
                description: "搜索课程讲义和例题讲解。",
                search_keywords: "高等数学 换元积分 例题",
              },
            ],
          },
          {
            dayIndex: 2,
            date: "2026-05-24",
            summary: "",
            review_method: "",
            tasks: [
              {
                content: "完成 6 道导数应用题并写出步骤",
                priority: "low",
                estimatedMinutes: "30",
              },
              {
                content: "整理 2 个常见建模模板",
                priority: "临时",
                estimatedMinutes: 20,
              },
            ],
          },
        ],
      })
    );

    expect(plan.days[0].date).toBe("2026-05-23");
    expect(plan.days[0].title).toBe("第 1 天学习安排");
    expect(plan.days[0].reviewMethod).toBe("完成后用 5 分钟回顾今日重点。");
    expect(plan.days[0].tasks[0].priority).toBe("must");
    expect(plan.days[0].tasks[0].estimatedMinutes).toBe(40);
    expect(plan.days[0].tasks[1].priority).toBe("should");
    expect(plan.days[0].tasks[1].estimatedMinutes).toBe(45);
    expect(plan.days[0].resources[0].searchKeywords).toBe("高等数学 换元积分 例题");
    expect(plan.days[1].resources).toEqual([]);
    expect(plan.days[1].tasks[0].priority).toBe("optional");
    expect(plan.days[1].tasks[1].priority).toBe("should");
  });

  it("normalizes standalone AI plan JSON into the generated plan shape", () => {
    const normalized = normalizeAIPlanResult(
      {
        title: "高数计划",
        overview: "每日练习。",
        days: [
          {
            dayIndex: "1",
            date: "2026/05/23",
            review_method: "做完后复述错题。",
            tasks: [
              {
                content: "完成 5 道基础题并订正",
                priority: "必做",
                estimated_minutes: "30",
              },
              {
                content: "整理一页公式卡片",
                priority: "临时",
              },
            ],
          },
        ],
      },
      input
    );

    expect(normalized.days[0].resources).toEqual([]);
    expect(normalized.days[0].reviewMethod).toBe("做完后复述错题。");
    expect(normalized.days[0].tasks[0].priority).toBe("must");
    expect(normalized.days[0].tasks[0].estimatedMinutes).toBe(30);
    expect(normalized.days[0].tasks[1].priority).toBe("should");
    expect(normalized.days[0].tasks[1].estimatedMinutes).toBe(45);
  });

  it("keeps resources only on public beta resource days", () => {
    const days = Array.from({ length: 15 }, (_, index) => ({
      dayIndex: index + 1,
      date: `2026-06-${String(index + 1).padStart(2, "0")}`,
      title: `第 ${index + 1} 天`,
      summary: "完成学习任务。",
      reviewMethod: index + 1 === 7 || index + 1 === 14 ? "复盘今日重点。" : "回顾今日重点。",
      tasks: [
        {
          content: "完成 6 道练习题并订正",
          priority: "must",
          estimatedMinutes: 30,
        },
        {
          content: "整理今日知识点笔记",
          priority: "should",
          estimatedMinutes: 20,
        },
      ],
      resources: [
        {
          title: `第 ${index + 1} 天资料`,
          type: "search_keyword",
          description: "资料说明。",
          searchKeywords: `第 ${index + 1} 天 搜索关键词`,
        },
      ],
    }));

    const normalized = normalizeAIPlanResult(
      {
        title: "15 天计划",
        overview: "每日学习。",
        days,
      },
      {
        ...input,
        startDate: "2026-06-01",
        deadline: "2026-06-15",
        maxDays: 15,
      }
    );

    expect(normalized.days[0].resources).toHaveLength(1);
    expect(normalized.days[3].resources).toHaveLength(1);
    expect(normalized.days[6].resources).toHaveLength(1);
    expect(normalized.days[14].resources).toEqual([]);
  });

  it("generates successfully when AI returns resources on day 15", async () => {
    const days = Array.from({ length: 15 }, (_, index) => ({
      dayIndex: index + 1,
      date: `2026-06-${String(index + 1).padStart(2, "0")}`,
      title: `第 ${index + 1} 天`,
      summary: "完成学习任务。",
      reviewMethod: index + 1 === 7 || index + 1 === 14 ? "复盘今日重点。" : "回顾今日重点。",
      tasks: [
        {
          content: "完成 6 道练习题并订正",
          priority: "must",
          estimatedMinutes: 30,
        },
        {
          content: "整理今日知识点笔记",
          priority: "should",
          estimatedMinutes: 20,
        },
      ],
      resources:
        index + 1 === 15
          ? [
              {
                title: "第 15 天错误资料",
                type: "search_keyword",
                description: "这条应被清空。",
                searchKeywords: "第 15 天 搜索关键词",
              },
            ]
          : [],
    }));

    const plan = await generatePlan(
      {
        ...input,
        startDate: "2026-06-01",
        deadline: "2026-06-15",
        maxDays: 15,
      },
      async () =>
        JSON.stringify({
          title: "15 天计划",
          overview: "每日学习。",
          days,
        })
    );

    expect(plan.days[14].resources).toEqual([]);
  });

  it("retries once when the first AI response is not parseable JSON", async () => {
    const prompts: string[] = [];
    let calls = 0;

    const plan = await generatePlan(input, async (messages) => {
      calls += 1;
      prompts.push(messages.map((message) => message.content).join("\n"));
      return calls === 1 ? "这是说明文字，不是 JSON" : JSON.stringify(buildValidPlan());
    });

    expect(plan.title).toBe("高数两天计划");
    expect(calls).toBe(2);
    expect(prompts[1]).toContain(
      "上一次输出不是合法 JSON，请只返回严格 JSON，不要 Markdown，不要解释文字。"
    );
  });

  it("retries once when zod validation fails and sends the issue summary", async () => {
    const prompts: string[] = [];
    let calls = 0;

    const plan = await generatePlan(input, async (messages) => {
      calls += 1;
      prompts.push(messages.map((message) => message.content).join("\n"));
      return calls === 1
        ? JSON.stringify({ title: "缺少字段" })
        : JSON.stringify(buildValidPlan());
    });

    expect(plan.title).toBe("高数两天计划");
    expect(calls).toBe(2);
    expect(prompts[1]).toContain("上一次 JSON 结构没有通过校验");
  });

  it("throws a stable Chinese error when JSON parsing still fails after retry", async () => {
    await expect(generatePlan(input, async () => "not json")).rejects.toThrow(
      "AI 返回格式不稳定，请重试。"
    );
  });

  it("throws a stable Chinese error when zod validation fails", async () => {
    await expect(
      generatePlan(input, async () => JSON.stringify({ title: "缺少字段" }))
    ).rejects.toThrow("AI 返回的数据结构不完整，请重试。");
  });

  it("throws Chinese errors for invalid AI JSON", async () => {
    expect(() => parseAIJson("not json")).toThrow("AI 返回格式不稳定，请重试。");
  });
});
