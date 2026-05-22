create extension if not exists "pgcrypto";

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  goal text not null,
  current_level text,
  deadline date not null,
  daily_minutes int not null,
  rest_days_per_week int default 1,
  preference text,
  overview text,
  status text default 'active',
  created_at timestamptz default now(),
  constraint plans_status_check check (status in ('active', 'archived', 'completed'))
);

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_index int not null,
  date date not null,
  title text not null,
  summary text,
  review_method text,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  priority text default 'must',
  estimated_minutes int,
  is_completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  constraint tasks_priority_check check (priority in ('must', 'should', 'optional'))
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text,
  description text,
  search_keywords text,
  created_at timestamptz default now()
);

create table if not exists public.mistake_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  date date not null,
  question text,
  mistake_reason text,
  correct_method text,
  next_action text,
  created_at timestamptz default now()
);

create table if not exists public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  date date not null,
  mood text,
  difficulty text,
  note text,
  created_at timestamptz default now(),
  constraint daily_reflections_user_plan_date_key unique (user_id, plan_id, date)
);

create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  week_index int not null,
  start_date date not null,
  end_date date not null,
  completion_rate numeric,
  summary text,
  strengths text,
  weaknesses text,
  next_week_advice text,
  created_at timestamptz default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  success boolean default true,
  created_at timestamptz default now()
);

create index if not exists plans_user_id_status_idx
  on public.plans(user_id, status);

create index if not exists plan_days_user_id_plan_id_date_idx
  on public.plan_days(user_id, plan_id, date);

create index if not exists tasks_user_id_plan_day_id_is_completed_idx
  on public.tasks(user_id, plan_day_id, is_completed);

create index if not exists resources_user_id_plan_day_id_idx
  on public.resources(user_id, plan_day_id);

create index if not exists mistake_reviews_user_id_plan_id_date_idx
  on public.mistake_reviews(user_id, plan_id, date);

create index if not exists daily_reflections_user_id_plan_id_date_idx
  on public.daily_reflections(user_id, plan_id, date);

create index if not exists weekly_summaries_user_id_plan_id_week_index_idx
  on public.weekly_summaries(user_id, plan_id, week_index);

create index if not exists ai_usage_logs_user_id_endpoint_created_at_idx
  on public.ai_usage_logs(user_id, endpoint, created_at);

alter table public.plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;
alter table public.mistake_reviews enable row level security;
alter table public.daily_reflections enable row level security;
alter table public.weekly_summaries enable row level security;
alter table public.ai_usage_logs enable row level security;

create policy "plans_select_own"
  on public.plans for select
  to authenticated
  using (auth.uid() = user_id);

create policy "plans_insert_own"
  on public.plans for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "plans_update_own"
  on public.plans for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plans_delete_own"
  on public.plans for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "plan_days_select_own"
  on public.plan_days for select
  to authenticated
  using (auth.uid() = user_id);

create policy "plan_days_insert_own"
  on public.plan_days for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "plan_days_update_own"
  on public.plan_days for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plan_days_delete_own"
  on public.plan_days for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "tasks_select_own"
  on public.tasks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "resources_select_own"
  on public.resources for select
  to authenticated
  using (auth.uid() = user_id);

create policy "resources_insert_own"
  on public.resources for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "resources_update_own"
  on public.resources for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "resources_delete_own"
  on public.resources for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "mistake_reviews_select_own"
  on public.mistake_reviews for select
  to authenticated
  using (auth.uid() = user_id);

create policy "mistake_reviews_insert_own"
  on public.mistake_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "mistake_reviews_update_own"
  on public.mistake_reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mistake_reviews_delete_own"
  on public.mistake_reviews for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "daily_reflections_select_own"
  on public.daily_reflections for select
  to authenticated
  using (auth.uid() = user_id);

create policy "daily_reflections_insert_own"
  on public.daily_reflections for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "daily_reflections_update_own"
  on public.daily_reflections for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_reflections_delete_own"
  on public.daily_reflections for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "weekly_summaries_select_own"
  on public.weekly_summaries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "weekly_summaries_insert_own"
  on public.weekly_summaries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "weekly_summaries_update_own"
  on public.weekly_summaries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weekly_summaries_delete_own"
  on public.weekly_summaries for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "ai_usage_logs_select_own"
  on public.ai_usage_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "ai_usage_logs_insert_own"
  on public.ai_usage_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "ai_usage_logs_update_own"
  on public.ai_usage_logs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ai_usage_logs_delete_own"
  on public.ai_usage_logs for delete
  to authenticated
  using (auth.uid() = user_id);
