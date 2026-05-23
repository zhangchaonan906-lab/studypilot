export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="sp-card min-w-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-words text-3xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{hint}</p>
    </div>
  );
}
