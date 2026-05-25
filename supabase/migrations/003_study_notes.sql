create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  plan_id uuid references public.plans(id) on delete set null,
  course_name text,
  tags text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint notes_title_length_check check (
    length(btrim(title)) > 0 and length(btrim(title)) <= 100
  )
);

create table if not exists public.note_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer not null,
  mime_type text,
  attachment_type text not null,
  created_at timestamptz default now(),
  constraint note_attachments_file_size_check check (file_size > 0),
  constraint note_attachments_type_check check (attachment_type in ('image', 'file')),
  constraint note_attachments_file_path_key unique (file_path)
);

create index if not exists notes_user_id_updated_at_idx
  on public.notes(user_id, updated_at desc);

create index if not exists notes_user_id_plan_id_idx
  on public.notes(user_id, plan_id);

create index if not exists note_attachments_user_id_note_id_idx
  on public.note_attachments(user_id, note_id);

alter table public.notes enable row level security;
alter table public.note_attachments enable row level security;

create policy "notes_select_own"
  on public.notes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.notes for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      plan_id is null
      or exists (
        select 1
        from public.plans
        where plans.id = notes.plan_id
          and plans.user_id = auth.uid()
      )
    )
  );

create policy "notes_update_own"
  on public.notes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      plan_id is null
      or exists (
        select 1
        from public.plans
        where plans.id = notes.plan_id
          and plans.user_id = auth.uid()
      )
    )
  );

create policy "notes_delete_own"
  on public.notes for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "note_attachments_select_own"
  on public.note_attachments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "note_attachments_insert_own"
  on public.note_attachments for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.notes
      where notes.id = note_attachments.note_id
        and notes.user_id = auth.uid()
    )
  );

create policy "note_attachments_delete_own"
  on public.note_attachments for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'study-notes',
  'study-notes',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "study_notes_objects_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'study-notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "study_notes_objects_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'study-notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "study_notes_objects_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'study-notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
