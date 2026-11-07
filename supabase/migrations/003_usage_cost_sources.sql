-- Migration 003: API usage tracking, cost caps, source intelligence, and rate limits
-- api_usage: per-engine cost ledger (used by cost guard + billing)
-- source_stats: which domains feed AI answers (source intelligence differentiator)
-- rate_limits: enforces the 3-request/day per-IP limit on free-check endpoint

create table public.api_usage (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade,
  run_id uuid references public.scan_runs(id) on delete cascade,
  engine text not null,
  cost_usd numeric(10,4) not null,
  created_at timestamptz not null default now()
);

create table public.source_stats (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  snapshot_date date not null,
  source_domain text not null,
  appearance_count int not null default 0,
  is_reddit boolean not null default false,
  unique (project_id, snapshot_date, source_domain)
);

create table public.rate_limits (
  id bigint generated always as identity primary key,
  ip_address text not null,
  endpoint text not null,
  request_count int not null default 0,
  window_start timestamptz not null default now(),
  unique (ip_address, endpoint, window_start)
);

create index if not exists idx_api_usage_project_id on public.api_usage(project_id);
create index if not exists idx_api_usage_run_id on public.api_usage(run_id);
create index if not exists idx_source_stats_project on public.source_stats(project_id, snapshot_date);
create index if not exists idx_rate_limits_ip on public.rate_limits(ip_address, endpoint, window_start);

-- error_logs: lightweight error monitoring (Sentry alternative)
create table public.error_logs (
  id bigint generated always as identity primary key,
  message text not null,
  stack text,
  endpoint text,
  severity text not null default 'error' check (severity in ('error', 'warning', 'info')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_error_logs_severity on public.error_logs(severity);
create index if not exists idx_error_logs_created_at on public.error_logs(created_at);
alter table public.error_logs enable row level security;

create policy "allow_insert_errors" on public.error_logs
  for insert with check (true);

create policy "owner_read_errors" on public.error_logs
  for select using (true);  -- public read for admin dashboard

-- RLS policies for these tables are in 004_usage_source_stats_rate_limits.sql
