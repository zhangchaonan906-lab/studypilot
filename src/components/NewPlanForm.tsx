"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressLoadingCard } from "./ProgressLoadingCard";
import {
  getLoadingProgressState,
  getSubmitButtonState,
  planGenerationProgressSteps,
  type LoadingStatus,
} from "@/lib/ui/loading-state";

const preferences = ["每天短时高频", "周末集中学习", "多做题", "多看讲解", "需要复盘提醒"];
const publicBetaMaxDays = 30;

export function NewPlanForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingStatus>("idle");
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isBusy = status === "loading" || status === "success";
  const progressState = getLoadingProgressState({
    elapsedSeconds,
    status,
    steps: planGenerationProgressSteps,
    timeoutSeconds: 60,
    timeoutMessage: "仍在生成中，复杂计划可能需要更久，请稍等。",
    successLabel: "生成完成，正在跳转...",
  });
  const submitButton = getSubmitButtonState({
    status,
    idleLabel: "生成学习计划",
    loadingLabel: "生成中...",
    successLabel: "生成完成",
  });
  const planDays = getInclusiveDaysUntil(selectedDeadline);
  const shouldShowPublicBetaLimit = planDays > publicBetaMaxDays;

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setError(null);
    setStatus("loading");
    setElapsedSeconds(0);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      goal: String(formData.get("goal") ?? "").trim(),
      currentLevel: String(formData.get("current_level") ?? "").trim(),
      deadline: String(formData.get("deadline") ?? "").trim(),
      dailyMinutes: Number(formData.get("daily_minutes") ?? 0),
      restDaysPerWeek: Number(formData.get("rest_days_per_week") ?? 1),
      preference: String(formData.get("preference") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        setError(result?.error || "生成学习计划失败，请稍后重试。");
        setStatus("error");
        return;
      }

      if (!result?.planId) {
        setError("生成成功但没有返回计划 ID，请刷新后查看学习台。");
        setStatus("error");
        return;
      }

      setStatus("success");
      window.setTimeout(() => {
        router.push(`/plans/${result.planId}`);
        router.refresh();
      }, 350);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "生成学习计划失败，请稍后重试。"
      );
      setStatus("error");
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <form onSubmit={handleSubmit} className="grid gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">计划标题</span>
          <input
            name="title"
            placeholder="例如：高数期末冲刺"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">学习目标</span>
          <textarea
            name="goal"
            placeholder="例如：30 天内完成高等数学期末复习，重点提升积分和应用题"
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">当前水平</span>
            <select
              name="current_level"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            >
              <option>基础薄弱</option>
              <option>能跟上课程</option>
              <option>需要冲刺高分</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">截止日期</span>
            <input
              name="deadline"
              type="date"
              onChange={(event) => setSelectedDeadline(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">每天学习时间</span>
            <input
              name="daily_minutes"
              type="number"
              min="15"
              max="600"
              placeholder="90"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">每周休息天数</span>
            <input
              name="rest_days_per_week"
              type="number"
              min="0"
              max="6"
              defaultValue="1"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">学习偏好</span>
          <select
            name="preference"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          >
            {preferences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        {shouldShowPublicBetaLimit ? (
          <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            公测版当前最多生成 30 天计划，后续版本会开放更长周期。
          </div>
        ) : null}

        <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          提交后会在服务端调用 AI，并把计划、每日安排、任务和资料建议保存到 Supabase。生成学习计划通常需要 20-60 秒，请不要关闭页面。
        </div>

        {status !== "idle" ? (
          <ProgressLoadingCard
            title="学习计划生成进度"
            progress={progressState.progress}
            label={progressState.label}
            hint="生成学习计划通常需要 20-60 秒，请不要关闭页面。"
            timeoutMessage={progressState.timeoutMessage}
            error={error ? `生成失败：${error}` : null}
          />
        ) : null}

        <button
          type="submit"
          disabled={submitButton.disabled}
          className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-fit"
        >
          {submitButton.label}
        </button>
      </form>
    </section>
  );
}

function getInclusiveDaysUntil(deadline: string) {
  if (!deadline) {
    return 0;
  }

  const [year, month, day] = deadline.split("-").map(Number);

  if (!year || !month || !day) {
    return 0;
  }

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadlineDate = new Date(year, month - 1, day);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((deadlineDate.getTime() - startDate.getTime()) / millisecondsPerDay);

  return Math.max(diffDays + 1, 0);
}
