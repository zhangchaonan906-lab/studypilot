import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PlanCard } from "@/components/PlanCard";
import { StatCard } from "@/components/StatCard";
import { getDashboardData } from "@/lib/study/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();
  const estimatedMinutes = dashboard.todayTasks.reduce(
    (total, task) => total + (task.estimated_minutes ?? 0),
    0
  );
  const stats = [
    {
      label: "总完成率",
      value: dashboard.currentPlan ? `${dashboard.totalCompletion.rate}%` : "--",
      hint: dashboard.currentPlan
        ? `${dashboard.totalCompletion.completed}/${dashboard.totalCompletion.total} 个任务完成`
        : "暂无进行中的计划",
    },
    {
      label: "今日完成率",
      value: dashboard.currentPlan ? `${dashboard.todayCompletion.rate}%` : "--",
      hint: dashboard.currentPlan
        ? `${dashboard.todayCompletion.completed}/${dashboard.todayCompletion.total} 个任务完成`
        : "先创建计划",
    },
    {
      label: "距离截止",
      value: dashboard.daysLeft === null ? "--" : `${dashboard.daysLeft} 天`,
      hint: dashboard.currentPlan ? `截止 ${dashboard.currentPlan.deadline}` : "暂无截止日期",
    },
    {
      label: "错题数量",
      value: String(dashboard.mistakeCount),
      hint: "当前计划累计记录",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="学习台"
        title="今天的节奏已经排好"
        description="这里展示当前学习计划的完成率、今日进度、复盘和错题统计。"
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">进行中的计划</h2>
            <Link href="/plans/new" className="text-sm font-semibold text-primary">
              新建计划
            </Link>
          </div>
          {dashboard.activePlans.length === 0 ? (
            <EmptyState
              title="还没有进行中的学习计划"
              description="先创建一个学习计划，生成后的任务、复盘和错题统计会出现在这里。"
              actionHref="/plans/new"
              actionLabel="创建计划"
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {dashboard.activePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-bold text-ink">最近复盘</h2>
            {dashboard.latestReflection ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-semibold text-primary">
                  {dashboard.latestReflection.date}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  状态：{dashboard.latestReflection.mood ?? "未填写"} · 难度：
                  {dashboard.latestReflection.difficulty ?? "未填写"}
                </p>
                {dashboard.latestReflection.note ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {dashboard.latestReflection.note}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-500">
                还没有每日复盘。完成今天任务后，可以在今日任务页写一段复盘。
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">今日待办</h2>
              <span className="text-sm font-semibold text-primary">{estimatedMinutes} 分钟</span>
            </div>
            {dashboard.todayTasks.length === 0 ? (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-500">
                当前计划今天还没有任务。
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {dashboard.todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-3 w-3 rounded-full ${
                          task.is_completed ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-ink">{task.content}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {task.plan_day.title} · {task.estimated_minutes ?? 0} 分钟
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/today"
              className="mt-4 block rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              去今日任务
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
