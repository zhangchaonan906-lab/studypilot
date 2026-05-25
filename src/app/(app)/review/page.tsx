import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { MistakeReviewForm } from "@/components/MistakeReviewForm";
import { PageHeader } from "@/components/PageHeader";
import { SuccessMessage } from "@/components/StatusMessage";
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
        description="轻量记录错题、错因和下一步行动，让复习不只停留在“看过一遍”。"
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {params.created ? <SuccessMessage>错题已保存。</SuccessMessage> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="sp-section-title">错题记录</h2>
              <p className="sp-muted mt-1">按日期倒序展示，优先处理最近暴露的问题。</p>
            </div>
            <Badge tone="violet">{mistakes.length} 条</Badge>
          </div>

          {mistakes.length === 0 ? (
            <EmptyState
              title={currentPlan ? "当前计划还没有错题复盘" : "还没有进行中的学习计划"}
              description={
                currentPlan
                  ? "很好，先把第一次遇到的卡点记下来，后续周总结会帮你归纳。"
                  : "先创建一个学习计划，再记录错题复习。"
              }
              actionHref={currentPlan ? undefined : "/plans/new"}
              actionLabel={currentPlan ? undefined : "创建学习计划"}
            />
          ) : (
            <div className="space-y-4">
              {mistakes.map((item) => (
                <article key={item.id} className="sp-card">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Badge tone="slate">{item.date}</Badge>
                      <h3 className="mt-3 break-words text-lg font-bold text-ink">
                        {item.question ?? "未命名错题"}
                      </h3>
                    </div>
                    <Badge tone={item.task_id ? "blue" : "slate"}>
                      {item.task_id ? "已关联任务" : "未关联任务"}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {item.mistake_reason ? (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-ink">错因</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.mistake_reason}
                        </p>
                      </div>
                    ) : null}
                    {item.correct_method ? (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-ink">正确方法</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.correct_method}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {item.next_action ? (
                    <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                      下一步：{item.next_action}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <MistakeReviewForm plan={currentPlan} todayTasks={todayTasks} error={error} />
      </section>
    </>
  );
}
