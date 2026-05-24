import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { getTimetableEntries } from "@/lib/study/timetable";
import { TimetableClient } from "./TimetableClient";
import type { TimetableEntry } from "@/lib/study/types";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let entries: TimetableEntry[] = [];
  let dbError: string | null = null;

  try {
    entries = await getTimetableEntries();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Could not find the table") || message.includes("schema cache")) {
      dbError = "数据库表未创建，请先在 Supabase SQL Editor 中执行迁移。";
    } else {
      dbError = message || "加载课程表失败，请稍后重试。";
    }
    entries = [];
  }

  return (
    <>
      <PageHeader
        eyebrow="课程表"
        title="规划你的每周课程"
        description="手动添加你的课程安排，StudyPilot 会帮你整理每周学习节奏。"
      />

      {dbError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-lg font-bold text-amber-800">需要设置数据库</p>
          <p className="mt-2 text-sm text-amber-700">{dbError}</p>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-semibold text-amber-800">
              点击查看需要执行的 SQL
            </summary>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-green-300 max-h-64">
{`-- 在 Supabase Dashboard > SQL Editor 中执行以下 SQL：

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null,
  weekday smallint not null,
  start_time time not null,
  end_time time not null,
  location text,
  teacher text,
  note text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint timetable_entries_weekday_check check (weekday between 1 and 7),
  constraint timetable_entries_course_name_check check (length(trim(course_name)) > 0),
  constraint timetable_entries_time_check check (start_time < end_time)
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  created_at timestamptz default now(),
  constraint daily_checkins_user_date_unique unique (user_id, checkin_date)
);

create index if not exists timetable_entries_user_id_weekday_idx
  on public.timetable_entries(user_id, weekday);

create index if not exists daily_checkins_user_id_checkin_date_idx
  on public.daily_checkins(user_id, checkin_date);

alter table public.timetable_entries enable row level security;
alter table public.daily_checkins enable row level security;

create policy "timetable_entries_select_own"
  on public.timetable_entries for select to authenticated
  using (auth.uid() = user_id);

create policy "timetable_entries_insert_own"
  on public.timetable_entries for insert to authenticated
  with check (auth.uid() = user_id);

create policy "timetable_entries_update_own"
  on public.timetable_entries for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "timetable_entries_delete_own"
  on public.timetable_entries for delete to authenticated
  using (auth.uid() = user_id);

create policy "daily_checkins_select_own"
  on public.daily_checkins for select to authenticated
  using (auth.uid() = user_id);

create policy "daily_checkins_insert_own"
  on public.daily_checkins for insert to authenticated
  with check (auth.uid() = user_id);

create policy "daily_checkins_delete_own"
  on public.daily_checkins for delete to authenticated
  using (auth.uid() = user_id);`}
            </pre>
          </details>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="还没有课程"
          description="还没有课程，添加第一门课吧。"
        />
      ) : null}

      {!dbError ? <TimetableClient initialEntries={entries} /> : null}
    </>
  );
}
