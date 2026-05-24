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
    <section className="sp-card">
      <form onSubmit={handleSubmit} className="grid gap-6">
        <label className="block">
          <span className="sp-label">计划标题</span>
          <input
            name="title"
            placeholder="例如：高数期末冲刺"
            className="sp-input"
          />
          <p className="sp-help">用一句话命名这个阶段，比如课程、考试或技能目标。</p>
        </label>

        <label className="block">
          <span className="sp-label">学习目标</span>
          <textarea
            name="goal"
            placeholder="例如：30 天内完成高等数学期末复习，重点提升积分和应用题"
            rows={4}
            className="sp-input resize-none"
          />
          <p className="sp-help">目标越具体，AI 拆出来的每日任务越稳。</p>
        </label>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="sp-label">当前水平</span>
            <select
              name="current_level"
              className="sp-input"
            >
              <option>基础薄弱</option>
              <option>能跟上课程</option>
              <option>需要冲刺高分</option>
            </select>
          </label>
          <label className="block">
            <span className="sp-label">截止日期</span>
            <input
              name="deadline"
              type="date"
              onChange={(event) => setSelectedDeadline(event.target.value)}
              className="sp-input"
            />
            <p className="sp-help">公测版最多生成前 30 天。</p>
          </label>
          <label className="block">
            <span className="sp-label">每天学习时间</span>
            <input
              name="daily_minutes"
              type="number"
              min="15"
              max="600"
              placeholder="90"
              className="sp-input"
            />
            <p className="sp-help">建议先填能稳定坚持的时间。</p>
          </label>
          <label className="block">
            <span className="sp-label">每周休息天数</span>
            <input
              name="rest_days_per_week"
              type="number"
              min="0"
              max="6"
              defaultValue="1"
              className="sp-input"
            />
          </label>
        </div>

        <label className="block">
          <span className="sp-label">学习偏好</span>
          <select
            name="preference"
            className="sp-input"
          >
            {preferences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        {shouldShowPublicBetaLimit ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            公测版最多生成 30 天计划，后续版本会开放更长周期。
          </div>
        ) : null}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          提交后由服务端调用 AI 生成计划、每日安排、任务和资料建议，通常需要 20-60 秒，请不要关闭页面。
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
          className="btn-primary w-full sm:w-fit"
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
