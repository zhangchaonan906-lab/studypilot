"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatTime,
  getRecentSessions,
  getTodayDate,
  getTodayStats,
  loadGoal,
  loadSessions,
  saveGoal,
  saveSession,
  type FocusSession,
} from "@/lib/focus-timer";

const DURATIONS = [25, 45, 60] as const;

function loadInitialSessions(): FocusSession[] {
  if (typeof window === "undefined") return [];
  return loadSessions(window.localStorage);
}

function loadInitialGoal(): string {
  if (typeof window === "undefined") return "";
  return loadGoal(window.localStorage);
}

export function FocusTimer({
  initialGoal,
  initialMinutes,
}: {
  initialGoal?: string;
  initialMinutes?: number;
}) {
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [customMinutes, setCustomMinutes] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [goal, setGoal] = useState(() => {
    if (initialGoal) return initialGoal;
    return loadInitialGoal();
  });
  const [sessions, setSessions] = useState<FocusSession[]>(loadInitialSessions);
  const [showCompletion, setShowCompletion] = useState(false);

  const goalRef = useRef(goal);
  const mountedRef = useRef(false);

  useEffect(() => {
    goalRef.current = goal;
  }, [goal]);

  useEffect(() => {
    if (initialGoal && initialGoal.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing parent searchParam to local state
      setGoal(initialGoal);
      if (typeof window !== "undefined") {
        saveGoal(window.localStorage, initialGoal);
      }
    }
  }, [initialGoal]);

  useEffect(() => {
    if (initialMinutes && initialMinutes >= 1 && initialMinutes <= 600) {
      /* eslint-disable react-hooks/set-state-in-effect -- syncing searchParam to timer */
      if ((DURATIONS as readonly number[]).includes(initialMinutes)) {
        setIsCustomMode(false);
        setCustomMinutes("");
        setSelectedDuration(initialMinutes);
      } else {
        setIsCustomMode(true);
        setCustomMinutes(String(initialMinutes));
      }
      setTimeRemaining(initialMinutes * 60);
      setIsPaused(false);
      setShowCompletion(false);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [initialMinutes]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    saveGoal(window.localStorage, goal);
  }, [goal]);

  useEffect(() => {
    if (!isRunning || endTime === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        setEndTime(null);

        const completed = selectedDuration;

        if (typeof window !== "undefined") {
          const session: FocusSession = {
            date: getTodayDate(),
            goal: goalRef.current,
            minutes: completed,
            completedAt: new Date().toISOString(),
          };
          saveSession(window.localStorage, session);
          setSessions((prev) => [session, ...prev]);
        }

        setShowCompletion(true);
      }
    };

    tick();
    const interval = setInterval(tick, 250);

    return () => clearInterval(interval);
  }, [isRunning, endTime, selectedDuration]);

  useEffect(() => {
    if (showCompletion) {
      const timeout = setTimeout(() => setShowCompletion(false), 8000);
      return () => clearTimeout(timeout);
    }
  }, [showCompletion]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isRunning) {
      document.title = `${formatTime(timeRemaining)} - StudyPilot`;
    } else {
      document.title = "StudyPilot";
    }

    return () => {
      document.title = "StudyPilot";
    };
  }, [isRunning, timeRemaining]);

  const durationMinutes = isCustomMode
    ? parseInt(customMinutes, 10) || 0
    : selectedDuration;

  const displayTime = isRunning
    ? formatTime(timeRemaining)
    : formatTime(isPaused ? timeRemaining : durationMinutes * 60);

  const canStart = !isRunning && durationMinutes > 0;

  const handleStart = useCallback(() => {
    if (!canStart) return;
    const seconds = durationMinutes * 60;
    setTimeRemaining(seconds);
    setEndTime(Date.now() + seconds * 1000);
    setIsRunning(true);
    setIsPaused(false);
    setShowCompletion(false);
  }, [canStart, durationMinutes]);

  const handlePause = useCallback(() => {
    if (!isRunning || endTime === null) return;
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    setTimeRemaining(remaining);
    setEndTime(null);
    setIsRunning(false);
    setIsPaused(true);
  }, [isRunning, endTime]);

  const handleResume = useCallback(() => {
    if (!isPaused) return;
    setEndTime(Date.now() + timeRemaining * 1000);
    setIsRunning(true);
    setIsPaused(false);
    setShowCompletion(false);
  }, [isPaused, timeRemaining]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTime(null);
    setTimeRemaining(durationMinutes * 60);
    setShowCompletion(false);
  }, [durationMinutes]);

  const handleDurationSelect = useCallback((minutes: number) => {
    setIsCustomMode(false);
    setCustomMinutes("");
    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    setIsPaused(false);
    setShowCompletion(false);
  }, []);

  const handleCustomSelect = useCallback(() => {
    setIsCustomMode(true);
    setIsPaused(false);
    setShowCompletion(false);
  }, []);

  const handleCustomChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "");
    setCustomMinutes(digits);
  }, []);

  const todayStats = getTodayStats(sessions);
  const recentSessions = getRecentSessions(sessions, 5);
  const timerActive = isRunning || isPaused || showCompletion;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sp-card">
        <label htmlFor="focus-goal" className="sp-label">
          本次学习目标
        </label>
        <input
          id="focus-goal"
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="例如：完成高数极限章节 3 道题"
          className="sp-input mt-2"
          disabled={isRunning}
        />
      </div>

      <div className="sp-card mt-4">
        <fieldset disabled={timerActive} className="contents">
          <legend className="sp-label">选择时长</legend>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {DURATIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => handleDurationSelect(minutes)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  !isCustomMode && selectedDuration === minutes
                    ? "border-primary bg-indigo-50 text-primary ring-1 ring-indigo-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {minutes} 分钟
              </button>
            ))}
            <button
              type="button"
              onClick={handleCustomSelect}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isCustomMode
                  ? "border-primary bg-indigo-50 text-primary ring-1 ring-indigo-100"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              自定义
            </button>
            {isCustomMode ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={customMinutes}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="分钟数"
                  maxLength={3}
                  disabled={isRunning}
                  className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                />
                <span className="text-sm text-slate-500">分钟</span>
              </div>
            ) : null}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div
          className={`flex flex-col items-center justify-center rounded-3xl border-2 px-10 py-10 sm:px-16 sm:py-14 ${
            isRunning
              ? "border-primary/30 bg-indigo-50/60"
              : showCompletion
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-slate-200 bg-white"
          }`}
        >
          <p
            className={`font-mono text-7xl font-bold tracking-tight sm:text-8xl ${
              showCompletion ? "text-emerald-600" : "text-ink"
            }`}
            aria-live="polite"
            aria-label={`剩余时间 ${displayTime}`}
          >
            {displayTime}
          </p>
          <p className="mt-4 text-sm font-medium text-slate-500">
            {isRunning ? "专注中..." : isPaused ? "已暂停" : "准备开始"}
          </p>
        </div>

        {showCompletion ? (
          <p className="mt-4 animate-in rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
            本次专注完成，做得不错。
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!isRunning && !isPaused ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="btn-primary min-w-[140px]"
            >
              开始计时
            </button>
          ) : null}

          {isRunning ? (
            <button
              type="button"
              onClick={handlePause}
              className="btn-secondary min-w-[140px]"
            >
              暂停
            </button>
          ) : null}

          {isPaused ? (
            <>
              <button
                type="button"
                onClick={handleResume}
                className="btn-primary min-w-[120px]"
              >
                继续
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary min-w-[120px]"
              >
                重置
              </button>
            </>
          ) : null}

          {!isRunning && !isPaused && timeRemaining !== durationMinutes * 60 ? (
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary min-w-[120px]"
            >
              重置
            </button>
          ) : null}
        </div>
      </div>

      <div className="sp-card mt-6">
        <h2 className="sp-section-title">今日统计</h2>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-2xl font-bold text-ink">{todayStats.count}</p>
            <p className="text-sm text-slate-500">专注次数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">{todayStats.minutes}</p>
            <p className="text-sm text-slate-500">专注分钟</p>
          </div>
        </div>
      </div>

      {recentSessions.length > 0 ? (
        <div className="sp-card mt-4">
          <h2 className="sp-section-title">最近记录</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {recentSessions.map((session, index) => (
              <li
                key={`${session.completedAt}-${index}`}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {session.goal || "无目标"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {session.date}
                  </p>
                </div>
                <span className="ml-3 shrink-0 text-sm font-bold text-slate-600">
                  {session.minutes} 分钟
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
