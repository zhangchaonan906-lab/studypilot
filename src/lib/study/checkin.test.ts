import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

describe("checkin data layer", () => {
  const source = readFileSync(
    join(rootDir, "src", "lib", "study", "checkin.ts"),
    "utf8",
  );

  it("rejects duplicate checkin", () => {
    expect(source).toContain("今天已经打过卡了");
    expect(source).toContain("count > 0");
  });

  it("rejects cancel when not checked in", () => {
    expect(source).toContain("今天还没有打卡，无法取消");
    expect(source).toContain("count === 0");
  });

  it("enforces user ownership on checkin queries", () => {
    expect(source).toContain('eq("user_id", userId)');
  });

  it("queries monthly checkins with date range", () => {
    expect(source).toContain('gte("checkin_date"');
    expect(source).toContain('lte("checkin_date"');
  });

  it("calculates checkin streak correctly", () => {
    expect(source).toContain("streak");
    expect(source).toContain("setDate(checkDate.getDate() - 1)");
  });

  it("computes stats with monthTotal and streak", () => {
    expect(source).toContain("monthTotal");
    expect(source).toContain("getCheckinStats");
  });

  it("redirects to login when unauthenticated", () => {
    expect(source).toContain('redirect("/login")');
  });
});

describe("checkin server actions", () => {
  const source = readFileSync(
    join(rootDir, "src", "lib", "study", "checkin-actions.ts"),
    "utf8",
  );

  it("has checkin action", () => {
    expect(source).toContain("checkInTodayAction");
    expect(source).toContain("checkInToday");
  });

  it("has cancel action", () => {
    expect(source).toContain("cancelTodayCheckinAction");
    expect(source).toContain("cancelTodayCheckin");
  });

  it("revalidates checkin path", () => {
    expect(source).toContain('revalidatePath("/checkin")');
  });

  it("catches errors and returns safe messages", () => {
    expect(source).toContain("打卡失败，请稍后重试");
    expect(source).toContain("取消打卡失败，请稍后重试");
  });
});

describe("checkin page", () => {
  it("checkin page exists and renders with paw emoji", () => {
    const pagePath = join(rootDir, "src", "app", "(app)", "checkin", "page.tsx");
    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("猫爪打卡");
    expect(source).toContain("getCheckinStats");
    expect(source).toContain("getMonthlyCheckins");
    expect(source).toContain("CheckinClient");
    expect(source).toContain('dynamic = "force-dynamic"');
  });

  it("checkin client renders calendar and stats", () => {
    const clientPath = join(rootDir, "src", "app", "(app)", "checkin", "CheckinClient.tsx");
    expect(existsSync(clientPath)).toBe(true);

    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("本月打卡");
    expect(source).toContain("连续打卡");
    expect(source).toContain("今日状态");
    expect(source).toContain("今日打卡");
    expect(source).toContain("取消今日打卡");
    expect(source).toContain("🐾");
    expect(source).toContain("已打卡");
    expect(source).toContain("未打卡");
  });

  it("renders weekday headers starting from Monday", () => {
    const source = readFileSync(
      join(rootDir, "src", "app", "(app)", "checkin", "CheckinClient.tsx"),
      "utf8",
    );
    expect(source).toContain('"一"');
    expect(source).toContain('"日"');
  });

  it("highlights today in calendar", () => {
    const source = readFileSync(
      join(rootDir, "src", "app", "(app)", "checkin", "CheckinClient.tsx"),
      "utf8",
    );
    expect(source).toContain("isToday");
    expect(source).toContain("bg-primary text-white");
  });

  it("shows paw emoji on checked-in dates", () => {
    const source = readFileSync(
      join(rootDir, "src", "app", "(app)", "checkin", "CheckinClient.tsx"),
      "utf8",
    );
    expect(source).toContain("isCheckedIn");
    expect(source).toContain("bg-amber-50");
  });

  it("dims future dates", () => {
    const source = readFileSync(
      join(rootDir, "src", "app", "(app)", "checkin", "CheckinClient.tsx"),
      "utf8",
    );
    expect(source).toContain("isFuture");
    expect(source).toContain("opacity-40");
  });

  it("has month navigation", () => {
    const source = readFileSync(
      join(rootDir, "src", "app", "(app)", "checkin", "CheckinClient.tsx"),
      "utf8",
    );
    expect(source).toContain("上月");
    expect(source).toContain("下月");
  });
});

describe("checkin migration", () => {
  it("has daily_checkins table with unique constraint", () => {
    const migrationPath = join(
      rootDir,
      "supabase",
      "migrations",
      "002_schedule_checkin.sql",
    );
    expect(existsSync(migrationPath)).toBe(true);

    const source = readFileSync(migrationPath, "utf8");
    expect(source).toContain("daily_checkins");
    expect(source).toContain("unique (user_id, checkin_date)");
    expect(source).toContain("user_id uuid not null references auth.users(id) on delete cascade");
  });

  it("has RLS enabled on daily_checkins (no update policy)", () => {
    const source = readFileSync(
      join(rootDir, "supabase", "migrations", "002_schedule_checkin.sql"),
      "utf8",
    );
    expect(source).toContain("daily_checkins enable row level security");
    expect(source).toContain("daily_checkins_select_own");
    expect(source).toContain("daily_checkins_insert_own");
    expect(source).toContain("daily_checkins_delete_own");
    // No update policy for checkins
    expect(source).not.toContain("daily_checkins_update_own");
  });
});
