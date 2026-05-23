"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTaskAction } from "@/lib/study/actions";
import type { TaskPriority } from "@/lib/study/types";

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "must", label: "必做" },
  { value: "should", label: "建议" },
  { value: "optional", label: "可选" },
];

export function CreateTaskForm({ planDayId, planId }: { planDayId: string; planId: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [minutes, setMinutes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("should");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCreate() {
    setContent("");
    setMinutes("");
    setPriority("should");
    setError(null);
    setIsCreating(true);
  }

  function cancelCreate() {
    setIsCreating(false);
    setError(null);
  }

  function handleSave() {
    if (!content.trim()) {
      setError("请输入任务内容。");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await createTaskAction(planDayId, planId, {
          content: content.trim(),
          estimated_minutes: minutes === "" ? undefined : Number(minutes),
          priority,
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        setIsCreating(false);
        router.refresh();
      } catch {
        setError("任务创建失败，请稍后重试。");
      }
    });
  }

  if (!isCreating) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={startCreate}
          className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600"
        >
          + 新增任务
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-3">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">任务内容</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink focus:border-blue-300 focus:outline-none"
            disabled={isPending}
            placeholder="输入新任务内容"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">预计时间（分钟）</label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink focus:border-blue-300 focus:outline-none"
              disabled={isPending}
              min={0}
              placeholder="可选"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink focus:border-blue-300 focus:outline-none"
              disabled={isPending}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? (
          <p className="text-sm font-semibold text-red-600">{error}</p>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={cancelCreate}
            disabled={isPending}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-70"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
