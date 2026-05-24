"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="sp-card max-w-md text-center">
            <h1 className="text-2xl font-bold text-ink">页面出错了，请稍后重试。</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              请尝试重新加载页面，或返回首页。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="btn-primary"
              >
                重新加载
              </button>
              <Link href="/" className="btn-secondary">
                返回首页
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
