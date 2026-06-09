import type { Metadata } from "next";
import Link from "next/link";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";

export const metadata: Metadata = {
  title: "A3 系统保障与开发说明 - StudyPilot",
  description: "StudyPilot A3 参赛版的内容可靠性、内容安全、开发工具、测试与部署说明",
};

const reliabilityItems = [
  "基于“数据结构课程知识库”生成资源，避免脱离课程内容编造。",
  "资源生成会引用章节知识点、重点难点、易错点、代码案例和复习建议。",
  "不生成不存在的网址和虚假引用。",
  "找不到知识点时返回中文兜底提示，让用户重新选择章节或关键词。",
  "通过测试过滤明显套话和缺少依据的表述。",
  "生成内容偏向复习资料风格，减少宣传话术。",
];

const safetyItems = [
  "不展示用户敏感信息。",
  "不输出 API Key、service role key、环境变量。",
  "不使用危险 HTML 渲染接口。",
  "用户输入内容仅作为学习画像和资源生成上下文。",
  "页面不渲染用户提供的 HTML。",
  "学习资源内容限制在高校课程学习场景内。",
];

const agentProgress = [
  {
    name: "Profile Agent",
    description: "学习画像分析，识别专业背景、目标、基础、薄弱点和资源偏好。",
  },
  {
    name: "Knowledge Agent",
    description: "课程知识库匹配，把薄弱点定位到数据结构章节和知识点。",
  },
  {
    name: "Resource Agent",
    description: "课程讲解与拓展资料生成，输出适合复习笔记的内容。",
  },
  {
    name: "Exercise Agent",
    description: "练习题与解析生成，覆盖选择题、简答题和算法题。",
  },
  {
    name: "Practice Agent",
    description: "代码实操案例生成，补充目标、思路、代码片段和易错边界。",
  },
  {
    name: "Evaluation Agent",
    description: "学习效果评估，根据任务、专注、错题、笔记和资源反馈给出后续建议。",
  },
];

const markdownItems = [
  "使用卡片展示讲解文档、思维导图、练习题、代码案例、拓展阅读。",
  "代码内容使用 pre/code 展示。",
  "思维导图先使用层级文本展示，方便直接放进复习资料。",
  "图片和文件附件由原有学习笔记模块支持。",
  "当前 A3 资源生成页面不使用危险 HTML 渲染。",
];

const aiCodingItems = [
  "项目开发过程中使用过 Codex / Claude Code 等 AI 辅助编程工具，用于代码生成、重构建议、测试补充和文档草拟。",
  "最终代码由团队成员人工审查、运行测试、构建验证后提交。",
  "AI 工具不直接接触 .env.local、API Key、service role key 等敏感信息。",
  "所有功能需通过 test/build/lint 后合并。",
];

const techStackItems = [
  {
    name: "Next.js",
    note: "应用框架与路由组织。",
  },
  {
    name: "React",
    note: "页面组件与交互界面。",
  },
  {
    name: "TypeScript",
    note: "类型约束和业务结构定义。",
  },
  {
    name: "Supabase Auth",
    note: "登录注册和用户会话。",
  },
  {
    name: "Supabase PostgreSQL",
    note: "学习计划、笔记、任务等数据存储。",
  },
  {
    name: "Supabase Storage",
    note: "学习笔记图片和文件附件存储。",
  },
  {
    name: "Vercel",
    note: "正式站点部署与自动发布。",
  },
  {
    name: "Zod / 项目 schema 校验",
    note: "用于结构化输入输出校验。",
  },
  {
    name: "Vitest / ESLint",
    note: "自动化测试和代码质量检查。",
  },
];

const deploymentItems = [
  "npm.cmd run test",
  "npm.cmd run build",
  "npm.cmd run lint",
  "Vercel 自动部署",
  "正式域名：www.studypilot.cn",
  "A3 演示入口：www.studypilot.cn/a3",
  "不提交 .env.local",
  "使用 .env.example 说明环境变量",
];

export default function A3SystemPage() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/a3" className="btn-secondary px-3 py-2 text-sm">
              演示中心
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
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <p className="badge-soft mb-4">中国软件杯 A3 赛题适配</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              A3 系统保障与开发说明
            </h1>
            <p className="mt-4 text-lg font-semibold leading-8 text-primary">
              防幻觉、内容安全、开发工具与部署测试说明
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              本页面用于展示 StudyPilot A3 参赛版在内容可靠性、资源生成安全、开发过程、开源工具使用和系统部署测试方面的设计说明。
            </p>
          </div>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">说明范围</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["防幻觉", "内容安全", "生成进度", "技术栈", "测试部署"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </aside>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <InfoSection title="防幻觉机制" items={reliabilityItems} />
          <InfoSection title="内容安全策略" items={safetyItems} />
        </div>

        <section className="sp-card mt-8">
          <div>
            <p className="badge-soft mb-3">Agent Progress</p>
            <h2 className="text-2xl font-bold text-ink">多智能体进度机制</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              当前参赛版采用阶段卡片展示多智能体执行状态。后续可以接入真实流式输出或分阶段 API 回调。
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {agentProgress.map((agent, index) => (
              <article key={agent.name} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-primary ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-ink">{agent.name}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{agent.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <InfoSection
            title="Markdown 与多模态内容展示说明"
            items={markdownItems}
          />
          <InfoSection title="AI Coding 工具使用说明" items={aiCodingItems} />
        </div>

        <section className="sp-card mt-8">
          <div>
            <p className="badge-soft mb-3">Open Source Stack</p>
            <h2 className="text-2xl font-bold text-ink">开源工具与技术栈说明</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              参赛文档中将列出具体版本、来源与协议。页面这里只展示当前系统实际使用的主要技术栈。
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {techStackItems.map((item) => (
              <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-bold text-ink">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sp-card mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="badge-soft mb-3">Test & Deploy</p>
              <h2 className="text-2xl font-bold text-ink">测试与部署说明</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                每次功能提交前运行测试、构建和 lint。正式站点通过 Vercel 自动部署，环境变量由平台配置，不进入 Git 仓库。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <a
                href="https://www.studypilot.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                正式域名
              </a>
              <a
                href="https://www.studypilot.cn/a3"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                A3 演示入口
              </a>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {deploymentItems.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>

      <IcpFooter />
    </main>
  );
}

function InfoSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="sp-card">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
