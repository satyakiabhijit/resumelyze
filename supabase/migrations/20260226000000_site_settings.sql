-- ══════════════════════════════════════════════════════════════
-- Migration 003 — Site Settings (maintenance mode)
-- ══════════════════════════════════════════════════════════════

create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz default now()
);

-- Allow everyone to read (middleware needs to check maintenance_mode)
alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

create policy "Service role can modify site settings"
  on public.site_settings for all
  using (auth.role() = 'service_role');

-- Seed defaults
insert into public.site_settings (key, value)
  values ('maintenance_mode', 'false')
  on conflict (key) do nothing;
