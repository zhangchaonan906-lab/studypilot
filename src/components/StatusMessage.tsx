import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-700 break-words">
      {children}
    </p>
  );
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-800 break-words">
      {children}
    </p>
  );
}
