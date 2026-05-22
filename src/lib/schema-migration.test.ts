import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(process.cwd(), "supabase", "migrations", "001_init_schema.sql");
const tableNames = [
  "plans",
  "plan_days",
  "tasks",
  "resources",
  "mistake_reviews",
  "daily_reflections",
  "weekly_summaries",
  "ai_usage_logs",
];

function readMigration() {
  expect(existsSync(migrationPath)).toBe(true);
  return readFileSync(migrationPath, "utf8").toLowerCase();
}

describe("initial Supabase schema migration", () => {
  it("creates all StudyPilot tables", () => {
    const sql = readMigration();

    for (const tableName of tableNames) {
      expect(sql).toContain(`create table if not exists public.${tableName}`);
      expect(sql).toContain(`user_id uuid not null references auth.users(id) on delete cascade`);
    }
  });

  it("enables RLS and defines owner-only CRUD policies for every table", () => {
    const sql = readMigration();

    for (const tableName of tableNames) {
      expect(sql).toContain(`alter table public.${tableName} enable row level security`);
      expect(sql).toContain(`"${tableName}_select_own"`);
      expect(sql).toContain(`"${tableName}_insert_own"`);
      expect(sql).toContain(`"${tableName}_update_own"`);
      expect(sql).toContain(`"${tableName}_delete_own"`);
    }

    expect(sql.match(/auth\.uid\(\) = user_id/g)?.length).toBeGreaterThanOrEqual(32);
  });

  it("adds required status and priority constraints", () => {
    const sql = readMigration();

    expect(sql).toContain("plans_status_check");
    expect(sql).toContain("status in ('active', 'archived', 'completed')");
    expect(sql).toContain("tasks_priority_check");
    expect(sql).toContain("priority in ('must', 'should', 'optional')");
  });

  it("adds required query indexes", () => {
    const sql = readMigration();
    const expectedIndexes = [
      "plans_user_id_status_idx",
      "plan_days_user_id_plan_id_date_idx",
      "tasks_user_id_plan_day_id_is_completed_idx",
      "resources_user_id_plan_day_id_idx",
      "mistake_reviews_user_id_plan_id_date_idx",
      "daily_reflections_user_id_plan_id_date_idx",
      "weekly_summaries_user_id_plan_id_week_index_idx",
      "ai_usage_logs_user_id_endpoint_created_at_idx",
    ];

    for (const indexName of expectedIndexes) {
      expect(sql).toContain(`create index if not exists ${indexName}`);
    }
  });
});
