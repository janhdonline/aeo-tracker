-- Migration 003: Fix briefs and verification runs
--
-- fix_briefs: generated after each scan for queries where the brand was
--   not mentioned. Each brief carries a gap_type, description, and a
--   recommendation object consumed by the BriefsManager UI.
-- verification_runs: written by the verification cron when a brief that
--   was marked "applied" 14+ days ago is re-checked.

CREATE TABLE IF NOT EXISTS public.fix_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  result_id UUID REFERENCES public.query_results(id) ON DELETE SET NULL,
  gap_type TEXT NOT NULL
    CHECK (gap_type IN ('missing_mention', 'weak_position', 'competitor_wins', 'source_gap')),
  gap_description TEXT NOT NULL,
  recommendation JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'applied', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.verification_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.fix_briefs(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  evidence TEXT
);

CREATE INDEX IF NOT EXISTS idx_fix_briefs_project_id ON public.fix_briefs(project_id);
CREATE INDEX IF NOT EXISTS idx_fix_briefs_status ON public.fix_briefs(status);
CREATE INDEX IF NOT EXISTS idx_verification_runs_brief_id ON public.verification_runs(brief_id);

ALTER TABLE public.fix_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all_fix_briefs" ON public.fix_briefs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "owner_all_verification_runs" ON public.verification_runs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.fix_briefs fb
      JOIN public.projects p ON p.id = fb.project_id
      WHERE fb.id = brief_id AND p.user_id = auth.uid()
    )
  );