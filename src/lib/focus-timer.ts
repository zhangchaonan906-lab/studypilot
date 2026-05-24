export type FocusSession = {
  date: string;
  goal: string;
  minutes: number;
  completedAt: string;
};

const SESSIONS_KEY = "studypilot:focus-sessions";
const GOAL_KEY = "studypilot:focus-goal";

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getTodayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function loadSessions(storage: Storage): FocusSession[] {
  try {
    const raw = storage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FocusSession[];
  } catch {
    return [];
  }
}

export function saveSession(storage: Storage, session: FocusSession): void {
  const sessions = loadSessions(storage);
  sessions.unshift(session);
  storage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadGoal(storage: Storage): string {
  try {
    return storage.getItem(GOAL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveGoal(storage: Storage, goal: string): void {
  storage.setItem(GOAL_KEY, goal);
}

export function getTodayStats(sessions: FocusSession[]): {
  count: number;
  minutes: number;
} {
  const today = getTodayDate();
  const todaySessions = sessions.filter((s) => s.date === today);
  return {
    count: todaySessions.length,
    minutes: todaySessions.reduce((sum, s) => sum + s.minutes, 0),
  };
}

export function getRecentSessions(
  sessions: FocusSession[],
  limit: number,
): FocusSession[] {
  return sessions.slice(0, limit);
}
