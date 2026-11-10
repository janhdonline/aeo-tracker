import { createAdminClient } from '@/lib/supabase/admin';
import { getEnv } from '@/lib/env';

export interface PlanConfig {
  plan_name: 'free' | 'starter' | 'pro' | 'enterprise';
  display_name: string;
  description: string;
  price_usd: number;
  keywords_limit: number;
  projects_limit: number;
  scan_frequency: 'monthly' | 'weekly' | 'daily';
  engines_allowed: string[];
  features: Record<string, boolean>;
  is_active: boolean;
}

export interface FeatureFlag {
  flag_key: string;
  is_enabled: boolean;
  rollout_pct: number;
  applies_to: 'all' | 'paid' | 'pro' | 'admin';
  description?: string;
}

interface CacheStore {
  configs: Record<string, any>;
  plans: Record<string, PlanConfig>;
  models: Record<string, string>; // e.g. "gemini:scan" -> "gemini-2.0-flash"
  flags: Record<string, FeatureFlag>;
  payment: Record<string, string>;
  cacheVersion: number;
  timestamp: number;
}

let memoryCache: CacheStore = {
  configs: {},
  plans: {},
  models: {},
  flags: {},
  payment: {},
  cacheVersion: 0,
  timestamp: 0,
};

const CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * Ensures cache is populated and invalidates if either:
 * 1. 60s TTL has expired
 * 2. app_config.cache_version was incremented in the database
 */
async function ensureCache(): Promise<void> {
  const now = Date.now();
  const isExpired = now - memoryCache.timestamp > CACHE_TTL_MS;

  if (!isExpired && memoryCache.cacheVersion > 0) {
    return;
  }

  try {
    const admin = createAdminClient();

    // First check cache_version
    const { data: versionRow } = await admin
      .from('app_config')
      .select('value')
      .eq('key', 'cache_version')
      .maybeSingle();

    const dbVersion = versionRow ? Number(versionRow.value) : 1;

    // If cache is fresh and versions match, skip reload
    if (!isExpired && memoryCache.cacheVersion === dbVersion && Object.keys(memoryCache.configs).length > 0) {
      return;
    }

    // Refresh all settings in parallel
    const [configsRes, plansRes, modelsRes, flagsRes, paymentRes] = await Promise.all([
      admin.from('app_config').select('key, value, value_type'),
      admin.from('plan_configs').select('*').eq('is_active', true),
      admin.from('ai_models').select('engine, model_id, purpose, is_default').eq('is_active', true),
      admin.from('feature_flags').select('flag_key, is_enabled, rollout_pct, applies_to'),
      admin.from('payment_config').select('key, value'),
    ]);

    const newConfigs: Record<string, any> = {};
    if (configsRes.data) {
      for (const row of configsRes.data) {
        let parsed: any = row.value;
        if (row.value_type === 'number') parsed = Number(row.value);
        else if (row.value_type === 'boolean') parsed = row.value === 'true';
        else if (row.value_type === 'json') {
          try {
            parsed = JSON.parse(row.value);
          } catch {
            parsed = row.value;
          }
        }
        newConfigs[row.key] = parsed;
      }
    }

    const newPlans: Record<string, PlanConfig> = {};
    if (plansRes.data) {
      for (const row of plansRes.data) {
        newPlans[row.plan_name] = {
          ...row,
          price_usd: Number(row.price_usd || 0),
          features: typeof row.features === 'object' && row.features !== null ? row.features : {},
        };
      }
    }

    const newModels: Record<string, string> = {};
    if (modelsRes.data) {
      for (const row of modelsRes.data) {
        if (row.is_default) {
          newModels[`${row.engine}:${row.purpose}`] = row.model_id;
        }
      }
    }

    const newFlags: Record<string, FeatureFlag> = {};
    if (flagsRes.data) {
      for (const row of flagsRes.data) {
        newFlags[row.flag_key] = row;
      }
    }

    const newPayment: Record<string, string> = {};
    if (paymentRes.data) {
      for (const row of paymentRes.data) {
        newPayment[row.key] = row.value;
      }
    }

    memoryCache = {
      configs: newConfigs,
      plans: newPlans,
      models: newModels,
      flags: newFlags,
      payment: newPayment,
      cacheVersion: dbVersion,
      timestamp: now,
    };
  } catch (err) {
    console.warn('Failed to refresh configuration cache, continuing with memory cache:', err);
  }
}

/**
 * Invalidate the memory cache manually
 */
export function invalidateConfigCache(): void {
  memoryCache.timestamp = 0;
  memoryCache.cacheVersion = 0;
}

/**
 * Get generic config string from app_config (fallback to env)
 */
export async function getConfig(key: string, fallback = ''): Promise<string> {
  await ensureCache();
  if (memoryCache.configs[key] !== undefined) {
    return String(memoryCache.configs[key]);
  }
  return getEnv(key.toUpperCase()) || fallback;
}

/**
 * Get config number from app_config
 */
export async function getConfigNumber(key: string, fallback = 0): Promise<number> {
  await ensureCache();
  const val = memoryCache.configs[key];
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && !isNaN(Number(val))) return Number(val);
  return fallback;
}

/**
 * Get config boolean from app_config
 */
export async function getConfigBoolean(key: string, fallback = false): Promise<boolean> {
  await ensureCache();
  const val = memoryCache.configs[key];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return fallback;
}

/**
 * Get parsed JSON from app_config
 */
export async function getConfigJson<T>(key: string, fallback: T): Promise<T> {
  await ensureCache();
  const val = memoryCache.configs[key];
  if (val !== undefined) return val as T;
  return fallback;
}

/**
 * Get plan configuration for a given tier (free, starter, pro, enterprise)
 */
export async function getPlanConfig(planName: string): Promise<PlanConfig | null> {
  await ensureCache();
  return memoryCache.plans[planName] || memoryCache.plans['free'] || null;
}

/**
 * Get all active plan configs
 */
export async function getAllPlanConfigs(): Promise<PlanConfig[]> {
  await ensureCache();
  return Object.values(memoryCache.plans);
}

/**
 * Get an active API key using priority rotation.
 * Checks api_keys table in DB first; falls back to environment variable.
 */
export async function getApiKey(service: string, purpose = 'scan'): Promise<string> {
  try {
    const admin = createAdminClient();
    let query: any = admin
      .from('api_keys')
      .select('key_value, vault_secret_id')
      .eq('service', service)
      .eq('is_active', true);

    if (typeof query.in === 'function') {
      query = query.in('purpose', [purpose, 'scan']);
    } else if (typeof query.eq === 'function') {
      query = query.eq('purpose', purpose);
    }

    if (typeof query.order === 'function') {
      query = query.order('priority', { ascending: true });
    }
    if (typeof query.limit === 'function') {
      query = query.limit(1);
    }

    const { data: keyRows } = await query;

    if (keyRows && keyRows.length > 0) {
      const row = keyRows[0];
      if (row.key_value && row.key_value.trim().length > 0) {
        return row.key_value.trim();
      }
    }
  } catch (err) {
    console.warn(`Error fetching DB API key for ${service}:`, err);
  }

  // Fallback to standard environment variables
  const envKey = `${service.toUpperCase()}_API_KEY`;
  const val = getEnv(envKey) || (typeof process !== 'undefined' ? process.env[envKey] : '');
  return val || '';
}

/**
 * Record an API key error for automatic rotation/disable
 */
export async function markApiKeyError(service: string, purpose = 'scan', errorMessage = ''): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.rpc('increment_api_key_error', {
      p_service: service,
      p_purpose: purpose,
    });
  } catch (err) {
    console.warn(`Failed to increment API key error for ${service}:`, err);
  }
}

/**
 * Get the default model for an engine & purpose (e.g. gemini/scan -> gemini-2.0-flash)
 */
export async function getDefaultModel(engine: string, purpose = 'scan'): Promise<string> {
  await ensureCache();
  const key = `${engine}:${purpose}`;
  if (memoryCache.models[key]) {
    return memoryCache.models[key];
  }

  // Fallback defaults
  const fallbacks: Record<string, string> = {
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-4o-mini',
    perplexity: 'llama-3.1-sonar-large-128k-online',
    grok: 'grok-2',
  };
  return fallbacks[engine] || 'gemini-2.0-flash';
}

/**
 * Check if a runtime feature flag is enabled for a given plan level
 */
export async function isFeatureEnabled(flagKey: string, plan = 'free'): Promise<boolean> {
  await ensureCache();
  const flag = memoryCache.flags[flagKey];
  if (!flag) return true; // Default allow if not configured
  if (!flag.is_enabled) return false;

  if (flag.applies_to === 'all') return true;
  if (flag.applies_to === 'paid') return plan !== 'free';
  if (flag.applies_to === 'pro') return plan === 'pro' || plan === 'enterprise';
  if (flag.applies_to === 'admin') return false; // Handled via is_admin guard

  return true;
}

/**
 * Get payment configuration value (e.g. LS checkout URL, variant ID)
 */
export async function getPaymentConfig(key: string, fallback = ''): Promise<string> {
  await ensureCache();
  if (memoryCache.payment[key]) {
    return memoryCache.payment[key];
  }
  return getEnv(key.toUpperCase()) || fallback;
}
