import type { DailyReflection, Plan } from "@/lib/study/types";
import { saveDailyReflectionAction } from "@/lib/study/actions";
import { getLocalDateString } from "@/lib/study/forms";
import { ErrorMessage, SuccessMessage } from "./StatusMessage";
import { SubmitButton } from "./SubmitButton";

export function DailyReflectionForm({
  plans,
  reflection,
  message,
  messageType = "success",
}: {
  plans: Plan[];
  reflection?: DailyReflection;
  message?: string;
  messageType?: "success" | "error";
}) {
  return (
    <aside className="sp-card">
      <h2 className="sp-section-title">今日复盘</h2>
      <p className="sp-muted mt-2">用一分钟记录状态，之后周总结会更准确。</p>
      {message ? (
        <div className="mt-3">
          {messageType === "error" ? (
            <ErrorMessage>{message}</ErrorMessage>
          ) : (
            <SuccessMessage>{message}</SuccessMessage>
          )}
        </div>
      ) : null}
      {reflection ? (
        <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          今天已经提交过复盘，可以继续编辑。
        </p>
      ) : null}
      {plans.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          还没有计划，创建基础计划后就可以记录每日复盘。
        </p>
      ) : (
        <form action={saveDailyReflectionAction} className="mt-4 space-y-4">
          <input type="hidden" name="date" value={getLocalDateString()} />
          <label className="block">
            <span className="sp-label">关联计划</span>
            <select
              name="plan_id"
              defaultValue={reflection?.plan_id ?? plans[0].id}
              className="sp-input"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sp-label">学习状态</span>
            <select
              name="mood"
              defaultValue={reflection?.mood ?? "正常"}
              className="sp-input"
            >
              <option value="轻松">轻松</option>
              <option value="正常">正常</option>
              <option value="疲惫">疲惫</option>
            </select>
          </label>
          <label className="block">
            <span className="sp-label">难度感受</span>
            <select
              name="difficulty"
              defaultValue={reflection?.difficulty ?? "刚好"}
              className="sp-input"
            >
              <option value="太简单">太简单</option>
              <option value="刚好">刚好</option>
              <option value="太难">太难</option>
            </select>
          </label>
          <label className="block">
            <span className="sp-label">复盘记录</span>
            <textarea
              name="note"
              rows={5}
              defaultValue={reflection?.note ?? ""}
              placeholder="今天哪里顺利？哪里卡住？明天要调整什么？"
              className="sp-input resize-none"
            />
          </label>
          <SubmitButton pendingLabel="保存中...">
            保存复盘
          </SubmitButton>
        </form>
      )}
    </aside>
  );
}
