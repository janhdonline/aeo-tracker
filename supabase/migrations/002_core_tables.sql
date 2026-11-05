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

-- RLS: owners can read/write their own projects and all dependent rows.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshot_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "owner_all_keywords" ON public.keywords
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "owner_all_scan_runs" ON public.scan_runs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "owner_all_query_results" ON public.query_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.scan_runs sr
      JOIN public.projects p ON p.id = sr.project_id
      WHERE sr.id = run_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_all_mentions" ON public.mentions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.query_results qr
      JOIN public.scan_runs sr ON sr.id = qr.run_id
      JOIN public.projects p ON p.id = sr.project_id
      WHERE qr.id = result_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_all_competitor_appearances" ON public.competitor_appearances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.query_results qr
      JOIN public.scan_runs sr ON sr.id = qr.run_id
      JOIN public.projects p ON p.id = sr.project_id
      WHERE qr.id = result_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_all_scan_results" ON public.scan_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = (SELECT project_id FROM public.scan_runs WHERE id = run_id)
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "owner_all_snapshot_scores" ON public.snapshot_scores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

-- Public read access for report pages (anon can read projects + snapshot_scores
-- for public reports). The report page uses the anon client.
CREATE POLICY "public_read_projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "public_read_snapshot_scores" ON public.snapshot_scores
  FOR SELECT USING (true);