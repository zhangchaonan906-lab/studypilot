import type { DailyReflectionUpsert, MistakeReviewInsert, PlanInsert } from "./types";

type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

const allowedMoods = ["轻松", "正常", "疲惫"];
const allowedDifficulties = ["太简单", "刚好", "太难"];

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullableTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length > 0 ? value : null;
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTaskCompletionPatch(isCompleted: boolean, now = new Date()) {
  return {
    is_completed: isCompleted,
    completed_at: isCompleted ? now.toISOString() : null,
  };
}

export function parseCreatePlanFormData(formData: FormData): ParseResult<PlanInsert> {
  const title = textValue(formData, "title");
  const goal = textValue(formData, "goal");
  const deadline = textValue(formData, "deadline");
  const dailyMinutes = parsePositiveInteger(textValue(formData, "daily_minutes"));
  const restDaysPerWeek = parsePositiveInteger(textValue(formData, "rest_days_per_week") || "1");

  if (!title || !goal) {
    return { ok: false, error: "请填写计划标题和学习目标。" };
  }

  if (!deadline) {
    return { ok: false, error: "请选择截止日期。" };
  }

  if (dailyMinutes < 1) {
    return { ok: false, error: "每天学习时间至少需要 1 分钟。" };
  }

  return {
    ok: true,
    data: {
      title,
      goal,
      current_level: nullableTextValue(formData, "current_level"),
      deadline,
      daily_minutes: dailyMinutes,
      rest_days_per_week: Math.max(0, Math.min(restDaysPerWeek, 7)),
      preference: nullableTextValue(formData, "preference"),
      overview: "手动创建的基础计划，后续可接入 AI 生成每日安排。",
    },
  };
}

export function parseMistakeReviewFormData(
  formData: FormData
): ParseResult<MistakeReviewInsert> {
  const planId = textValue(formData, "plan_id");
  const date = textValue(formData, "date") || getLocalDateString();
  const question = nullableTextValue(formData, "question");

  if (!planId) {
    return { ok: false, error: "请先选择关联计划。" };
  }

  if (!question) {
    return { ok: false, error: "请填写题目或错误点。" };
  }

  return {
    ok: true,
    data: {
      plan_id: planId,
      task_id: nullableTextValue(formData, "task_id"),
      date,
      question,
      mistake_reason: nullableTextValue(formData, "mistake_reason"),
      correct_method: nullableTextValue(formData, "correct_method"),
      next_action: nullableTextValue(formData, "next_action"),
    },
  };
}

export function parseDailyReflectionFormData(
  formData: FormData
): ParseResult<DailyReflectionUpsert> {
  const planId = textValue(formData, "plan_id");
  const date = textValue(formData, "date") || getLocalDateString();
  const mood = nullableTextValue(formData, "mood");
  const difficulty = nullableTextValue(formData, "difficulty");

  if (!planId) {
    return { ok: false, error: "请先选择关联计划。" };
  }

  if (
    (mood && !allowedMoods.includes(mood)) ||
    (difficulty && !allowedDifficulties.includes(difficulty))
  ) {
    return { ok: false, error: "请选择有效的学习状态和难度感受。" };
  }

  return {
    ok: true,
    data: {
      plan_id: planId,
      date,
      mood,
      difficulty,
      note: nullableTextValue(formData, "note"),
    },
  };
}
