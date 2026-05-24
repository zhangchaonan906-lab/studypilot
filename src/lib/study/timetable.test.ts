import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

describe("timetable data layer", () => {
  it("rejects empty course name", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain("课程名称不能为空");
    expect(source).toContain("course_name.trim().length === 0");
  });

  it("validates weekday range 1-7", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain("星期几必须是 1-7");
    expect(source).toContain("weekday < 1 || input.weekday > 7");
  });

  it("validates start time before end time", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain("开始时间必须早于结束时间");
    expect(source).toContain("start_time >= input.end_time");
  });

  it("enforces user ownership on select", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain('eq("user_id", userId)');
  });

  it("validates input before update", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain("validateTimetableInput(input)");
  });

  it("returns error when entry not found on update", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain("课程不存在或无权修改");
  });

  it("returns error when entry not found on delete", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain("count === 0");
  });

  it("redirects to login when unauthenticated", () => {
    const source = readFileSync(
      join(rootDir, "src", "lib", "study", "timetable.ts"),
      "utf8",
    );
    expect(source).toContain('redirect("/login")');
  });
});

describe("timetable server actions", () => {
  const source = readFileSync(
    join(rootDir, "src", "lib", "study", "timetable-actions.ts"),
    "utf8",
  );

  it("validates course name in server action", () => {
    expect(source).toContain("课程名称不能为空。");
  });

  it("validates weekday in server action", () => {
    expect(source).toContain("请选择有效的星期。");
  });

  it("validates time range in server action", () => {
    expect(source).toContain("请填写开始时间和结束时间。");
    expect(source).toContain("开始时间必须早于结束时间。");
  });

  it("revalidates schedule path after mutations", () => {
    expect(source).toContain('revalidatePath("/schedule")');
  });

  it("has create action", () => {
    expect(source).toContain("createTimetableEntryAction");
  });

  it("has update action", () => {
    expect(source).toContain("updateTimetableEntryAction");
  });

  it("has delete action", () => {
    expect(source).toContain("deleteTimetableEntryAction");
  });

  it("catches errors and returns safe messages", () => {
    expect(source).toContain("添加课程失败，请稍后重试");
    expect(source).toContain("更新课程失败，请稍后重试");
    expect(source).toContain("删除课程失败，请稍后重试");
  });
});

describe("timetable page", () => {
  it("schedule page exists and renders", () => {
    const pagePath = join(rootDir, "src", "app", "(app)", "schedule", "page.tsx");
    expect(existsSync(pagePath)).toBe(true);

    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("课程表");
    expect(source).toContain("getTimetableEntries");
    expect(source).toContain("TimetableClient");
    expect(source).toContain('dynamic = "force-dynamic"');
    expect(source).toContain("还没有课程");
  });

  it("timetable client renders weekly grid", () => {
    const clientPath = join(rootDir, "src", "app", "(app)", "schedule", "TimetableClient.tsx");
    expect(existsSync(clientPath)).toBe(true);

    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("周一");
    expect(source).toContain("周日");
    expect(source).toContain("添加课程");
    expect(source).toContain("编辑课程");
    expect(source).toContain("确认删除");
    expect(source).toContain("课程名称");
    expect(source).toContain("开始时间");
    expect(source).toContain("结束时间");
    expect(source).toContain("地点");
    expect(source).toContain("老师");
    expect(source).toContain("备注");
    expect(source).toContain("颜色标签");
  });

  it("supports mobile and desktop layouts", () => {
    const source = readFileSync(
      join(rootDir, "src", "app", "(app)", "schedule", "TimetableClient.tsx"),
      "utf8",
    );
    expect(source).toContain("lg:grid-cols-7");
    expect(source).toContain("lg:hidden");
  });
});

describe("timetable migration", () => {
  it("has timetable_entries table with constraints", () => {
    const migrationPath = join(
      rootDir,
      "supabase",
      "migrations",
      "002_schedule_checkin.sql",
    );
    expect(existsSync(migrationPath)).toBe(true);

    const source = readFileSync(migrationPath, "utf8");
    expect(source).toContain("timetable_entries");
    expect(source).toContain("weekday_check");
    expect(source).toContain("course_name_check");
    expect(source).toContain("time_check");
    expect(source).toContain("user_id uuid not null references auth.users(id) on delete cascade");
  });

  it("has RLS enabled on timetable_entries", () => {
    const source = readFileSync(
      join(rootDir, "supabase", "migrations", "002_schedule_checkin.sql"),
      "utf8",
    );
    expect(source).toContain("timetable_entries enable row level security");
    expect(source).toContain("timetable_entries_select_own");
    expect(source).toContain("timetable_entries_insert_own");
    expect(source).toContain("timetable_entries_update_own");
    expect(source).toContain("timetable_entries_delete_own");
  });
});
