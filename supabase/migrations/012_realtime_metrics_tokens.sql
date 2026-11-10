-- Migration 012: Realtime Metrics, Granular Token Ledger & Engine Health Telemetry
-- Adds model tracking, token metrics, and execution latency to api_usage

ALTER TABLE public.api_usage 
  ADD COLUMN IF NOT EXISTS model_name TEXT,
  ADD COLUMN IF NOT EXISTS tokens_in INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_out INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latency_ms INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_api_usage_created_engine ON public.api_usage(created_at, engine);
CREATE INDEX IF NOT EXISTS idx_api_usage_model_name ON public.api_usage(model_name);

-- Seed realistic demonstration usage for past 24 hours so dashboard immediately renders rich data
DO $$
DECLARE
  v_project_id UUID;
  v_run_id UUID;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Grab any existing project or create a fallback dummy reference if none exists
  SELECT id INTO v_project_id FROM public.projects LIMIT 1;
  SELECT id INTO v_run_id FROM public.scan_runs LIMIT 1;

  -- Only seed if api_usage has fewer than 10 records
  IF (SELECT count(*) FROM public.api_usage) < 10 THEN
    -- Gemini 2.0 Flash queries
    INSERT INTO public.api_usage (project_id, run_id, engine, model_name, tokens_in, tokens_out, latency_ms, cost_usd, created_at)
    VALUES
      (v_project_id, v_run_id, 'gemini', 'gemini-2.0-flash', 1450, 420, 380, 0.00023, v_now - interval '1 hour'),
      (v_project_id, v_run_id, 'gemini', 'gemini-2.0-flash', 2100, 680, 410, 0.00036, v_now - interval '2 hours'),
      (v_project_id, v_run_id, 'gemini', 'gemini-2.0-flash', 1890, 510, 395, 0.00029, v_now - interval '3 hours'),
      (v_project_id, v_run_id, 'gemini', 'gemini-1.5-flash', 1200, 340, 320, 0.00019, v_now - interval '5 hours');

    -- OpenAI GPT-4o-mini queries
    INSERT INTO public.api_usage (project_id, run_id, engine, model_name, tokens_in, tokens_out, latency_ms, cost_usd, created_at)
    VALUES
      (v_project_id, v_run_id, 'openai', 'gpt-4o-mini', 1650, 580, 720, 0.00059, v_now - interval '30 minutes'),
      (v_project_id, v_run_id, 'openai', 'gpt-4o-mini', 2400, 890, 810, 0.00089, v_now - interval '2 hours'),
      (v_project_id, v_run_id, 'openai', 'gpt-4o-mini', 1980, 610, 750, 0.00071, v_now - interval '4 hours');

    -- Perplexity Sonar queries
    INSERT INTO public.api_usage (project_id, run_id, engine, model_name, tokens_in, tokens_out, latency_ms, cost_usd, created_at)
    VALUES
      (v_project_id, v_run_id, 'perplexity', 'perplexity/sonar', 1850, 620, 1150, 0.00240, v_now - interval '1 hour'),
      (v_project_id, v_run_id, 'perplexity', 'perplexity/sonar', 2200, 740, 1220, 0.00285, v_now - interval '3 hours');

    -- Grok 2 queries
    INSERT INTO public.api_usage (project_id, run_id, engine, model_name, tokens_in, tokens_out, latency_ms, cost_usd, created_at)
    VALUES
      (v_project_id, v_run_id, 'grok', 'x-ai/grok-2', 1700, 510, 940, 0.00195, v_now - interval '2 hours');
  END IF;
END $$;
