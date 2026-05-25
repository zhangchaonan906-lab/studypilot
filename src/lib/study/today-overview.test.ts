import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildTodayStudyOverview } from "./today-overview";
import type { DailyReflection, Plan, PlanDay, Resource, Task } from "./types";

const rootDir = process.cwd();

function plan(overrides: Partial<Plan> & Pick<Plan, "id" | "title">): Plan {
  return {
    id: overrides.id,
    user_id: overrides.user_id ?? "user-1",
    title: overrides.title,
    goal: overrides.goal ?? "通过考试",
    current_level: overrides.current_level ?? null,
    deadline: overrides.deadline ?? "2026-06-30",
    daily_minutes: overrides.daily_minutes ?? 60,
    rest_days_per_week: overrides.rest_days_per_week ?? null,
    preference: overrides.preference ?? null,
    overview: overrides.overview ?? null,
    status: overrides.status ?? "active",
    created_at: overrides.created_at ?? "2026-05-20T00:00:00.000Z",
  };
}

function day(overrides: Partial<PlanDay> & Pick<PlanDay, "id" | "plan_id">): PlanDay {
  return {
    id: overrides.id,
    plan_id: overrides.plan_id,
    user_id: overrides.user_id ?? "user-1",
    day_index: overrides.day_index ?? 1,
    date: overrides.date ?? "2026-05-25",
    title: overrides.title ?? `Day ${overrides.day_index ?? 1}`,
    summary: overrides.summary ?? null,
    review_method: overrides.review_method ?? null,
    created_at: overrides.created_at ?? "2026-05-20T00:00:00.000Z",
  };
}

function task(overrides: Partial<Task> & Pick<Task, "id" | "plan_day_id" | "content">): Task {
  return {
    id: overrides.id,
    plan_day_id: overrides.plan_day_id,
    user_id: overrides.user_id ?? "user-1",
    content: overrides.content,
    priority: overrides.priority ?? "must",
    estimated_minutes: overrides.estimated_minutes ?? 30,
    is_completed: overrides.is_completed ?? false,
    completed_at: overrides.completed_at ?? null,
    created_at: overrides.created_at ?? "2026-05-25T08:00:00.000Z",
  };
}

function resource(
  overrides: Partial<Resource> & Pick<Resource, "id" | "plan_day_id" | "title">,
): Resource {
  return {
    id: overrides.id,
    plan_day_id: overrides.plan_day_id,
    user_id: overrides.user_id ?? "user-1",
    title: overrides.title,
    type: overrides.type ?? "视频",
    description: overrides.description ?? null,
    search_keywords: overrides.search_keywords ?? null,
    created_at: overrides.created_at ?? "2026-05-25T08:00:00.000Z",
  };
}

function reflection(overrides: Partial<DailyReflection> & Pick<DailyReflection, "id" | "plan_id">): DailyReflection {
  return {
    id: overrides.id,
    user_id: overrides.user_id ?? "user-1",
    plan_id: overrides.plan_id,
    date: overrides.date ?? "2026-05-25",
    mood: overrides.mood ?? "正常",
    difficulty: overrides.difficulty ?? "刚好",
    note: overrides.note ?? null,
    created_at: overrides.created_at ?? "2026-05-25T08:00:00.000Z",
  };
}

describe("today study overview aggregation", () => {
  it("groups today's tasks for two active plans and aggregates completion", () => {
    const planA = plan({ id: "plan-a", title: "计划 A" });
    const planB = plan({ id: "plan-b", title: "计划 B" });
    const dayA = day({ id: "day-a", plan_id: planA.id, day_index: 2, title: "函数 Day 2" });
    const dayB = day({ id: "day-b", plan_id: planB.id, day_index: 5, title: "英语 Day 5" });

    const overview = buildTodayStudyOverview({
      userId: "user-1",
      activePlans: [planA, planB],
      planDays: [dayA, dayB],
      tasks: [
        task({ id: "task-a1", plan_day_id: dayA.id, content: "复习函数", is_completed: true }),
        task({ id: "task-a2", plan_day_id: dayA.id, content: "完成函数题" }),
        task({ id: "task-b1", plan_day_id: dayB.id, content: "背诵单词" }),
      ],
      resources: [],
      reflections: [],
    });

    expect(overview).not.toBeNull();
    expect(overview?.planGroups.map((group) => group.plan.title)).toEqual(["计划 A", "计划 B"]);
    expect(overview?.planGroups[0].day?.tasks.map((item) => item.content)).toEqual([
      "复习函数",
      "完成函数题",
    ]);
    expect(overview?.planGroups[1].day?.tasks.map((item) => item.content)).toEqual([
      "背诵单词",
    ]);
    expect(overview?.completion).toEqual({ completed: 1, total: 3, rate: 33 });
    expect(overview?.planGroups[0].completion).toEqual({ completed: 1, total: 2, rate: 50 });
    expect(overview?.planGroups[1].completion).toEqual({ completed: 0, total: 1, rate: 0 });
  });

  it("keeps another plan's tasks visible when one active plan has no task today", () => {
    const planA = plan({ id: "plan-a", title: "计划 A" });
    const planB = plan({ id: "plan-b", title: "计划 B" });
    const dayB = day({ id: "day-b", plan_id: planB.id, day_index: 3 });

    const overview = buildTodayStudyOverview({
      userId: "user-1",
      activePlans: [planA, planB],
      planDays: [dayB],
      tasks: [task({ id: "task-b1", plan_day_id: dayB.id, content: "完成听力训练" })],
      resources: [],
      reflections: [],
    });

    expect(overview?.planGroups).toHaveLength(2);
    expect(overview?.planGroups[0].day).toBeNull();
    expect(overview?.planGroups[0].completion).toEqual({ completed: 0, total: 0, rate: 0 });
    expect(overview?.planGroups[1].day?.tasks.map((item) => item.content)).toEqual([
      "完成听力训练",
    ]);
    expect(overview?.completion).toEqual({ completed: 0, total: 1, rate: 0 });
  });

  it("returns overview data for the overall empty state when all active plans have no tasks", () => {
    const planA = plan({ id: "plan-a", title: "计划 A" });
    const planB = plan({ id: "plan-b", title: "计划 B" });

    const overview = buildTodayStudyOverview({
      userId: "user-1",
      activePlans: [planA, planB],
      planDays: [],
      tasks: [],
      resources: [],
      reflections: [],
    });

    expect(overview?.completion).toEqual({ completed: 0, total: 0, rate: 0 });
    expect(overview?.planGroups.map((group) => group.day)).toEqual([null, null]);
  });

  it("only includes the current user's active plans and their tasks", () => {
    const ownActive = plan({ id: "plan-a", title: "我的计划" });
    const ownArchived = plan({ id: "plan-archived", title: "归档计划", status: "archived" });
    const otherActive = plan({ id: "plan-other", title: "别人的计划", user_id: "other-user" });
    const ownDay = day({ id: "day-a", plan_id: ownActive.id });
    const archivedDay = day({ id: "day-archived", plan_id: ownArchived.id });
    const otherDay = day({ id: "day-other", plan_id: otherActive.id, user_id: "other-user" });

    const overview = buildTodayStudyOverview({
      userId: "user-1",
      activePlans: [ownActive, ownArchived, otherActive],
      planDays: [ownDay, archivedDay, otherDay],
      tasks: [
        task({ id: "task-a", plan_day_id: ownDay.id, content: "自己的任务" }),
        task({ id: "task-archived", plan_day_id: archivedDay.id, content: "归档任务" }),
        task({
          id: "task-other",
          plan_day_id: otherDay.id,
          content: "别人的任务",
          user_id: "other-user",
        }),
      ],
      resources: [],
      reflections: [reflection({ id: "reflection-other", plan_id: otherActive.id, user_id: "other-user" })],
    });

    expect(overview?.planGroups.map((group) => group.plan.title)).toEqual(["我的计划"]);
    expect(overview?.planGroups[0].day?.tasks.map((item) => item.content)).toEqual([
      "自己的任务",
    ]);
    expect(overview?.reflection).toBeNull();
  });

  it("aggregates resources and marks which plan each resource comes from", () => {
    const planA = plan({ id: "plan-a", title: "计划 A" });
    const planB = plan({ id: "plan-b", title: "计划 B" });
    const dayA = day({ id: "day-a", plan_id: planA.id });
    const dayB = day({ id: "day-b", plan_id: planB.id });

    const overview = buildTodayStudyOverview({
      userId: "user-1",
      activePlans: [planA, planB],
      planDays: [dayA, dayB],
      tasks: [],
      resources: [
        resource({ id: "resource-a", plan_day_id: dayA.id, title: "函数视频" }),
        resource({ id: "resource-b", plan_day_id: dayB.id, title: "单词资料" }),
      ],
      reflections: [reflection({ id: "reflection-a", plan_id: planA.id })],
    });

    expect(overview?.resources.map((item) => `${item.plan.title}:${item.title}`)).toEqual([
      "计划 A:函数视频",
      "计划 B:单词资料",
    ]);
    expect(overview?.reflection?.id).toBe("reflection-a");
  });
});

describe("/today page source", () => {
  const todayPageSource = readFileSync(
    join(rootDir, "src", "app", "(app)", "today", "page.tsx"),
    "utf8",
  );

  it("renders tasks by plan group and keeps task completion toggles wired", () => {
    expect(todayPageSource).toContain("today.planGroups.map");
    expect(todayPageSource).toContain("group.day.tasks.map");
    expect(todayPageSource).toContain("TaskCompletionToggle");
    expect(todayPageSource).toContain("estimatedMinutes={task.estimated_minutes ?? 0}");
  });

  it("shows aggregate completion and an overall empty state only when no plan has tasks", () => {
    expect(todayPageSource).toContain("today.completion.rate");
    expect(todayPageSource).toContain("hasAnyTodayTasks");
    expect(todayPageSource).toContain("所有进行中的计划今天都暂无任务");
  });

  it("uses all active plans for the reflection form and limits aggregated resources", () => {
    expect(todayPageSource).toContain("plans={today.activePlans}");
    expect(todayPageSource).toContain("today.resources.slice(0, 5)");
    expect(todayPageSource).toContain("resource.plan.title");
  });
});
