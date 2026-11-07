export type PlanName = 'free' | 'starter' | 'pro';

export interface PlanLimits {
  keywords: number;
  engines: string[];
  frequency: 'monthly' | 'weekly';
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: { keywords: 10, engines: ['gemini'], frequency: 'monthly' },
  starter: { keywords: 50, engines: ['gemini', 'perplexity', 'openai'], frequency: 'weekly' },
  pro: { keywords: 150, engines: ['gemini', 'perplexity', 'openai', 'grok'], frequency: 'weekly' },
};

export function getPlanLimits(plan: PlanName): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canCreateKeyword(plan: PlanName, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].keywords;
}

export function getAllowedEngines(plan: PlanName): string[] {
  return PLAN_LIMITS[plan].engines;
}

export function isEngineAllowed(plan: PlanName, engine: string): boolean {
  return PLAN_LIMITS[plan].engines.includes(engine);
}

export function getRunFrequency(plan: PlanName): 'monthly' | 'weekly' {
  return PLAN_LIMITS[plan].frequency;
}

export function getKeywordLimit(plan: PlanName): number {
  return PLAN_LIMITS[plan].keywords;
}

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

export function checkKeywordLimit(plan: PlanName, currentCount: number): PlanCheckResult {
  const limit = PLAN_LIMITS[plan].keywords;
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

export function checkEngineAccess(plan: PlanName, engine: string): PlanCheckResult {
  const allowedEngines = PLAN_LIMITS[plan].engines;
  if (!allowedEngines.includes(engine)) {
    return {
      allowed: false,
      reason: `Engine "${engine}" not available on ${plan} plan. Available: ${allowedEngines.join(', ')}.`,
      limit: allowedEngines.length,
    };
  }
  return { allowed: true, limit: allowedEngines.length };
}

export function checkScanFrequency(plan: PlanName, lastRunDate: string | null): PlanCheckResult {
  const frequency = PLAN_LIMITS[plan].frequency;
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
