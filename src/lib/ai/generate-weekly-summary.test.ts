import { describe, expect, it } from "vitest";
import {
  buildGenerateWeeklySummaryMessages,
  generateWeeklySummary,
} from "./generate-weekly-summary";

const weeklyInput = {
  planTitle: "高数期末冲刺",
  weekIndex: 1,
  startDate: "2026-05-18",
  endDate: "2026-05-24",
  completionRate: 75,
  tasks: [
    {
      date: "2026-05-23",
      title: "积分练习",
      content: "完成 8 道换元积分题",
      isCompleted: true,
      estimatedMinutes: 40,
    },
    {
      date: "2026-05-23",
      title: "错题复盘",
      content: "整理错题原因",
      isCompleted: false,
      estimatedMinutes: 20,
    },
  ],
  reflections: [
    {
      date: "2026-05-23",
      mood: "正常",
      difficulty: "刚好",
      note: "积分换元比昨天熟练。",
    },
  ],
  mistakes: [
    {
      date: "2026-05-23",
      question: "换元后忘记改上下限",
      mistakeReason: "步骤检查不够",
      correctMethod: "先换元再代入新边界",
      nextAction: "明天重做 3 道同类题",
    },
  ],
};

describe("generateWeeklySummary", () => {
  it("builds a strict Chinese JSON prompt from weekly learning data", () => {
    const prompt = buildGenerateWeeklySummaryMessages(weeklyInput)
      .map((message) => message.content)
      .join("\n");

    expect(prompt).toContain("严格 JSON");
    expect(prompt).toContain("本周任务完成率：75%");
    expect(prompt).toContain("不要输出 Markdown");
  });

  it("validates AI weekly summary output before returning", async () => {
    const summary = await generateWeeklySummary(weeklyInput, async () =>
      JSON.stringify({
        summary: "本周能稳定推进积分训练，但复盘还不够细。",
        strengths: "能按计划完成主要题目，并能记录错因。",
        weaknesses: "任务完成后缺少系统归纳，错题复做次数偏少。",
        nextWeekAdvice: "下周把错题复做安排进每日任务，并固定 10 分钟复盘。",
      })
    );

    expect(summary.nextWeekAdvice).toContain("错题复做");
  });

  it("throws a Chinese error when AI output misses required fields", async () => {
    await expect(
      generateWeeklySummary(weeklyInput, async () =>
        JSON.stringify({
          summary: "只有总结",
        })
      )
    ).rejects.toThrow("AI 返回的周总结格式不正确");
  });
});
