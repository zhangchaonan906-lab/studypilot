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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}
