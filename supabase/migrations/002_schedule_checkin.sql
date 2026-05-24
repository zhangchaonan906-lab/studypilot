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
  on public.timetable_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "timetable_entries_insert_own"
  on public.timetable_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "timetable_entries_update_own"
  on public.timetable_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "timetable_entries_delete_own"
  on public.timetable_entries for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "daily_checkins_select_own"
  on public.daily_checkins for select
  to authenticated
  using (auth.uid() = user_id);

create policy "daily_checkins_insert_own"
  on public.daily_checkins for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "daily_checkins_delete_own"
  on public.daily_checkins for delete
  to authenticated
  using (auth.uid() = user_id);
