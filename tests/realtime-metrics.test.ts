import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'api_usage') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 1,
                engine: 'gemini',
                model_name: 'gemini-2.0-flash',
                tokens_in: 1500,
                tokens_out: 500,
                latency_ms: 350,
                cost_usd: 0.00026,
                created_at: new Date().toISOString(),
              },
              {
                id: 2,
                engine: 'openai',
                model_name: 'gpt-4o-mini',
                tokens_in: 2000,
                tokens_out: 800,
                latency_ms: 650,
                cost_usd: 0.00078,
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'scan_runs') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              { id: 'run-1', status: 'running', started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
            ],
          }),
        };
      }
      if (table === 'engine_health_logs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ engine_name: 'gemini', status: 'healthy', latency_ms: 320, checked_at: new Date().toISOString() }],
          }),
        };
      }
      if (table === 'webhook_events') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [] }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
      };
    }),
  })),
}));

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockResolvedValue('Admin@2026!'),
  getConfigNumber: vi.fn().mockResolvedValue(25.0),
  getConfigBoolean: vi.fn().mockResolvedValue(false),
}));

describe('Realtime Telemetry API & Warning Heuristics', () => {
  it('aggregates tokens, calculates model shares, and triggers stuck scan warnings', async () => {
    const { GET } = await import('@/app/api/admin/metrics/realtime/route');

    const req = new NextRequest('http://localhost:3000/api/admin/metrics/realtime', {
      headers: {
        'x-admin-key': 'Admin@2026!',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.tokens.today).toBe(4800); // (1500+500) + (2000+800)
    expect(data.tokens.todayIn).toBe(3500);
    expect(data.tokens.todayOut).toBe(1300);

    // Verify models breakdown
    expect(data.models.length).toBe(2);
    expect(data.models.find((m: any) => m.model === 'gemini-2.0-flash')).toBeDefined();
    expect(data.models.find((m: any) => m.model === 'gpt-4o-mini')).toBeDefined();

    // Verify warning heuristic detected stuck scan (>10m)
    expect(data.warnings.length).toBeGreaterThan(0);
    const stuckWarn = data.warnings.find((w: any) => w.id === 'warn-stuck-jobs');
    expect(stuckWarn).toBeDefined();
    expect(stuckWarn.actionType).toBe('kill_stuck');
  });
});
