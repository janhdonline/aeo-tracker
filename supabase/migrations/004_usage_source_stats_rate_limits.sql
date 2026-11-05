-- Migration 003: API usage tracking, source stats, and rate limits
--
-- api_usage: records every API call cost per project/run/engine for the
--   $15/month cost guard to work correctly.
-- source_stats: tracks which domains appear most often across scans so
--   the dashboard can show top source opportunities.
-- rate_limits: enforces the 3-request/day per-IP limit on free-check.

CREATE TABLE IF NOT EXISTS public.api_usage (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.scan_runs(id) ON DELETE CASCADE,
  engine TEXT NOT NULL,
  cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.source_stats (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  source_domain TEXT NOT NULL,
  appearance_count INT NOT NULL DEFAULT 0,
  is_reddit BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (project_id, snapshot_date, source_domain)
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ip_address, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_api_usage_project_id ON public.api_usage(project_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_run_id ON public.api_usage(run_id);
CREATE INDEX IF NOT EXISTS idx_source_stats_project ON public.source_stats(project_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits(ip_address, endpoint, window_start);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_api_usage" ON public.api_usage
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "owner_all_source_stats" ON public.source_stats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

-- Rate limits are public-facing; allow insert and select for all authenticated users
CREATE POLICY "allow_insert_rate_limits" ON public.rate_limits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_select_rate_limits" ON public.rate_limits
  FOR SELECT USING (true);