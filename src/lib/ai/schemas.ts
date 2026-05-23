import { z } from "zod";

export const PUBLIC_BETA_MAX_PLAN_DAYS = 30;
export const DEFAULT_REVIEW_METHOD = "完成后用 5 分钟回顾今日重点。";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须是 YYYY-MM-DD");

export const generatePlanRequestSchema = z.object({
  title: z.string().trim().min(1, "请填写计划标题。"),
  goal: z.string().trim().min(1, "请填写学习目标。"),
  currentLevel: z.string().trim().optional().nullable(),
  deadline: dateStringSchema,
  dailyMinutes: z.number().int().min(15, "每天学习时间不能少于 15 分钟。").max(600, "每天学习时间不能超过 600 分钟。"),
  restDaysPerWeek: z.number().int().min(0, "每周休息天数不能小于 0。").max(6, "每周休息天数不能超过 6。"),
  preference: z.string().trim().optional().nullable(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function emptyStringToUndefined(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim().length === 0)
  ) {
    return undefined;
  }

  return value;
}

function normalizePriority(value: unknown) {
  if (typeof value !== "string") {
    return value;
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

  return priorityMap[normalized] ?? value;
}

const taskSchema = z.preprocess((value) => {
  if (!isRecord(value)) {
    return value;
  }

  return {
    ...value,
    priority: normalizePriority(value.priority),
    estimatedMinutes: value.estimatedMinutes ?? value.estimated_minutes,
  };
}, z.object({
  content: z.string().trim().min(4),
  priority: z.enum(["must", "should", "optional"]),
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
}));

const resourceSchema = z.preprocess((value) => {
  if (!isRecord(value)) {
    return value;
  }

  return {
    ...value,
    searchKeywords: value.searchKeywords ?? value.search_keywords,
  };
}, z.object({
  title: z.string().trim().min(1),
  type: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  searchKeywords: z.string().trim().nullable().optional(),
}));

const daySchema = z.preprocess((value) => {
  if (!isRecord(value)) {
    return value;
  }

  return {
    ...value,
    reviewMethod: value.reviewMethod ?? value.review_method,
    resources: value.resources ?? [],
  };
}, z.object({
  dayIndex: z.coerce.number().int().min(1).max(PUBLIC_BETA_MAX_PLAN_DAYS),
  date: dateStringSchema,
  title: z.string().trim().min(1),
  summary: z.string().trim().nullable().optional(),
  reviewMethod: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).default(DEFAULT_REVIEW_METHOD)
  ),
  tasks: z.array(taskSchema).min(2).max(4),
  resources: z.array(resourceSchema).min(0).max(3).default([]),
}));

export const generatedPlanSchema = z.object({
  title: z.string().trim().min(1),
  overview: z.string().trim().min(1),
  days: z.array(daySchema).min(1).max(PUBLIC_BETA_MAX_PLAN_DAYS),
});

export const weeklySummaryRequestSchema = z.object({
  planId: z.string().uuid("计划 ID 不正确。"),
  weekIndex: z.number().int().min(1, "周次必须大于 0。"),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
});

export const generatedWeeklySummarySchema = z.object({
  summary: z.string().trim().min(1),
  strengths: z.string().trim().min(1),
  weaknesses: z.string().trim().min(1),
  nextWeekAdvice: z.string().trim().min(1),
});

export type GeneratePlanRequest = z.infer<typeof generatePlanRequestSchema>;
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
export type WeeklySummaryRequest = z.infer<typeof weeklySummaryRequestSchema>;
export type GeneratedWeeklySummary = z.infer<typeof generatedWeeklySummarySchema>;

export type GeneratePlanRequestWithDates = GeneratePlanRequest & {
  startDate: string;
  maxDays: number;
};

export function getDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function calculatePlanDays(deadline: string, currentDate = new Date()) {
  const startDate = getDateOnly(currentDate);
  const deadlineDate = parseDateOnly(deadline);
  const diffDays = Math.floor(
    (deadlineDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  return Math.min(Math.max(diffDays + 1, 0), PUBLIC_BETA_MAX_PLAN_DAYS);
}

export function validateGeneratePlanRequest(
  input: unknown,
  currentDate = new Date()
):
  | { success: true; data: GeneratePlanRequestWithDates }
  | { success: false; error: string } {
  const parsed = generatePlanRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "学习计划参数不正确。",
    };
  }

  const today = getDateOnly(currentDate);
  const deadlineDate = parseDateOnly(parsed.data.deadline);

  if (Number.isNaN(deadlineDate.getTime())) {
    return { success: false, error: "截止日期格式不正确。" };
  }

  if (deadlineDate <= today) {
    return { success: false, error: "截止日期必须是未来日期。" };
  }

  const maxDays = calculatePlanDays(parsed.data.deadline, currentDate);

  if (maxDays < 1) {
    return { success: false, error: "计划天数至少需要 1 天。" };
  }

  return {
    success: true,
    data: {
      ...parsed.data,
      startDate: formatDateOnly(today),
      maxDays,
    },
  };
}

export function validateWeeklySummaryRequest(
  input: unknown
): { success: true; data: WeeklySummaryRequest } | { success: false; error: string } {
  const parsed = weeklySummaryRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "周总结参数不正确。",
    };
  }

  const startDate = parseDateOnly(parsed.data.startDate);
  const endDate = parseDateOnly(parsed.data.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { success: false, error: "周总结日期格式不正确。" };
  }

  if (endDate < startDate) {
    return { success: false, error: "结束日期不能早于开始日期。" };
  }

  const rangeDays =
    Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  if (rangeDays > 7) {
    return { success: false, error: "每周总结最多只能覆盖 7 天。" };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function validateGeneratedPlan(
  plan: GeneratedPlan,
  options: {
    startDate: string;
    deadline: string;
    dailyMinutes: number;
    maxDays: number;
  }
): { ok: true } | { ok: false; error: string } {
  if (plan.days.length > options.maxDays) {
    return { ok: false, error: `AI 返回了 ${plan.days.length} 天，超过允许的 ${options.maxDays} 天。` };
  }

  const startDate = parseDateOnly(options.startDate);
  const deadlineDate = parseDateOnly(options.deadline);

  for (const day of plan.days) {
    const expectedDate = formatDateOnly(addDays(startDate, day.dayIndex - 1));
    const totalMinutes = day.tasks.reduce(
      (sum, task) => sum + task.estimatedMinutes,
      0
    );

    if (day.dayIndex > options.maxDays) {
      return { ok: false, error: `AI 返回的第 ${day.dayIndex} 天超过计划天数。` };
    }

    if (day.date !== expectedDate) {
      return {
        ok: false,
        error: `AI 返回的第 ${day.dayIndex} 天日期不正确，应为 ${expectedDate}。`,
      };
    }

    if (parseDateOnly(day.date) > deadlineDate) {
      return {
        ok: false,
        error: `AI 返回的第 ${day.dayIndex} 天超过截止日期。`,
      };
    }

    if (totalMinutes > options.dailyMinutes) {
      return {
        ok: false,
        error: `AI 返回的第 ${day.dayIndex} 天任务总时长超过每天可学习时间。`,
      };
    }

    if (day.dayIndex % 7 === 0) {
      const hasReviewTask = day.tasks.some((task) => task.content.includes("复盘"));
      const hasReviewMethod = day.reviewMethod?.includes("复盘") ?? false;

      if (!hasReviewTask && !hasReviewMethod) {
        return {
          ok: false,
          error: `AI 返回的第 ${day.dayIndex} 天缺少复盘安排。`,
        };
      }
    }

  }

  return { ok: true };
}
