import { EmptyState } from "@/components/EmptyState";
import { MistakeReviewForm } from "@/components/MistakeReviewForm";
import { PageHeader } from "@/components/PageHeader";
import { getReviewPageData } from "@/lib/study/data";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const { currentPlan, mistakes, todayTasks } = await getReviewPageData();
  const error = params.error ? decodeURIComponent(params.error) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="错题复习"
        title="把错误变成下一次会做"
        description="记录当前学习计划中的错题、错因、正确方法和下一步行动。"
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {params.created ? (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              错题已保存。
            </p>
          ) : null}
          {mistakes.length === 0 ? (
            <EmptyState
              title={currentPlan ? "当前计划还没有错题复盘" : "还没有进行中的学习计划"}
              description={
                currentPlan
                  ? "记录错因和下一步行动后，错题会按日期倒序显示在这里。"
                  : "先创建一个学习计划，再记录错题复习。"
              }
              actionHref={currentPlan ? undefined : "/plans/new"}
              actionLabel={currentPlan ? undefined : "创建学习计划"}
            />
          ) : (
            mistakes.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary">{item.date}</p>
                    <h2 className="mt-1 text-lg font-bold text-ink">
                      {item.question ?? "未命名错题"}
                    </h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {item.task_id ? "已关联任务" : "未关联任务"}
                  </span>
                </div>
                {item.mistake_reason ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    错因：{item.mistake_reason}
                  </p>
                ) : null}
                {item.correct_method ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    正确方法：{item.correct_method}
                  </p>
                ) : null}
                {item.next_action ? (
                  <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    下一步：{item.next_action}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>

        <MistakeReviewForm plan={currentPlan} todayTasks={todayTasks} error={error} />
      </section>
    </>
  );
}
