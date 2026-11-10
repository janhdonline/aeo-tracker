import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest } from 'next/server';

let blacklistCache: { ips: Set<string>; lastFetch: number } = {
  ips: new Set<string>(),
  lastFetch: 0,
};
const CACHE_TTL_MS = 30_000; // 30 seconds

export function extractClientIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    if (parts[0]) return parts[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

export async function isIpBlacklisted(ip: string): Promise<boolean> {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost') return false;

  const now = Date.now();
  if (now - blacklistCache.lastFetch < CACHE_TTL_MS) {
    return blacklistCache.ips.has(ip);
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('ip_blacklist')
      .select('ip_address, expires_at')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (error) {
      console.warn('isIpBlacklisted query error:', error.message);
      return blacklistCache.ips.has(ip);
    }

    const set = new Set<string>();
    for (const row of data || []) {
      if (row.ip_address) {
        set.add(row.ip_address.trim());
      }
    }

    blacklistCache = { ips: set, lastFetch: now };
    return set.has(ip);
  } catch (err) {
    console.warn('isIpBlacklisted caught exception:', err);
    return false;
  }
}

export function invalidateBlacklistCache() {
  blacklistCache.lastFetch = 0;
}
