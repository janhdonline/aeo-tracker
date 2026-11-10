-- Migration 013: High-Performance Composite Indexes & API Key Pool Acceleration

-- 1. Accelerate Projects & Scan Runs Sequential Scans (fixes 2,500+ seq scans)
CREATE INDEX IF NOT EXISTS idx_projects_user_domain 
  ON public.projects(user_id, domain);

CREATE INDEX IF NOT EXISTS idx_scan_runs_project_status_time 
  ON public.scan_runs(project_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_results_run_engine 
  ON public.query_results(run_id, engine);

-- 2. Engine Latency & Health Probes Index
CREATE INDEX IF NOT EXISTS idx_engine_health_logs_engine_checked 
  ON public.engine_health_logs(engine_name, checked_at DESC);

-- 3. Notification Logs Dead-Letter Queue Index
CREATE INDEX IF NOT EXISTS idx_notification_logs_status_sent 
  ON public.notification_logs(status, sent_at DESC);

-- 4. API Key Pool Rotation Index
CREATE INDEX IF NOT EXISTS idx_api_keys_rotation 
  ON public.api_keys(service, is_active, priority, error_count, last_used_at);

-- 5. Stored Procedure: Auto-Rotate & Fetch Next Best Key in Pool
CREATE OR REPLACE FUNCTION public.get_next_api_key_in_pool(p_service TEXT, p_purpose TEXT DEFAULT 'scan')
RETURNS TABLE (
  id UUID,
  key_value TEXT,
  key_name TEXT,
  error_count INT,
  priority INT
) AS $$
DECLARE
  v_key_id UUID;
BEGIN
  -- Select the key with lowest errors, lowest priority number, and least recently used
  SELECT k.id INTO v_key_id
  FROM public.api_keys k
  WHERE k.service = p_service 
    AND k.is_active = true 
    AND (k.purpose = p_purpose OR k.purpose = 'scan')
  ORDER BY k.error_count ASC, k.priority ASC, k.last_used_at ASC NULLS FIRST
  LIMIT 1;

  IF v_key_id IS NOT NULL THEN
    -- Update last_used_at timestamp for round-robin rotation
    UPDATE public.api_keys
    SET last_used_at = NOW()
    WHERE public.api_keys.id = v_key_id;

    RETURN QUERY
    SELECT k.id, k.key_value, k.key_name, k.error_count, k.priority
    FROM public.api_keys k
    WHERE k.id = v_key_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Stored Procedure: 1-Click Reset Key Errors & Re-enable Pool
CREATE OR REPLACE FUNCTION public.reset_api_key_pool(p_service TEXT DEFAULT NULL)
RETURNS INT AS $$
DECLARE
  v_updated INT;
BEGIN
  IF p_service IS NULL THEN
    UPDATE public.api_keys
    SET error_count = 0, is_active = true, last_error = NULL;
  ELSE
    UPDATE public.api_keys
    SET error_count = 0, is_active = true, last_error = NULL
    WHERE service = p_service;
  END IF;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql;
