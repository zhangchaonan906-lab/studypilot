"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePlanAction } from "@/lib/study/actions";

const deletePlanConfirmMessage =
  "确定要删除这个学习计划吗？删除后，该计划下的每日任务、资料建议、复盘、错题和周总结都会被删除，且无法恢复。";

export function DeletePlanButton({
  planId,
  planTitle,
  redirectAfterDelete = false,
  className,
}: {
  planId: string;
  planTitle?: string;
  redirectAfterDelete?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenConfirm() {
    setError(null);
    setSuccess(null);
    setIsConfirming(true);
  }

  function handleCancel() {
    if (isPending) {
      return;
    }

    setIsConfirming(false);
    setError(null);
  }

  function handleDelete() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await deletePlanAction(planId, redirectAfterDelete);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setIsConfirming(false);
      setSuccess(result?.success ?? "学习计划已删除。");
      router.refresh();
    });
  }

  return (
    <div className={className}>
      {!isConfirming ? (
        <button
          type="button"
          onClick={handleOpenConfirm}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
        >
          删除计划
        </button>
      ) : (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">删除计划</p>
          {planTitle ? (
            <p className="mt-1 break-words text-sm text-red-700/80">{planTitle}</p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-red-700">{deletePlanConfirmMessage}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isPending}
              onClick={handleCancel}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "删除中..." : "确认删除"}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      )}
      {success ? <p className="mt-2 text-sm font-semibold text-emerald-700">{success}</p> : null}
    </div>
  );
}
