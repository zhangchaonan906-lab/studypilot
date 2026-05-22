"use client";

import { useState, useTransition } from "react";
import { updateTaskCompletionAction } from "@/lib/study/actions";

export function TaskCompletionToggle({
  taskId,
  initialCompleted,
}: {
  taskId: string;
  initialCompleted: boolean;
}) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: boolean) {
    setIsCompleted(nextValue);

    startTransition(async () => {
      try {
        await updateTaskCompletionAction(taskId, nextValue);
      } catch {
        setIsCompleted(!nextValue);
      }
    });
  }

  return (
    <input
      type="checkbox"
      checked={isCompleted}
      disabled={isPending}
      onChange={(event) => handleChange(event.target.checked)}
      className="mt-1 h-5 w-5 accent-blue-600 disabled:cursor-not-allowed"
      aria-label={isCompleted ? "取消完成任务" : "完成任务"}
    />
  );
}
