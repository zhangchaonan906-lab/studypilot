import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "003_study_notes.sql",
);

function readMigration() {
  expect(existsSync(migrationPath)).toBe(true);
  return readFileSync(migrationPath, "utf8").toLowerCase();
}

describe("study notes migration", () => {
  it("creates notes and note_attachments with required constraints", () => {
    const sql = readMigration();

    expect(sql).toContain("create table if not exists public.notes");
    expect(sql).toContain("create table if not exists public.note_attachments");
    expect(sql).toContain("references public.plans(id) on delete set null");
    expect(sql).toContain("references public.notes(id) on delete cascade");
    expect(sql).toContain("notes_title_length_check");
    expect(sql).toContain("attachment_type in ('image', 'file')");
    expect(sql).toContain("file_size > 0");
  });

  it("enables RLS and owner-only policies for notes and attachments", () => {
    const sql = readMigration();

    for (const table of ["notes", "note_attachments"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(`"${table}_select_own"`);
      expect(sql).toContain(`"${table}_insert_own"`);
      expect(sql).toContain(`"${table}_delete_own"`);
    }

    expect(sql).toContain('"notes_update_own"');
    expect(sql).toContain("auth.uid() = user_id");
    expect(sql).toContain("exists (");
  });

  it("creates a private study-notes storage bucket and owner path policies", () => {
    const sql = readMigration();

    expect(sql).toContain("storage.buckets");
    expect(sql).toContain("'study-notes'");
    expect(sql).toContain("public = false");
    expect(sql).toContain("10485760");
    expect(sql).toContain("storage.objects");
    expect(sql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
  });
});
