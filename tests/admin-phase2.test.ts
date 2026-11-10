import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockResolvedValue('Admin@2026!'),
  getConfigNumber: vi.fn().mockResolvedValue(25),
  getConfigBoolean: vi.fn().mockResolvedValue(false),
}));

import { createImpersonationToken, verifyImpersonationToken } from '@/lib/impersonation';
import { extractClientIp } from '@/lib/security';
import { NextRequest } from 'next/server';

describe('Admin Phase 2 Operations Tests', () => {
  describe('Customer Impersonation HMAC Tokens', () => {
    it('creates and verifies a valid impersonation token', async () => {
      const userId = '11111111-2222-3333-4444-555555555555';
      const email = 'customer@test.com';

      const token = await createImpersonationToken(userId, email);
      expect(token).toContain('.');

      const result = await verifyImpersonationToken(token);
      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.email).toBe(email);
    });

    it('rejects tampered or forged impersonation tokens', async () => {
      const userId = '11111111-2222-3333-4444-555555555555';
      const email = 'customer@test.com';

      const token = await createImpersonationToken(userId, email);
      const [payload] = token.split('.');
      const forgedToken = `${payload}.forged_fake_signature_abc123`;

      const result = await verifyImpersonationToken(forgedToken);
      expect(result.valid).toBe(false);
      expect(result.userId).toBeUndefined();
    });

    it('gracefully fails on empty or corrupted token strings', async () => {
      expect((await verifyImpersonationToken('')).valid).toBe(false);
      expect((await verifyImpersonationToken('notavalidtoken')).valid).toBe(false);
    });
  });

  describe('Client IP Extraction for Anti-Scraping', () => {
    it('extracts Cloudflare CF-Connecting-IP with priority', () => {
      const req = new NextRequest('https://aeo-checker.com/api/free-check', {
        headers: {
          'cf-connecting-ip': '203.0.113.195',
          'x-forwarded-for': '198.51.100.1, 192.0.2.1',
        },
      });

      const ip = extractClientIp(req);
      expect(ip).toBe('203.0.113.195');
    });

    it('extracts first IP from X-Forwarded-For if CF header missing', () => {
      const req = new NextRequest('https://aeo-checker.com/api/free-check', {
        headers: {
          'x-forwarded-for': '198.51.100.42, 192.0.2.1',
        },
      });

      const ip = extractClientIp(req);
      expect(ip).toBe('198.51.100.42');
    });

    it('falls back to 127.0.0.1 when no headers provided', () => {
      const req = new NextRequest('https://aeo-checker.com/api/free-check');
      const ip = extractClientIp(req);
      expect(ip).toBe('127.0.0.1');
    });
  });
});
