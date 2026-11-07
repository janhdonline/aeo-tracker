export interface Project {
  id: string;
  user_id: string;
  domain: string;
  brand_name: string;
  brand_aliases: string[];
  competitor_domains: string[];
  industry: string | null;
  active: boolean;
  created_at: string;
}

export interface Keyword {
  id: string;
  project_id: string;
  keyword: string;
  intent: 'informational' | 'commercial' | 'navigational';
  source: 'user' | 'discovery';
  active: boolean;
  created_at: string;
}

export interface ScanRun {
  id: string;
  project_id: string;
  started_at: string;
  finished_at: string | null;
  status: 'pending' | 'running' | 'done' | 'failed';
  total_queries: number;
  api_cost_usd: number;
}

export interface QueryResult {
  id: string;
  run_id: string;
  keyword_id: string;
  engine: 'perplexity' | 'openai' | 'gemini' | 'grok';
  prompt_version: string;
  prompt_used: string;
  raw_answer: string;
  citations: { domain: string; url: string; title: string }[];
  cost_usd: number;
  created_at: string;
}

export interface Mention {
  id: string;
  result_id: string;
  matched_entity: string;
  mention_type: 'named' | 'linked' | 'implied';
  position_in_answer: number | null;
  context_snippet: string | null;
}

export interface CompetitorAppearance {
  id: string;
  result_id: string;
  competitor_domain: string;
  frequency: number;
}

export interface SnapshotScore {
  id: string;
  project_id: string;
  snapshot_date: string;
  visibility_score: number;
  share_of_voice_pct: number;
  total_mentions: number;
  competitor_mentions: number;
  keywords_covered: number;
  keywords_total: number;
}

export interface FixBrief {
  id: string;
  project_id: string;
  result_id: string | null;
  gap_type: 'missing_mention' | 'weak_position' | 'competitor_wins' | 'source_gap' | 'traffic_leak';
  gap_description: string;
  recommendation: {
    action: 'update_page' | 'get_listed' | 'create_content' | 'engage_community';
    target: string;
    content_hint: string;
    priority: 'high' | 'medium' | 'low';
  };
  status: 'open' | 'applied' | 'dismissed';
  created_at: string;
  applied_at: string | null;
}

export interface VerificationRun {
  id: string;
  brief_id: string;
  checked_at: string;
  resolved: boolean;
  evidence: string | null;
}

export interface SourceStat {
  id: number;
  project_id: string;
  snapshot_date: string;
  source_domain: string;
  appearance_count: number;
  is_reddit: boolean;
}

export interface ApiUsage {
  id: number;
  project_id: string | null;
  run_id: string | null;
  engine: string;
  cost_usd: number;
  created_at: string;
}

export interface RateLimit {
  id: number;
  ip_address: string;
  endpoint: string;
  request_count: number;
  window_start: string;
}

export interface Profile {
  id: string;
  email: string;
  plan: 'free' | 'starter' | 'pro';
  lemonsqueezy_customer_id: string | null;
  plan_keywords_limit: number;
  plan_engines: string[];
  plan_run_frequency: 'monthly' | 'weekly';
  created_at: string;
}

export type PlanName = 'free' | 'starter' | 'pro';

export const PLAN_LIMITS: Record<PlanName, { keywords: number; engines: string[]; frequency: 'monthly' | 'weekly' }> = {
  free: { keywords: 10, engines: ['gemini'], frequency: 'monthly' },
  starter: { keywords: 50, engines: ['gemini', 'perplexity', 'openai'], frequency: 'weekly' },
  pro: { keywords: 150, engines: ['gemini', 'perplexity', 'openai', 'grok'], frequency: 'weekly' },
};

export interface DashboardTrendSeries {
  label: string;
  color: string;
  values: number[];
}

export interface LiveDashboardData {
  domain: string;
  score: number;
  webPresence: number;
  brandSentiment: number;
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative';
  totalQueries: number;
  totalMentions: number;
  mentionedQueries: number;
  citationsCount: number;
  promptCoverage: number;
  promptBars: number[];
  trends: DashboardTrendSeries[];
  trendLabels: string[];
  lastUpdated: string;
}
