"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsPending(true);
    setError(null);
    setMessage(null);

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
        return;
      }

      setMessage("本周总结已生成。");
      router.refresh();
    } catch {
      setError("网络请求失败，请稍后重试。");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={handleGenerate}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {isPending ? "AI 正在分析你的本周学习情况..." : "生成本周总结"}
      </button>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}
