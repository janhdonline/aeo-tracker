-- Migration 002b: Execution loop tables (the differentiator)
-- fix_briefs: gap -> recommendation -> status
-- verification_runs: re-check briefs after being applied
-- Note: RLS policies for these tables are in 004_usage_source_stats_rate_limits.sql

create table public.fix_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  result_id uuid references public.query_results(id) on delete set null,
  gap_type text not null,
  gap_description text not null,
  recommendation jsonb not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  applied_at timestamptz
);

create table public.verification_runs (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.fix_briefs(id) on delete cascade,
  checked_at timestamptz not null default now(),
  resolved boolean not null default false,
  evidence text
);

create index if not exists idx_fix_briefs_project_id on public.fix_briefs(project_id);
create index if not exists idx_fix_briefs_status on public.fix_briefs(status);
create index if not exists idx_verification_runs_brief_id on public.verification_runs(brief_id);
