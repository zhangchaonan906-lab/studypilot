"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressLoadingCard } from "./ProgressLoadingCard";
import {
  getLoadingProgressState,
  getSubmitButtonState,
  planGenerationProgressSteps,
  type LoadingStatus,
} from "@/lib/ui/loading-state";
import {
  DEFAULT_PLAN_DAYS,
  buildGeneratePlanPayloadFromFormData,
  calculateDeadlineDate,
  getDefaultStartDate,
} from "@/lib/study/plan-dates";
import {
  estimateDailyStudyMinutes,
  type StudyTimeEstimateResult,
} from "@/lib/study/time-estimation";

const preferences = ["每天短时高频", "周末集中学习", "多做题", "多看讲解", "需要复盘提醒"];
const publicBetaMaxDays = 30;

export function NewPlanForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingStatus>("idle");
  const [startDate, setStartDate] = useState(() => getDefaultStartDate());
  const [totalDays, setTotalDays] = useState(String(DEFAULT_PLAN_DAYS));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [goalText, setGoalText] = useState("");
  const [currentLevelText, setCurrentLevelText] = useState("基础薄弱");
  const [restDaysText, setRestDaysText] = useState("1");
  const [preferenceText, setPreferenceText] = useState("每天短时高频");

  const isBusy = status === "loading" || status === "success";
  const parsedTotalDays = Number(totalDays);
  const calculatedDeadline = calculateDeadlineDate(startDate, parsedTotalDays);
  const parsedRestDays = Number(restDaysText) || 0;

  const timeEstimate: StudyTimeEstimateResult | null = useMemo(() => {
    if (!goalText.trim() || !parsedTotalDays || parsedTotalDays < 1) {
      return null;
    }

    return estimateDailyStudyMinutes({
      goal: goalText,
      currentLevel: currentLevelText,
      planDays: parsedTotalDays,
      restDaysPerWeek: parsedRestDays,
      preference: preferenceText,
    });
  }, [goalText, currentLevelText, parsedTotalDays, parsedRestDays, preferenceText]);
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
    const formData = new FormData(event.currentTarget);
    const payload = buildGeneratePlanPayloadFromFormData(formData);

    if (!payload.ok) {
      setError(payload.error);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setElapsedSeconds(0);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload.data),
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
      <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6">
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
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="例如：30 天内完成高等数学期末复习，重点提升积分和应用题"
            rows={4}
            className="sp-input resize-none"
          />
          <p className="sp-help">目标越具体，AI 拆出来的每日任务越稳。</p>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="sp-label">当前水平</span>
            <select
              name="current_level"
              value={currentLevelText}
              onChange={(e) => setCurrentLevelText(e.target.value)}
              className="sp-input"
            >
              <option>基础薄弱</option>
              <option>能跟上课程</option>
              <option>需要冲刺高分</option>
            </select>
          </label>
          <label className="block">
            <span className="sp-label">起始日期</span>
            <input
              name="start_date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="sp-input"
            />
            <p className="sp-help">你只需要选择从哪天开始，以及计划持续多少天。</p>
          </label>
          <label className="block">
            <span className="sp-label">计划天数</span>
            <input
              name="total_days"
              type="number"
              min="1"
              max={publicBetaMaxDays}
              value={totalDays}
              onChange={(event) => setTotalDays(event.target.value)}
              className="sp-input"
            />
            <p className="sp-help">公测版最多生成前 30 天。</p>
          </label>
          <label className="block">
            <span className="sp-label">截止日期</span>
            <input
              name="deadline"
              type="text"
              value={calculatedDeadline ?? ""}
              readOnly
              className="sp-input bg-slate-50 text-slate-600"
            />
            <p className="sp-help">
              {calculatedDeadline
                ? `系统将自动计算截止日期：${calculatedDeadline}`
                : "请输入 1 到 30 天的计划天数。"}
            </p>
          </label>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            <p className="font-semibold">自动估算每日学习时间</p>
            <p className="mt-1 text-blue-700/80">
              StudyPilot 会根据你的学习目标、当前水平和计划天数，自动推荐每日学习时间。
            </p>
            {timeEstimate ? (
              <div className="mt-3 space-y-1.5">
                <p className="text-base font-bold text-blue-900">
                  预计每日学习时间：约 {timeEstimate.dailyMinutes} 分钟
                </p>
                <p>
                  计划强度：
                  <span
                    className={`ml-1 font-semibold ${
                      timeEstimate.intensity === "冲刺"
                        ? "text-red-600"
                        : timeEstimate.intensity === "标准"
                          ? "text-blue-700"
                          : "text-emerald-700"
                    }`}
                  >
                    {timeEstimate.intensity}
                  </span>
                </p>
                {timeEstimate.intensity === "冲刺" ? (
                  <p className="text-red-600/90">
                    当前计划强度较高，建议适当增加计划天数或减少目标范围。
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-blue-700/70">
                填写学习目标和计划天数后自动估算。
              </p>
            )}
          </div>
          <input
            type="hidden"
            name="daily_minutes"
            value={timeEstimate?.dailyMinutes ?? 90}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="sp-label">每周休息天数</span>
            <input
              name="rest_days_per_week"
              type="number"
              min="0"
              max="6"
              value={restDaysText}
              onChange={(e) => setRestDaysText(e.target.value)}
              className="sp-input"
            />
          </label>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            你选择的起始日期会对应 Day 1，后续每天按顺序自动递增，减少日期错位。
          </div>
        </div>

        <label className="block">
          <span className="sp-label">学习偏好</span>
          <select
            name="preference"
            value={preferenceText}
            onChange={(e) => setPreferenceText(e.target.value)}
            className="sp-input"
          >
            {preferences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

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
