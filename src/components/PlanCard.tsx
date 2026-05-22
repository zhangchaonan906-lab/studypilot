import Link from "next/link";

export type PlanCardData = {
  id: string;
  title: string;
  goal: string;
  deadline: string;
  daily_minutes: number;
  status?: string | null;
  overview?: string | null;
};

export function PlanCard({ plan }: { plan: PlanCardData }) {
  return (
    <Link
      href={`/plans/${plan.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-blue-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">
            {plan.status === "completed" ? "已完成" : plan.status === "archived" ? "已归档" : "进行中"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-ink">{plan.title}</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
          {plan.daily_minutes} 分钟/天
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{plan.goal}</p>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>当前进度</span>
          <span>待生成每日安排</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div className="h-2 w-1/5 rounded-full bg-primary" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">截止 {plan.deadline}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {plan.overview ?? "基础计划"}
        </span>
      </div>
    </Link>
  );
}
