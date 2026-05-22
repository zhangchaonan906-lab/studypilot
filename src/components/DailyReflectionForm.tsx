import type { DailyReflection, Plan } from "@/lib/study/types";
import { saveDailyReflectionAction } from "@/lib/study/actions";
import { getLocalDateString } from "@/lib/study/forms";

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
  const messageClass =
    messageType === "error"
      ? "bg-red-50 text-red-700"
      : "bg-blue-50 text-blue-800";

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <h2 className="text-lg font-bold text-ink">今日复盘</h2>
      {message ? (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${messageClass}`}>{message}</p>
      ) : null}
      {reflection ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
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
            <span className="text-sm font-semibold text-slate-700">关联计划</span>
            <select
              name="plan_id"
              defaultValue={reflection?.plan_id ?? plans[0].id}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">学习状态</span>
            <select
              name="mood"
              defaultValue={reflection?.mood ?? "正常"}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            >
              <option value="轻松">轻松</option>
              <option value="正常">正常</option>
              <option value="疲惫">疲惫</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">难度感受</span>
            <select
              name="difficulty"
              defaultValue={reflection?.difficulty ?? "刚好"}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            >
              <option value="太简单">太简单</option>
              <option value="刚好">刚好</option>
              <option value="太难">太难</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">复盘记录</span>
            <textarea
              name="note"
              rows={5}
              defaultValue={reflection?.note ?? ""}
              placeholder="今天哪里顺利？哪里卡住？明天要调整什么？"
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            保存复盘
          </button>
        </form>
      )}
    </aside>
  );
}
