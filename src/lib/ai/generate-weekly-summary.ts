import { callAIJson } from "./client";
import { parseAIJson } from "./generate-plan";
import {
  GeneratedWeeklySummary,
  generatedWeeklySummarySchema,
} from "./schemas";

type InvokeAI = typeof callAIJson;

export type WeeklySummaryAIInput = {
  planTitle: string;
  weekIndex: number;
  startDate: string;
  endDate: string;
  completionRate: number;
  tasks: Array<{
    date: string;
    title: string;
    content: string;
    isCompleted: boolean;
    estimatedMinutes: number | null;
  }>;
  reflections: Array<{
    date: string;
    mood: string | null;
    difficulty: string | null;
    note: string | null;
  }>;
  mistakes: Array<{
    date: string;
    question: string | null;
    mistakeReason: string | null;
    correctMethod: string | null;
    nextAction: string | null;
  }>;
};

export async function generateWeeklySummary(
  input: WeeklySummaryAIInput,
  invokeAI: InvokeAI = callAIJson
): Promise<GeneratedWeeklySummary> {
  const rawContent = await invokeAI(buildGenerateWeeklySummaryMessages(input));
  const parsedJson = parseAIJson(rawContent);
  const parsedSummary = generatedWeeklySummarySchema.safeParse(parsedJson);

  if (!parsedSummary.success) {
    throw new Error("AI 返回的周总结格式不正确，请重试。");
  }

  return parsedSummary.data;
}

export function buildGenerateWeeklySummaryMessages(input: WeeklySummaryAIInput) {
  return [
    {
      role: "system" as const,
      content:
        "你是 StudyPilot 的中文学习教练。你必须只输出严格 JSON，不要输出 Markdown、解释文字或代码块。",
    },
    {
      role: "user" as const,
      content: [
        "请基于以下真实学习数据，生成一份中文每周学习总结。",
        `学习计划：${input.planTitle}`,
        `周次：第 ${input.weekIndex} 周`,
        `日期范围：${input.startDate} 到 ${input.endDate}`,
        `本周任务完成率：${input.completionRate}%`,
        "",
        "任务完成情况：",
        JSON.stringify(input.tasks),
        "",
        "每日复盘：",
        JSON.stringify(input.reflections),
        "",
        "错题记录：",
        JSON.stringify(input.mistakes),
        "",
        "要求：",
        "1. 输出必须是严格 JSON，不要输出 Markdown。",
        "2. 内容必须是中文，具体、温和、可执行。",
        "3. strengths 要总结做得好的学习行为。",
        "4. weaknesses 要指出 1 到 3 个需要改进的问题。",
        "5. nextWeekAdvice 要给出下周可执行建议，不要泛泛而谈。",
        "6. 不要编造不存在的数据。",
        "",
        "JSON 结构必须完全符合：",
        JSON.stringify({
          summary: "本周学习总结",
          strengths: "做得好的地方",
          weaknesses: "需要改进的问题",
          nextWeekAdvice: "下周建议",
        }),
      ].join("\n"),
    },
  ];
}
