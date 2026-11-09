/**
 * Universal environment variable accessor that works across:
 * - Node.js (local dev, vitest, scripts)
 * - Next.js server actions & route handlers
 * - Cloudflare Workers runtime (OpenNext env bindings)
 */
export function getEnv(key: string): string {
  // 1. Standard process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }

  // 2. Cloudflare Worker runtime context (OpenNext)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx && ctx.env && ctx.env[key]) {
      return String(ctx.env[key]);
    }
  } catch {
    // Not running inside a Cloudflare worker context
  }

  return '';
}
