"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";
import {
  defaultA3ResourceTypes,
  generateAgentWorkflow,
  generateLearningResources,
  resourceTypeLabels,
} from "@/lib/a3/resource-generation/resource-generator";
import type {
  AgentWorkflowStep,
  GeneratedLearningResource,
  ResourceType,
} from "@/lib/a3/resource-generation/types";

const defaultProfileSummary =
  "大数据管理与应用专业，大二，正在复习数据结构，线性表和二叉树薄弱，每天可学习 2 小时，喜欢代码例题和刷题。";

const topicOptions = [
  { label: "线性表", chapterId: "linear-list", weakPoints: ["线性表"] },
  { label: "栈和队列", chapterId: "stacks-queues", weakPoints: ["栈", "队列"] },
  { label: "串", chapterId: "strings", weakPoints: ["串"] },
  { label: "树与二叉树", chapterId: "trees-binary-trees", weakPoints: ["二叉树"] },
  { label: "图", chapterId: "graphs", weakPoints: ["图"] },
  { label: "查找", chapterId: "searching", weakPoints: ["查找"] },
  { label: "排序", chapterId: "sorting", weakPoints: ["排序"] },
];

const agentPreviewNames = [
  "Profile Agent",
  "Knowledge Agent",
  "Resource Agent",
  "Exercise Agent",
  "Practice Agent",
  "Review Agent",
];

export default function A3ResourcesPage() {
  const [profileSummary, setProfileSummary] = useState(defaultProfileSummary);
  const [selectedTopic, setSelectedTopic] = useState(topicOptions[0].label);
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>(defaultA3ResourceTypes);
  const [resources, setResources] = useState<GeneratedLearningResource[] | null>(null);
  const [workflow, setWorkflow] = useState<AgentWorkflowStep[] | null>(null);
  const selectedTopicOption =
    topicOptions.find((topic) => topic.label === selectedTopic) ?? topicOptions[0];

  function toggleResourceType(type: ResourceType) {
    setSelectedTypes((current) => {
      if (current.includes(type)) {
        return current.filter((item) => item !== type);
      }

      return [...current, type];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resourceTypes = selectedTypes.length > 0 ? selectedTypes : defaultA3ResourceTypes;
    const input = {
      profileSummary: profileSummary.trim() || defaultProfileSummary,
      courseId: "data-structure",
      chapterId: selectedTopicOption.chapterId,
      weakPoints: selectedTopicOption.weakPoints,
      resourceTypes,
    };

    setWorkflow(generateAgentWorkflow(input));
    setResources(generateLearningResources(input));
  }

  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/a3/profile" className="btn-secondary px-3 py-2 text-sm">
              学习画像
            </Link>
            <Link href="/a3/knowledge-base" className="btn-secondary px-3 py-2 text-sm">
              知识库
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <p className="badge-soft mb-4">中国软件杯 A3 赛题适配</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              A3 个性化资源生成中心
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              基于学习画像和数据结构课程知识库，模拟多智能体协同生成课程讲解、思维导图、练习题、代码实操和拓展阅读等个性化学习资源。
            </p>
          </div>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">多智能体流程</h2>
            <div className="mt-3 space-y-2">
              {agentPreviewNames.map((agentName, index) => (
                <div
                  key={agentName}
                  className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-700">{agentName}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <form onSubmit={handleSubmit} className="sp-card mt-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <label className="block">
              <span className="sp-label">学习画像摘要</span>
              <textarea
                value={profileSummary}
                onChange={(event) => setProfileSummary(event.target.value)}
                rows={5}
                className="sp-input mt-2 min-h-32 resize-y"
              />
            </label>

            <div className="space-y-4">
              <label className="block">
                <span className="sp-label">选择知识点或章节</span>
                <select
                  value={selectedTopic}
                  onChange={(event) => setSelectedTopic(event.target.value)}
                  className="sp-input mt-2"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic.label}>{topic.label}</option>
                  ))}
                </select>
              </label>

              <div>
                <span className="sp-label">生成资源类型</span>
                <div className="mt-2 grid gap-2">
                  {defaultA3ResourceTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleResourceType(type)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      {resourceTypeLabels[type]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-5 w-full sm:w-fit">
            生成个性化资源
          </button>
        </form>

        {workflow ? (
          <section className="mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="badge-soft mb-3">Agent Workflow</p>
                <h2 className="text-2xl font-bold text-ink">多智能体生成流程</h2>
              </div>
              <p className="text-sm text-slate-500">本地规则版演示，不调用 AI。</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {workflow.map((step) => (
                <article key={step.id} className="sp-card">
                  <p className="text-sm font-bold text-primary">{step.agentName}</p>
                  <h3 className="mt-2 text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    已完成
                  </span>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {resources ? (
          <section className="mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="badge-soft mb-3">Generated Resources</p>
                <h2 className="text-2xl font-bold text-ink">资源卡片</h2>
              </div>
              <p className="text-sm text-slate-500">
                知识点：{selectedTopicOption.weakPoints.join("、")}
              </p>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {resources.map((resource) => (
                <article key={resource.id} className="sp-card">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-primary">
                        {resourceTypeLabels[resource.type]}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-ink">{resource.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {resource.description}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <p>难度：{resource.difficulty}</p>
                      <p>预计：{resource.estimatedMinutes} 分钟</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.targetConcepts.map((concept) => (
                      <span
                        key={concept}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>

                  <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                    <code>{resource.content}</code>
                  </pre>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-bold text-ink">关键点</p>
                      <p className="text-xs font-semibold text-slate-500">
                        生成智能体：{resource.agentName}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-600">
                      {resource.keyPoints.map((point) => (
                        <li key={point}>· {point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <IcpFooter />
    </main>
  );
}
