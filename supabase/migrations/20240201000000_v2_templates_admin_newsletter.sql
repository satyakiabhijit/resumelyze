-- ══════════════════════════════════════════════════════════════
-- Migration 002 — Templates, Admin flag, Newsletter
-- ══════════════════════════════════════════════════════════════

-- 1. Add is_admin flag to profiles
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 2. Add resume_data column to profiles
alter table public.profiles
  add column if not exists resume_data jsonb;

-- 3. Resume templates table
create table if not exists public.resume_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  author text not null default '',
  description text not null default '',
  category text[] not null default '{}',
  tags text[] not null default '{}',
  accent text not null default 'from-blue-600 to-blue-800',
  bg text not null default 'bg-blue-50',
  preview_image_url text,
  sample_latex_code text not null default '',
  recommended text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resume_templates enable row level security;

drop policy if exists "Anyone can view active templates" on public.resume_templates;
drop policy if exists "Admins can insert templates" on public.resume_templates;
drop policy if exists "Admins can update templates" on public.resume_templates;
drop policy if exists "Admins can delete templates" on public.resume_templates;

create policy "Anyone can view active templates"
  on public.resume_templates for select using (is_active = true);

create policy "Admins can insert templates"
  on public.resume_templates for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update templates"
  on public.resume_templates for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can delete templates"
  on public.resume_templates for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create index if not exists idx_resume_templates_sort
  on public.resume_templates(sort_order, created_at desc);

drop trigger if exists set_updated_at on public.resume_templates;
create trigger set_updated_at before update on public.resume_templates
  for each row execute function public.update_updated_at();

-- 4. Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  user_id uuid references public.profiles(id) on delete set null,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  is_active boolean not null default true
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert with check (true);

drop policy if exists "Users can unsubscribe" on public.newsletter_subscribers;
create policy "Users can unsubscribe"
  on public.newsletter_subscribers for update using (true);

drop policy if exists "Admins can view subscribers" on public.newsletter_subscribers;
create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop policy if exists "Admins can delete subscribers" on public.newsletter_subscribers;
create policy "Admins can delete subscribers"
  on public.newsletter_subscribers for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers(email);
create index if not exists idx_newsletter_subscribers_active
  on public.newsletter_subscribers(is_active);

-- 5. Sent newsletters log
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null,
  body_text text,
  sent_by uuid references public.profiles(id),
  recipient_count integer not null default 0,
  status text not null default 'sent' check (status in ('draft', 'sent', 'failed')),
  sent_at timestamptz default now()
);

alter table public.newsletters enable row level security;

drop policy if exists "Admins can manage newsletters" on public.newsletters;
create policy "Admins can manage newsletters"
  on public.newsletters for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create index if not exists idx_newsletters_sent_at on public.newsletters(sent_at desc);

-- ══════════════════════════════════════════════════════════════
-- After running: make yourself admin
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';
-- Also: create Storage bucket "template-images" (public ON)
-- ══════════════════════════════════════════════════════════════
