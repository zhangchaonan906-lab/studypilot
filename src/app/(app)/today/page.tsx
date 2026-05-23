import { DailyReflectionForm } from "@/components/DailyReflectionForm";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
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
  const message = params.saved
    ? "今日复盘已保存。"
    : params.error
      ? decodeURIComponent(params.error)
      : undefined;

  return (
    <>
      <PageHeader
        eyebrow="今日任务"
        title="把今天的任务完成就很好"
        description="这里展示当前学习计划今天的安排、任务、资料和复盘。"
      />

      {!today ? (
        <EmptyState
          title="还没有进行中的学习计划"
          description="先创建一个学习计划，生成后的每日任务会出现在这里。"
          actionHref="/plans/new"
          actionLabel="创建学习计划"
        />
      ) : (
        <section className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">{today.plan.title}</p>
                <h2 className="mt-1 text-xl font-bold text-ink">
                  {today.day?.title ?? "今天没有安排"}
                </h2>
                {today.day?.summary ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{today.day.summary}</p>
                ) : null}
              </div>
              <div className="rounded-lg bg-blue-50 px-4 py-3 text-left sm:text-right">
                <p className="text-sm text-blue-700">今日完成率</p>
                <p className="text-2xl font-bold text-primary">{today.completion.rate}%</p>
                <p className="text-xs text-blue-700">
                  {today.completion.completed}/{today.completion.total} 个任务
                </p>
              </div>
            </div>

            {!today.day ? (
              <div className="mt-5">
                <EmptyState
                  title="当前计划今天没有任务"
                  description="如果这是 AI 生成计划，请确认计划日期覆盖今天；也可以新建一个新的学习计划。"
                  actionHref="/plans/new"
                  actionLabel="新建计划"
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-ink">任务清单</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                      {today.day.tasks.length} 项
                    </span>
                  </div>

                  {today.day.tasks.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        title="今天还没有任务"
                        description="当前计划今天有日期安排，但还没有生成具体任务。"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {today.day.tasks.map((task) => (
                        <TaskCompletionToggle
                          key={task.id}
                          taskId={task.id}
                          initialCompleted={task.is_completed}
                          content={task.content}
                          meta={`${task.estimated_minutes ?? 0} 分钟 · ${task.priority}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <h3 className="font-bold text-ink">复习方法</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {today.day.review_method ?? "今天暂时没有单独的复习方法。"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <h3 className="font-bold text-ink">资料建议</h3>
                    {today.day.resources.length === 0 ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        今天暂时没有资料建议。
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {today.day.resources.map((resource) => (
                          <div key={resource.id} className="rounded-lg bg-white p-3">
                            <p className="font-semibold text-ink">{resource.title}</p>
                            {resource.description ? (
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {resource.description}
                              </p>
                            ) : null}
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
            )}
          </div>

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
