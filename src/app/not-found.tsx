import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="sp-card max-w-md text-center">
        <h1 className="text-2xl font-bold text-ink">页面不存在或已被删除。</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          请检查链接是否正确，或返回首页和 Dashboard。
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            返回 Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
