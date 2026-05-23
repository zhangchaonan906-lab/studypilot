import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-primary">
        SP
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="btn-primary mt-5"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
