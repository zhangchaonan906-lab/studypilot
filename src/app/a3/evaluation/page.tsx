"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";
import {
  generateEvaluationAgentWorkflow,
  generateLearningEvaluation,
} from "@/lib/a3/evaluation/learning-evaluation";
import type {
  EvaluationAgentStep,
  LearningEvaluationReport,
  ResourceFeedback,
} from "@/lib/a3/evaluation/types";

const defaultProfileSummary =
  "大数据管理与应用专业，大二，正在复习数据结构，线性表和二叉树薄弱，每天可学习 2 小时，喜欢代码例题和刷题。";

const conceptOptions = ["线性表", "栈", "队列", "串", "二叉树", "图", "查找", "排序"];

const resourceFeedbackOptions: ResourceFeedback[] = ["很有帮助", "一般", "帮助不大"];

const agentPreviewNames = [
  "Behavior Agent",
  "Weakness Agent",
  "Resource Feedback Agent",
  "Evaluation Agent",
  "Recommendation Agent",
];

export default function A3EvaluationPage() {
  const [profileSummary, setProfileSummary] = useState(defaultProfileSummary);
  const [completedTasks, setCompletedTasks] = useState(6);
  const [totalTasks, setTotalTasks] = useState(10);
  const [focusMinutes, setFocusMinutes] = useState(75);
  const [mistakeCount, setMistakeCount] = useState(5);
  const [noteCount, setNoteCount] = useState(1);
  const [resourceFeedback, setResourceFeedback] = useState<ResourceFeedback>("一般");
  const [selectedWeakPoints, setSelectedWeakPoints] = useState<string[]>([
    "线性表",
    "二叉树",
  ]);
  const [recentConceptInput, setRecentConceptInput] = useState("二叉树、递归遍历");
  const [report, setReport] = useState<LearningEvaluationReport | null>(null);
  const [workflow, setWorkflow] = useState<EvaluationAgentStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognizedKnowledgeConcepts = useMemo(
    () =>
      conceptOptions.filter((concept) =>
        [...selectedWeakPoints, ...parseConcepts(recentConceptInput)].some((item) =>
          item.includes(concept),
        ),
      ),
    [recentConceptInput, selectedWeakPoints],
  );

  function toggleWeakPoint(concept: string) {
    setSelectedWeakPoints((current) =>
      current.includes(concept)
        ? current.filter((item) => item !== concept)
        : [...current, concept],
    );
  }

  function fillDataStructureExample() {
    setProfileSummary(defaultProfileSummary);
    setCompletedTasks(6);
    setTotalTasks(10);
    setFocusMinutes(75);
    setMistakeCount(5);
    setNoteCount(1);
    setResourceFeedback("一般");
    setSelectedWeakPoints(["线性表", "二叉树"]);
    setRecentConceptInput("二叉树、递归遍历、线性表");
    setError(null);
    setReport(null);
    setWorkflow(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (totalTasks <= 0) {
      setReport(null);
      setWorkflow(null);
      setError("请填写有效的任务数量。");
      return;
    }

    setError(null);
    setWorkflow(generateEvaluationAgentWorkflow());
    setReport(
      generateLearningEvaluation({
        profileSummary: profileSummary.trim() || defaultProfileSummary,
        courseId: "data-structure",
        weakPoints: selectedWeakPoints,
        completedTasks,
        totalTasks,
        focusMinutes,
        mistakeCount,
        noteCount,
        resourceFeedback,
        recentConcepts: parseConcepts(recentConceptInput),
      }),
    );
  }

  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/a3/profile" className="btn-secondary px-3 py-2 text-sm">
              学习画像
            </Link>
            <Link href="/a3/resources" className="btn-secondary px-3 py-2 text-sm">
              资源生成
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
              A3 学习效果评估
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              根据任务完成、专注时长、错题数量、笔记情况和资源反馈，生成学习效果评估报告，并调整后续学习路径与资源推荐。
            </p>
          </div>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">评估智能体流程</h2>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="sp-section-title">学习数据输入</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                这里先用本地规则演示评估逻辑。后续可以接入真实任务、专注、错题和资源反馈数据。
              </p>
            </div>
            <button
              type="button"
              onClick={fillDataStructureExample}
              className="btn-secondary shrink-0"
            >
              填入数据结构复习示例
            </button>
          </div>

          <label className="mt-5 block">
            <span className="sp-label">学习画像摘要</span>
            <textarea
              value={profileSummary}
              onChange={(event) => setProfileSummary(event.target.value)}
              rows={4}
              className="sp-input mt-2 min-h-28 resize-y"
            />
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <NumberField
              label="已完成任务数"
              value={completedTasks}
              onChange={setCompletedTasks}
            />
            <NumberField label="总任务数" value={totalTasks} onChange={setTotalTasks} />
            <NumberField
              label="今日专注分钟数"
              value={focusMinutes}
              onChange={setFocusMinutes}
            />
            <NumberField label="错题数量" value={mistakeCount} onChange={setMistakeCount} />
            <NumberField label="笔记数量" value={noteCount} onChange={setNoteCount} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <span className="sp-label">薄弱知识点</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {conceptOptions.map((concept) => (
                  <label
                    key={concept}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWeakPoints.includes(concept)}
                      onChange={() => toggleWeakPoint(concept)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    {concept}
                  </label>
                ))}
              </div>

              <label className="mt-4 block">
                <span className="sp-label">最近学习知识点</span>
                <input
                  value={recentConceptInput}
                  onChange={(event) => setRecentConceptInput(event.target.value)}
                  className="sp-input mt-2"
                  placeholder="例如：二叉树、递归遍历、线性表"
                />
              </label>
            </div>

            <label className="block">
              <span className="sp-label">资源反馈</span>
              <select
                value={resourceFeedback}
                onChange={(event) =>
                  setResourceFeedback(event.target.value as ResourceFeedback)
                }
                className="sp-input mt-2"
              >
                {resourceFeedbackOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                如果资源“帮助不大”，系统会更偏向推荐练习题、代码案例、图解资料和错题对照。
              </p>
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary mt-5 w-full sm:w-fit">
            生成评估报告
          </button>
        </form>

        {workflow ? (
          <section className="mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="badge-soft mb-3">Agent Evaluation</p>
                <h2 className="text-2xl font-bold text-ink">多智能体评估过程</h2>
              </div>
              <p className="text-sm text-slate-500">本地规则版演示，不调用 AI。</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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

        {report ? (
          <section className="mt-6">
            {recognizedKnowledgeConcepts.length > 0 ? (
              <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                <p className="font-semibold">已根据数据结构知识库调整学习路径。</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recognizedKnowledgeConcepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="sp-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="badge-soft mb-3">Learning Report</p>
                  <h2 className="text-2xl font-bold text-ink">评估报告卡片</h2>
                </div>
                <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-primary">
                  掌握程度：{report?.masteryLevel ?? "待生成"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MetricCard label="任务完成率" value={`${report.completionRate}%`} />
                <MetricCard label="专注状态" value={report.focusLevel} />
                <MetricCard label="资源反馈" value={resourceFeedback} />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-ink">总结</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {report.summary}
                </p>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <ReportList title="风险点" items={report.riskPoints} />
                <ReportList title="当前优势" items={report.strengths} />
                <ReportList title="下一步建议" items={report.nextStepSuggestions} />
                <ReportList title="推荐资源类型" items={report.recommendedResourceTypes} />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-bold text-ink">调整后的学习路径</h3>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {report.adjustedLearningPath.map((item, index) => (
                    <li key={item} className="flex gap-2">
                      <span className="font-bold text-primary">{index + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        ) : null}
      </section>

      <IcpFooter />
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="sp-label">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(toSafeNumber(event.target.value))}
        className="sp-input mt-2"
      />
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function parseConcepts(value: string) {
  return value
    .split(/[、,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSafeNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? Math.max(nextValue, 0) : 0;
}
