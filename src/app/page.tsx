import Link from "next/link";
import { mockPlans, todayTasks, weeklyMetrics } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-soft">
            面向大学同学的 AI 学习计划生成器
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl lg:text-6xl">
            StudyPilot
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            输入学习目标、当前水平和截止日期，把备考、课程补习、技能学习拆成每天能完成的任务。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              开始模拟使用
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
            >
              查看学习台
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">今日计划</p>
                <h2 className="text-xl font-bold text-ink">{mockPlans[0].title}</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-primary">
                {mockPlans[0].progress}%
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {todayTasks.map((task) => (
                <div key={task.title} className="rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <span className="text-sm text-slate-500">{task.minutes} 分钟</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{task.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {weeklyMetrics.slice(0, 2).map((metric) => (
              <div key={metric.label} className="rounded-xl border border-slate-100 p-3">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="mt-1 text-xl font-bold text-ink">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
