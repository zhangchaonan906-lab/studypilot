"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressLoadingCard } from "./ProgressLoadingCard";
import { SuccessMessage } from "./StatusMessage";
import {
  getLoadingProgressState,
  getSubmitButtonState,
  weeklySummaryProgressSteps,
  type LoadingStatus,
} from "@/lib/ui/loading-state";

export function WeeklySummaryGenerator({
  planId,
  weekIndex,
  startDate,
  endDate,
  disabled,
}: {
  planId: string;
  weekIndex: number;
  startDate: string;
  endDate: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LoadingStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isBusy = status === "loading" || status === "success";
  const progressState = getLoadingProgressState({
    elapsedSeconds,
    status,
    steps: weeklySummaryProgressSteps,
    timeoutSeconds: 45,
    timeoutMessage: "仍在生成中，请稍等。",
    successLabel: "总结生成完成",
  });
  const submitButton = getSubmitButtonState({
    status,
    idleLabel: "生成本周总结",
    loadingLabel: "生成中...",
    successLabel: "已生成",
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

  async function handleGenerate() {
    if (disabled || isBusy) {
      return;
    }

    setStatus("loading");
    setError(null);
    setMessage(null);
    setElapsedSeconds(0);

    try {
      const response = await fetch("/api/weekly-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          weekIndex,
          startDate,
          endDate,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "生成周总结失败，请稍后重试。");
        setStatus("error");
        return;
      }

      setStatus("success");
      setMessage("总结生成完成。");
      window.setTimeout(() => {
        router.refresh();
        setStatus("idle");
      }, 500);
    } catch {
      setError("网络请求失败，请稍后重试。");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || submitButton.disabled}
        onClick={handleGenerate}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {submitButton.label}
      </button>
      {status !== "idle" ? (
        <ProgressLoadingCard
          title="周总结生成进度"
          progress={progressState.progress}
          label={progressState.label}
          hint="AI 正在分析你的本周学习情况，通常需要 10-30 秒。"
          timeoutMessage={progressState.timeoutMessage}
          error={error ? `生成周总结失败：${error}` : null}
        />
      ) : null}
      {message ? (
        <SuccessMessage>{message}</SuccessMessage>
      ) : null}
    </div>
  );
}
