"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  authValidationMessages,
  submitAuthCredentials,
  type AuthMode,
  validateAuthCredentials,
} from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ErrorMessage, SuccessMessage } from "./StatusMessage";

type AuthErrorState = {
  message: string;
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
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const validation = validateAuthCredentials({ mode, email, password });

    if (!validation.ok) {
      setError({
        message: validation.error,
      });
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const result = await submitAuthCredentials({
          mode,
          email: validation.data.email,
          password: validation.data.password,
          auth: supabase.auth,
          origin: window.location.origin,
        });

        if (!result.ok) {
          setError({
            message: result.error,
          });
          return;
        }

        if (mode === "sign-up") {
          if (result.data.session) {
            router.replace("/dashboard");
            router.refresh();
            return;
          }

          setNotice("注册邮件已发送，请前往邮箱完成确认后再登录。");
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      } catch {
        setError({
          message:
            mode === "sign-in"
              ? authValidationMessages.loginFailed
              : authValidationMessages.signupFailed,
        });
      }
    });
  }

  return (
    <section className="sp-card-soft">
      <p className="text-sm font-semibold text-primary">账号登录</p>
      <h1 className="mt-2 break-words text-2xl font-bold text-ink sm:text-3xl">
        欢迎来到 StudyPilot
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        使用邮箱注册或登录，进入你的学习台。
      </p>

      <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
            setNotice(null);
          }}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === "sign-in" ? "bg-white text-primary shadow-sm" : "text-slate-600"
          }`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
            setNotice(null);
          }}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === "sign-up" ? "bg-white text-primary shadow-sm" : "text-slate-600"
          }`}
        >
          注册
        </button>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        onChange={() => {
          setError(null);
          setNotice(null);
        }}
        className="mt-6 space-y-4"
      >
        <label className="block">
          <span className="sp-label">邮箱</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@university.edu"
            className="sp-input"
          />
        </label>
        <label className="block">
          <span className="sp-label">密码</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            placeholder="至少 6 位密码"
            className="sp-input"
          />
        </label>

        {error ? (
          <ErrorMessage>
            <p>{error.message}</p>
          </ErrorMessage>
        ) : null}
        {notice ? (
          <SuccessMessage>{notice}</SuccessMessage>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full"
        >
          {isPending ? "处理中..." : mode === "sign-in" ? "登录并进入学习台" : "注册账号"}
        </button>
      </form>
    </section>
  );
}
