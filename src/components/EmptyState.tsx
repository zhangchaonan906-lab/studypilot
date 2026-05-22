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
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
