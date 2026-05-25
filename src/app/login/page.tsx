import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialMessage =
    params.error === "auth_callback" ? "邮箱确认链接已失效，请重新登录或注册。" : undefined;

  return (
    <main className="min-h-dvh bg-mist px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl flex-col justify-start pt-2 lg:justify-center lg:pt-0">
        <Link href="/" className="mb-8 flex w-fit items-center gap-3 text-sm font-semibold text-ink">
          <StudyPilotLogo size={40} showText />
        </Link>
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
          <section className="hidden lg:block">
            <p className="badge-soft">AI 学习计划生成器</p>
            <h1 className="mt-5 max-w-xl text-3xl font-bold tracking-normal text-ink sm:text-4xl lg:text-5xl">
              回到你的学习节奏里。
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              登录后可以生成计划、查看今日任务、记录复盘和错题，并生成每周学习总结。
            </p>
            <div className="mt-8 grid max-w-lg gap-3">
              {["每日任务清单", "复盘与错题记录", "每周 AI 学习报告"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </section>
          <LoginForm initialMessage={initialMessage} />
        </div>
      </div>
    </main>
  );
}
