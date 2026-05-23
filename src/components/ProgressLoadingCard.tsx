import { ErrorMessage } from "./StatusMessage";

export function ProgressLoadingCard({
  title,
  progress,
  label,
  hint,
  timeoutMessage,
  error,
  showErrorSlot = true,
}: {
  title: string;
  progress: number;
  label: string;
  hint: string;
  timeoutMessage?: string;
  error?: string | null;
  showErrorSlot?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      aria-live="polite"
      className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-1 break-words text-blue-900">{label}</p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
          {progress}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 break-words text-blue-800">{hint}</p>
      {timeoutMessage ? (
        <p className="mt-3 rounded-xl bg-white/75 px-3 py-2 text-blue-900">
          {timeoutMessage}
        </p>
      ) : null}
      {showErrorSlot ? (
        <div className="mt-3">
          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <p className="text-xs text-blue-700">如果处理失败，错误提示会显示在这里。</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
