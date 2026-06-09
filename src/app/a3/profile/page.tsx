"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";
import {
  extractLearningProfileFromText,
  getRecognizedDataStructureConcepts,
} from "@/lib/a3/profile/profile-extraction";
import type { LearningProfile } from "@/lib/a3/profile/types";

const exampleProfileText =
  "我是大数据管理与应用专业大二学生，最近要复习数据结构，线性表和二叉树比较薄弱，期末还有 20 天，每天能学 2 小时，喜欢代码例题和刷题。";

export default function A3ProfilePage() {
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognizedConcepts = useMemo(
    () => (profile ? getRecognizedDataStructureConcepts(input) : []),
    [input, profile],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!input.trim()) {
      setProfile(null);
      setError("请先描述你的学习情况。");
      return;
    }

    setError(null);
    setProfile(extractLearningProfileFromText(input));
  }

  function handleUseExample() {
    setInput(exampleProfileText);
    setError(null);
    setProfile(null);
  }

  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <Link href="/a3/knowledge-base" className="btn-secondary px-4 py-2">
            数据结构知识库
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <p className="badge-soft mb-4">中国软件杯 A3 赛题适配</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              A3 对话式学习画像
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              通过自然语言描述学习情况，系统将自动抽取专业背景、课程目标、知识短板、学习偏好等维度，构建个性化学习画像，用于后续学习路径规划和资源生成。
            </p>
          </div>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">画像维度</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "专业背景",
                "课程目标",
                "学习目标",
                "当前基础",
                "知识短板",
                "可用学习时间",
                "学习偏好",
                "资源偏好",
                "认知风格",
                "考试 / 截止时间",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <form onSubmit={handleSubmit} className="sp-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="sp-section-title">自然语言描述</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  可以直接写专业、课程、目标、基础、薄弱点、时间安排和偏好的学习资料类型。
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseExample}
                className="btn-secondary shrink-0"
              >
                使用示例输入
              </button>
            </div>

            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError(null);
              }}
              rows={8}
              className="sp-input mt-4 min-h-48 resize-y"
              placeholder={exampleProfileText}
            />

            {error ? (
              <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn-primary mt-4 w-full sm:w-fit">
              生成学习画像
            </button>
          </form>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">规则抽取说明</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              当前版本使用本地规则抽取，不调用 AI。它会识别专业、课程、薄弱知识点、学习时间、资源偏好，并计算画像置信度。
            </p>
            <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              示例输入适合展示 A3 的“对话式学习画像自主构建”能力，后续可接入多智能体资源生成流程。
            </div>
          </aside>
        </section>

        {profile ? (
          <section className="mt-6">
            {recognizedConcepts.length > 0 ? (
              <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                <p className="font-semibold">
                  已识别到数据结构知识点，可用于后续资源生成。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recognizedConcepts.map((concept) => (
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="badge-soft mb-3">Learning Profile</p>
                  <h2 className="text-2xl font-bold text-ink">学习画像卡片</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-primary">
                  置信度：{profile.confidence}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <ProfileField label="专业背景" value={profile.majorBackground} />
                <ProfileField label="课程目标" value={profile.courseTarget} />
                <ProfileField label="学习目标" value={profile.learningGoal} />
                <ProfileField label="当前基础" value={profile.currentLevel} />
                <ProfileField
                  label="知识短板"
                  value={
                    profile.weakPoints.length > 0
                      ? profile.weakPoints.join("、")
                      : "暂未识别明确短板"
                  }
                />
                <ProfileField label="可用学习时间" value={profile.availableTime} />
                <ProfileField label="学习偏好" value={profile.learningPreference} />
                <ProfileField
                  label="资源偏好"
                  value={
                    profile.resourcePreference.length > 0
                      ? profile.resourcePreference.join("、")
                      : "未明确资源偏好"
                  }
                />
                <ProfileField label="认知风格" value={profile.cognitiveStyle} />
                <ProfileField
                  label="考试 / 截止时间"
                  value={profile.examOrDeadline ?? "未明确考试或截止时间"}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-ink">画像总结</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{profile.summary}</p>
              </div>
            </div>
          </section>
        ) : null}
      </section>

      <IcpFooter />
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
    </div>
  );
}
