import Link from "next/link";
import { Badge } from "@/components/Badge";
import { DeletePlanButton } from "@/components/DeletePlanButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PlanCard } from "@/components/PlanCard";
import { ProgressBar } from "@/components/ProgressBar";
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
        title="欢迎回来，今天继续稳稳推进"
        description="这里汇总当前计划、今日任务、复盘和错题情况，帮你快速进入学习状态。"
      />

      {!dashboard.currentPlan ? (
        <EmptyState
          title="还没有进行中的学习计划"
          description="创建一个学习计划后，StudyPilot 会在这里展示进度、今日任务、复盘和错题统计。"
          actionHref="/plans/new"
          actionLabel="创建学习计划"
        />
      ) : (
        <section className="space-y-6">
          <div className="sp-card overflow-hidden">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <Badge tone="blue">当前计划</Badge>
                <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
                  {dashboard.currentPlan.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {dashboard.currentPlan.overview ?? dashboard.currentPlan.goal}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                <Link href="/today" className="btn-primary">
                  去今日任务
                </Link>
                <Link href="/plans/new" className="btn-secondary">
                  新建计划
                </Link>
                <DeletePlanButton
                  planId={dashboard.currentPlan.id}
                  planTitle={dashboard.currentPlan.title}
                />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>总完成率</span>
                <span className="font-semibold text-primary">{dashboard.totalCompletion.rate}%</span>
              </div>
              <ProgressBar value={dashboard.totalCompletion.rate} className="mt-2" />
            </div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((metric) => (
              <StatCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="sp-section-title">进行中的计划</h2>
                  <p className="sp-muted mt-1">最多同时保留 3 个 active plans。</p>
                </div>
                <Link href="/plans/new" className="text-sm font-semibold text-primary">
                  创建新计划
                </Link>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {dashboard.activePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="sp-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">今日待办</p>
                    <h2 className="mt-1 text-lg font-bold text-ink">学习清单预览</h2>
                  </div>
                  <Badge tone="violet">{estimatedMinutes} 分钟</Badge>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>今日完成率</span>
                    <span className="font-semibold text-primary">{dashboard.todayCompletion.rate}%</span>
                  </div>
                  <ProgressBar value={dashboard.todayCompletion.rate} className="mt-2" />
                </div>
                {dashboard.todayTasks.length === 0 ? (
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    当前计划今天还没有任务。
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {dashboard.todayTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-3 w-3 rounded-full ${
                              task.is_completed ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="break-words font-semibold text-ink">{task.content}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {task.plan_day.title} · {task.estimated_minutes ?? 0} 分钟
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sp-card">
                <h2 className="sp-section-title">最近复盘</h2>
                {dashboard.latestReflection ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <Badge tone="slate">{dashboard.latestReflection.date}</Badge>
                    <p className="mt-3 text-sm text-slate-600">
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
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                    还没有每日复盘。完成今天任务后，可以在今日任务页写一段复盘。
                  </p>
                )}
              </div>
            </aside>
          </section>
        </section>
      )}
    </>
  );
}
