"use client";

import { useState, useTransition } from "react";
import { updateTaskCompletionAction } from "@/lib/study/actions";

export function TaskCompletionToggle({
  taskId,
  initialCompleted,
  content,
  meta,
  variant = "card",
}: {
  taskId: string;
  initialCompleted: boolean;
  content: string;
  meta?: string;
  variant?: "card" | "compact";
}) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const nextValue = !isCompleted;

    setIsCompleted(nextValue);
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateTaskCompletionAction(taskId, nextValue);

        if (result?.error) {
          throw new Error(result.error);
        }
      } catch {
        setIsCompleted(!nextValue);
        setError("任务状态更新失败，请稍后重试。");
      }
    });
  }

  const statusText = isPending
    ? "更新中..."
    : isCompleted
      ? "已完成 · 点击取消完成"
      : "未完成 · 点击打卡";
  const rootClass =
    variant === "compact"
      ? "rounded-xl bg-white"
      : isCompleted
        ? "rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4"
        : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:bg-blue-50/30";
  const buttonClass =
    variant === "compact"
      ? "flex w-full flex-col gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-row sm:items-start"
      : "flex w-full flex-col gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 sm:flex-row sm:items-start";

  return (
    <div className={rootClass}>
      <button
        type="button"
        aria-pressed={isCompleted}
        aria-label={isCompleted ? "取消完成任务" : "完成任务"}
        disabled={isPending}
        onClick={handleToggle}
        className={buttonClass}
      >
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 bg-white text-transparent"
          }`}
        >
          ✓
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block font-bold ${
              isCompleted ? "text-slate-400 line-through" : "text-ink"
            }`}
          >
            {content}
          </span>
          {meta ? (
            <span className="mt-2 block text-sm font-semibold text-slate-500">{meta}</span>
          ) : null}
        </span>
        <span
          className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold ${
            isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {statusText}
        </span>
      </button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
