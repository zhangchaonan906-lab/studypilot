import { Badge } from "@/components/Badge";
import { DailyReflectionForm } from "@/components/DailyReflectionForm";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { ResourceSearchLinks } from "@/components/ResourceSearchLinks";
import { TaskCompletionToggle } from "@/components/TaskCompletionToggle";
import { getTodayStudyOverview } from "@/lib/study/data";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const today = await getTodayStudyOverview();
  const todayLabel = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
  const message = params.saved
    ? "复盘已保存。"
    : params.error
      ? decodeURIComponent(params.error)
      : undefined;

  if (!today) {
    return (
      <>
        <PageHeader
          eyebrow="今日任务"
          title="像待办清单一样完成今天"
          description="查看今天的学习安排，完成任务后打卡，也可以在底部写一段复盘。"
        />
        <EmptyState
          title="还没有进行中的学习计划"
          description="先创建一个学习计划，生成后的每日任务会出现在这里。"
          actionHref="/plans/new"
          actionLabel="创建学习计划"
        />
      </>
    );
  }

  const hasAnyTodayTasks = today.completion.total > 0;
  const reviewMethods = today.planGroups.filter((group) => group.day?.review_method);

  return (
    <>
      <PageHeader
        eyebrow="今日任务"
        title="像待办清单一样完成今天"
        description="已汇总所有进行中计划的今日任务，完成后打卡，也可以在底部写一段复盘。"
      />

      <section className="space-y-6">
        <div className="sp-card">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{todayLabel}</Badge>
                <Badge tone="slate">{today.activePlans.length} 个进行中计划</Badge>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-ink">今日任务总览</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                按计划分组展示今天需要完成的任务；某个计划今天暂无任务时，不会影响其他计划显示。
              </p>
            </div>
            <div className="w-full rounded-2xl bg-blue-50 p-4 lg:w-72">
              <div className="flex items-center justify-between text-sm text-blue-800">
                <span>今日完成率</span>
                <span className="font-semibold">{today.completion.rate}%</span>
              </div>
              <ProgressBar value={today.completion.rate} className="mt-3" />
              <p className="mt-3 text-xs text-blue-800">
                {today.completion.completed}/{today.completion.total} 个任务
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {!hasAnyTodayTasks ? (
              <EmptyState
                title="所有进行中的计划今天都暂无任务"
                description="如果这是 AI 生成计划，请确认计划日期覆盖今天；也可以新建一个新的学习计划。"
                actionHref="/plans/new"
                actionLabel="新建计划"
              />
            ) : (
              today.planGroups.map((group) => (
                <article key={group.plan.id} className="sp-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="slate">
                          {group.day
                            ? `${group.day.date} · 第 ${group.day.day_index} 天`
                            : `${todayLabel} · 今天暂无任务`}
                        </Badge>
                        <Badge tone="violet">
                          {group.completion.completed}/{group.completion.total} 已完成
                        </Badge>
                      </div>
                      <h3 className="mt-3 text-xl font-bold text-ink">{group.plan.title}</h3>
                      {group.day?.title ? (
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {group.day.title}
                        </p>
                      ) : null}
                      {group.day?.summary ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {group.day.summary}
                        </p>
                      ) : null}
                    </div>
                    <div className="w-full rounded-2xl bg-slate-50 p-4 lg:w-56">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>计划今日完成率</span>
                        <span className="font-semibold text-primary">
                          {group.completion.rate}%
                        </span>
                      </div>
                      <ProgressBar value={group.completion.rate} className="mt-3" />
                    </div>
                  </div>

                  {!group.day || group.day.tasks.length === 0 ? (
                    <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                      今天暂无任务。
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {group.day.tasks.map((task) => (
                        <TaskCompletionToggle
                          key={task.id}
                          taskId={task.id}
                          initialCompleted={task.is_completed}
                          content={task.content}
                          estimatedMinutes={task.estimated_minutes ?? 0}
                          meta={`${group.day?.title ?? "今日任务"} · ${task.estimated_minutes ?? 0} 分钟 · ${priorityLabel(task.priority)}`}
                          variant="compact"
                        />
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>

          <aside className="space-y-5">
            <div className="sp-card">
              <h3 className="sp-section-title">今日学习建议</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                已汇总所有进行中计划的今日任务。优先完成必做项，再进入专注计时。
              </p>
            </div>

            <div className="sp-card">
              <h3 className="sp-section-title">复习方法</h3>
              {reviewMethods.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  今天暂时没有单独的复习方法。
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviewMethods.map((group) => (
                    <div key={group.plan.id} className="rounded-2xl bg-slate-50 p-4">
                      <Badge tone="slate">{group.plan.title}</Badge>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {group.day?.review_method}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sp-card">
              <h3 className="sp-section-title">资料建议</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                点击后会打开对应平台的搜索结果页。
              </p>
              {today.resources.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  今天暂时没有资料建议。
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {today.resources.slice(0, 5).map((resource) => (
                    <div key={resource.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="slate">{resource.plan.title}</Badge>
                        <Badge tone="blue">{resource.plan_day.title}</Badge>
                      </div>
                      <p className="mt-3 font-semibold text-ink">{resource.title}</p>
                      {resource.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {resource.description}
                        </p>
                      ) : null}
                      <ResourceSearchLinks searchKeywords={resource.search_keywords} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>

        <DailyReflectionForm
          plans={today.activePlans}
          reflection={today.reflection ?? undefined}
          message={message}
          messageType={params.error ? "error" : "success"}
        />
      </section>
    </>
  );
}

function priorityLabel(priority: string) {
  if (priority === "must") {
    return "必做";
  }

  if (priority === "optional") {
    return "可选";
  }

  return "建议";
}
