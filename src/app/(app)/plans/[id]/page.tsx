import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCompletionToggle } from "@/components/TaskCompletionToggle";
import { getPlanDetail } from "@/lib/study/data";
import type { TaskPriority } from "@/lib/study/types";

export const dynamic = "force-dynamic";

const priorityMeta: Record<TaskPriority, { label: string; tone: "blue" | "amber" | "slate" }> = {
  must: { label: "必做", tone: "amber" },
  should: { label: "建议", tone: "blue" },
  optional: { label: "可选", tone: "slate" },
};

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPlanDetail(id);

  if (!detail) {
    notFound();
  }

  const { plan, days } = detail;
  const allTasks = days.flatMap((day) => day.tasks);
  const completedTasks = allTasks.filter((task) => task.is_completed).length;
  const completionRate =
    allTasks.length === 0 ? 0 : Math.round((completedTasks / allTasks.length) * 100);

  return (
    <>
      <PageHeader
        eyebrow="计划详情"
        title={plan.title}
        description={plan.goal}
      />

      <section className="sp-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Badge tone={plan.status === "active" ? "blue" : "slate"}>
              {plan.status === "active" ? "进行中" : plan.status}
            </Badge>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              {plan.overview ?? "这个计划会按日期展示每日任务、资料建议和复习方法。"}
            </p>
          </div>
          <Link href="/today" className="btn-primary">
            查看今日任务
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">截止日期</p>
            <p className="mt-2 text-xl font-bold text-ink">{plan.deadline}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">每天学习</p>
            <p className="mt-2 text-xl font-bold text-ink">{plan.daily_minutes} 分钟</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">任务完成率</p>
            <p className="mt-2 text-xl font-bold text-ink">{completionRate}%</p>
            <ProgressBar value={completionRate} className="mt-3" />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="sp-section-title">每日安排</h2>
            <p className="sp-muted mt-1">按天查看任务、资料和复习方法，长计划也能快速扫读。</p>
          </div>
          <Badge tone="violet">{days.length} 天</Badge>
        </div>

        {days.length === 0 ? (
          <EmptyState
            title="这个计划还没有每日安排"
            description="如果刚刚生成计划失败，可以回到新建计划页重新生成。"
            actionHref="/plans/new"
            actionLabel="重新生成计划"
          />
        ) : (
          <div className="space-y-4">
            {days.map((day) => (
              <article key={day.id} className="sp-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Badge tone="slate">
                      Day {day.day_index} · {day.date}
                    </Badge>
                    <h3 className="mt-3 text-xl font-bold text-ink">{day.title}</h3>
                    {day.summary ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{day.summary}</p>
                    ) : null}
                  </div>
                  <Badge tone="blue">{day.tasks.length} 项任务</Badge>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_320px]">
                  <div>
                    <h4 className="text-sm font-bold text-ink">任务</h4>
                    {day.tasks.length === 0 ? (
                      <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                        暂无任务
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {day.tasks.map((task) => {
                          const priority = priorityMeta[task.priority];

                          return (
                            <li key={task.id}>
                              <div className="rounded-2xl bg-slate-50 p-2">
                                <div className="mb-2 flex justify-end">
                                  <Badge tone={priority.tone}>{priority.label}</Badge>
                                </div>
                                <TaskCompletionToggle
                                  taskId={task.id}
                                  initialCompleted={task.is_completed}
                                  content={task.content}
                                  meta={`${task.estimated_minutes ?? 0} 分钟`}
                                  variant="compact"
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <h4 className="text-sm font-bold text-ink">复习方法</h4>
                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        {day.review_method ?? "完成后用 5 分钟回顾今日重点。"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <h4 className="text-sm font-bold text-ink">资料建议</h4>
                      {day.resources.length === 0 ? (
                        <p className="mt-2 text-sm leading-6 text-slate-500">暂无资源</p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {day.resources.map((resource) => (
                            <div key={resource.id} className="rounded-2xl bg-white p-3">
                              <p className="text-sm font-semibold text-ink">{resource.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {resource.description ?? "按关键词查找适合自己的资料。"}
                              </p>
                              {resource.search_keywords ? (
                                <p className="mt-2 text-xs font-semibold text-primary">
                                  搜索：{resource.search_keywords}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
