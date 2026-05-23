import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="break-words rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
      {children}
    </div>
  );
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <div className="break-words rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-800">
      {children}
    </div>
  );
}
