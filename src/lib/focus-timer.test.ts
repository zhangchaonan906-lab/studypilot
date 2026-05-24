import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
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
} from "./focus-timer";

const rootDir = process.cwd();

function createMockStorage(): Storage {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats seconds only", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(1499)).toBe("24:59");
    expect(formatTime(1500)).toBe("25:00");
    expect(formatTime(3661)).toBe("61:01");
  });

  it("handles negative input by returning 00:00", () => {
    expect(formatTime(-5)).toBe("00:00");
  });
});

describe("getTodayDate", () => {
  it("returns YYYY-MM-DD format", () => {
    const date = getTodayDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("localStorage sessions", () => {
  it("returns empty array when no sessions stored", () => {
    const storage = createMockStorage();
    expect(loadSessions(storage)).toEqual([]);
  });

  it("saves and loads sessions", () => {
    const storage = createMockStorage();
    const session: FocusSession = {
      date: "2026-05-25",
      goal: "完成高数极限",
      minutes: 25,
      completedAt: "2026-05-25T10:00:00.000Z",
    };

    saveSession(storage, session);
    const loaded = loadSessions(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].goal).toBe("完成高数极限");
    expect(loaded[0].minutes).toBe(25);
  });

  it("prepends new sessions to the list", () => {
    const storage = createMockStorage();
    saveSession(storage, {
      date: "2026-05-24",
      goal: "first",
      minutes: 25,
      completedAt: "2026-05-24T10:00:00.000Z",
    });
    saveSession(storage, {
      date: "2026-05-25",
      goal: "second",
      minutes: 45,
      completedAt: "2026-05-25T10:00:00.000Z",
    });

    const loaded = loadSessions(storage);
    expect(loaded).toHaveLength(2);
    expect(loaded[0].goal).toBe("second");
    expect(loaded[1].goal).toBe("first");
  });

  it("handles corrupted data gracefully", () => {
    const storage = createMockStorage();
    storage.setItem("studypilot:focus-sessions", "not json at all");
    expect(loadSessions(storage)).toEqual([]);

    storage.setItem("studypilot:focus-sessions", "42");
    expect(loadSessions(storage)).toEqual([]);
  });
});

describe("localStorage goal", () => {
  it("returns empty string when no goal stored", () => {
    const storage = createMockStorage();
    expect(loadGoal(storage)).toBe("");
  });

  it("saves and loads goal", () => {
    const storage = createMockStorage();
    saveGoal(storage, "完成高数极限章节 3 道题");
    expect(loadGoal(storage)).toBe("完成高数极限章节 3 道题");
  });

  it("overwrites previous goal", () => {
    const storage = createMockStorage();
    saveGoal(storage, "first goal");
    saveGoal(storage, "second goal");
    expect(loadGoal(storage)).toBe("second goal");
  });
});

describe("getTodayStats", () => {
  it("returns zeros for empty session list", () => {
    expect(getTodayStats([])).toEqual({ count: 0, minutes: 0 });
  });

  it("counts only today's sessions", () => {
    const today = getTodayDate();
    const sessions: FocusSession[] = [
      {
        date: today,
        goal: "a",
        minutes: 25,
        completedAt: new Date().toISOString(),
      },
      {
        date: today,
        goal: "b",
        minutes: 45,
        completedAt: new Date().toISOString(),
      },
      {
        date: "2025-01-01",
        goal: "old",
        minutes: 60,
        completedAt: "2025-01-01T10:00:00.000Z",
      },
    ];

    expect(getTodayStats(sessions)).toEqual({ count: 2, minutes: 70 });
  });
});

describe("getRecentSessions", () => {
  it("returns the most recent sessions up to the limit", () => {
    const sessions: FocusSession[] = [
      {
        date: "2026-05-25",
        goal: "1",
        minutes: 25,
        completedAt: "2026-05-25T10:00:00.000Z",
      },
      {
        date: "2026-05-24",
        goal: "2",
        minutes: 45,
        completedAt: "2026-05-24T10:00:00.000Z",
      },
      {
        date: "2026-05-23",
        goal: "3",
        minutes: 60,
        completedAt: "2026-05-23T10:00:00.000Z",
      },
    ];

    expect(getRecentSessions(sessions, 2)).toHaveLength(2);
    expect(getRecentSessions(sessions, 10)).toHaveLength(3);
    expect(getRecentSessions(sessions, 0)).toHaveLength(0);
  });
});

describe("focus page structure", () => {
  it("renders FocusTimer instead of placeholder", () => {
    const pagePath = join(rootDir, "src", "app", "(app)", "focus", "page.tsx");
    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("FocusTimer");
    expect(source).not.toContain("计时功能正在准备中");
  });
});

describe("FocusTimer component structure", () => {
  const source = readFileSync(
    join(rootDir, "src", "components", "FocusTimer.tsx"),
    "utf8",
  );

  it("has duration presets with 25, 45, and 60 minutes", () => {
    expect(source).toContain("25, 45, 60");
    expect(source).toContain("分钟");
  });

  it("supports custom minutes input", () => {
    expect(source).toContain("isCustomMode");
    expect(source).toContain("自定义");
  });

  it("has start, pause, and reset controls", () => {
    expect(source).toContain("开始计时");
    expect(source).toContain("handlePause");
    expect(source).toContain("handleReset");
  });

  it("shows completion message after timer finishes", () => {
    expect(source).toContain("本次专注完成，做得不错。");
  });

  it("saves completed sessions to localStorage", () => {
    expect(source).toContain("saveSession");
    expect(source).toContain("loadSessions");
    const utilsSource = readFileSync(
      join(rootDir, "src", "lib", "focus-timer.ts"),
      "utf8",
    );
    expect(utilsSource).toContain("studypilot:focus-sessions");
  });

  it("updates document title while running", () => {
    expect(source).toContain("document.title");
    expect(source).toContain("StudyPilot");
  });

  it("displays today stats and recent sessions", () => {
    expect(source).toContain("getTodayStats");
    expect(source).toContain("getRecentSessions");
    expect(source).toContain("今日统计");
    expect(source).toContain("最近记录");
  });

  it("disables duration selection while timer is running", () => {
    expect(source).toContain("timerActive");
    expect(source).toContain("disabled={timerActive}");
  });
});

describe("focus-timer linkage with today tasks", () => {
  it("accepts initialGoal prop for pre-filling from query params", () => {
    const timerSource = readFileSync(
      join(rootDir, "src", "components", "FocusTimer.tsx"),
      "utf8",
    );
    expect(timerSource).toContain("initialGoal?: string");
    expect(timerSource).toContain("initialGoal && initialGoal.trim()");
  });

  it("reads goal searchParam in /focus page", () => {
    const pageSource = readFileSync(
      join(rootDir, "src", "app", "(app)", "focus", "page.tsx"),
      "utf8",
    );
    expect(pageSource).toContain("searchParams");
    expect(pageSource).toContain("goal");
    expect(pageSource).toContain("decodeURIComponent");
    expect(pageSource).toContain("initialGoal={initialGoal}");
  });

  it("shows focus start link in TaskCompletionToggle for incomplete tasks", () => {
    const toggleSource = readFileSync(
      join(rootDir, "src", "components", "TaskCompletionToggle.tsx"),
      "utf8",
    );
    expect(toggleSource).toContain("开始专注");
    expect(toggleSource).toContain("encodeURIComponent");
    expect(toggleSource).toContain("/focus?goal=");
    expect(toggleSource).toContain("!isCompleted");
  });

  it("includes estimatedMinutes in focus link when available", () => {
    const toggleSource = readFileSync(
      join(rootDir, "src", "components", "TaskCompletionToggle.tsx"),
      "utf8",
    );
    expect(toggleSource).toContain("estimatedMinutes");
    expect(toggleSource).toContain("&minutes=");
  });

  it("accepts initialMinutes prop in FocusTimer", () => {
    const timerSource = readFileSync(
      join(rootDir, "src", "components", "FocusTimer.tsx"),
      "utf8",
    );
    expect(timerSource).toContain("initialMinutes?: number");
    expect(timerSource).toContain("initialMinutes && initialMinutes >= 1");
  });

  it("reads minutes searchParam in /focus page", () => {
    const pageSource = readFileSync(
      join(rootDir, "src", "app", "(app)", "focus", "page.tsx"),
      "utf8",
    );
    expect(pageSource).toContain("minutes");
    expect(pageSource).toContain("initialMinutes={initialMinutes}");
  });

  it("passes estimatedMinutes from /today to TaskCompletionToggle", () => {
    const todaySource = readFileSync(
      join(rootDir, "src", "app", "(app)", "today", "page.tsx"),
      "utf8",
    );
    expect(todaySource).toContain("estimatedMinutes={task.estimated_minutes");
  });
});

describe("NewPlanForm auto-estimate", () => {
  const formSource = readFileSync(
    join(rootDir, "src", "components", "NewPlanForm.tsx"),
    "utf8",
  );

  it("replaces manual dailyMinutes input with auto-estimate card", () => {
    expect(formSource).not.toContain("建议先填能稳定坚持的时间");
    expect(formSource).toContain("自动估算每日学习时间");
    expect(formSource).toContain("填写学习目标和计划天数后自动估算");
  });

  it("shows intensity and sprint warning", () => {
    expect(formSource).toContain("计划强度");
    expect(formSource).toContain("当前计划强度较高");
  });

  it("keeps dailyMinutes as hidden field for form submission", () => {
    expect(formSource).toContain('type="hidden"');
    expect(formSource).toContain('name="daily_minutes"');
  });

  it("imports time estimation function", () => {
    expect(formSource).toContain("estimateDailyStudyMinutes");
  });
});

describe("backend dailyMinutes enforcement", () => {
  it("recalculates dailyMinutes in validateGeneratePlanRequest", () => {
    const schemaSource = readFileSync(
      join(rootDir, "src", "lib", "ai", "schemas.ts"),
      "utf8",
    );
    expect(schemaSource).toContain("estimateDailyStudyMinutes");
    expect(schemaSource).toContain("dailyMinutes: backendDailyMinutes.dailyMinutes");
  });

  it("normalizes task estimatedMinutes with clamping", () => {
    const genSource = readFileSync(
      join(rootDir, "src", "lib", "ai", "generate-plan.ts"),
      "utf8",
    );
    expect(genSource).toContain("normalizeTaskMinutes");
    expect(genSource).toContain("Math.max(10, Math.min(90");
  });

  it("includes task time allocation requirements in AI prompt", () => {
    const genSource = readFileSync(
      join(rootDir, "src", "lib", "ai", "generate-plan.ts"),
      "utf8",
    );
    expect(genSource).toContain("任务时间分配要求");
    expect(genSource).toContain("±20%");
  });
});
