import type { Metadata } from "next";
import Link from "next/link";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";

export const metadata: Metadata = {
  title: "StudyPilot A3 参赛版演示中心",
  description: "中国软件杯 A3 赛题参赛版演示入口",
};

const moduleCards = [
  {
    title: "数据结构课程知识库",
    requirement: "至少一门完整高校专业课程知识库",
    description:
      "整理数据结构 8 个章节、核心知识点、重点难点、常见题型、代码案例和复习建议。",
    href: "/a3/knowledge-base",
    action: "查看知识库",
  },
  {
    title: "对话式学习画像",
    requirement: "自然语言构建动态学生画像",
    description:
      "用户用一段话描述专业、目标、基础、薄弱点和偏好，系统抽取不少于 6 个画像维度。",
    href: "/a3/profile",
    action: "生成学习画像",
  },
  {
    title: "多智能体资源生成",
    requirement: "协同生成至少 5 类个性化资源",
    description:
      "根据画像和知识点生成课程讲解、思维导图、练习题、代码实操和拓展阅读。",
    href: "/a3/resources",
    action: "生成资源",
  },
  {
    title: "学习效果评估",
    requirement: "跟踪学习行为并调整资源推荐",
    description:
      "结合任务完成、专注时长、错题数量、笔记情况和资源反馈，给出下一步建议。",
    href: "/a3/evaluation",
    action: "查看评估",
  },
];

const demoSteps = [
  {
    title: "第一步：查看数据结构课程知识库",
    description: "先让评委看到课程章节、知识点、题型和代码案例来自固定知识库。",
    href: "/a3/knowledge-base",
  },
  {
    title: "第二步：输入自然语言，生成学习画像",
    description: "用一段学生自述抽取专业背景、学习目标、薄弱点和资源偏好。",
    href: "/a3/profile",
  },
  {
    title: "第三步：基于画像和知识点生成 5 类资源",
    description: "选择线性表、二叉树等知识点，展示多智能体生成资源卡片。",
    href: "/a3/resources",
  },
  {
    title: "第四步：根据任务完成、错题和资源反馈生成评估报告",
    description: "用学习行为数据给出掌握程度、风险点、路径调整和下一轮资源推荐。",
    href: "/a3/evaluation",
  },
];

const agentChain = [
  {
    name: "Profile Agent",
    description: "抽取学习画像",
  },
  {
    name: "Knowledge Agent",
    description: "匹配课程知识库",
  },
  {
    name: "Resource Agent",
    description: "生成讲解与拓展资料",
  },
  {
    name: "Exercise Agent",
    description: "生成练习题与解析",
  },
  {
    name: "Practice Agent",
    description: "生成代码实操案例",
  },
  {
    name: "Evaluation Agent",
    description: "生成学习效果评估与后续建议",
  },
];

const resourceTypes = [
  {
    title: "课程讲解文档",
    description: "说明这个知识点考什么、容易混淆什么，适合放进复习笔记。",
  },
  {
    title: "知识点思维导图",
    description: "用层级文本展示概念关系，帮助快速梳理章节结构。",
  },
  {
    title: "练习题与答案解析",
    description: "包含选择题、简答题和算法题，答案后面跟简短解析。",
  },
  {
    title: "代码实操案例",
    description: "优先用 C 语言风格，覆盖目标、思路、代码片段和易错边界。",
  },
  {
    title: "拓展阅读材料",
    description: "给出复习方向、检索关键词和对比知识点，不编造外部链接。",
  },
];

const ctaLinks = [
  {
    label: "开始演示",
    href: "/a3/knowledge-base",
    primary: true,
  },
  {
    label: "生成学习画像",
    href: "/a3/profile",
  },
  {
    label: "生成个性化资源",
    href: "/a3/resources",
  },
  {
    label: "查看学习评估",
    href: "/a3/evaluation",
  },
];

export default function A3DemoCenterPage() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/a3/knowledge-base" className="btn-secondary px-3 py-2 text-sm">
              知识库
            </Link>
            <Link href="/a3/profile" className="btn-secondary px-3 py-2 text-sm">
              学习画像
            </Link>
            <Link href="/a3/resources" className="btn-secondary px-3 py-2 text-sm">
              资源生成
            </Link>
            <Link href="/a3/evaluation" className="btn-secondary px-3 py-2 text-sm">
              学习评估
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <p className="badge-soft mb-4">中国软件杯 A3 赛题适配</p>
            <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              StudyPilot A3 参赛版演示中心
            </h1>
            <p className="mt-4 text-lg font-semibold leading-8 text-primary">
              基于大模型的个性化资源生成与学习多智能体系统开发
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              本页面用于展示 StudyPilot 面向中国软件杯 A3 赛题的参赛版能力，包括课程知识库、对话式学习画像、多智能体资源生成和学习效果评估。
            </p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              围绕数据结构课程，构建从学习画像、知识库匹配、资源生成到效果评估的个性化学习闭环。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/a3/knowledge-base" className="btn-primary">
                开始演示
              </Link>
              <Link href="/a3/profile" className="btn-secondary">
                生成学习画像
              </Link>
            </div>
          </div>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">演示重点</h2>
            <div className="mt-4 grid gap-3">
              <HeroMetric label="课程" value="数据结构" />
              <HeroMetric label="演示模块" value="4 个" />
              <HeroMetric label="资源类型" value="5 类" />
              <HeroMetric label="实现方式" value="本地规则版原型" />
            </div>
          </aside>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="badge-soft mb-3">A3 Requirements</p>
              <h2 className="text-2xl font-bold text-ink">A3 赛题能力对应</h2>
            </div>
            <p className="text-sm text-slate-500">评委可以从这里直接进入每个演示模块。</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {moduleCards.map((module) => (
              <article key={module.href} className="sp-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-primary">{module.requirement}</p>
                    <h3 className="mt-2 text-xl font-bold text-ink">{module.title}</h3>
                  </div>
                  <Link href={module.href} className="btn-secondary shrink-0 px-3 py-2 text-sm">
                    {module.action}
                  </Link>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{module.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div>
            <p className="badge-soft mb-3">Demo Flow</p>
            <h2 className="text-2xl font-bold text-ink">推荐演示顺序</h2>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            {demoSteps.map((step, index) => (
              <Link
                key={step.href}
                href={step.href}
                className="sp-card block transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-bold leading-6 text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="sp-card mt-8">
          <div>
            <p className="badge-soft mb-3">Agent Chain</p>
            <h2 className="text-2xl font-bold text-ink">多智能体架构</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              演示版先用本地规则把协作链路跑通，后续接入真实模型时，每个 Agent 可以替换为独立提示词、工具调用和安全校验。
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {agentChain.map((agent, index) => (
              <article key={agent.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  {index < agentChain.length - 1 ? (
                    <span className="text-sm font-bold text-slate-400">→</span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-sm font-bold text-ink">{agent.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{agent.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="badge-soft mb-3">Generated Resources</p>
              <h2 className="text-2xl font-bold text-ink">资源生成能力</h2>
            </div>
            <p className="text-sm text-slate-500">基于数据结构知识库生成，不编造外部链接。</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {resourceTypes.map((resource) => (
              <article key={resource.title} className="sp-card">
                <h3 className="text-base font-bold text-ink">{resource.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="sp-card mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="badge-soft mb-3">Start Demo</p>
              <h2 className="text-2xl font-bold text-ink">按比赛讲解顺序开始</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                建议先展示知识库，再演示画像抽取、资源生成和效果评估。这样评委能看到数据来源、生成过程和反馈结果。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {ctaLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={link.primary ? "btn-primary" : "btn-secondary"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>

      <IcpFooter />
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}
