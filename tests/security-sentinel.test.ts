import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockResolvedValue('Admin@2026!'),
}));

vi.mock('@/lib/supabase/admin', () => {
  return {
    createAdminClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'ip_blacklist') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { ip_address: '192.168.1.100', reason: 'Brute force attempts', expires_at: null, hit_count: 5 },
                  { ip_address: '10.0.0.99', reason: 'Scraper bot', expires_at: '2025-01-01T00:00:00Z', hit_count: 2 },
                ],
                error: null,
              }),
              eq: vi.fn().mockImplementation((col: string, val: string) => ({
                maybeSingle: vi.fn().mockImplementation(() => {
                  if (val === '192.168.1.100') {
                    return Promise.resolve({
                      data: { ip_address: '192.168.1.100', reason: 'Brute force attempts', expires_at: null },
                      error: null,
                    });
                  }
                  return Promise.resolve({ data: null, error: null });
                }),
              })),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'misinformation_alerts') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'alert-1',
                    quote: 'Pricing is $999/mo',
                    claimed_value: '$999',
                    expected_value: '$49',
                    engine: 'perplexity',
                    reviewed: false,
                  },
                ],
                error: null,
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'sim-alert-123',
                    quote: 'Pricing is $999/mo',
                    claimed_value: '$999',
                    expected_value: '$49',
                    engine: 'perplexity',
                    reviewed: false,
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'alert-1', reviewed: true },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'fix_briefs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'brief-sim-1', status: 'open' },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'brief-sim-1', status: 'resolved' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'proj-123' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'wh-1',
                    event_name: 'scan.failed',
                    source: 'lemonsqueezy',
                    processed: false,
                  },
                ],
                error: null,
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'wh-sim-1',
                    event_name: 'subscription_payment_success',
                    processed: true,
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [{ id: 'wh-1' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    })),
  };
});

describe('Security Sentinel & Truth Radar API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/admin/security/blacklist - checks IP against blacklist', async () => {
    const { GET } = await import('@/app/api/admin/security/blacklist/route');

    // Test check on blacklisted IP
    const reqBlocked = new NextRequest('http://localhost/api/admin/security/blacklist?checkIp=192.168.1.100', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const resBlocked = await GET(reqBlocked);
    const dataBlocked = await resBlocked.json();

    expect(resBlocked.status).toBe(200);
    expect(dataBlocked.success).toBe(true);
    expect(dataBlocked.isBlocked).toBe(true);
    expect(dataBlocked.record.reason).toBe('Brute force attempts');

    // Test check on clean IP
    const reqClean = new NextRequest('http://localhost/api/admin/security/blacklist?checkIp=8.8.8.8', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const resClean = await GET(reqClean);
    const dataClean = await resClean.json();

    expect(resClean.status).toBe(200);
    expect(dataClean.success).toBe(true);
    expect(dataClean.isBlocked).toBe(false);
  });

  it('POST /api/admin/misinformation - handles simulate and resolve_brief', async () => {
    const { POST } = await import('@/app/api/admin/misinformation/route');

    // Test simulate action
    const reqSimulate = new NextRequest('http://localhost/api/admin/misinformation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'Admin@2026!',
      },
      body: JSON.stringify({
        action: 'simulate',
        quote: 'Pricing is $999/mo',
        claimed_value: '$999',
        expected_value: '$49',
        engine: 'perplexity',
        confidence: 0.95,
      }),
    });
    const resSimulate = await POST(reqSimulate);
    const dataSimulate = await resSimulate.json();

    expect(resSimulate.status).toBe(200);
    expect(dataSimulate.success).toBe(true);
    expect(dataSimulate.alert).toBeDefined();

    // Test resolve_brief action
    const reqResolve = new NextRequest('http://localhost/api/admin/misinformation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'Admin@2026!',
      },
      body: JSON.stringify({
        action: 'resolve_brief',
        briefId: 'brief-sim-1',
      }),
    });
    const resResolve = await POST(reqResolve);
    const dataResolve = await resResolve.json();

    expect(resResolve.status).toBe(200);
    expect(dataResolve.success).toBe(true);
    expect(dataResolve.brief.status).toBe('resolved');
  });

  it('POST /api/admin/webhooks - handles simulate and retry_all', async () => {
    const { POST } = await import('@/app/api/admin/webhooks/route');

    // Test simulate action
    const reqSimulate = new NextRequest('http://localhost/api/admin/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'Admin@2026!',
      },
      body: JSON.stringify({
        action: 'simulate',
        eventName: 'subscription_payment_success',
      }),
    });
    const resSimulate = await POST(reqSimulate);
    const dataSimulate = await resSimulate.json();

    expect(resSimulate.status).toBe(200);
    expect(dataSimulate.success).toBe(true);
    expect(dataSimulate.event).toBeDefined();

    // Test retry_all action
    const reqRetry = new NextRequest('http://localhost/api/admin/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'Admin@2026!',
      },
      body: JSON.stringify({
        action: 'retry_all',
      }),
    });
    const resRetry = await POST(reqRetry);
    const dataRetry = await resRetry.json();

    expect(resRetry.status).toBe(200);
    expect(dataRetry.success).toBe(true);
    expect(dataRetry.count).toBe(1);
  });
});
