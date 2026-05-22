"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatAuthError } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "sign-in" | "sign-up";
type AuthErrorState = {
  message: string;
  rawMessage: string;
};

export function LoginForm({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<AuthErrorState | null>(null);
  const [notice, setNotice] = useState<string | null>(initialMessage ?? null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError({
        message: "请填写邮箱和密码。",
        rawMessage: "Missing email or password",
      });
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        if (mode === "sign-up") {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            },
          });

          if (signUpError) {
            setError(formatAuthError(signUpError.message));
            return;
          }

          if (data.session) {
            router.replace("/dashboard");
            router.refresh();
            return;
          }

          setNotice("注册邮件已发送，请前往邮箱完成确认后再登录。");
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(formatAuthError(signInError.message));
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      } catch (authError) {
        setError(
          formatAuthError(authError instanceof Error ? authError.message : undefined)
        );
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-primary">账号登录</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">欢迎来到 StudyPilot</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        使用邮箱注册或登录，进入你的学习台。
      </p>

      <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            mode === "sign-in" ? "bg-white text-primary shadow-sm" : "text-slate-600"
          }`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            mode === "sign-up" ? "bg-white text-primary shadow-sm" : "text-slate-600"
          }`}
        >
          注册
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">邮箱</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@university.edu"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">密码</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            placeholder="至少 6 位密码"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>

        {error ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
            <p>{error.message}</p>
            <p className="mt-1 break-words text-xs text-red-600">
              Supabase 原始错误：{error.rawMessage}
            </p>
          </div>
        ) : null}
        {notice ? (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm leading-6 text-blue-800">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isPending ? "处理中..." : mode === "sign-in" ? "登录并进入学习台" : "注册账号"}
        </button>
      </form>
    </section>
  );
}
