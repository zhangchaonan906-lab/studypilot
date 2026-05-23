import { callAIJson } from "./client";
import {
  DEFAULT_REVIEW_METHOD,
  GeneratedPlan,
  GeneratePlanRequestWithDates,
  addDays,
  formatDateOnly,
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

class AIPlanSchemaError extends Error {
  constructor(public issues: string[]) {
    super(AI_PLAN_SCHEMA_ERROR_MESSAGE);
    this.name = "AIPlanSchemaError";
  }
}

export async function generatePlan(
  input: GeneratePlanRequestWithDates,
  invokeAI: InvokeAI = callAIJson
): Promise<GeneratedPlan> {
  const rawContent = await invokeAI(buildGeneratePlanMessages(input), { maxTokens: 6500 });
  let retryOptions: GeneratePlanPromptOptions | null = null;

  try {
    return parseAndValidateGeneratedPlan(rawContent, input);
  } catch (error) {
    if (error instanceof AIJsonParseError) {
      logAIPlanParseFailure(rawContent, 1);
      retryOptions = { retryForInvalidJson: true };
    } else if (error instanceof AIPlanSchemaError) {
      logAIPlanSchemaFailure(error.issues, rawContent, 1);
      retryOptions = { schemaIssues: error.issues };
    } else {
      throw error;
    }
  }

  const retryContent = await invokeAI(buildGeneratePlanMessages(input, retryOptions), {
    maxTokens: 6500,
  });

  try {
    return parseAndValidateGeneratedPlan(retryContent, input);
  } catch (error) {
    if (error instanceof AIJsonParseError) {
      logAIPlanParseFailure(retryContent, 2);
      throw new Error(AI_JSON_PARSE_ERROR_MESSAGE);
    }

    if (error instanceof AIPlanSchemaError) {
      logAIPlanSchemaFailure(error.issues, retryContent, 2);
      throw new Error(AI_PLAN_SCHEMA_ERROR_MESSAGE);
    }

    throw error;
  }
}

function parseAndValidateGeneratedPlan(
  rawContent: string,
  input: GeneratePlanRequestWithDates
) {
  const parsedJson = parseAIJson(rawContent);
  const normalizedJson = normalizeAIPlanResult(parsedJson, input);
  const parsedPlan = generatedPlanSchema.safeParse(normalizedJson);

  if (!parsedPlan.success) {
    throw new AIPlanSchemaError(
      parsedPlan.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    );
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

type GeneratePlanPromptOptions = {
  retryForInvalidJson?: boolean;
  schemaIssues?: string[];
} | null;

export function buildGeneratePlanMessages(
  input: GeneratePlanRequestWithDates,
  options: GeneratePlanPromptOptions = {}
) {
  const preference = input.preference || "无特殊偏好";
  const currentLevel = input.currentLevel || "未填写";
  const retryInstruction = options?.retryForInvalidJson
    ? "上一次输出不是合法 JSON，请只返回严格 JSON，不要 Markdown，不要解释文字。"
    : options?.schemaIssues
      ? [
          "上一次 JSON 结构没有通过校验，请修复 JSON 结构后重新输出。",
          "校验失败原因：",
          ...options.schemaIssues.slice(0, 8).map((issue) => `- ${issue}`),
        ].join("\n")
      : "";

  return [
    {
      role: "system" as const,
      content:
        "你是 StudyPilot 的中文学习计划生成器。你必须只输出严格 JSON。只输出 JSON，不要 Markdown，不要 ```json 代码块，不要解释文字，不要前缀或后缀。输出要简洁，不要长篇解释。",
    },
    {
      role: "user" as const,
      content: [
        retryInstruction,
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
        "8. 资料推荐不要编造具体 URL，只提供 type、description 和 searchKeywords；只有第 1 天以及之后每 3 天生成 resources，也就是 dayIndex 为 1、4、7、10、13、16... 时可以填写 resources，其他日期 resources 返回空数组 []。",
        "9. 任务必须具体可执行，不要生成“自己制定计划”“认真学习”“好好复习”这种空泛任务。",
        "10. summary、reviewMethod、resource description 都要简短；reviewMethod 控制在一句话以内。",
        "11. 每个 day 都必须包含 resources 字段；如果当天没有资料建议，resources 返回空数组 []。",
        "12. 每个 day 都必须包含 tasks 数组；每个 task 必须包含 content、priority、estimatedMinutes。",
        "13. 每个 day 必须包含 reviewMethod。",
        "14. 每个 day 都必须包含 dayIndex、date、title、summary、reviewMethod、tasks、resources。",
        "15. 如果 resources 偶尔出现在非资源日，后端会自动忽略；你仍应尽量在非资源日返回 []。",
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

export function normalizeAIPlanResult(
  value: unknown,
  input: GeneratePlanRequestWithDates
) {
  if (!isRecord(value)) {
    return value;
  }

  const rawDays = Array.isArray(value.days) ? value.days : [];

  return {
    ...value,
    title: getNonEmptyString(value.title) ?? input.title,
    overview:
      getNonEmptyString(value.overview) ?? `围绕“${input.goal}”安排每日任务、练习和复盘。`,
    days: rawDays.map((rawDay, index) => normalizeAIPlanDay(rawDay, index, input)),
  };
}

function normalizeAIPlanDay(
  rawDay: unknown,
  index: number,
  input: GeneratePlanRequestWithDates
) {
  const day = isRecord(rawDay) ? rawDay : {};
  const dayIndex = toPositiveInteger(day.dayIndex ?? day.day_index) ?? index + 1;
  const rawTasks = Array.isArray(day.tasks) ? day.tasks : [];
  const normalizedTasks = rawTasks.map((task) =>
    normalizeAIPlanTask(task, input.dailyMinutes, Math.max(rawTasks.length, 2))
  );

  return {
    ...day,
    dayIndex,
    date: normalizeDateString(day.date, input.startDate, dayIndex),
    title: getNonEmptyString(day.title) ?? `第 ${dayIndex} 天学习安排`,
    summary: getNonEmptyString(day.summary) ?? "完成今天的学习重点。",
    reviewMethod:
      getNonEmptyString(day.reviewMethod ?? day.review_method) ?? DEFAULT_REVIEW_METHOD,
    tasks: normalizedTasks,
    resources:
      dayIndex % 3 === 1
        ? normalizeAIPlanResources(Array.isArray(day.resources) ? day.resources : [])
        : [],
  };
}

function normalizeAIPlanTask(
  rawTask: unknown,
  dailyMinutes: number,
  taskCount: number
) {
  const task = isRecord(rawTask) ? rawTask : {};
  const estimatedMinutes =
    toPositiveInteger(task.estimatedMinutes ?? task.estimated_minutes) ??
    Math.max(1, Math.floor(dailyMinutes / taskCount));

  return {
    ...task,
    content: getNonEmptyString(task.content) ?? "完成今日学习任务并记录重点",
    priority: normalizePriority(task.priority) ?? "should",
    estimatedMinutes,
  };
}

function normalizeAIPlanResources(rawResources: unknown[]) {
  return rawResources.map((rawResource) => {
    const resource = isRecord(rawResource) ? rawResource : {};
    const searchKeywords = getNonEmptyString(
      resource.searchKeywords ?? resource.search_keywords
    );

    return {
      ...resource,
      title:
        getNonEmptyString(resource.title) ??
        searchKeywords ??
        "学习资料建议",
      type: getNonEmptyString(resource.type) ?? "search_keyword",
      description: getNonEmptyString(resource.description) ?? null,
      searchKeywords: searchKeywords ?? null,
    };
  });
}

function normalizePriority(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const priorityMap: Record<string, "must" | "should" | "optional"> = {
    high: "must",
    important: "must",
    must: "must",
    "必做": "must",
    "重要": "must",
    "必须": "must",
    "核心": "must",
    medium: "should",
    normal: "should",
    should: "should",
    "建议": "should",
    "推荐": "should",
    "普通": "should",
    low: "optional",
    optional: "optional",
    "可选": "optional",
    "补充": "optional",
  };

  return priorityMap[normalized] ?? "should";
}

function normalizeDateString(value: unknown, startDate: string, dayIndex: number) {
  const fallbackDate = formatDateOnly(addDays(parseDateOnlySafe(startDate), dayIndex - 1));

  if (typeof value !== "string") {
    return fallbackDate;
  }

  const normalized = value.trim().replace(/\//g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (!match) {
    return fallbackDate;
  }

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseDateOnlySafe(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toPositiveInteger(value: unknown) {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function logAIPlanSchemaFailure(issues: string[], rawContent: string, attempt: number) {
  console.warn(`[StudyPilot] AI plan zod validation failed on attempt ${attempt}. Issues:`, issues);
  console.warn(
    `[StudyPilot] AI plan zod validation raw prefix on attempt ${attempt}:`,
    rawContent.slice(0, 500)
  );
}
