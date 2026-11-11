import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/middleware/admin-guard', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ errorResponse: null, adminUser: { email: 'admin@test.com' } }),
}));

vi.mock('@/lib/engines', () => ({
  getEngineAdapter: vi.fn().mockReturnValue({
    run: vi.fn().mockResolvedValue({
      answerText: 'Acme Cloud is ranked #1 as the best cloud database with incredible performance.',
      citations: [{ url: 'https://acme.com', title: 'Acme Cloud' }],
    }),
  }),
}));

vi.mock('@/lib/config', () => ({
  getApiKey: vi.fn().mockResolvedValue('test-key'),
}));

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'engine_health_logs') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    engine_name: 'gemini',
                    status: 'healthy',
                    latency_ms: 320,
                    error_message: null,
                    checked_at: new Date().toISOString(),
                  },
                ],
                error: null,
              }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'api_keys') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { service: 'gemini', is_active: true },
                { service: 'gemini', is_active: true },
                { service: 'openai', is_active: true },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === 'prompt_templates') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { id: '1', version: 'v1', purpose: 'scan', template: 'Test template {{brand}}' },
              ],
              error: null,
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'promoted-123', template: 'Winning prompt {{brand}}' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
  })),
}));

import { GET as getWatchdog, POST as postWatchdog } from '@/app/api/admin/watchdog/route';
import { GET as getPlayground, POST as postPlayground, PUT as putPlayground } from '@/app/api/admin/playground/route';

describe('Watchdog & Latency Playground API Suite', () => {
  describe('GET /api/admin/watchdog', () => {
    it('returns auto-hydrated engine summaries with fallback baseline latencies and key pool counts', async () => {
      const req = new NextRequest('http://localhost/api/admin/watchdog');
      const res = await getWatchdog(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.gemini.status).toBe('healthy');
      expect(data.summary.gemini.latencyMs).toBe(320);
      expect(data.summary.gemini.keyPoolCount).toBe(2);
      expect(data.summary.openai.latencyMs).toBeGreaterThan(0);
      expect(data.telemetry).toBeDefined();
      expect(data.telemetry.uptimePct).toBe(100);
    });
  });

  describe('POST /api/admin/watchdog', () => {
    it('supports pinging a single engine via query parameter', async () => {
      const req = new NextRequest('http://localhost/api/admin/watchdog?engine=gemini', {
        method: 'POST',
      });
      const res = await postWatchdog(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.singleEngine).toBe('gemini');
      expect(data.results).toHaveLength(1);
      expect(data.results[0].engine).toBe('gemini');
      expect(data.results[0].status).toBe('healthy');
    });
  });

  describe('POST /api/admin/playground', () => {
    it('executes Dual Prompt A/B test and evaluates winner', async () => {
      const req = new NextRequest('http://localhost/api/admin/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'prompt_ab',
          engine: 'gemini',
          promptA: 'Check if {{brand}} is visible for {{keyword}}',
          promptB: 'Rank the top database including {{brand}} for {{keyword}}',
          brandName: 'Acme Cloud',
          domain: 'acme.com',
          keyword: 'best database',
        }),
      });

      const res = await postPlayground(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('prompt_ab');
      expect(data.resultA).toBeDefined();
      expect(data.resultB).toBeDefined();
      expect(data.resultA.mentionsCount).toBeGreaterThanOrEqual(1);
      expect(data.winner).toBeDefined();
    });

    it('executes Multi-Engine Duel between two engines', async () => {
      const req = new NextRequest('http://localhost/api/admin/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'engine_duel',
          engineA: 'gemini',
          engineB: 'openai',
          promptTemplate: 'Evaluate {{brand}} on {{keyword}}',
          brandName: 'Acme Cloud',
          domain: 'acme.com',
          keyword: 'cloud database',
        }),
      });

      const res = await postPlayground(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('engine_duel');
      expect(data.resultA.engine).toBe('gemini');
      expect(data.resultB.engine).toBe('openai');
    });
  });

  describe('PUT /api/admin/playground', () => {
    it('promotes winning prompt to production templates table', async () => {
      const req = new NextRequest('http://localhost/api/admin/playground', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'Winning prompt {{brand}} on {{keyword}}',
          purpose: 'scan',
          notes: 'Promoted from A/B testing',
        }),
      });

      const res = await putPlayground(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.template.id).toBe('promoted-123');
    });
  });
});
