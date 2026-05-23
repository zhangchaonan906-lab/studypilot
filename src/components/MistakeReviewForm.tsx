import type { Plan, TodayTask } from "@/lib/study/types";
import { createMistakeReviewAction } from "@/lib/study/actions";
import { getLocalDateString } from "@/lib/study/forms";
import { ErrorMessage } from "./StatusMessage";
import { SubmitButton } from "./SubmitButton";

export function MistakeReviewForm({
  plan,
  todayTasks,
  error,
}: {
  plan: Plan | null;
  todayTasks: TodayTask[];
  error?: string;
}) {
  return (
    <aside className="sp-card">
      <h2 className="sp-section-title">新增错题</h2>
      <p className="sp-muted mt-2">不用写得很完整，先把错因和下一步行动留下来。</p>
      {error ? (
        <div className="mt-3">
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      ) : null}
      {!plan ? (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          请先创建一个学习计划，再把错题关联到计划中。
        </p>
      ) : (
        <form action={createMistakeReviewAction} className="mt-4 space-y-4">
          <input type="hidden" name="date" value={getLocalDateString()} />
          <input type="hidden" name="plan_id" value={plan.id} />
          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
            当前计划：<span className="font-semibold text-ink">{plan.title}</span>
          </div>
          <label className="block">
            <span className="sp-label">关联今天的任务</span>
            <select
              name="task_id"
              defaultValue=""
              className="sp-input"
            >
              <option value="">不关联具体任务</option>
              {todayTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.content}
                </option>
              ))}
            </select>
          </label>
          <textarea
            name="question"
            rows={4}
            placeholder="题目或错误点"
            className="sp-input resize-none"
          />
          <textarea
            name="mistake_reason"
            rows={4}
            placeholder="错因分析"
            className="sp-input resize-none"
          />
          <textarea
            name="correct_method"
            rows={3}
            placeholder="正确方法"
            className="sp-input resize-none"
          />
          <textarea
            name="next_action"
            rows={3}
            placeholder="下一步行动"
            className="sp-input resize-none"
          />
          <SubmitButton pendingLabel="保存中...">
            保存错题
          </SubmitButton>
        </form>
      )}
    </aside>
  );
}
