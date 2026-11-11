import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockImplementation((key: string) => {
    if (key === 'admin_master_password') return Promise.resolve('Admin@2026!');
    return Promise.resolve(null);
  }),
}));

vi.mock('@/lib/supabase/admin', () => {
  return {
    createAdminClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'query_results') {
          return {
            select: vi.fn().mockReturnValue({
              lt: vi.fn().mockResolvedValue({ count: 12, data: null, error: null }),
            }),
            delete: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [{ id: 'q-1' }, { id: 'q-2' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'error_logs') {
          return {
            select: vi.fn().mockReturnValue({
              lt: vi.fn().mockResolvedValue({ count: 4, data: null, error: null }),
            }),
            delete: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [{ id: 'e-1' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'engine_health_logs') {
          return {
            select: vi.fn().mockReturnValue({
              lt: vi.fn().mockResolvedValue({ count: 6, data: null, error: null }),
            }),
            delete: vi.fn().mockReturnValue({
              lt: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [{ id: 'h-1' }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'public_reports_cache') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [
                    { domain: 'stripe.com', brand_name: 'Stripe', visibility_score: 84 },
                    { domain: 'notion.so', brand_name: 'Notion', visibility_score: 88 },
                  ],
                  count: 2,
                  error: null,
                }),
              }),
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [{ domain: 'stripe.com', brand_name: 'Stripe', visibility_score: 84 }],
                    count: 1,
                    error: null,
                  }),
                }),
              }),
            }),
            upsert: vi.fn().mockResolvedValue({ error: null }),
            delete: vi.fn().mockReturnValue({
              neq: vi.fn().mockResolvedValue({ error: null }),
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (
          table === 'profiles' ||
          table === 'projects' ||
          table === 'keywords' ||
          table === 'app_config' ||
          table === 'api_keys' ||
          table === 'plan_configs' ||
          table === 'feature_flags'
        ) {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ id: '1' }, { id: '2' }],
              error: null,
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

describe('Tab 8: Database Hygiene, Cache & Backup APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/admin/backup?summary=true - returns metadata summary', async () => {
    const { GET } = await import('@/app/api/admin/backup/route');

    const req = new NextRequest('http://localhost/api/admin/backup?summary=true', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.summary).toBeDefined();
    expect(data.summary.tableCounts).toBeDefined();
    expect(data.summary.totalRows).toBeGreaterThan(0);
  });

  it('GET and POST /api/admin/hygiene - calculates horizons and executes selective prune', async () => {
    const { GET, POST } = await import('@/app/api/admin/hygiene/route');

    // GET hygiene stats
    const getReq = new NextRequest('http://localhost/api/admin/hygiene', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.success).toBe(true);
    expect(getData.stats.horizons).toBeDefined();
    expect(getData.stats.horizons['90']).toBeGreaterThan(0);

    // POST execute prune
    const postReq = new NextRequest('http://localhost/api/admin/hygiene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        retentionDays: 60,
        pruneQueries: true,
        pruneErrors: true,
        pruneHealth: true,
      }),
    });
    const postRes = await POST(postReq);
    const postData = await postRes.json();

    expect(postRes.status).toBe(200);
    expect(postData.success).toBe(true);
    expect(postData.pruned.total).toBe(4); // 2 queries + 1 error + 1 health log
  });

  it('GET, POST, and DELETE /api/admin/cache - supports single domain warming and purge', async () => {
    const { GET, POST, DELETE } = await import('@/app/api/admin/cache/route');

    // GET with search
    const getReq = new NextRequest('http://localhost/api/admin/cache?search=stripe', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.success).toBe(true);
    expect(getData.items.length).toBe(1);

    // POST single domain warm
    const postReq = new NextRequest('http://localhost/api/admin/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        domain: 'supabase.com',
      }),
    });
    const postRes = await POST(postReq);
    const postData = await postRes.json();

    expect(postRes.status).toBe(200);
    expect(postData.success).toBe(true);
    expect(postData.prewarmed).toContain('supabase.com');

    // DELETE single domain
    const delReq = new NextRequest('http://localhost/api/admin/cache?domain=supabase.com', {
      method: 'DELETE',
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const delRes = await DELETE(delReq);
    const delData = await delRes.json();

    expect(delRes.status).toBe(200);
    expect(delData.success).toBe(true);
  });
});
