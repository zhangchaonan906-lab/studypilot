import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai/generate-plan";
import { validateGeneratePlanRequest } from "@/lib/ai/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AI_USAGE_ENDPOINT = "/api/generate-plan";
const DAILY_LIMIT = 5;
const PER_MINUTE_LIMIT = 2;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "请先登录后再生成学习计划。" }, { status: 401 });
  }

  // --- Rate limiting ---
  const now = new Date();
  const todayStart = now.toISOString().slice(0, 10) + "T00:00:00Z";
  const oneMinuteAgo = new Date(now.getTime() - 60_000).toISOString();

  const [dailyResult, recentResult] = await Promise.all([
    supabase
      .from("ai_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("endpoint", AI_USAGE_ENDPOINT)
      .gte("created_at", todayStart),
    supabase
      .from("ai_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("endpoint", AI_USAGE_ENDPOINT)
      .gte("created_at", oneMinuteAgo),
  ]);

  if (dailyResult.error || recentResult.error) {
    return NextResponse.json(
      { error: "请求失败，请稍后重试。" },
      { status: 500 },
    );
  }

  if ((dailyResult.count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "今日生成次数已达上限，请明天再试。" },
      { status: 429 },
    );
  }

  if ((recentResult.count ?? 0) >= PER_MINUTE_LIMIT) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试。" },
      { status: 429 },
    );
  }

  // --- Request parsing ---
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json({ error: "请求内容不是有效 JSON。" }, { status: 400 });
  }

  const parsedInput = validateGeneratePlanRequest(body);

  if (!parsedInput.success) {
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json({ error: parsedInput.error }, { status: 400 });
  }

  // --- Active plan count check ---
  let activePlanCount = 0;

  try {
    activePlanCount = await countActivePlans(supabase, user.id);
  } catch (error) {
    console.error("[StudyPilot] countActivePlans failed:", error);
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json(
      { error: "请求失败，请稍后重试。" },
      { status: 500 },
    );
  }

  if (activePlanCount >= 3) {
    await recordAiUsageLog(supabase, user.id, false);
    return NextResponse.json(
      { error: "每个用户最多同时拥有 3 个进行中的学习计划。" },
      { status: 400 },
    );
  }

  // --- Plan generation ---
  let createdPlanId: string | null = null;

  try {
    const generatedPlan = await generatePlan(parsedInput.data);
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .insert({
        user_id: user.id,
        title: generatedPlan.title || parsedInput.data.title,
        goal: parsedInput.data.goal,
        current_level: parsedInput.data.currentLevel || null,
        deadline: parsedInput.data.deadline,
        daily_minutes: parsedInput.data.dailyMinutes,
        rest_days_per_week: parsedInput.data.restDaysPerWeek,
        preference: parsedInput.data.preference || null,
        overview: generatedPlan.overview,
        status: "active",
      })
      .select("id")
      .single();

    if (planError || !plan) {
      console.error("[StudyPilot] plan insert failed:", planError);
      throw new Error("创建学习计划失败。");
    }

    createdPlanId = plan.id;

    const { data: planDays, error: planDaysError } = await supabase
      .from("plan_days")
      .insert(
        generatedPlan.days.map((day) => ({
          user_id: user.id,
          plan_id: createdPlanId,
          day_index: day.dayIndex,
          date: day.date,
          title: day.title,
          summary: day.summary || null,
          review_method: day.reviewMethod || null,
        }))
      )
      .select("id, day_index");

    if (planDaysError || !planDays) {
      console.error("[StudyPilot] plan_days insert failed:", planDaysError);
      throw new Error("保存每日安排失败。");
    }

    const planDayIdByIndex = new Map<number, string>(
      planDays.map((day) => [day.day_index, day.id])
    );

    const taskRows = generatedPlan.days.flatMap((day) => {
      const planDayId = planDayIdByIndex.get(day.dayIndex);

      if (!planDayId) {
        throw new Error("保存任务失败。");
      }

      return day.tasks.map((task) => ({
        user_id: user.id,
        plan_day_id: planDayId,
        content: task.content,
        priority: task.priority,
        estimated_minutes: task.estimatedMinutes,
        is_completed: false,
      }));
    });

    if (taskRows.length > 0) {
      const { error: tasksError } = await supabase.from("tasks").insert(taskRows);

      if (tasksError) {
        console.error("[StudyPilot] tasks insert failed:", tasksError);
        throw new Error("保存任务失败。");
      }
    }

    const resourceRows = generatedPlan.days.flatMap((day) => {
      const planDayId = planDayIdByIndex.get(day.dayIndex);

      if (!planDayId) {
        throw new Error("保存学习资源失败。");
      }

      return day.resources.map((resource) => ({
        user_id: user.id,
        plan_day_id: planDayId,
        title: resource.title,
        type: resource.type || null,
        description: resource.description || null,
        search_keywords: resource.searchKeywords || null,
      }));
    });

    if (resourceRows.length > 0) {
      const { error: resourcesError } = await supabase.from("resources").insert(resourceRows);

      if (resourcesError) {
        console.error("[StudyPilot] resources insert failed:", resourcesError);
        throw new Error("保存学习资源失败。");
      }
    }

    await recordAiUsageLog(supabase, user.id, true);
    return NextResponse.json({ planId: createdPlanId });
  } catch (error) {
    console.error(
      "[StudyPilot] generate-plan failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      createdPlanId ? "(after plan insert)" : "(before plan insert)"
    );

    if (createdPlanId) {
      await supabase
        .from("plans")
        .delete()
        .eq("id", createdPlanId)
        .eq("user_id", user.id);
    }

    await recordAiUsageLog(supabase, user.id, false);

    return NextResponse.json(
      { error: "生成学习计划失败，请稍后重试。" },
      { status: 500 },
    );
  }
}

async function countActivePlans(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  const { count, error } = await supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message || "检查进行中计划数量失败。");
  }

  return count ?? 0;
}

async function recordAiUsageLog(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  success: boolean,
) {
  await supabase.from("ai_usage_logs").insert({
    user_id: userId,
    endpoint: AI_USAGE_ENDPOINT,
    success,
  });
}
