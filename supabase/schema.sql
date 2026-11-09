CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan TEXT DEFAULT 'free',
  lemonsqueezy_customer_id TEXT,
  plan_keywords_limit INT DEFAULT 10,
  plan_engines TEXT[] DEFAULT ARRAY['gemini'],
  plan_run_frequency TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Backfill any existing users into profiles
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Migration 002: Core tables (projects, keywords, scan_runs, query_results,
-- mentions, competitor_appearances, scan_results, snapshot_scores)
--
-- These tables power the scanner, dashboard, and public report pages.
-- They are created BEFORE the fix_briefs/verification tables because
-- those reference projects and query_results.

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  brand_aliases TEXT[] DEFAULT '{}',
  competitor_domains TEXT[] DEFAULT '{}',
  industry TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT 'informational'
    CHECK (intent IN ('informational', 'commercial', 'navigational')),
  source TEXT NOT NULL DEFAULT 'user'
    CHECK (source IN ('user', 'discovery')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'done', 'failed')),
  total_queries INT NOT NULL DEFAULT 0,
  api_cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.query_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.scan_runs(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  engine TEXT NOT NULL
    CHECK (engine IN ('perplexity', 'openai', 'gemini', 'grok')),
  prompt_version TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  raw_answer TEXT,
  citations JSONB DEFAULT '[]',
  cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.query_results(id) ON DELETE CASCADE,
  matched_entity TEXT NOT NULL,
  mention_type TEXT NOT NULL
    CHECK (mention_type IN ('named', 'linked', 'implied')),
  position_in_answer INT,
  context_snippet TEXT
);

CREATE TABLE IF NOT EXISTS public.competitor_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.query_results(id) ON DELETE CASCADE,
  competitor_domain TEXT NOT NULL,
  frequency INT NOT NULL DEFAULT 1
);

-- scan_results is a join table used by the dashboard to fetch
-- competitor_appearances alongside query_results in a single query.
CREATE TABLE IF NOT EXISTS public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.scan_runs(id) ON DELETE CASCADE,
  query_result_id UUID NOT NULL REFERENCES public.query_results(id) ON DELETE CASCADE,
  competitor_domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.snapshot_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  visibility_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  share_of_voice_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_mentions INT NOT NULL DEFAULT 0,
  competitor_mentions INT NOT NULL DEFAULT 0,
  keywords_covered INT NOT NULL DEFAULT 0,
  keywords_total INT NOT NULL DEFAULT 0,
  UNIQUE (project_id, snapshot_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_project_id ON public.keywords(project_id);
CREATE INDEX IF NOT EXISTS idx_scan_runs_project_id ON public.scan_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_query_results_run_id ON public.query_results(run_id);
CREATE INDEX IF NOT EXISTS idx_query_results_keyword_id ON public.query_results(keyword_id);
CREATE INDEX IF NOT EXISTS idx_mentions_result_id ON public.mentions(result_id);
CREATE INDEX IF NOT EXISTS idx_competitor_appearances_result_id ON public.competitor_appearances(result_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_run_id ON public.scan_results(run_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_project_id ON public.snapshot_scores(project_id);
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
-- Migration 003b: (no-op - fix_briefs and verification_runs created in 002_execution_loop.sql)
-- This file exists to maintain migration number sequence.
-- All RLS policies for these tables are in 004_usage_source_stats_rate_limits.sql
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
-- Migration 004: Row Level Security on all user tables + public read for reports
-- Owner-only access joined through projects for child tables.
-- Service role bypasses RLS for cron jobs; never expose service key to the client.

alter table public.projects enable row level security;
alter table public.keywords enable row level security;
alter table public.scan_runs enable row level security;
alter table public.query_results enable row level security;
alter table public.mentions enable row level security;
alter table public.competitor_appearances enable row level security;
alter table public.snapshot_scores enable row level security;
alter table public.scan_results enable row level security;
alter table public.fix_briefs enable row level security;
alter table public.verification_runs enable row level security;
alter table public.api_usage enable row level security;
alter table public.source_stats enable row level security;

-- projects: direct ownership
create policy "owner_all_projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- keywords: ownership via project
create policy "owner_all_keywords" on public.keywords
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- scan_runs: ownership via project
create policy "owner_all_scan_runs" on public.scan_runs
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- query_results: ownership via run -> project
create policy "owner_all_query_results" on public.query_results
  for all using (
    exists (
      select 1 from public.scan_runs r
      join public.projects p on p.id = r.project_id
      where r.id = run_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.scan_runs r
      join public.projects p on p.id = r.project_id
      where r.id = run_id and p.user_id = auth.uid()
    )
  );

-- mentions: ownership via result -> run -> project
create policy "owner_all_mentions" on public.mentions
  for all using (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  );

-- competitor_appearances: ownership via result -> run -> project
create policy "owner_all_competitor_appearances" on public.competitor_appearances
  for all using (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  );

-- snapshot_scores: ownership via project
create policy "owner_all_snapshot_scores" on public.snapshot_scores
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- scan_results: ownership via run -> project
create policy "owner_all_scan_results" on public.scan_results
  for all using (
    exists (
      select 1 from public.projects p
      join public.scan_runs sr on sr.project_id = p.id
      where sr.id = scan_results.run_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      join public.scan_runs sr on sr.project_id = p.id
      where sr.id = scan_results.run_id and p.user_id = auth.uid()
    )
  );

-- fix_briefs: ownership via project
create policy "owner_all_fix_briefs" on public.fix_briefs
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- verification_runs: ownership via brief -> project
create policy "owner_all_verification_runs" on public.verification_runs
  for all using (
    exists (
      select 1 from public.fix_briefs fb
      join public.projects p on p.id = fb.project_id
      where fb.id = verification_runs.brief_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.fix_briefs fb
      join public.projects p on p.id = fb.project_id
      where fb.id = verification_runs.brief_id and p.user_id = auth.uid()
    )
  );

-- api_usage: owner read only
create policy "owner_read_api_usage" on public.api_usage
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- source_stats: owner read only
create policy "owner_read_source_stats" on public.source_stats
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- Public read access for report pages (anon can read projects + snapshot_scores
-- for public reports). The report page uses the anon client.
create policy "public_read_projects" on public.projects
  for select using (true);

create policy "public_read_snapshot_scores" on public.snapshot_scores
  for select using (true);
-- Migration 005: Lemon Squeezy webhook -> plan
-- profiles columns (lemonsqueezy_customer_id, plan_keywords_limit,
-- plan_engines, plan_run_frequency) are created in 001_profiles.sql.
-- Here we add the server-side function that the webhook route calls to
-- upgrade/downgrade a plan based on the verified Lemon Squeezy payload.

create or replace function public.set_plan_from_lemonsqueezy(
  p_customer_id text,
  p_plan_name text,
  p_status text default 'active'
)
returns void as $$
declare
  v_keywords int;
  v_engines text[];
  v_frequency text;
begin
  -- Map plan name -> limits (kept in sync with PLAN_LIMITS in src/lib/types)
  v_keywords := case p_plan_name
    when 'free' then 10
    when 'starter' then 50
    when 'pro' then 150
    else 10
  end;

  v_engines := case p_plan_name
    when 'free' then array['gemini']::text[]
    when 'starter' then array['gemini','perplexity','openai']::text[]
    when 'pro' then array['gemini','perplexity','openai','grok']::text[]
    else array['gemini']::text[]
  end;

  v_frequency := case
    when p_plan_name = 'free' then 'monthly'
    else 'weekly'
  end;

  update public.profiles
  set
    plan = p_plan_name,
    lemonsqueezy_customer_id = p_customer_id,
    plan_keywords_limit = v_keywords,
    plan_engines = v_engines,
    plan_run_frequency = v_frequency,
    updated_at = now()
  where lemonsqueezy_customer_id = p_customer_id;
end;
$$ language plpgsql security definer;

-- updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
-- Migration 006: Mention vs Citation dual-metrics columns
-- Differentiator: separate Mention Rate from Citation Rate so the dashboard
-- can show "traffic leaks" (brand named but not linked).
-- Also adds a traffic_leak gap type to fix_briefs.

alter table public.snapshot_scores
  add column if not exists mention_rate numeric(5,2),
  add column if not exists citation_rate numeric(5,2),
  add column if not exists traffic_leak boolean not null default false;

alter table public.fix_briefs
  alter column gap_type type text;
-- Migration 007: Statistical Sampling Engine (spec section 15.1)
-- Polling model: spread sample budget across query set, track sample_index,
-- compute Wilson score intervals for uncertainty display.

alter table public.query_results
  add column if not exists sample_index int not null default 1;

alter table public.snapshot_scores
  add column if not exists ci_low numeric(5,2),
  add column if not exists ci_high numeric(5,2),
  add column if not exists effective_n int not null default 0;
-- Migration 008: Hallucination Watch (spec section 15.6)
-- Fact-check AI claims against a brand facts sheet.
-- If a claim contradicts the facts, raise a Misinformation Alert
-- with the exact quote + engine + date for manual review.

create table public.brand_facts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  fact_type text not null,              -- price | feature | availability | status | claim
  key text not null,                    -- e.g. "aeropress_pro", "pricing"
  expected_value text not null,         -- e.g. "$89", "available"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, fact_type, key)
);

create table public.misinformation_alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  result_id uuid references public.query_results(id) on delete set null,
  engine text not null,
  quote text not null,
  claimed_value text not null,
  expected_value text not null,
  fact_type text not null,
  confidence numeric(3,2) not null default 0.5,  -- 0-1, how confident the LLM is
  reviewed boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_facts_project on public.brand_facts(project_id);
create index if not exists idx_misinformation_project on public.misinformation_alerts(project_id);
create index if not exists idx_misinformation_reviewed on public.misinformation_alerts(reviewed);

alter table public.brand_facts enable row level security;
alter table public.misinformation_alerts enable row level security;

create policy "owner_all_brand_facts" on public.brand_facts
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "owner_all_misinformation" on public.misinformation_alerts
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );
-- Migration 009: Agent Traffic Analytics (spec section 15.5)
-- Lightweight version of Profound's enterprise feature.
-- Tracks AI bot visits by engine/page, correlates with citations.
-- Differentiate real bots from spoofed ones.

create table public.agent_visits (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  engine text not null,              -- gptbot | claude | perplexity | google | etc
  path text not null,                -- the URL path visited
  user_agent text not null,          -- raw UA string
  is_verified boolean not null default false,  -- verified against known bot patterns
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agent_correlation (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null,
  path text not null,
  engine text not null,
  bot_visits int not null default 0,
  citations int not null default 0,
  unique (project_id, date, path, engine)
);

create index if not exists idx_agent_visits_project on public.agent_visits(project_id);
create index if not exists idx_agent_visits_created on public.agent_visits(created_at);
create index if not exists idx_agent_correlation_project on public.agent_correlation(project_id);

alter table public.agent_visits enable row level security;
alter table public.agent_correlation enable row level security;

create policy "owner_all_agent_visits" on public.agent_visits
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "owner_all_agent_correlation" on public.agent_correlation
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );
