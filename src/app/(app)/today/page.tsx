import { Badge } from "@/components/Badge";
import { DailyReflectionForm } from "@/components/DailyReflectionForm";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { ResourceSearchLinks } from "@/components/ResourceSearchLinks";
import { TaskCompletionToggle } from "@/components/TaskCompletionToggle";
import { getTodayStudyDay } from "@/lib/study/data";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const today = await getTodayStudyDay();
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

  return (
    <>
      <PageHeader
        eyebrow="今日任务"
        title="像待办清单一样完成今天"
        description="查看今天的学习安排，完成任务后打卡，也可以在底部写一段复盘。"
      />

      {!today ? (
        <EmptyState
          title="还没有进行中的学习计划"
          description="先创建一个学习计划，生成后的每日任务会出现在这里。"
          actionHref="/plans/new"
          actionLabel="创建学习计划"
        />
      ) : (
        <section className="space-y-6">
          <div className="sp-card">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="blue">{todayLabel}</Badge>
                  <Badge tone="slate">{today.plan.title}</Badge>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-ink">
                  {today.day?.title ?? "今天没有安排"}
                </h2>
                {today.day?.summary ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {today.day.summary}
                  </p>
                ) : null}
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

          {!today.day ? (
            <EmptyState
              title="当前计划今天没有任务"
              description="如果这是 AI 生成计划，请确认计划日期覆盖今天；也可以新建一个新的学习计划。"
              actionHref="/plans/new"
              actionLabel="新建计划"
            />
          ) : (
            <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <div className="sp-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">学习清单</p>
                    <h3 className="mt-1 text-xl font-bold text-ink">今天要完成的任务</h3>
                  </div>
                  <Badge tone="violet">{today.day.tasks.length} 项</Badge>
                </div>

                {today.day.tasks.length === 0 ? (
                  <div className="mt-5">
                    <EmptyState
                      title="今天还没有任务"
                      description="当前计划今天有日期安排，但还没有生成具体任务。"
                    />
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {today.day.tasks.map((task) => (
                      <TaskCompletionToggle
                        key={task.id}
                        taskId={task.id}
                        initialCompleted={task.is_completed}
                        content={task.content}
                        estimatedMinutes={task.estimated_minutes ?? 0}
                        meta={`${task.estimated_minutes ?? 0} 分钟 · ${priorityLabel(task.priority)}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <aside className="space-y-5">
                <div className="sp-card">
                  <h3 className="sp-section-title">复习方法</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {today.day.review_method ?? "今天暂时没有单独的复习方法。"}
                  </p>
                </div>

                <div className="sp-card">
                  <h3 className="sp-section-title">资料建议</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    点击后会打开对应平台的搜索结果页。
                  </p>
                  {today.day.resources.length === 0 ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      今天暂时没有资料建议。
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {today.day.resources.map((resource) => (
                        <div key={resource.id} className="rounded-2xl bg-slate-50 p-4">
                          <p className="font-semibold text-ink">{resource.title}</p>
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
          )}

          <DailyReflectionForm
            plans={[today.plan]}
            reflection={today.reflection ?? undefined}
            message={message}
            messageType={params.error ? "error" : "success"}
          />
        </section>
      )}
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
