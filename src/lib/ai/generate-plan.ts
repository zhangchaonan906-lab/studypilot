import { callAIJson } from "./client";
import {
  GeneratedPlan,
  GeneratePlanRequestWithDates,
  generatedPlanSchema,
  validateGeneratedPlan,
} from "./schemas";

type InvokeAI = typeof callAIJson;

export async function generatePlan(
  input: GeneratePlanRequestWithDates,
  invokeAI: InvokeAI = callAIJson
): Promise<GeneratedPlan> {
  const rawContent = await invokeAI(buildGeneratePlanMessages(input));
  const parsedJson = parseAIJson(rawContent);
  const parsedPlan = generatedPlanSchema.safeParse(parsedJson);

  if (!parsedPlan.success) {
    throw new Error("AI 返回内容格式不正确，请重试。");
  }

  const validation = validateGeneratedPlan(parsedPlan.data, {
    startDate: input.startDate,
    deadline: input.deadline,
    dailyMinutes: input.dailyMinutes,
    maxDays: input.maxDays,
  });

  if (!validation.ok) {
    throw new Error(validation.error);
  }

  return parsedPlan.data;
}

export function buildGeneratePlanMessages(input: GeneratePlanRequestWithDates) {
  const preference = input.preference || "无特殊偏好";
  const currentLevel = input.currentLevel || "未填写";

  return [
    {
      role: "system" as const,
      content:
        "你是 StudyPilot 的中文学习计划生成器。你必须只输出严格 JSON，不要输出 Markdown、解释文字或代码块。",
    },
    {
      role: "user" as const,
      content: [
        "请根据以下信息生成中文学习计划。",
        `计划标题：${input.title}`,
        `学习目标：${input.goal}`,
        `当前水平：${currentLevel}`,
        `开始日期：${input.startDate}`,
        `截止日期：${input.deadline}`,
        `最多生成天数：${input.maxDays}`,
        `每天可学习时间：${input.dailyMinutes} 分钟`,
        `每周休息天数：${input.restDaysPerWeek}`,
        `学习偏好：${preference}`,
        "",
        "硬性要求：",
        "1. 输出必须是严格 JSON，不要 Markdown。",
        "2. 内容必须是中文。",
        "3. days 从 dayIndex=1 开始，日期从开始日期逐日递增，不超过截止日期。",
        "4. 每天任务数量 2 到 5 个。",
        "5. 每天任务 estimatedMinutes 总和不能超过每天可学习时间。",
        "6. priority 只能是 must、should、optional。",
        "7. 每 7 天安排一次复盘任务，任务内容或 reviewMethod 必须包含“复盘”。",
        "8. 资料推荐不要编造具体 URL，只提供 type、description 和 searchKeywords。",
        "9. 任务必须具体可执行，不要写“认真学习”“好好复习”。",
        "",
        "JSON 结构必须完全符合：",
        JSON.stringify({
          title: "计划标题",
          overview: "计划总览",
          days: [
            {
              dayIndex: 1,
              date: "YYYY-MM-DD",
              title: "当天标题",
              summary: "当天目标",
              reviewMethod: "复习方法",
              tasks: [
                {
                  content: "具体任务",
                  priority: "must",
                  estimatedMinutes: 30,
                },
              ],
              resources: [
                {
                  title: "资料名称",
                  type: "search_keyword",
                  description: "资料说明",
                  searchKeywords: "搜索关键词",
                },
              ],
            },
          ],
        }),
      ].join("\n"),
    },
  ];
}

export function parseAIJson(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("AI 没有返回有效 JSON，请重试。");
    }

    try {
      return JSON.parse(content.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new Error("AI 返回的 JSON 无法解析，请重试。");
    }
  }
}
