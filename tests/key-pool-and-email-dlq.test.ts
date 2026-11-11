import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'notification_logs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: '1',
                user_id: 'user-1',
                event_type: 'payment_success',
                recipient_email: 'jalom3396@gmail.com',
                subject: 'Your AEO Tracker subscription is active',
                status: 'failed',
                sent_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'api_keys') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockImplementation(function (this: any, col: string) {
            if (col === 'priority') {
              return Promise.resolve({
                data: [
                  {
                    id: 'key-1',
                    service: 'gemini',
                    key_name: 'primary',
                    key_value: 'AIzaSyFakeKey1234',
                    is_active: true,
                    priority: 1,
                    purpose: 'scan',
                    error_count: 0,
                    last_error: null,
                  },
                ],
                error: null,
              });
            }
            return this;
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'new-key-1',
                  service: 'openai',
                  key_name: 'backup',
                  is_active: true,
                  priority: 2,
                  purpose: 'scan',
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'key-1', is_active: false },
                  error: null,
                }),
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
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
      };
    }),
  })),
}));

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockResolvedValue('Admin@2026!'),
  resetApiKeyPool: vi.fn().mockResolvedValue(3),
}));

describe('Email DLQ & Key Pool Management', () => {
  it('retrieves failed notification logs and computes failure rate', async () => {
    const { GET } = await import('@/app/api/admin/emails/route');
    const req = new NextRequest('http://localhost:3000/api/admin/emails', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.logs.length).toBe(1);
    expect(json.stats.failedCount).toBe(1);
    expect(json.logs[0].recipient_email).toBe('jalom3396@gmail.com');
  });

  it('GET /api/admin/keys returns redacted key hints and environment fallback statuses', async () => {
    const { GET } = await import('@/app/api/admin/keys/route');
    const req = new NextRequest('http://localhost:3000/api/admin/keys', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.keys).toBeDefined();
    expect(json.keys[0].key_hint).toBe('••••1234');
    expect(json.keys[0].key_value).toBeUndefined(); // Secret value stripped
    expect(json.envFallbacks).toBeDefined();
    expect(json.envFallbacks.gemini).toBeDefined();
    expect(json.stats.total).toBe(1);
  });

  it('PATCH /api/admin/keys resets all pool errors via stored procedure helper', async () => {
    const { PATCH } = await import('@/app/api/admin/keys/route');
    const req = new NextRequest('http://localhost:3000/api/admin/keys', {
      method: 'PATCH',
      headers: { 'x-admin-key': 'Admin@2026!', 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_all_pool' }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.resetCount).toBe(3);
  });
});
