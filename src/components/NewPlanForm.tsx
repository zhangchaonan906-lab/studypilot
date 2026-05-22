"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const preferences = ["每天短时高频", "周末集中学习", "多做题", "多看讲解", "需要复盘提醒"];

export function NewPlanForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      goal: String(formData.get("goal") ?? "").trim(),
      currentLevel: String(formData.get("current_level") ?? "").trim(),
      deadline: String(formData.get("deadline") ?? "").trim(),
      dailyMinutes: Number(formData.get("daily_minutes") ?? 0),
      restDaysPerWeek: Number(formData.get("rest_days_per_week") ?? 1),
      preference: String(formData.get("preference") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        setError(result?.error || "生成学习计划失败，请稍后重试。");
        return;
      }

      if (!result?.planId) {
        setError("生成成功但没有返回计划 ID，请刷新后查看学习台。");
        return;
      }

      router.push(`/plans/${result.planId}`);
      router.refresh();
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "生成学习计划失败，请稍后重试。"
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <form onSubmit={handleSubmit} className="grid gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">计划标题</span>
          <input
            name="title"
            placeholder="例如：高数期末冲刺"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">学习目标</span>
          <textarea
            name="goal"
            placeholder="例如：30 天内完成高等数学期末复习，重点提升积分和应用题"
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">当前水平</span>
            <select
              name="current_level"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            >
              <option>基础薄弱</option>
              <option>能跟上课程</option>
              <option>需要冲刺高分</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">截止日期</span>
            <input
              name="deadline"
              type="date"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">每天学习时间</span>
            <input
              name="daily_minutes"
              type="number"
              min="1"
              placeholder="90"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">每周休息天数</span>
            <input
              name="rest_days_per_week"
              type="number"
              min="0"
              max="7"
              defaultValue="1"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">学习偏好</span>
          <select
            name="preference"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
          >
            {preferences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          提交后会在服务端调用 AI，并把计划、每日安排、任务和资料建议保存到 Supabase。
        </div>

        {isPending ? (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm leading-6 text-blue-800">
            AI 正在拆解你的学习目标...
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:w-fit"
        >
          {isPending ? "AI 正在生成..." : "生成学习计划"}
        </button>
      </form>
    </section>
  );
}
