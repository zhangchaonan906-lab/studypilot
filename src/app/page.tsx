import Link from "next/link";
import { capabilityCards, learningLoopSteps, sceneTags } from "@/lib/site";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist">
      {/* Header */}
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

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:pt-16 lg:pb-16">
        <div className="min-w-0">
          <p className="badge-soft mb-4">AI 学习计划工作台</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            把学习目标，
            <br />
            拆成每天能完成的任务。
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            从考试复习到技能学习，StudyPilot 帮你把模糊目标变成清晰节奏，让每一天都知道下一步该做什么。
          </p>
          <div className="mt-6">
            <p className="text-xl tracking-widest text-slate-300 select-none">
              🐾 🐾 🐾
            </p>
            <p className="mt-2 text-sm text-slate-400">
              每一步坚持，都会留下痕迹。
            </p>
          </div>
        </div>

        {/* Welcome card — desktop */}
        <aside className="sp-card hidden lg:block">
          <div className="flex items-center gap-2.5">
            <StudyPilotLogo size={28} />
            <h2 className="text-lg font-bold text-ink">Welcome to StudyPilot</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Turn your study goals into daily progress.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            写下目标，生成计划，完成今日任务，用猫爪记录你的坚持。
          </p>
          <p className="mt-4 text-sm font-semibold text-ink">
            Start small.
            <br />
            Begin with a 7-day plan.
          </p>
          <Link href="/plans/new" className="btn-primary mt-5 w-full text-center">
            开始生成学习计划
          </Link>
        </aside>

        {/* Welcome card — mobile */}
        <aside className="sp-card lg:hidden">
          <div className="flex items-center gap-2.5">
            <StudyPilotLogo size={24} />
            <h2 className="text-base font-bold text-ink">Welcome to StudyPilot</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Turn your study goals into daily progress.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            写下目标，生成计划，完成今日任务，用猫爪记录你的坚持。
          </p>
          <p className="mt-3 text-sm font-semibold text-ink">
            Start small. Begin with a 7-day plan.
          </p>
          <Link href="/plans/new" className="btn-primary mt-4 w-full text-center">
            开始生成学习计划
          </Link>
        </aside>
      </section>

      {/* Learning loop */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-primary">学习闭环</p>
          <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            从目标到执行，形成学习闭环
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {learningLoopSteps.map((step) => (
            <div key={step.step} className="sp-card text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                {step.icon}
              </span>
              <div className="mt-3">
                <span className="text-xs font-bold text-primary">0{step.step}</span>
                <h3 className="mt-1 font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core capabilities */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-primary">核心能力</p>
          <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            覆盖学习全流程的工具集
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilityCards.map((card) => (
            <article key={card.title} className="sp-card">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">
                {card.icon}
              </span>
              <span className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.tone}`}>
                {card.title}
              </span>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Learning scenes */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="sp-card text-center">
          <p className="text-sm font-semibold text-primary">学习场景</p>
          <h2 className="mt-1 text-xl font-bold text-ink">适合这些学习场景</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {sceneTags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <IcpFooter />
    </main>
  );
}
