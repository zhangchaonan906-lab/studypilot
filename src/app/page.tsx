import Link from "next/link";
import { mockPlans, todayTasks } from "@/lib/site";
import { ProgressBar } from "@/components/ProgressBar";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";

const featureCards = [
  {
    title: "AI 拆解学习目标",
    description: "把考试、课程补习或技能学习拆成每天可以执行的任务。",
    tone: "bg-blue-50 text-primary",
  },
  {
    title: "每日任务打卡",
    description: "按天推进任务，误触也可以取消完成，节奏更可控。",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "复盘与周总结",
    description: "记录当天状态和错题，每周生成清晰的学习报告。",
    tone: "bg-violet-50 text-violet-700",
  },
];

const flowSteps = ["输入目标", "生成计划", "每日执行", "每周总结"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <Link href="/login" className="btn-secondary px-4 py-2">
            登录
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
        <div className="min-w-0">
          <p className="badge-soft mb-4">AI 学习计划生成器</p>
          <h1 className="text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            StudyPilot
          </h1>
          <p className="mt-4 max-w-xl break-words text-lg font-semibold leading-7 text-slate-800 sm:text-xl">
            输入目标，生成每日任务，持续打卡复盘。
          </p>
          <p className="mt-3 max-w-xl break-words text-sm leading-7 text-slate-600 sm:text-base">
            面向大学同学的 AI 学习工具。把备考、课程补习、技能学习拆成清晰的每日计划，并用复盘和周总结稳稳推进。
          </p>
          <div className="mt-6 flex w-full max-w-[calc(100vw-2rem)] flex-col gap-3 sm:max-w-none sm:flex-row">
            <Link href="/plans/new" className="btn-primary">
              开始生成学习计划
            </Link>
            <Link href="/login" className="btn-secondary">
              登录学习台
            </Link>
          </div>
        </div>

        <aside className="sp-card hidden lg:block">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">今日计划</p>
              <h2 className="mt-1 text-lg font-bold text-ink">{mockPlans[0].title}</h2>
            </div>
            <span className="badge-soft">{mockPlans[0].progress}%</span>
          </div>
          <ProgressBar value={mockPlans[0].progress} className="mt-4" />
          <div className="mt-5 space-y-3">
            {todayTasks.slice(0, 3).map((task) => (
              <div key={task.title} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{task.title}</p>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {task.minutes} 分钟
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {task.detail}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article key={feature.title} className="sp-card h-full">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${feature.tone}`}>
                核心能力
              </span>
              <h2 className="mt-4 text-xl font-bold text-ink">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="sp-card mt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">使用流程</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">四步把学习目标跑起来</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              不需要先整理复杂表格，先把目标告诉 StudyPilot，再按每天任务推进。
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-bold text-primary">0{index + 1}</span>
                <p className="mt-2 font-semibold text-ink">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
