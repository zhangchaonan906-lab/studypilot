import { NextResponse } from "next/server";
import { generateWeeklySummary } from "@/lib/ai/generate-weekly-summary";
import {
  checkAiUsageRateLimit,
  type AiUsageRateLimitClient,
  weeklySummaryRateLimitRule,
} from "@/lib/ai/rate-limit";
import { validateWeeklySummaryRequest } from "@/lib/ai/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateCompletionRate } from "@/lib/study/metrics";
import type {
  DailyReflection,
  MistakeReview,
  Plan,
  PlanDay,
  Task,
} from "@/lib/study/types";

const AI_USAGE_ENDPOINT = "/api/weekly-summary";
const MIN_WEEKLY_TASKS = 2;

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "请先登录后再生成周总结。" }, { status: 401 });
  }

  const rateLimit = await checkAiUsageRateLimit({
    supabase: supabase as unknown as AiUsageRateLimitClient,
    userId: user.id,
    endpoint: AI_USAGE_ENDPOINT,
    rule: weeklySummaryRateLimitRule,
  });

  if (!rateLimit.allowed) {
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json(
      { error: rateLimit.error },
      { status: rateLimit.status }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json({ error: "请求内容不是有效 JSON。" }, { status: 400 });
  }

  const parsedInput = validateWeeklySummaryRequest(body);

  if (!parsedInput.success) {
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json({ error: parsedInput.error }, { status: 400 });
  }

  const input = parsedInput.data;

  try {
    const plan = await getUserPlan(supabase, user.id, input.planId);

    if (!plan) {
      await recordAiUsageLog(supabase, user.id, false);
      return NextResponse.json({ error: "无法访问该学习计划。" }, { status: 404 });
    }

    const sourceData = await getWeeklySourceData(supabase, user.id, input);
    const completion = calculateCompletionRate(sourceData.tasks);

    if (sourceData.tasks.length < MIN_WEEKLY_TASKS) {
      await recordAiUsageLog(supabase, user.id, false);
      return NextResponse.json(
        {
          error: `本周任务数据太少，至少需要 ${MIN_WEEKLY_TASKS} 个任务后再生成总结。`,
        },
        { status: 400 }
      );
    }

    const planDayById = new Map(sourceData.planDays.map((day) => [day.id, day]));
    const generatedSummary = await generateWeeklySummary({
      planTitle: plan.title,
      weekIndex: input.weekIndex,
      startDate: input.startDate,
      endDate: input.endDate,
      completionRate: completion.rate,
      tasks: sourceData.tasks.map((task) => {
        const day = planDayById.get(task.plan_day_id);

        return {
          date: day?.date ?? input.startDate,
          title: day?.title ?? "未命名安排",
          content: task.content,
          isCompleted: task.is_completed,
          estimatedMinutes: task.estimated_minutes,
        };
      }),
      reflections: sourceData.reflections.map((reflection) => ({
        date: reflection.date,
        mood: reflection.mood,
        difficulty: reflection.difficulty,
        note: reflection.note,
      })),
      mistakes: sourceData.mistakes.map((mistake) => ({
        date: mistake.date,
        question: mistake.question,
        mistakeReason: mistake.mistake_reason,
        correctMethod: mistake.correct_method,
        nextAction: mistake.next_action,
      })),
    });

    const summaryId = await saveWeeklySummary(supabase, user.id, input, {
      completionRate: completion.rate,
      summary: generatedSummary.summary,
      strengths: generatedSummary.strengths,
      weaknesses: generatedSummary.weaknesses,
      nextWeekAdvice: generatedSummary.nextWeekAdvice,
    });

    await recordAiUsageLog(supabase, user.id, true);
    return NextResponse.json({ summaryId });
  } catch (error) {
    console.error("[StudyPilot] weekly-summary failed:", error);
    await recordAiUsageLog(supabase, user.id, false);

    return NextResponse.json(
      { error: "生成周总结失败，请稍后重试。" },
      { status: 500 },
    );
  }
}

async function getUserPlan(
  supabase: SupabaseClient,
  userId: string,
  planId: string
) {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message || "读取学习计划失败。");
  }

  return data as Plan;
}

async function getWeeklySourceData(
  supabase: SupabaseClient,
  userId: string,
  input: {
    planId: string;
    startDate: string;
    endDate: string;
  }
) {
  const [daysResult, reflectionsResult, mistakesResult] = await Promise.all([
    supabase
      .from("plan_days")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", input.planId)
      .gte("date", input.startDate)
      .lte("date", input.endDate)
      .order("date", { ascending: true }),
    supabase
      .from("daily_reflections")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", input.planId)
      .gte("date", input.startDate)
      .lte("date", input.endDate)
      .order("date", { ascending: true }),
    supabase
      .from("mistake_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", input.planId)
      .gte("date", input.startDate)
      .lte("date", input.endDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (daysResult.error) {
    throw new Error(daysResult.error.message || "读取本周学习安排失败。");
  }

  if (reflectionsResult.error) {
    throw new Error(reflectionsResult.error.message || "读取本周每日复盘失败。");
  }

  if (mistakesResult.error) {
    throw new Error(mistakesResult.error.message || "读取本周错题失败。");
  }

  const planDays = (daysResult.data ?? []) as PlanDay[];
  const dayIds = planDays.map((day) => day.id);
  const tasks =
    dayIds.length > 0 ? await listTasksByPlanDayIds(supabase, userId, dayIds) : [];

  return {
    planDays,
    tasks,
    reflections: (reflectionsResult.data ?? []) as DailyReflection[],
    mistakes: (mistakesResult.data ?? []) as MistakeReview[],
  };
}

async function listTasksByPlanDayIds(
  supabase: SupabaseClient,
  userId: string,
  dayIds: string[]
) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .in("plan_day_id", dayIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message || "读取本周任务失败。");
  }

  return (data ?? []) as Task[];
}

async function saveWeeklySummary(
  supabase: SupabaseClient,
  userId: string,
  input: {
    planId: string;
    weekIndex: number;
    startDate: string;
    endDate: string;
  },
  summary: {
    completionRate: number;
    summary: string;
    strengths: string;
    weaknesses: string;
    nextWeekAdvice: string;
  }
) {
  const payload = {
    completion_rate: summary.completionRate,
    summary: summary.summary,
    strengths: summary.strengths,
    weaknesses: summary.weaknesses,
    next_week_advice: summary.nextWeekAdvice,
    start_date: input.startDate,
    end_date: input.endDate,
  };

  const { data: existingRows, error: existingError } = await supabase
    .from("weekly_summaries")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_id", input.planId)
    .eq("week_index", input.weekIndex)
    .limit(1);

  if (existingError) {
    throw new Error(existingError.message || "检查已有周总结失败。");
  }

  const existingId = ((existingRows ?? []) as Array<{ id: string }>)[0]?.id;

  if (existingId) {
    const { data, error } = await supabase
      .from("weekly_summaries")
      .update(payload)
      .eq("user_id", userId)
      .eq("plan_id", input.planId)
      .eq("week_index", input.weekIndex)
      .select("id")
      .limit(1);

    if (error) {
      throw new Error(error.message || "更新周总结失败。");
    }

    return ((data ?? []) as Array<{ id: string }>)[0]?.id ?? existingId;
  }

  const { data, error } = await supabase
    .from("weekly_summaries")
    .insert({
      ...payload,
      user_id: userId,
      plan_id: input.planId,
      week_index: input.weekIndex,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "保存周总结失败。");
  }

  return (data as { id: string }).id;
}

async function recordAiUsageLog(
  supabase: SupabaseClient,
  userId: string,
  success: boolean
) {
  await supabase.from("ai_usage_logs").insert({
    user_id: userId,
    endpoint: AI_USAGE_ENDPOINT,
    success,
  });
}
