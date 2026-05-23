"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/Badge";
import { TaskCompletionToggle } from "@/components/TaskCompletionToggle";
import {
  deleteTaskAction,
  updateTaskAction,
} from "@/lib/study/actions";
import type { Task } from "@/lib/study/types";

const priorityMeta: Record<Task["priority"], { label: string; tone: "blue" | "amber" | "slate" }> = {
  must: { label: "必做", tone: "amber" },
  should: { label: "建议", tone: "blue" },
  optional: { label: "可选", tone: "slate" },
};

const priorityOptions: Array<{ value: Task["priority"]; label: string }> = [
  { value: "must", label: "必做" },
  { value: "should", label: "建议" },
  { value: "optional", label: "可选" },
];

export function TaskCard({ task, planId }: { task: Task; planId: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [editMinutes, setEditMinutes] = useState(String(task.estimated_minutes ?? ""));
  const [editPriority, setEditPriority] = useState<Task["priority"]>(task.priority);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isDeleted, setIsDeleted] = useState(false);

  function startEdit() {
    setEditContent(task.content);
    setEditMinutes(String(task.estimated_minutes ?? ""));
    setEditPriority(task.priority);
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditError(null);
  }

  function handleSave() {
    setEditError(null);

    startSaveTransition(async () => {
      try {
        const result = await updateTaskAction(task.id, planId, {
          content: editContent,
          estimated_minutes: editMinutes === "" ? undefined : Number(editMinutes),
          priority: editPriority,
        });

        if (result.error) {
          setEditError(result.error);
          return;
        }

        setIsEditing(false);
        router.refresh();
      } catch {
        setEditError("任务更新失败，请稍后重试。");
      }
    });
  }

  function handleDelete() {
    if (!confirm("确定删除这个任务吗？删除后无法恢复。")) {
      return;
    }

    startDeleteTransition(async () => {
      try {
        const result = await deleteTaskAction(task.id, planId);

        if (result.error) {
          return;
        }

        setIsDeleted(true);
        router.refresh();
      } catch {
        // deletion failed silently after confirm
      }
    });
  }

  if (isDeleted) {
    return null;
  }

  if (isEditing) {
    const priority = priorityMeta[editPriority];

    return (
      <div className="rounded-2xl bg-slate-50 p-2">
        <div className="mb-2 flex justify-end">
          <Badge tone={priority.tone}>{priority.label}</Badge>
        </div>
        <div className="rounded-xl bg-white p-3 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">任务内容</label>
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink focus:border-blue-300 focus:outline-none"
              disabled={isSavePending}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">预计时间（分钟）</label>
              <input
                type="number"
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink focus:border-blue-300 focus:outline-none"
                disabled={isSavePending}
                min={0}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">优先级</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Task["priority"])}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink focus:border-blue-300 focus:outline-none"
                disabled={isSavePending}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {editError ? (
            <p className="text-sm font-semibold text-red-600">{editError}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSavePending}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {isSavePending ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSavePending}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-70"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  const priority = priorityMeta[task.priority];

  return (
    <div className="rounded-2xl bg-slate-50 p-2">
      <div className="mb-2 flex items-center justify-between">
        <Badge tone={priority.tone}>{priority.label}</Badge>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={startEdit}
            disabled={isDeletePending}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white hover:text-ink disabled:opacity-50"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeletePending}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            {isDeletePending ? "删除中..." : "删除"}
          </button>
        </div>
      </div>
      <TaskCompletionToggle
        taskId={task.id}
        initialCompleted={task.is_completed}
        content={task.content}
        meta={`${task.estimated_minutes ?? 0} 分钟`}
        variant="compact"
      />
    </div>
  );
}
