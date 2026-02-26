-- ══════════════════════════════════════════════════════════════
-- Migration 001 — Initial Schema
-- Tables: profiles, tracked_jobs, analysis_history, cover_letters
-- ══════════════════════════════════════════════════════════════

-- 1. PROFILES — extends Supabase auth.users with editable fields
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  headline text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. TRACKED JOBS
create table public.tracked_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  company text not null,
  role text not null,
  url text,
  status text not null default 'saved'
    check (status in ('saved', 'applied', 'interview', 'offer', 'rejected')),
  applied_date date,
  job_description text,
  notes text,
  salary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ANALYSIS HISTORY
create table public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  resume_filename text,
  job_description_preview text,
  analysis_mode text,
  jd_match integer,
  ats_score integer,
  readability_score integer,
  overall_grade text,
  missing_keywords text[],
  found_keywords text[],
  full_result jsonb,
  created_at timestamptz default now()
);

-- 4. COVER LETTERS
create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  company_name text,
  role_title text,
  tone text default 'professional',
  cover_letter_text text not null,
  word_count integer,
  job_description_preview text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security
-- ══════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.tracked_jobs enable row level security;
alter table public.analysis_history enable row level security;
alter table public.cover_letters enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own jobs"
  on public.tracked_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own jobs"
  on public.tracked_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs"
  on public.tracked_jobs for update using (auth.uid() = user_id);
create policy "Users can delete own jobs"
  on public.tracked_jobs for delete using (auth.uid() = user_id);

create policy "Users can view own analyses"
  on public.analysis_history for select using (auth.uid() = user_id);
create policy "Users can insert own analyses"
  on public.analysis_history for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses"
  on public.analysis_history for delete using (auth.uid() = user_id);

create policy "Users can view own cover letters"
  on public.cover_letters for select using (auth.uid() = user_id);
create policy "Users can insert own cover letters"
  on public.cover_letters for insert with check (auth.uid() = user_id);
create policy "Users can update own cover letters"
  on public.cover_letters for update using (auth.uid() = user_id);
create policy "Users can delete own cover letters"
  on public.cover_letters for delete using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Indexes
-- ══════════════════════════════════════════════════════════════

create index idx_tracked_jobs_user on public.tracked_jobs(user_id);
create index idx_tracked_jobs_status on public.tracked_jobs(user_id, status);
create index idx_analysis_history_user on public.analysis_history(user_id);
create index idx_analysis_history_date on public.analysis_history(user_id, created_at desc);
create index idx_cover_letters_user on public.cover_letters(user_id);

-- ══════════════════════════════════════════════════════════════
-- Updated-at trigger
-- ══════════════════════════════════════════════════════════════

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.tracked_jobs
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.cover_letters
  for each row execute function public.update_updated_at();
