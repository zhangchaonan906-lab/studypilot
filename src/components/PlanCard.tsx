import Link from "next/link";
import { Badge } from "./Badge";
import { DeletePlanButton } from "./DeletePlanButton";
import { ProgressBar } from "./ProgressBar";

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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-soft">
      <Link href={`/plans/${plan.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge tone={plan.status === "completed" ? "emerald" : plan.status === "archived" ? "slate" : "blue"}>
              {plan.status === "completed" ? "已完成" : plan.status === "archived" ? "已归档" : "进行中"}
            </Badge>
            <h2 className="mt-1 text-lg font-bold text-ink">{plan.title}</h2>
          </div>
          <Badge tone="violet">{plan.daily_minutes} 分钟/天</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{plan.goal}</p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>当前进度</span>
            <span>打开查看安排</span>
          </div>
          <ProgressBar value={20} className="mt-2" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <Badge tone="slate">截止 {plan.deadline}</Badge>
          <Badge tone="slate">{plan.overview ?? "基础计划"}</Badge>
        </div>
      </Link>
      <DeletePlanButton planId={plan.id} planTitle={plan.title} className="mt-4" />
    </article>
  );
}
