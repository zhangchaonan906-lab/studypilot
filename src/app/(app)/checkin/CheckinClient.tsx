"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckinStats } from "@/lib/study/types";
import { cancelTodayCheckinAction, checkInTodayAction } from "@/lib/study/checkin-actions";

const WEEKDAY_HEADERS = ["一", "二", "三", "四", "五", "六", "日"];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0 in our week index (JS getDay: 0=Sun, 1=Mon, ..., 6=Sat)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: Array<{ day: number; date: string } | null> = [];

  // Leading nulls for alignment
  for (let i = 0; i < startDow; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, date: dateStr });
  }

  return days;
}

export function CheckinClient({
  initialYear,
  initialMonth,
  today,
  initialCheckinDates,
  initialStats,
}: {
  initialYear: number;
  initialMonth: number;
  today: string;
  initialCheckinDates: string[];
  initialStats: CheckinStats;
}) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const checkinDates = initialCheckinDates;
  const stats = initialStats;
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMessage = useCallback((type: "error" | "success", text: string) => {
    setMessage({ type, text });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);

  const days = generateCalendarDays(year, month);

  const handleCheckin = useCallback(async () => {
    const result = await checkInTodayAction();
    if (result?.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", result.success ?? "打卡成功！");
      router.refresh();
    }
  }, [router, showMessage]);

  const handleCancel = useCallback(async () => {
    const result = await cancelTodayCheckinAction();
    if (result?.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", result.success ?? "已取消今日打卡。");
      router.refresh();
    }
  }, [router, showMessage]);

  const goToPrevMonth = useCallback(() => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  return (
    <section className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div data-checkin-stat-card className="sp-card text-center">
          <p className="text-xs font-semibold text-slate-500">本月打卡</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-ink">{stats.monthTotal}</p>
          <p className="mt-0.5 text-xs text-slate-400">天</p>
        </div>
        <div data-checkin-stat-card className="sp-card text-center">
          <p className="text-xs font-semibold text-slate-500">连续打卡</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-ink">{stats.streak}</p>
          <p className="mt-0.5 text-xs text-slate-400">天</p>
        </div>
        <div data-checkin-stat-card className="sp-card text-center">
          <p className="text-xs font-semibold text-slate-500">今日状态</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-ink">
            {stats.todayCheckedIn ? "🐾" : "—"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {stats.todayCheckedIn ? "已打卡" : "未打卡"}
          </p>
        </div>
      </div>

      {/* Checkin action */}
      <div className="sp-card">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-bold text-ink">
              {stats.todayCheckedIn ? "今天已留下猫爪 🐾" : "今天还没打卡"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {stats.todayCheckedIn
                ? "继续加油，坚持就是胜利！"
                : "完成今日学习后，记录你的努力。"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stats.todayCheckedIn ? (
               <button type="button" onClick={handleCancel} className="btn-secondary w-full sm:w-auto text-sm">
                取消今日打卡
              </button>
            ) : (
               <button type="button" onClick={handleCheckin} className="btn-primary w-full sm:w-auto px-6 text-base sm:px-8 sm:text-lg">
                🐾 今日打卡
              </button>
            )}
          </div>
        </div>
        {message ? (
          <div
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}
      </div>

      {/* Calendar */}
      <div className="sp-card">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← 上月
          </button>
          <h3 className="text-base font-bold text-ink sm:text-lg">
            {year} 年 {month} 月
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            下月 →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7">
          {WEEKDAY_HEADERS.map((header) => (
            <div key={header} className="py-2 text-center text-xs font-bold text-slate-400">
              {header}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isToday = day.date === today;
            const isCheckedIn = checkinDates.includes(day.date);
            const isFuture = day.date > today;

            return (
              <div
                key={day.date}
                 className={`flex aspect-square flex-col items-center justify-center rounded-lg sm:rounded-xl text-xs transition sm:text-sm ${
                  isToday
                    ? "bg-primary text-white font-bold shadow-sm"
                    : isCheckedIn
                      ? "bg-amber-50"
                      : "hover:bg-slate-50"
                } ${isFuture ? "opacity-40" : ""}`}
              >
                <span className={isToday ? "text-white" : "text-slate-700"}>
                  {day.day}
                </span>
                {isCheckedIn ? (
                  <span className="text-xs mt-0.5">🐾</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
