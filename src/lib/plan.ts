import { getPlanConfig } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';

export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PlanLimits {
  keywords: number;
  engines: string[];
  frequency: 'monthly' | 'weekly' | 'daily';
  projects?: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { keywords: 10, engines: ['gemini'], frequency: 'monthly', projects: 1 },
  starter: { keywords: 50, engines: ['gemini', 'perplexity', 'openai'], frequency: 'weekly', projects: 3 },
  pro: { keywords: 150, engines: ['gemini', 'perplexity', 'openai', 'grok'], frequency: 'weekly', projects: 10 },
  enterprise: { keywords: 1000, engines: ['gemini', 'perplexity', 'openai', 'grok'], frequency: 'daily', projects: 100 },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export async function getDynamicPlanLimits(plan: string): Promise<PlanLimits> {
  const cfg = await getPlanConfig(plan);
  if (cfg) {
    return {
      keywords: cfg.keywords_limit,
      engines: cfg.engines_allowed,
      frequency: cfg.scan_frequency,
      projects: cfg.projects_limit,
    };
  }
  return getPlanLimits(plan);
}

export function canCreateKeyword(plan: string, currentCount: number): boolean {
  const limit = getPlanLimits(plan).keywords;
  return currentCount < limit;
}

export function getAllowedEngines(plan: string): string[] {
  return getPlanLimits(plan).engines;
}

export function isEngineAllowed(plan: string, engine: string): boolean {
  return getPlanLimits(plan).engines.includes(engine);
}

export function getRunFrequency(plan: string): 'monthly' | 'weekly' | 'daily' {
  return getPlanLimits(plan).frequency;
}

export function getKeywordLimit(plan: string): number {
  return getPlanLimits(plan).keywords;
}

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

export function checkKeywordLimit(plan: string, currentCount: number): PlanCheckResult {
  const limit = getPlanLimits(plan).keywords;
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Keyword limit reached (${limit} for ${plan} plan). Upgrade to add more.`,
      limit,
      current: currentCount,
    };
  }
  return { allowed: true, limit, current: currentCount };
}

export async function checkDynamicKeywordLimit(plan: string, currentCount: number): Promise<PlanCheckResult> {
  const limits = await getDynamicPlanLimits(plan);
  if (currentCount >= limits.keywords) {
    return {
      allowed: false,
      reason: `Keyword limit reached (${limits.keywords} for ${plan} plan). Upgrade to add more.`,
      limit: limits.keywords,
      current: currentCount,
    };
  }
  return { allowed: true, limit: limits.keywords, current: currentCount };
}

export function checkEngineAccess(plan: string, engine: string): PlanCheckResult {
  const allowedEngines = getPlanLimits(plan).engines;
  if (!allowedEngines.includes(engine)) {
    return {
      allowed: false,
      reason: `Engine "${engine}" not available on ${plan} plan. Available: ${allowedEngines.join(', ')}.`,
      limit: allowedEngines.length,
    };
  }
  return { allowed: true, limit: allowedEngines.length };
}

export async function checkDynamicEngineAccess(plan: string, engine: string): Promise<PlanCheckResult> {
  const limits = await getDynamicPlanLimits(plan);
  if (!limits.engines.includes(engine)) {
    return {
      allowed: false,
      reason: `Engine "${engine}" not available on ${plan} plan. Available: ${limits.engines.join(', ')}.`,
      limit: limits.engines.length,
    };
  }
  return { allowed: true, limit: limits.engines.length };
}

export function checkScanFrequency(plan: string, lastRunDate: string | null): PlanCheckResult {
  const frequency = getPlanLimits(plan).frequency;
  if (!lastRunDate) return { allowed: true, limit: 1 };

  const lastRun = new Date(lastRunDate);
  const now = new Date();
  const daysSinceLastRun = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60 * 24));

  if (frequency === 'monthly' && daysSinceLastRun < 30) {
    return {
      allowed: false,
      reason: `Monthly scan limit reached. Next scan available in ${30 - daysSinceLastRun} days.`,
      limit: 1,
    };
  }
  if (frequency === 'weekly' && daysSinceLastRun < 7) {
    return {
      allowed: false,
      reason: `Weekly scan limit reached. Next scan available in ${7 - daysSinceLastRun} days.`,
      limit: 1,
    };
  }
  return { allowed: true };
}

/**
 * Calculates the effective plan taking into account:
 * 1. Team subscription plan if project belongs to a team
 * 2. Subscription grace period (7 days for past_due)
 * 3. Cancelled subscriptions within active billing period (subscription_renews_at > now)
 */
export async function getEffectivePlan(userId: string, projectId?: string): Promise<string> {
  try {
    const admin = createAdminClient();

    // 1. If project belongs to a team, team plan takes priority
    if (projectId) {
      const { data: project } = await admin
        .from('projects')
        .select('team_id')
        .eq('id', projectId)
        .maybeSingle();

      if (project?.team_id) {
        const { data: team } = await admin
          .from('teams')
          .select('plan')
          .eq('id', project.team_id)
          .maybeSingle();

        if (team?.plan) {
          return team.plan;
        }
      }
    }

    // 2. Individual user profile
    const { data: profile } = await admin
      .from('profiles')
      .select('plan, subscription_status, subscription_renews_at, subscription_grace_until')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return 'free';

    const now = new Date();

    // Active subscription
    if (profile.subscription_status === 'active') {
      return profile.plan || 'free';
    }

    // Cancelled but still inside paid period
    if (
      profile.subscription_status === 'cancelled' &&
      profile.subscription_renews_at &&
      new Date(profile.subscription_renews_at) > now
    ) {
      return profile.plan || 'free';
    }

    // Past due with grace period
    if (
      profile.subscription_status === 'past_due' &&
      profile.subscription_grace_until &&
      new Date(profile.subscription_grace_until) > now
    ) {
      return profile.plan || 'free';
    }

    // Fallback: if user has a plan explicitly assigned without LS subscription
    if (profile.plan && profile.plan !== 'free' && (!profile.subscription_status || profile.subscription_status === 'inactive')) {
      return profile.plan;
    }

    return 'free';
  } catch (err) {
    console.warn('Error determining effective plan:', err);
    return 'free';
  }
}
