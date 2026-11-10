-- Migration 010: Complete Admin Control System & Dynamic Backend Infrastructure
-- 
-- Adds 11 admin/control tables, teams & agency infrastructure, comprehensive audit logs,
-- lifecycle soft-delete, and default seed configurations for zero-code runtime management.

-- 1. App Configuration Table (Global Runtime Settings)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  value_type TEXT DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "allow_read_app_config" ON public.app_config FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.app_config (key, value, value_type, description) VALUES
  ('scan_chunk_size',         '25',     'number',  'Queries processed per scan chunk'),
  ('gemini_delay_ms',         '4000',   'number',  'Delay between Gemini API calls in ms'),
  ('stuck_timeout_ms',        '3600000','number',  'Scan stuck timeout (ms) = 1 hour'),
  ('public_report_cache_ttl', '604800', 'number',  'Public report cache TTL in seconds (7 days)'),
  ('max_free_public_scans',   '5',      'number',  'Max free-tier public report scans per day per IP'),
  ('use_free_models',         'false',  'boolean', 'Force OpenRouter free models instead of paid APIs'),
  ('maintenance_mode',        'false',  'boolean', 'Put app in read-only maintenance mode'),
  ('site_name',               'AEO Checker', 'string', 'App display name'),
  ('support_email',           'support@aeochecker.com', 'string', 'Support contact email'),
  ('cache_version',           '1',      'number',  'Increment to force-invalidate all worker config caches'),
  ('supported_currencies',    '["BDT","INR","GBP","EUR","CAD","AUD","SGD","MYR","NGN","PKR"]', 'json', 'Currencies supported in pricing'),
  ('currency_rates',          '{"BDT":110,"INR":84,"GBP":0.79,"EUR":0.92,"CAD":1.36,"AUD":1.53,"SGD":1.34,"MYR":4.70,"NGN":1540,"PKR":278}', 'json', 'USD exchange rates'),
  ('alert_error_threshold',   '10',     'number',  'Errors per hour before admin alert fires'),
  ('alert_api_error_threshold','5',     'number',  'API key errors before auto-disable')
ON CONFLICT (key) DO NOTHING;

-- 2. Plan Configurations Table (Replaces static PLAN_LIMITS)
CREATE TABLE IF NOT EXISTS public.plan_configs (
  plan_name TEXT PRIMARY KEY CHECK (plan_name IN ('free', 'starter', 'pro', 'enterprise')),
  display_name TEXT NOT NULL,
  description TEXT,
  price_usd NUMERIC(10, 2) DEFAULT 0.00,
  keywords_limit INT NOT NULL DEFAULT 10,
  projects_limit INT NOT NULL DEFAULT 1,
  scan_frequency TEXT DEFAULT 'monthly' CHECK (scan_frequency IN ('daily', 'weekly', 'monthly')),
  engines_allowed TEXT[] DEFAULT ARRAY['gemini'],
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public_read_plan_configs" ON public.plan_configs FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.plan_configs (plan_name, display_name, description, price_usd, keywords_limit, projects_limit, scan_frequency, engines_allowed, features, is_active) VALUES
  ('free', 'Free', 'Forever free, single engine baseline', 0.00,
   10, 1, 'monthly', ARRAY['gemini'],
   '{"fix_briefs":false,"fact_watch":false,"csv_export":false,"pdf_export":false,"email_digest":false,"api_access":false,"teams":false}'::jsonb,
   true),
  ('starter', 'Starter', 'For growing brands needing multi-engine tracking', 49.00,
   50, 3, 'weekly', ARRAY['gemini','perplexity','openai'],
   '{"fix_briefs":true,"fact_watch":true,"csv_export":true,"pdf_export":false,"email_digest":true,"api_access":false,"teams":false}'::jsonb,
   true),
  ('pro', 'Pro', 'Full suite, all engines & priority fixes', 79.00,
   150, 10, 'weekly', ARRAY['gemini','perplexity','openai','grok'],
   '{"fix_briefs":true,"fact_watch":true,"csv_export":true,"pdf_export":true,"email_digest":true,"api_access":true,"teams":true}'::jsonb,
   true)
ON CONFLICT (plan_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  keywords_limit = EXCLUDED.keywords_limit,
  projects_limit = EXCLUDED.projects_limit,
  engines_allowed = EXCLUDED.engines_allowed,
  features = EXCLUDED.features;

-- 3. API Keys Table (Vault/Encrypted Secret Reference & Priority Rotation)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,         -- 'gemini', 'openai', 'perplexity', 'grok', 'openrouter', 'resend', etc.
  key_name TEXT NOT NULL DEFAULT 'primary',
  key_value TEXT,                -- Plain key or encrypted string
  vault_secret_id UUID,          -- Supabase Vault reference if available
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 1,        -- 1 = highest priority
  rate_limit_rpm INT,
  rate_limit_rpd INT,
  purpose TEXT DEFAULT 'scan' CHECK (purpose IN ('scan', 'briefs', 'email', 'payment', 'public_scan', 'discovery')),
  error_count INT DEFAULT 0,
  last_error TEXT,
  last_used_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_lookup ON public.api_keys(service, purpose, is_active, priority);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 4. AI Models Registry Table
CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine TEXT NOT NULL,          -- 'gemini', 'openai', 'perplexity', 'grok'
  model_id TEXT NOT NULL,        -- 'gemini-2.0-flash', 'gpt-4o-mini', etc.
  display_name TEXT NOT NULL,
  purpose TEXT DEFAULT 'scan' CHECK (purpose IN ('scan', 'briefs', 'discovery', 'hallucination')),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  context_window INT,
  cost_per_1k_tokens NUMERIC(8, 6) DEFAULT 0.000000,
  supports_grounding BOOLEAN DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "allow_read_ai_models" ON public.ai_models FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.ai_models (engine, model_id, display_name, purpose, is_default, is_active, context_window, cost_per_1k_tokens, supports_grounding, notes) VALUES
  ('gemini', 'gemini-2.0-flash', 'Gemini 2.0 Flash', 'scan', true, true, 1000000, 0.000000, true, 'Default Google search grounding'),
  ('gemini', 'gemini-1.5-pro', 'Gemini 1.5 Pro', 'briefs', false, true, 2000000, 0.001250, true, 'High accuracy brief synthesis'),
  ('openai', 'gpt-4o-mini', 'GPT-4o Mini', 'scan', true, true, 128000, 0.000150, false, 'Fast and economical'),
  ('openai', 'gpt-4o-mini', 'GPT-4o Mini', 'briefs', true, true, 128000, 0.000150, false, 'Actionable gap briefs drafting'),
  ('perplexity', 'llama-3.1-sonar-large-128k-online', 'Perplexity Sonar Large', 'scan', true, true, 128000, 0.001000, true, 'Online real-time citations'),
  ('grok', 'grok-2', 'Grok 2', 'scan', true, true, 128000, 0.002000, false, 'Real-time social and web grounding')
ON CONFLICT DO NOTHING;

-- 5. Payment Configuration Table (Lemon Squeezy runtime mappings)
CREATE TABLE IF NOT EXISTS public.payment_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public_read_payment_config" ON public.payment_config FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.payment_config (key, value, description) VALUES
  ('ls_store_id',              '', 'Lemon Squeezy Store ID'),
  ('ls_webhook_secret',        '', 'Lemon Squeezy Webhook Secret'),
  ('ls_starter_variant_id',    '2337849', 'Starter Plan variant ID'),
  ('ls_pro_variant_id',        '2337852', 'Pro Plan variant ID'),
  ('ls_starter_checkout_url',  'https://aeo-tracker.lemonsqueezy.com/checkout/buy/482b92a7-0f99-4689-9653-d58fb35bc3cf', 'Starter checkout URL'),
  ('ls_pro_checkout_url',      'https://aeo-tracker.lemonsqueezy.com/checkout/buy/41f8ba70-e418-48da-8554-e25210808053', 'Pro checkout URL'),
  ('currency',                 'USD', 'Base billing currency'),
  ('trial_days',               '0', 'Free trial days')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. Prompt Templates Table (Versioned AI Prompts)
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,         -- 'v1', 'v2'
  purpose TEXT NOT NULL DEFAULT 'scan', -- 'scan', 'discovery', 'brief_gen', 'hallucination_check'
  template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  performance_score NUMERIC(3, 1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "allow_read_prompt_templates" ON public.prompt_templates FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.prompt_templates (version, purpose, template, is_active, is_default) VALUES
  ('v1', 'scan', '{keyword}?', true, false),
  ('v1', 'scan', 'I''m evaluating options. {keyword} — what do you recommend and why?', true, false),
  ('v1', 'scan', 'Compare the top 5 options for "{keyword}" with pros and cons.', true, true),
  ('v1', 'discovery', 'Generate 40 keyword questions that buyers ask when researching {industry} products/services.\nBrand: {brand}\nCompetitors: {competitors}\n{pain_point}\nReturn as JSON array with fields: keyword (string), intent ("informational" | "commercial" | "navigational"), score (0-1).', true, true),
  ('v1', 'brief_gen', 'Brand: {brand} (domain: {domain}). Gap: {gap_description}. Generate specific actionable content recommendations to improve AI engine visibility for this brand with platform, action, and impact.', true, true)
ON CONFLICT DO NOTHING;

-- 7. Feature Flags Table (Runtime Toggles)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  flag_key TEXT PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT false,
  rollout_pct INT DEFAULT 100 CHECK (rollout_pct BETWEEN 0 AND 100),
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'paid', 'pro', 'admin')),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "allow_read_feature_flags" ON public.feature_flags FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.feature_flags (flag_key, is_enabled, rollout_pct, applies_to, description) VALUES
  ('public_report_realtime_scan', true,  100, 'all',   'Live AI scan on /report/[domain] for new domains'),
  ('grok_engine',                 true,  100, 'pro',   'Grok (xAI) engine enabled for Pro plans'),
  ('email_digest',                true,  100, 'paid',  'Weekly executive email digest for paid plans'),
  ('csv_export',                  true,  100, 'paid',  'CSV export feature'),
  ('pdf_export',                  true,  100, 'pro',   'PDF report export'),
  ('fact_watch',                  true,  100, 'paid',  'Hallucination audit and Fact Watch'),
  ('api_access',                  false, 100, 'pro',   'REST API access token generation'),
  ('competitor_tracking',         true,  100, 'all',   'Competitor share-of-voice benchmark'),
  ('multi_project',               true,  100, 'paid',  'Multiple projects per user'),
  ('llms_txt_generator',          true,  100, 'all',   'llms.txt generator and validation suite')
ON CONFLICT (flag_key) DO NOTHING;

-- 8. Public Reports Cache Table (Fast Public Audits)
CREATE TABLE IF NOT EXISTS public.public_reports_cache (
  domain TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  visibility_score INT NOT NULL DEFAULT 0,
  share_of_voice_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  summary_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_analyses JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompt_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  product_rankings JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.public_reports_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "allow_public_read_reports_cache" ON public.public_reports_cache FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 9. Enhanced Profiles (User management, admin flags, preferences, grace period)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_grace_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_keyword_limit INT,
  ADD COLUMN IF NOT EXISTS custom_engines TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by TEXT,
  ADD COLUMN IF NOT EXISTS total_scans_run INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
    "scan_complete": true,
    "weekly_digest": true,
    "hallucination_alert": true,
    "payment_success": true,
    "payment_failed": true,
    "plan_changed": true,
    "marketing": false
  }'::jsonb;

-- 10. Teams & Agency Infrastructure
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' REFERENCES public.plan_configs(plan_name),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "team_members_view_team" ON public.teams
    FOR SELECT USING (
      id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR owner_id = auth.uid()
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "team_members_view_membership" ON public.team_members
    FOR SELECT USING (
      team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()) OR user_id = auth.uid()
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 11. Audit Logs, Webhooks, Sessions, and Notifications
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'lemonsqueezy',
  event_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN DEFAULT true,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  attempt_count INT DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  max_attempts INT DEFAULT 3,
  received_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('login', 'logout', 'token_refresh', 'password_reset')),
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced', 'queued')),
  resend_message_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  purge_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'purged')),
  purge_steps_done JSONB DEFAULT '{}'::jsonb,
  recovered_at TIMESTAMPTZ,
  purged_at TIMESTAMPTZ
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "users_see_own_notifications" ON public.notification_logs
    FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 12. Helper Functions & Triggers
-- Increment API Key Error function
CREATE OR REPLACE FUNCTION public.increment_api_key_error(p_service TEXT, p_purpose TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.api_keys
  SET error_count = error_count + 1,
      is_active = CASE WHEN error_count + 1 >= 5 THEN false ELSE is_active END
  WHERE id = (
    SELECT id FROM public.api_keys
    WHERE service = p_service AND purpose = p_purpose AND is_active = true
    ORDER BY priority ASC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Team Owner Deletion Trigger
CREATE OR REPLACE FUNCTION public.handle_team_owner_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_team_id UUID;
  v_new_owner UUID;
BEGIN
  FOR v_team_id IN
    SELECT id FROM public.teams WHERE owner_id = OLD.id
  LOOP
    SELECT user_id INTO v_new_owner
    FROM public.team_members
    WHERE team_id = v_team_id
      AND user_id != OLD.id
      AND role IN ('editor', 'owner')
    ORDER BY joined_at ASC
    LIMIT 1;

    IF v_new_owner IS NOT NULL THEN
      UPDATE public.teams SET owner_id = v_new_owner WHERE id = v_team_id;
      UPDATE public.team_members SET role = 'owner' WHERE team_id = v_team_id AND user_id = v_new_owner;
      INSERT INTO public.audit_logs (action, target_type, target_id, new_value)
        VALUES ('ownership_transferred', 'team', v_team_id::text, jsonb_build_object('new_owner', v_new_owner));
    ELSE
      UPDATE public.teams SET plan = 'suspended' WHERE id = v_team_id;
      INSERT INTO public.audit_logs (action, target_type, target_id, new_value)
        VALUES ('team_suspended', 'team', v_team_id::text, jsonb_build_object('reason', 'owner_deleted_no_successor'));
    END IF;
  END LOOP;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_soft_deleted ON public.profiles;
CREATE TRIGGER on_profile_soft_deleted
  BEFORE UPDATE OF deleted_at ON public.profiles
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION public.handle_team_owner_deletion();

-- Ensure PostgREST permissions for public tables
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
