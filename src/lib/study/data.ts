import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalDateString } from "./forms";
import {
  calculateCompletionRate,
  getCurrentWeekRange,
  getDaysUntilDeadline,
  getPlanWeekIndex,
} from "./metrics";
import { deletePlanForUser } from "./plan-deletion";
import { updateTaskCompletionForUser } from "./task-completion";
import type {
  DashboardData,
  DailyReflection,
  DailyReflectionUpsert,
  MistakeReview,
  MistakeReviewInsert,
  Plan,
  PlanDay,
  PlanDetail,
  PlanInsert,
  Resource,
  ReviewPageData,
  Task,
  TodayStudyDay,
  TodayTask,
  WeeklyPageData,
  WeeklySummary,
} from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function getAuthenticatedContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, userId: user.id };
}

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) {
    throw new Error(`${fallback}：${error.message}`);
  }
}

export async function listActivePlans() {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  throwIfError(error, "读取学习计划失败");
  return (data ?? []) as Plan[];
}

export async function getCurrentActivePlan() {
  const { supabase, userId } = await getAuthenticatedContext();
  return getCurrentActivePlanForUser(supabase, userId);
}

export async function createPlan(input: PlanInsert) {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("plans")
    .insert({
      ...input,
      user_id: userId,
      status: "active",
    })
    .select("*")
    .single();

  throwIfError(error, "创建学习计划失败");
  return data as Plan;
}

export async function deletePlan(planId: string) {
  const { supabase, userId } = await getAuthenticatedContext();
  return deletePlanForUser(supabase, userId, planId);
}

export async function getPlanDetail(planId: string): Promise<PlanDetail | null> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (planError) {
    if (planError.code === "PGRST116") {
      return null;
    }

    throwIfError(planError, "读取计划详情失败");
  }

  const { data: days, error: daysError } = await supabase
    .from("plan_days")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .order("day_index", { ascending: true });

  throwIfError(daysError, "读取每日安排失败");

  const typedDays = (days ?? []) as PlanDay[];
  const dayIds = typedDays.map((day) => day.id);

  if (dayIds.length === 0) {
    return { plan: plan as Plan, days: [] };
  }

  const [tasksResult, resourcesResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .in("plan_day_id", dayIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("resources")
      .select("*")
      .eq("user_id", userId)
      .in("plan_day_id", dayIds)
      .order("created_at", { ascending: true }),
  ]);

  throwIfError(tasksResult.error, "读取任务失败");
  throwIfError(resourcesResult.error, "读取资源失败");

  const tasksByDay = groupByPlanDayId((tasksResult.data ?? []) as Task[]);
  const resourcesByDay = groupByPlanDayId((resourcesResult.data ?? []) as Resource[]);

  return {
    plan: plan as Plan,
    days: typedDays.map((day) => ({
      ...day,
      tasks: tasksByDay.get(day.id) ?? [],
      resources: resourcesByDay.get(day.id) ?? [],
    })),
  };
}

function groupByPlanDayId<T extends { plan_day_id: string }>(items: T[]) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const list = grouped.get(item.plan_day_id) ?? [];
    list.push(item);
    grouped.set(item.plan_day_id, list);
  }

  return grouped;
}

export async function listTodayTasks(date = getLocalDateString()) {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data: activePlans, error: plansError } = await supabase
    .from("plans")
    .select("id,title")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  throwIfError(plansError, "读取进行中的学习计划失败");

  const planIds = ((activePlans ?? []) as Pick<Plan, "id" | "title">[]).map(
    (plan) => plan.id
  );

  if (planIds.length === 0) {
    return [];
  }

  const { data: days, error: daysError } = await supabase
    .from("plan_days")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .in("plan_id", planIds)
    .order("day_index", { ascending: true });

  throwIfError(daysError, "读取今日安排失败");

  const typedDays = (days ?? []) as PlanDay[];
  const dayIds = typedDays.map((day) => day.id);

  if (dayIds.length === 0) {
    return [];
  }

  const tasksResult = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .in("plan_day_id", dayIds)
    .order("created_at", { ascending: true });

  throwIfError(tasksResult.error, "读取今日任务失败");

  const dayById = new Map(typedDays.map((day) => [day.id, day]));
  const planById = new Map(
    ((activePlans ?? []) as Pick<Plan, "id" | "title">[]).map((plan) => [
      plan.id,
      plan,
    ])
  );

  return ((tasksResult.data ?? []) as Task[])
    .map((task) => {
      const planDay = dayById.get(task.plan_day_id);
      const plan = planDay ? planById.get(planDay.plan_id) : undefined;

      if (!planDay || !plan) {
        return null;
      }

      return {
        ...task,
        plan_day: planDay,
        plan,
      };
    })
    .filter(Boolean) as TodayTask[];
}

export async function getTodayStudyDay(
  date = getLocalDateString()
): Promise<TodayStudyDay | null> {
  const { supabase, userId } = await getAuthenticatedContext();
  const plan = await getCurrentActivePlanForUser(supabase, userId);

  if (!plan) {
    return null;
  }

  const [dayResult, reflectionResult] = await Promise.all([
    supabase
      .from("plan_days")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", plan.id)
      .eq("date", date)
      .order("day_index", { ascending: true })
      .limit(1),
    supabase
      .from("daily_reflections")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", plan.id)
      .eq("date", date)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  throwIfError(dayResult.error, "读取今日安排失败");
  throwIfError(reflectionResult.error, "读取今日复盘失败");

  const planDay = ((dayResult.data ?? []) as PlanDay[])[0] ?? null;
  const reflection = ((reflectionResult.data ?? []) as DailyReflection[])[0] ?? null;

  if (!planDay) {
    return {
      plan,
      day: null,
      reflection,
      completion: calculateCompletionRate([]),
    };
  }

  const [tasksResult, resourcesResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_day_id", planDay.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("resources")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_day_id", planDay.id)
      .order("created_at", { ascending: true }),
  ]);

  throwIfError(tasksResult.error, "读取今日任务失败");
  throwIfError(resourcesResult.error, "读取今日资料失败");

  const tasks = (tasksResult.data ?? []) as Task[];
  const resources = (resourcesResult.data ?? []) as Resource[];

  return {
    plan,
    day: {
      ...planDay,
      tasks,
      resources,
    },
    reflection,
    completion: calculateCompletionRate(tasks),
  };
}

export async function updateTaskCompletion(taskId: string, isCompleted: boolean) {
  const { supabase, userId } = await getAuthenticatedContext();
  await updateTaskCompletionForUser(supabase, userId, taskId, isCompleted);
}

export async function listMistakeReviews() {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("mistake_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  throwIfError(error, "读取错题复盘失败");
  return (data ?? []) as MistakeReview[];
}

export async function getReviewPageData(
  date = getLocalDateString()
): Promise<ReviewPageData> {
  const { supabase, userId } = await getAuthenticatedContext();
  const currentPlan = await getCurrentActivePlanForUser(supabase, userId);

  if (!currentPlan) {
    return {
      currentPlan: null,
      mistakes: [],
      todayTasks: [],
    };
  }

  const [mistakesResult, todayTasks] = await Promise.all([
    supabase
      .from("mistake_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    listTodayTasksForPlan(supabase, userId, currentPlan, date),
  ]);

  throwIfError(mistakesResult.error, "读取错题复盘失败");

  return {
    currentPlan,
    mistakes: (mistakesResult.data ?? []) as MistakeReview[],
    todayTasks,
  };
}

export async function createMistakeReview(input: MistakeReviewInsert) {
  const { supabase, userId } = await getAuthenticatedContext();
  await ensurePlanBelongsToUser(supabase, userId, input.plan_id);

  if (input.task_id) {
    await ensureTaskBelongsToPlan(supabase, userId, input.task_id, input.plan_id);
  }

  const { error } = await supabase.from("mistake_reviews").insert({
    ...input,
    user_id: userId,
  });

  throwIfError(error, "保存错题复盘失败");
}

export async function listDailyReflections(date = getLocalDateString()) {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("daily_reflections")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: false });

  throwIfError(error, "读取每日复盘失败");
  return (data ?? []) as DailyReflection[];
}

export async function upsertDailyReflection(input: DailyReflectionUpsert) {
  const { supabase, userId } = await getAuthenticatedContext();
  await ensurePlanBelongsToUser(supabase, userId, input.plan_id);

  const { error } = await supabase.from("daily_reflections").upsert(
    {
      ...input,
      user_id: userId,
    },
    { onConflict: "user_id,plan_id,date" }
  );

  throwIfError(error, "保存每日复盘失败");
}

export async function listWeeklySummaries() {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("weekly_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("week_index", { ascending: false })
    .order("created_at", { ascending: false });

  throwIfError(error, "读取周总结失败");
  return (data ?? []) as WeeklySummary[];
}

export async function getWeeklyPageData(
  date = getLocalDateString()
): Promise<WeeklyPageData> {
  const { supabase, userId } = await getAuthenticatedContext();
  const currentPlan = await getCurrentActivePlanForUser(supabase, userId);

  if (!currentPlan) {
    return {
      currentPlan: null,
      summaries: [],
      currentWeek: null,
    };
  }

  const weekRange = getCurrentWeekRange(date);
  const [
    summariesResult,
    firstDayResult,
    weekDaysResult,
    reflectionCountResult,
    mistakeCountResult,
  ] = await Promise.all([
    supabase
      .from("weekly_summaries")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .order("week_index", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("plan_days")
      .select("date")
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .order("date", { ascending: true })
      .limit(1),
    supabase
      .from("plan_days")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .gte("date", weekRange.startDate)
      .lte("date", weekRange.endDate),
    supabase
      .from("daily_reflections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .gte("date", weekRange.startDate)
      .lte("date", weekRange.endDate),
    supabase
      .from("mistake_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .gte("date", weekRange.startDate)
      .lte("date", weekRange.endDate),
  ]);

  throwIfError(summariesResult.error, "读取周总结失败");
  throwIfError(firstDayResult.error, "读取计划起始日期失败");
  throwIfError(weekDaysResult.error, "读取本周学习安排失败");
  throwIfError(reflectionCountResult.error, "读取本周复盘数量失败");
  throwIfError(mistakeCountResult.error, "读取本周错题数量失败");

  const firstPlanDay = ((firstDayResult.data ?? []) as Array<{ date: string }>)[0];
  const planStartDate =
    firstPlanDay?.date ?? currentPlan.created_at?.slice(0, 10) ?? date;
  const weekDays = (weekDaysResult.data ?? []) as PlanDay[];
  const dayIds = weekDays.map((day) => day.id);
  const taskCount =
    dayIds.length > 0
      ? await countTasksByPlanDayIds(supabase, userId, dayIds)
      : 0;

  return {
    currentPlan,
    summaries: (summariesResult.data ?? []) as WeeklySummary[],
    currentWeek: {
      weekIndex: getPlanWeekIndex(planStartDate, weekRange.startDate),
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      taskCount,
      reflectionCount: reflectionCountResult.count ?? 0,
      mistakeCount: mistakeCountResult.count ?? 0,
    },
  };
}

export async function getDashboardData(
  date = getLocalDateString()
): Promise<DashboardData> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data: plansData, error: plansError } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  throwIfError(plansError, "读取进行中的学习计划失败");

  const activePlans = (plansData ?? []) as Plan[];
  const currentPlan = activePlans[0] ?? null;
  const emptyCompletion = calculateCompletionRate([]);

  if (!currentPlan) {
    return {
      activePlans,
      currentPlan: null,
      totalCompletion: emptyCompletion,
      todayCompletion: emptyCompletion,
      daysLeft: null,
      latestReflection: null,
      mistakeCount: 0,
      todayTasks: [],
    };
  }

  const { data: daysData, error: daysError } = await supabase
    .from("plan_days")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", currentPlan.id)
    .order("day_index", { ascending: true });

  throwIfError(daysError, "读取计划日期失败");

  const days = (daysData ?? []) as PlanDay[];
  const dayIds = days.map((day) => day.id);
  const tasks =
    dayIds.length > 0
      ? await listTasksByPlanDayIds(supabase, userId, dayIds)
      : [];
  const dayById = new Map(days.map((day) => [day.id, day]));
  const todayTasks = tasks
    .map((task) => {
      const planDay = dayById.get(task.plan_day_id);

      if (!planDay || planDay.date !== date) {
        return null;
      }

      return {
        ...task,
        plan_day: planDay,
        plan: {
          id: currentPlan.id,
          title: currentPlan.title,
        },
      };
    })
    .filter(Boolean) as TodayTask[];

  const [reflectionResult, mistakeCountResult] = await Promise.all([
    supabase
      .from("daily_reflections")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("mistake_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("plan_id", currentPlan.id),
  ]);

  throwIfError(reflectionResult.error, "读取最近复盘失败");
  throwIfError(mistakeCountResult.error, "读取错题数量失败");

  return {
    activePlans,
    currentPlan,
    totalCompletion: calculateCompletionRate(tasks),
    todayCompletion: calculateCompletionRate(todayTasks),
    daysLeft: getDaysUntilDeadline(currentPlan.deadline, date),
    latestReflection: ((reflectionResult.data ?? []) as DailyReflection[])[0] ?? null,
    mistakeCount: mistakeCountResult.count ?? 0,
    todayTasks,
  };
}

async function getCurrentActivePlanForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  throwIfError(error, "读取当前学习计划失败");
  return ((data ?? []) as Plan[])[0] ?? null;
}

async function listTodayTasksForPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: Pick<Plan, "id" | "title">,
  date: string
) {
  const { data: days, error: daysError } = await supabase
    .from("plan_days")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", plan.id)
    .eq("date", date)
    .order("day_index", { ascending: true });

  throwIfError(daysError, "读取今日安排失败");

  const typedDays = (days ?? []) as PlanDay[];
  const dayIds = typedDays.map((day) => day.id);

  if (dayIds.length === 0) {
    return [];
  }

  const tasks = await listTasksByPlanDayIds(supabase, userId, dayIds);
  const dayById = new Map(typedDays.map((day) => [day.id, day]));

  return tasks
    .map((task) => {
      const planDay = dayById.get(task.plan_day_id);

      if (!planDay) {
        return null;
      }

      return {
        ...task,
        plan_day: planDay,
        plan,
      };
    })
    .filter(Boolean) as TodayTask[];
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

  throwIfError(error, "读取任务失败");
  return (data ?? []) as Task[];
}

async function countTasksByPlanDayIds(
  supabase: SupabaseClient,
  userId: string,
  dayIds: string[]
) {
  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("plan_day_id", dayIds);

  throwIfError(error, "读取本周任务数量失败");
  return count ?? 0;
}

async function ensurePlanBelongsToUser(
  supabase: SupabaseClient,
  userId: string,
  planId: string
) {
  const { error } = await supabase
    .from("plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  throwIfError(error, "无法访问该计划");
}

async function ensureTaskBelongsToPlan(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  planId: string
) {
  const { data: task, error } = await supabase
    .from("tasks")
    .select("id, plan_day_id")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  throwIfError(error, "无法访问该任务");

  const { error: planDayError } = await supabase
    .from("plan_days")
    .select("id")
    .eq("id", (task as Pick<Task, "plan_day_id">).plan_day_id)
    .eq("plan_id", planId)
    .eq("user_id", userId)
    .single();

  throwIfError(planDayError, "该任务不属于当前学习计划");
}
