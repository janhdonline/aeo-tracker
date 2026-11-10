import { createAdminClient } from '@/lib/supabase/admin';
import { getConfigBoolean, getConfigNumber } from '@/lib/config';

let cachedTodaySpend: { amount: number; lastChecked: number; todayDate: string } = {
  amount: 0,
  lastChecked: 0,
  todayDate: '',
};

const CACHE_TTL_MS = 20_000; // 20 seconds cache

export async function getTodayAiSpendUsd(): Promise<number> {
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  if (
    cachedTodaySpend.todayDate === todayStr &&
    now - cachedTodaySpend.lastChecked < CACHE_TTL_MS
  ) {
    return cachedTodaySpend.amount;
  }

  try {
    const admin = createAdminClient();
    const startOfToday = `${todayStr}T00:00:00.000Z`;

    const { data, error } = await admin
      .from('api_usage')
      .select('cost_usd')
      .gte('created_at', startOfToday);

    if (error) {
      console.warn('getTodayAiSpendUsd query error:', error.message);
      return cachedTodaySpend.amount;
    }

    const total = (data || []).reduce(
      (sum, row) => sum + (Number(row.cost_usd) || 0),
      0
    );

    cachedTodaySpend = {
      amount: Math.round(total * 1000) / 1000,
      lastChecked: now,
      todayDate: todayStr,
    };

    return cachedTodaySpend.amount;
  } catch (err) {
    console.warn('getTodayAiSpendUsd exception:', err);
    return cachedTodaySpend.amount;
  }
}

export async function checkAiBudgetAllowed(): Promise<{ allowed: boolean; reason?: string }> {
  const emergencyStop = await getConfigBoolean('emergency_ai_stop', false);
  if (emergencyStop) {
    return {
      allowed: false,
      reason: 'AI operations are paused by administrator (Emergency AI Stop active)',
    };
  }

  const dailyCap = await getConfigNumber('daily_ai_spend_cap_usd', 25.0);
  const currentSpend = await getTodayAiSpendUsd();

  if (currentSpend >= dailyCap) {
    return {
      allowed: false,
      reason: `Daily AI spend cap of $${dailyCap.toFixed(2)} reached (Current: $${currentSpend.toFixed(2)})`,
    };
  }

  return { allowed: true };
}

export function invalidateSpendCache() {
  cachedTodaySpend.lastChecked = 0;
}
