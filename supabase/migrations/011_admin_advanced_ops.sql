-- Migration 011: Advanced Backend Operations & Admin Infrastructure
-- Phase 2 additions: IP Blacklist, Engine Health Watchdog, Admin Roles (RBAC), and Operational Configs

-- 1. IP Blacklist & Abuse Shield Table
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    blocked_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ip_blacklist_ip ON public.ip_blacklist(ip_address);

ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "allow_read_ip_blacklist" ON public.ip_blacklist FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Engine Latency & Synthetic Health Logs
CREATE TABLE IF NOT EXISTS public.engine_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engine_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    latency_ms INT NOT NULL,
    error_message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engine_health_logs_engine_time ON public.engine_health_logs(engine_name, checked_at DESC);

ALTER TABLE public.engine_health_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "allow_read_engine_health_logs" ON public.engine_health_logs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Granular Admin Roles (RBAC) Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'support_agent', 'seo_tuner')),
    granted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "allow_read_admin_roles" ON public.admin_roles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Seed Operational App Config Keys
INSERT INTO public.app_config (key, value, value_type, description) VALUES
  ('daily_ai_spend_cap_usd', '25.00', 'number', 'Maximum allowed daily USD spend across all AI engines before auto-kill switch engages'),
  ('emergency_ai_stop', 'false', 'boolean', 'Emergency manual master kill-switch to pause all outgoing LLM calls'),
  ('maintenance_message', 'We are undergoing scheduled infrastructure upgrades. Scans will resume shortly.', 'string', 'Message displayed to users when maintenance_mode is enabled'),
  ('announcement_banner', '{"active": false, "text": "", "type": "info", "link": ""}', 'json', 'Global top notification banner across dashboard and public pages'),
  ('email_template_weekly_digest', '### Weekly AEO Performance for {{project_name}}\n\nHi {{user_name}},\n\nYour brand visibility score this week is **{{score}}** ({{score_delta}} pts change).\n\n[View Full Report]({{dashboard_url}})', 'string', 'Dynamic template for executive weekly digest emails'),
  ('email_template_scan_complete', '### Scan Completed: {{project_name}}\n\nYour latest search visibility audit has finished.\n- Brand Score: **{{score}}**\n- Queries Analyzed: {{total_queries}}\n\n[Open Analysis]({{report_url}})', 'string', 'Dynamic template for scan completion alert emails')
ON CONFLICT (key) DO NOTHING;
