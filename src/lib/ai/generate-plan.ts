import { callAIJson } from "./client";
import {
  GeneratedPlan,
  GeneratePlanRequestWithDates,
  generatedPlanSchema,
  validateGeneratedPlan,
} from "./schemas";

type InvokeAI = typeof callAIJson;

const AI_JSON_PARSE_ERROR_MESSAGE = "AI 返回格式不稳定，请重试。";
const AI_PLAN_SCHEMA_ERROR_MESSAGE = "AI 返回的数据结构不完整，请重试。";

class AIJsonParseError extends Error {
  constructor() {
    super(AI_JSON_PARSE_ERROR_MESSAGE);
    this.name = "AIJsonParseError";
  }
}

export async function generatePlan(
  input: GeneratePlanRequestWithDates,
  invokeAI: InvokeAI = callAIJson
): Promise<GeneratedPlan> {
  const rawContent = await invokeAI(buildGeneratePlanMessages(input), { maxTokens: 6500 });

  try {
    return parseAndValidateGeneratedPlan(rawContent, input);
  } catch (error) {
    if (!(error instanceof AIJsonParseError)) {
      throw error;
    }

    logAIPlanParseFailure(rawContent, 1);
  }

  const retryContent = await invokeAI(buildGeneratePlanMessages(input, { retryForInvalidJson: true }), {
    maxTokens: 6500,
  });

  try {
    return parseAndValidateGeneratedPlan(retryContent, input);
  } catch (error) {
    if (error instanceof AIJsonParseError) {
      logAIPlanParseFailure(retryContent, 2);
      throw new Error(AI_JSON_PARSE_ERROR_MESSAGE);
    }

    throw error;
  }
}

function parseAndValidateGeneratedPlan(
  rawContent: string,
  input: GeneratePlanRequestWithDates
) {
  const parsedJson = parseAIJson(rawContent);
  const parsedPlan = generatedPlanSchema.safeParse(parsedJson);

  if (!parsedPlan.success) {
    throw new Error(AI_PLAN_SCHEMA_ERROR_MESSAGE);
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

export function buildGeneratePlanMessages(
  input: GeneratePlanRequestWithDates,
  options: { retryForInvalidJson?: boolean } = {}
) {
  const preference = input.preference || "无特殊偏好";
  const currentLevel = input.currentLevel || "未填写";

  return [
    {
      role: "system" as const,
      content:
        "你是 StudyPilot 的中文学习计划生成器。你必须只输出严格 JSON。只输出 JSON，不要 Markdown，不要 ```json 代码块，不要解释文字，不要前缀或后缀。输出要简洁，不要长篇解释。",
    },
    {
      role: "user" as const,
      content: [
        options.retryForInvalidJson
          ? "上一次输出不是合法 JSON，请只返回合法 JSON，不要包含任何说明文字。"
          : "",
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
        "1. 只输出严格 JSON，不要 Markdown，不要 ```json 代码块，不要解释文字，不要前缀或后缀。",
        "2. 内容必须是中文。",
        "3. 公测版当前最多生成 30 天计划；days 从 dayIndex=1 开始，日期从开始日期逐日递增，不超过截止日期。",
        "4. 每天任务数量 2 到 4 个。",
        "5. 每天任务 estimatedMinutes 总和不能超过每天可学习时间。",
        "6. priority 只能是 must、should、optional。",
        "7. 每 7 天安排一次复盘任务，任务内容或 reviewMethod 必须包含“复盘”。",
        "8. 资料推荐不要编造具体 URL，只提供 type、description 和 searchKeywords；每 3 天生成一次 resources，只在 dayIndex 为 1、4、7、10... 的天数填写，其他天 resources 为空数组。",
        "9. 任务必须具体可执行，不要写“认真学习”“好好复习”。",
        "10. summary、reviewMethod、resource description 都要简短；reviewMethod 控制在一句话以内。",
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
    // Continue with tolerant extraction below.
  }

  const strippedContent = stripJsonCodeFences(content);

  if (strippedContent !== content) {
    try {
      return JSON.parse(strippedContent);
    } catch {
      // Continue with balanced object extraction below.
    }
  }

  for (const candidate of extractBalancedJsonObjects(strippedContent)) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next complete object, because models may include invalid
      // examples or prose before the real JSON payload.
    }
  }

  throw new AIJsonParseError();
}

function stripJsonCodeFences(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractBalancedJsonObjects(content: string) {
  const candidates: string[] = [];

  for (let start = 0; start < content.length; start += 1) {
    if (content[start] !== "{") {
      continue;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let index = start; index < content.length; index += 1) {
      const char = content[index];

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
        } else if (char === "\\") {
          isEscaped = true;
        } else if (char === "\"") {
          inString = false;
        }

        continue;
      }

      if (char === "\"") {
        inString = true;
      } else if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;

        if (depth === 0) {
          candidates.push(content.slice(start, index + 1));
          break;
        }
      }
    }
  }

  return candidates;
}

function logAIPlanParseFailure(rawContent: string, attempt: number) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.warn(
    `[StudyPilot] AI plan JSON parse failed on attempt ${attempt}. Raw prefix:`,
    rawContent.slice(0, 500)
  );
}
