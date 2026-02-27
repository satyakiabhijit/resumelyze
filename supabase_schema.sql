-- ══════════════════════════════════════════════════════════════
-- Resumelyzer — Supabase Database Schema
-- Run this ONCE in Supabase SQL Editor (supabase.com → SQL Editor)
-- ══════════════════════════════════════════════════════════════

-- 1. PROFILES — extends Supabase auth.users with editable fields
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  headline text,         -- e.g. "Senior Frontend Developer"
  bio text,              -- short about-me paragraph
  avatar_url text,
  resume_data jsonb,     -- structured data extracted from resume (skills, experience, education…)
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

-- 2. TRACKED JOBS — the job tracker (replaces localStorage)
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

-- 3. ANALYSIS HISTORY — saved resume analysis results
create table public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  resume_filename text,           -- original uploaded file name
  job_description_preview text,   -- first ~200 chars of JD for display
  analysis_mode text,             -- 'ai', 'local', 'hybrid'
  jd_match integer,
  ats_score integer,
  readability_score integer,
  overall_grade text,             -- 'A+', 'A', 'B+', etc.
  missing_keywords text[],
  found_keywords text[],
  full_result jsonb,              -- entire AnalysisResult object
  created_at timestamptz default now()
);

-- 4. COVER LETTERS — saved generated cover letters
create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,                     -- user-editable label
  company_name text,
  role_title text,
  tone text default 'professional',
  cover_letter_text text not null,
  word_count integer,
  job_description_preview text,   -- first ~200 chars
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — users can only see their own data
-- ══════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.tracked_jobs enable row level security;
alter table public.analysis_history enable row level security;
alter table public.cover_letters enable row level security;

-- Profiles: users read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Tracked Jobs: full CRUD on own rows
create policy "Users can view own jobs"
  on public.tracked_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own jobs"
  on public.tracked_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs"
  on public.tracked_jobs for update using (auth.uid() = user_id);
create policy "Users can delete own jobs"
  on public.tracked_jobs for delete using (auth.uid() = user_id);

-- Analysis History: read/insert own rows
create policy "Users can view own analyses"
  on public.analysis_history for select using (auth.uid() = user_id);
create policy "Users can insert own analyses"
  on public.analysis_history for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses"
  on public.analysis_history for delete using (auth.uid() = user_id);

-- Cover Letters: full CRUD on own rows
create policy "Users can view own cover letters"
  on public.cover_letters for select using (auth.uid() = user_id);
create policy "Users can insert own cover letters"
  on public.cover_letters for insert with check (auth.uid() = user_id);
create policy "Users can update own cover letters"
  on public.cover_letters for update using (auth.uid() = user_id);
create policy "Users can delete own cover letters"
  on public.cover_letters for delete using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Indexes for faster queries
-- ══════════════════════════════════════════════════════════════

create index idx_tracked_jobs_user on public.tracked_jobs(user_id);
create index idx_tracked_jobs_status on public.tracked_jobs(user_id, status);
create index idx_analysis_history_user on public.analysis_history(user_id);
create index idx_analysis_history_date on public.analysis_history(user_id, created_at desc);
create index idx_cover_letters_user on public.cover_letters(user_id);

-- ══════════════════════════════════════════════════════════════
-- Updated-at trigger (auto-update timestamp on row changes)
-- ══════════════════════════════════════════════════════════════

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
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

-- 5. RESUME TEMPLATES — admin-managed LaTeX templates
create table public.resume_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  author text not null default '',
  description text not null default '',
  category text[] not null default '{}',      -- e.g. {"professional","simple"}
  tags text[] not null default '{}',           -- e.g. {"ATS Friendly","Popular"}
  accent text not null default 'from-blue-600 to-blue-800',
  bg text not null default 'bg-blue-50',
  preview_image_url text,                      -- path or URL to preview image
  sample_latex_code text not null default '',   -- LaTeX with {{PLACEHOLDER}} markers
  recommended text[] not null default '{}',     -- e.g. {"Software Engineer","New Grad"}
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: everyone can read active templates; only admins can write
alter table public.resume_templates enable row level security;

create policy "Anyone can view active templates"
  on public.resume_templates for select using (is_active = true);

-- Admin policies (service_role bypasses RLS, but we also add email-based admin check)
-- Option A: use service_role key in API routes (simplest, recommended)
-- Option B: check a profile flag — uncomment below if you add an is_admin column to profiles
-- create policy "Admins can do everything"
--   on public.resume_templates for all
--   using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Add is_admin flag to profiles for admin panel access
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Allow admins full access to resume_templates
create policy "Admins can insert templates"
  on public.resume_templates for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update templates"
  on public.resume_templates for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can delete templates"
  on public.resume_templates for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Index for sort
create index idx_resume_templates_sort on public.resume_templates(sort_order, created_at desc);

-- Auto-update timestamp
create trigger set_updated_at before update on public.resume_templates
  for each row execute function public.update_updated_at();

-- ═══════════════════════════════════════════════════
-- Migration patch: run if you created the DB before
-- this update (adds resume_data to existing profiles)
-- Safe to run even on fresh installs (IF NOT EXISTS)
-- ═══════════════════════════════════════════════════
alter table public.profiles
  add column if not exists resume_data jsonb;

-- ═══════════════════════════════════════════════════════
-- Site settings (key-value config, e.g. maintenance_mode)
-- ═══════════════════════════════════════════════════════
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz default now()
);

-- Allow everyone to read (needed for middleware maintenance check)
alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

create policy "Service role can modify site settings"
  on public.site_settings for all
  using (auth.role() = 'service_role');

-- Seed the maintenance_mode key
insert into public.site_settings (key, value)
  values ('maintenance_mode', 'false')
  on conflict (key) do nothing;
