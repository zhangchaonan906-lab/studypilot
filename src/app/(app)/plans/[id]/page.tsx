import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TaskCompletionToggle } from "@/components/TaskCompletionToggle";
import { getPlanDetail } from "@/lib/study/data";

export const dynamic = "force-dynamic";

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

  return (
    <>
      <PageHeader
        eyebrow="计划详情"
        title={plan.title}
        description={plan.goal}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">截止日期</p>
          <p className="mt-2 text-xl font-bold text-ink">{plan.deadline}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">每天学习</p>
          <p className="mt-2 text-xl font-bold text-ink">{plan.daily_minutes} 分钟</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">计划状态</p>
          <p className="mt-2 text-xl font-bold text-ink">{plan.status}</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">每日安排预览</h2>
            <p className="mt-1 text-sm text-slate-500">从 plan_days、tasks 和 resources 读取。</p>
          </div>
          <Link href="/today" className="text-sm font-semibold text-primary">
            查看今日任务
          </Link>
        </div>

        {days.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="这个计划还没有每日安排"
              description="当前 Issue 只创建基础计划，不自动生成 plan_days、tasks 或 resources。你可以先在 Supabase 中手动插入数据测试详情页读取。"
            />
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {days.map((day) => (
              <article key={day.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold text-ink">
                    Day {day.day_index} · {day.title}
                  </h3>
                  <span className="text-sm text-slate-500">{day.date}</span>
                </div>
                {day.summary ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{day.summary}</p>
                ) : null}
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-bold text-ink">任务</h4>
                    {day.tasks.length === 0 ? (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-500">
                        暂无任务
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {day.tasks.map((task) => (
                          <li key={task.id} className="flex gap-3 rounded-lg bg-white px-3 py-2">
                            <TaskCompletionToggle
                              taskId={task.id}
                              initialCompleted={task.is_completed}
                            />
                            <span className="text-sm leading-6 text-slate-700">{task.content}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">学习资源</h4>
                    {day.resources.length === 0 ? (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-500">
                        暂无资源
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {day.resources.map((resource) => (
                          <li key={resource.id} className="rounded-lg bg-white px-3 py-2">
                            <p className="text-sm font-semibold text-ink">{resource.title}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {resource.description ?? resource.search_keywords ?? "暂无说明"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {day.review_method ? (
                  <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    复习方法：{day.review_method}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
