export type LoadingStatus = "idle" | "loading" | "success" | "error";

export type ProgressStep = {
  atSeconds: number;
  progress: number;
  label: string;
};

export const planGenerationProgressSteps: ProgressStep[] = [
  { atSeconds: 0, progress: 0, label: "准备生成学习计划..." },
  { atSeconds: 4, progress: 15, label: "AI 正在分析你的学习目标..." },
  { atSeconds: 14, progress: 35, label: "正在拆解每日任务..." },
  { atSeconds: 28, progress: 60, label: "正在生成复习方法和资料建议..." },
  { atSeconds: 42, progress: 80, label: "正在校验 AI 返回结果..." },
  { atSeconds: 55, progress: 90, label: "正在保存学习计划..." },
];

export const weeklySummaryProgressSteps: ProgressStep[] = [
  { atSeconds: 0, progress: 0, label: "准备分析本周学习情况..." },
  { atSeconds: 5, progress: 30, label: "正在统计任务完成情况..." },
  { atSeconds: 15, progress: 60, label: "AI 正在生成总结..." },
  { atSeconds: 25, progress: 85, label: "正在保存周总结..." },
];

export function getLoadingProgressState({
  elapsedSeconds,
  status,
  steps,
  timeoutSeconds,
  timeoutMessage,
  successLabel,
}: {
  elapsedSeconds: number;
  status: LoadingStatus;
  steps: ProgressStep[];
  timeoutSeconds: number;
  timeoutMessage: string;
  successLabel?: string;
}) {
  if (status === "success") {
    return {
      progress: 100,
      label: successLabel ?? "处理完成",
      timeoutMessage: undefined,
    };
  }

  const fallbackStep = steps[0] ?? {
    atSeconds: 0,
    progress: 0,
    label: "正在处理...",
  };
  const activeStep = steps.reduce(
    (current, step) => (elapsedSeconds >= step.atSeconds ? step : current),
    fallbackStep
  );

  return {
    progress: Math.min(activeStep.progress, 95),
    label: activeStep.label,
    timeoutMessage:
      status === "loading" && elapsedSeconds >= timeoutSeconds
        ? timeoutMessage
        : undefined,
  };
}

export function getSubmitButtonState({
  status,
  idleLabel,
  loadingLabel,
  successLabel,
}: {
  status: LoadingStatus;
  idleLabel: string;
  loadingLabel: string;
  successLabel?: string;
}) {
  if (status === "loading") {
    return { disabled: true, label: loadingLabel };
  }

  if (status === "success") {
    return { disabled: true, label: successLabel ?? loadingLabel };
  }

  return { disabled: false, label: idleLabel };
}
