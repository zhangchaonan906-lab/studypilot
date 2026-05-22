import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { WeeklySummaryGenerator } from "@/components/WeeklySummaryGenerator";
import { getWeeklyPageData } from "@/lib/study/data";

export const dynamic = "force-dynamic";

export default async function WeeklyPage() {
  const { currentPlan, summaries, currentWeek } = await getWeeklyPageData();
  const latest = summaries[0];
  const hasWeeklyData = Boolean(
    currentWeek &&
      (currentWeek.taskCount > 0 ||
        currentWeek.reflectionCount > 0 ||
        currentWeek.mistakeCount > 0)
  );
  const metrics = [
    {
      label: "当前计划",
      value: currentPlan ? currentPlan.title : "--",
      hint: currentPlan ? "最近创建的 active plan" : "暂无进行中的计划",
    },
    {
      label: "本周任务",
      value: currentWeek ? String(currentWeek.taskCount) : "--",
      hint: currentWeek
        ? `${currentWeek.startDate} 至 ${currentWeek.endDate}`
        : "暂无本周范围",
    },
    {
      label: "本周复盘",
      value: currentWeek ? String(currentWeek.reflectionCount) : "--",
      hint: "来自 daily_reflections",
    },
    {
      label: "本周错题",
      value: currentWeek ? String(currentWeek.mistakeCount) : "--",
      hint: "来自 mistake_reviews",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="周总结"
        title="把这一周的学习状态收束一下"
        description="基于任务完成情况、每日复盘和错题记录生成 AI 学习总结。"
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      {!currentPlan || !currentWeek ? (
        <section className="mt-6">
          <EmptyState
            title="还没有进行中的学习计划"
            description="先创建并生成学习计划，之后就可以在这里生成每周 AI 总结。"
            actionHref="/plans/new"
            actionLabel="创建学习计划"
          />
        </section>
      ) : (
        <section className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
            <p className="text-sm font-semibold text-primary">
              第 {currentWeek.weekIndex} 周
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">生成本周总结</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              范围：{currentWeek.startDate} 至 {currentWeek.endDate}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-slate-50 px-2 py-3">
                <p className="font-bold text-ink">{currentWeek.taskCount}</p>
                <p className="mt-1 text-slate-500">任务</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-3">
                <p className="font-bold text-ink">{currentWeek.reflectionCount}</p>
                <p className="mt-1 text-slate-500">复盘</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2 py-3">
                <p className="font-bold text-ink">{currentWeek.mistakeCount}</p>
                <p className="mt-1 text-slate-500">错题</p>
              </div>
            </div>

            {!hasWeeklyData ? (
              <div className="mt-4 rounded-lg bg-blue-50 px-3 py-3 text-sm leading-6 text-blue-900">
                本周还没有可分析的学习数据。完成任务、写复盘或记录错题后再生成总结。
              </div>
            ) : null}

            <div className="mt-5">
              <WeeklySummaryGenerator
                planId={currentPlan.id}
                weekIndex={currentWeek.weekIndex}
                startDate={currentWeek.startDate}
                endDate={currentWeek.endDate}
                disabled={!hasWeeklyData}
              />
            </div>
          </aside>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">历史周总结</h2>
                <p className="mt-1 text-sm text-slate-500">
                  同一计划同一周再次生成时，会更新原总结。
                </p>
              </div>
              {latest ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-primary">
                  最近：第 {latest.week_index} 周
                </span>
              ) : null}
            </div>

            {summaries.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="还没有周总结"
                  description="点击生成后，AI 会把本周任务完成、每日复盘和错题记录整理成总结。"
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {summaries.map((summary) => (
                  <article key={summary.id} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-bold text-ink">
                        第 {summary.week_index} 周总结
                      </h3>
                      <span className="text-sm text-slate-500">
                        {summary.start_date} - {summary.end_date}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">
                        完成率{" "}
                        {summary.completion_rate === null ||
                        summary.completion_rate === undefined
                          ? "--"
                          : `${Number(summary.completion_rate).toFixed(0)}%`}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <SummaryBlock title="总结" content={summary.summary} />
                      <SummaryBlock title="做得好的地方" content={summary.strengths} />
                      <SummaryBlock title="需要改进的问题" content={summary.weaknesses} />
                      <SummaryBlock
                        title="下周建议"
                        content={summary.next_week_advice}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function SummaryBlock({ title, content }: { title: string; content: string | null }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {content ?? "暂无内容"}
      </p>
    </div>
  );
}
