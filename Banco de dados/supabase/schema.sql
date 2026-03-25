-- NeuroCode AI — Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- Synced from Clerk via webhook (/api/webhooks/clerk)
-- ============================================================
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique not null,
  email         text,
  first_name    text,
  last_name     text,
  avatar_url    text,
  plan          text not null default 'free',          -- free | starter | pro | enterprise
  generations_used  integer not null default 0,
  generations_limit integer not null default 3,         -- free tier limit
  stripe_customer_id      text,
  stripe_subscription_id  text,
  subscription_cancel_at_period_end boolean not null default false,
  payment_failed boolean not null default false,
  preferences   jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Preferências da app (JSONB); idempotente em bases já criadas
alter table public.users add column if not exists preferences jsonb not null default '{}'::jsonb;

-- Index for fast lookups by Clerk ID
create index if not exists users_clerk_id_idx on public.users (clerk_id);

-- Indexes for common query patterns
create index if not exists users_plan_idx             on public.users (plan);
create index if not exists users_stripe_customer_idx  on public.users (stripe_customer_id);
create index if not exists users_created_at_idx       on public.users (created_at desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ============================================================
-- PROJECTS
-- Generated software projects
-- ============================================================
create table if not exists public.projects (
  id              uuid primary key default uuid_generate_v4(),
  user_clerk_id   text not null references public.users (clerk_id) on delete cascade,
  name            text not null,
  description     text,
  type            text not null default 'website',     -- website | landing | webapp | mobile | saas | dashboard | api | automation
  prompt          text,                                 -- original user prompt
  status          text not null default 'draft',        -- draft | generating | completed | error
  generated_code  jsonb,                               -- { files: [{path, language, content}], preview_html, summary, tech_stack }
  tech_stack      text[] default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes
create index if not exists projects_user_idx    on public.projects (user_clerk_id);
create index if not exists projects_created_idx on public.projects (created_at desc);
create index if not exists projects_type_idx    on public.projects (type);
create index if not exists projects_status_idx  on public.projects (status);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable so that service-role key bypasses but anon key is blocked
-- ============================================================
alter table public.users    enable row level security;
alter table public.projects enable row level security;

-- Service role bypasses RLS — our API routes use SUPABASE_SERVICE_ROLE_KEY
-- so no additional policies are needed for server-side access.
-- If you ever need client-side access, add policies here.

-- ============================================================
-- PLAN LIMITS (helper view)
-- ============================================================
create or replace view public.plan_limits as
select
  'free'       as plan, 3   as generations_limit union all
  select 'starter',         20                   union all
  select 'pro',             100                  union all
  select 'enterprise',      -1;  -- -1 = unlimited

-- ============================================================
-- RESET GENERATIONS (call via cron on the 1st of each month)
-- ============================================================
create or replace function public.reset_monthly_generations()
returns void language plpgsql as $$
begin
  update public.users set generations_used = 0;
end;
$$;

-- To schedule with pg_cron (available in Supabase):
-- select cron.schedule('reset-generations', '0 0 1 * *', 'select public.reset_monthly_generations()');

-- ============================================================
-- CONTACT REQUESTS
-- Enterprise / sales contact form submissions
-- ============================================================
create table if not exists public.contact_requests (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  company     text,
  phone       text,
  message     text not null,
  plan        text,                                     -- which plan triggered the contact
  status      text not null default 'new',             -- new | read | replied
  created_at  timestamptz not null default now()
);

create index if not exists contact_requests_created_idx on public.contact_requests (created_at desc);
create index if not exists contact_requests_status_idx  on public.contact_requests (status);

alter table public.contact_requests enable row level security;

-- ============================================================
-- RATE LIMITS
-- Persistent rate limiting table (used by lib/rate-limit.ts)
-- ============================================================
create table if not exists public.rate_limits (
  id         text primary key,
  count      integer not null default 1,
  reset_at   timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limits_reset_idx on public.rate_limits (reset_at);
alter table public.rate_limits enable row level security;

-- Function used by the rate limiter
create or replace function public.upsert_rate_limit(
  p_key       text,
  p_window_ms bigint,
  p_now       timestamptz,
  p_reset_at  timestamptz
) returns integer language plpgsql as $$
declare
  v_count integer;
begin
  -- Delete expired entry for this key
  delete from public.rate_limits where id = p_key and reset_at < p_now;

  -- Insert or increment
  insert into public.rate_limits (id, count, reset_at)
  values (p_key, 1, p_reset_at)
  on conflict (id) do update
    set count = rate_limits.count + 1
  returning count into v_count;

  return v_count;
end;
$$;

-- Service role (used by API routes) must be able to execute the RPC
grant execute on function public.upsert_rate_limit(text, bigint, timestamptz, timestamptz) to service_role;

-- ============================================================
-- MIGRATION — run these if updating an existing database
-- (safe to run multiple times: uses IF NOT EXISTS / IF EXISTS)
-- ============================================================
alter table public.users
  add column if not exists subscription_cancel_at_period_end boolean not null default false,
  add column if not exists payment_failed boolean not null default false;
