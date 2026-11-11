import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'plan_configs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { plan_name: 'starter', price_usd: 49, keywords_limit: 50, projects_limit: 3, is_active: true },
              { plan_name: 'pro', price_usd: 79, keywords_limit: 150, projects_limit: 10, is_active: true },
            ],
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { plan_name: 'starter', keywords_limit: 100 },
            error: null,
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              { id: 'u1', plan: 'starter' },
              { id: 'u2', plan: 'pro' },
              { id: 'u3', plan: 'free' },
            ],
            error: null,
          }),
        };
      }
      if (table === 'public_reports_cache') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { domain: 'stripe.com', brand_name: 'Stripe', visibility_score: 84 },
              { domain: 'notion.so', brand_name: 'Notion', visibility_score: 88 },
            ],
            count: 2,
            error: null,
          }),
          upsert: vi.fn().mockResolvedValue({ error: null }),
          delete: vi.fn().mockReturnThis(),
          neq: vi.fn().mockResolvedValue({ error: null }),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'misinformation_alerts') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'm-1',
                project_id: 'p-1',
                engine: 'gemini',
                quote: 'Pricing is $200/mo',
                claimed_value: '$200',
                expected_value: '$49',
                confidence: 0.95,
                reviewed: false,
              },
            ],
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'm-1', reviewed: true },
            error: null,
          }),
        };
      }
      if (table === 'fix_briefs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'b-1', status: 'open', gap_type: 'traffic_leak' }],
          }),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'b-new', status: 'open' },
            error: null,
          }),
        };
      }
      if (table === 'agent_visits') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { id: 1, user_agent: 'Mozilla/5.0 GPTBot/1.0', is_verified: true },
              { id: 2, user_agent: 'ClaudeBot/1.0', is_verified: false },
            ],
            error: null,
          }),
        };
      }
      if (table === 'projects') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [{ id: 'p-1', domain: 'example.com', name: 'Example' }],
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }),
  })),
}));

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockResolvedValue('Admin@2026!'),
}));

describe('Batch 2: Advanced Management API Endpoints', () => {
  it('computes MRR and allows updating plan limits via /api/admin/plans', async () => {
    const { GET, PATCH } = await import('@/app/api/admin/plans/route');

    const getReq = new NextRequest('http://localhost:3000/api/admin/plans', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    // Starter ($49) + Pro ($79) = $128 MRR
    expect(getData.revenue.mrrUsd).toBe(128);
    expect(getData.revenue.totalPayingUsers).toBe(2);

    const patchReq = new NextRequest('http://localhost:3000/api/admin/plans', {
      method: 'PATCH',
      headers: { 'x-admin-key': 'Admin@2026!', 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_name: 'starter', keywords_limit: 100 }),
    });
    const patchRes = await PATCH(patchReq);
    expect(patchRes.status).toBe(200);
  });

  it('retrieves cached reports and allows prewarming via /api/admin/cache', async () => {
    const { GET, POST } = await import('@/app/api/admin/cache/route');

    const getReq = new NextRequest('http://localhost:3000/api/admin/cache', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.items.length).toBe(2);

    const postReq = new NextRequest('http://localhost:3000/api/admin/cache', {
      method: 'POST',
      headers: { 'x-admin-key': 'Admin@2026!', 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains: ['notion.so', 'stripe.com'] }),
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
  });

  it('retrieves misinformation alerts and resolves them via /api/admin/misinformation', async () => {
    const { GET, POST } = await import('@/app/api/admin/misinformation/route');

    const getReq = new NextRequest('http://localhost:3000/api/admin/misinformation', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.alerts.length).toBe(1);
    expect(getData.stats.unreviewedAlerts).toBe(1);

    const postReq = new NextRequest('http://localhost:3000/api/admin/misinformation', {
      method: 'POST',
      headers: { 'x-admin-key': 'Admin@2026!', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_reviewed', id: 'm-1' }),
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
  });

  it('tracks search crawler bot visits via /api/admin/crawlers', async () => {
    const { GET } = await import('@/app/api/admin/crawlers/route');

    const getReq = new NextRequest('http://localhost:3000/api/admin/crawlers', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.stats.totalVisits).toBe(2);
    expect(getData.stats.botDistribution.gptbot).toBe(1);
    expect(getData.stats.botDistribution.claudebot).toBe(1);
    expect(getData.stats.verifiedRatePct).toBe(50);
  });
});
