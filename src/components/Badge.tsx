import type { ReactNode } from "react";

const badgeToneClass = {
  blue: "bg-blue-50 text-primary",
  slate: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeToneClass;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeToneClass[tone]}`}
    >
      {children}
    </span>
  );
}
