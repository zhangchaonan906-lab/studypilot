import type { DailyReflection, Plan, PlanDay, Resource, Task } from "./types";
import { calculateCompletionRate } from "./metrics";

export type TodayStudyOverview = {
  activePlans: Plan[];
  planGroups: Array<{
    plan: Plan;
    day:
      | (PlanDay & {
          tasks: Task[];
          resources: Resource[];
        })
      | null;
    completion: {
      completed: number;
      total: number;
      rate: number;
    };
  }>;
  completion: {
    completed: number;
    total: number;
    rate: number;
  };
  resources: Array<
    Resource & {
      plan: Pick<Plan, "id" | "title">;
      plan_day: PlanDay;
    }
  >;
  reflection: DailyReflection | null;
};

export type BuildTodayStudyOverviewInput = {
  userId: string;
  activePlans: Plan[];
  planDays: PlanDay[];
  tasks: Task[];
  resources: Resource[];
  reflections: DailyReflection[];
};

export function buildTodayStudyOverview({
  userId,
  activePlans,
  planDays,
  tasks,
  resources,
  reflections,
}: BuildTodayStudyOverviewInput): TodayStudyOverview | null {
  const ownActivePlans = activePlans.filter(
    (plan) => plan.user_id === userId && plan.status === "active",
  );

  if (ownActivePlans.length === 0) {
    return null;
  }

  const activePlanIds = new Set(ownActivePlans.map((plan) => plan.id));
  const dayByPlanId = new Map<string, PlanDay>();

  for (const planDay of planDays) {
    if (
      planDay.user_id !== userId ||
      !activePlanIds.has(planDay.plan_id) ||
      dayByPlanId.has(planDay.plan_id)
    ) {
      continue;
    }

    dayByPlanId.set(planDay.plan_id, planDay);
  }

  const activeDayIds = new Set(Array.from(dayByPlanId.values()).map((day) => day.id));
  const tasksByDayId = groupByPlanDayId(
    tasks.filter((task) => task.user_id === userId && activeDayIds.has(task.plan_day_id)),
  );
  const resourcesByDayId = groupByPlanDayId(
    resources.filter(
      (resource) => resource.user_id === userId && activeDayIds.has(resource.plan_day_id),
    ),
  );
  const allTodayTasks: Task[] = [];
  const allTodayResources: TodayStudyOverview["resources"] = [];

  const planGroups = ownActivePlans.map((plan) => {
    const planDay = dayByPlanId.get(plan.id) ?? null;
    const dayTasks = planDay ? (tasksByDayId.get(planDay.id) ?? []) : [];
    const dayResources = planDay ? (resourcesByDayId.get(planDay.id) ?? []) : [];

    allTodayTasks.push(...dayTasks);

    if (planDay) {
      allTodayResources.push(
        ...dayResources.map((resource) => ({
          ...resource,
          plan: {
            id: plan.id,
            title: plan.title,
          },
          plan_day: planDay,
        })),
      );
    }

    return {
      plan,
      day: planDay
        ? {
            ...planDay,
            tasks: dayTasks,
            resources: dayResources,
          }
        : null,
      completion: calculateCompletionRate(dayTasks),
    };
  });

  const reflection =
    reflections.find(
      (item) => item.user_id === userId && activePlanIds.has(item.plan_id),
    ) ?? null;

  return {
    activePlans: ownActivePlans,
    planGroups,
    completion: calculateCompletionRate(allTodayTasks),
    resources: allTodayResources,
    reflection,
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
